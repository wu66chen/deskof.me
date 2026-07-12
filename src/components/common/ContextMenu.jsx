import { useCallback } from 'react';
import './ContextMenu.css';

/**
 * Y2K 风格右键菜单
 * 桌面右键 / 图标右键
 */
export default function ContextMenu({
  menu,
  isAdmin,
  editMode,
  onClose,
  onOpen,
  onRename,
  onDelete,
  onChangeIcon,
  onAddItem,
  onToggleEdit,
  onOpenSettings,
}) {
  if (!menu) return null;

  const isDesktop = menu.type === 'desktop';
  const isIcon = menu.type === 'icon';

  const handleAction = useCallback((action) => {
    switch (action) {
      case 'open':
        onOpen(menu.item);
        break;
      case 'rename':
        onRename(menu.itemId, menu.item.name);
        break;
      case 'delete':
        onDelete(menu.itemId);
        break;
      case 'changeIcon':
        onChangeIcon(menu.itemId);
        break;
      case 'newFolder':
        onAddItem({ type: 'folder', name: '新文件夹', size: 'normal' });
        break;
      case 'newLargeFolder':
        onAddItem({ type: 'folder-large', name: '新文件夹', size: 'large' });
        break;
      case 'newMarkdown':
        onAddItem({ type: 'markdown', name: '新文档.md', content: '# 新文档\n\n开始写点什么...' });
        break;
      case 'newImage':
        onAddItem({ type: 'image', name: '新图片.png', url: '' });
        break;
      case 'newVideo':
        onAddItem({ type: 'video', name: '新视频.mp4', url: '' });
        break;
      case 'newLink':
        onAddItem({ type: 'link', name: '新链接', url: 'https://' });
        break;
      case 'newFile':
        onAddItem({ type: 'file', name: '新文件' });
        break;
      case 'toggleEdit':
        onToggleEdit();
        break;
      case 'openSettings':
        onOpenSettings();
        break;
      default:
        break;
    }
    onClose();
  }, [menu, onClose, onOpen, onRename, onDelete, onChangeIcon, onAddItem, onToggleEdit, onOpenSettings]);

  // 调整菜单位置防止溢出
  const adjustedX = Math.min(menu.x, window.innerWidth - 200);
  const adjustedY = Math.min(menu.y, window.innerHeight - 400);

  return (
    <div
      className="context-menu-overlay"
      onClick={onClose}
      onContextMenu={(e) => { e.preventDefault(); onClose(); }}
    >
      <div
        className="context-menu win98-window"
        style={{ left: adjustedX, top: adjustedY }}
        onClick={(e) => e.stopPropagation()}
      >
        {isDesktop && (
          <>
            <div className="menu-section-label">排列图标</div>
            {isAdmin && (
              <>
                <button className="menu-item" onClick={() => handleAction('toggleEdit')}>
                  {editMode ? '✕ 退出编辑模式' : '✎ 进入编辑模式'}
                </button>
                <div className="menu-separator" />
              </>
            )}
            <div className="menu-section-label">新建</div>
            {isAdmin && editMode && (
              <>
                <button className="menu-item" onClick={() => handleAction('newFolder')}>
                  📁 新建文件夹
                </button>
                <button className="menu-item" onClick={() => handleAction('newLargeFolder')}>
                  📂 新建大型文件夹
                </button>
                <button className="menu-item" onClick={() => handleAction('newMarkdown')}>
                  📝 新建 Markdown
                </button>
                <button className="menu-item" onClick={() => handleAction('newImage')}>
                  🖼️ 新建图片
                </button>
                <button className="menu-item" onClick={() => handleAction('newVideo')}>
                  🎬 新建视频
                </button>
                <button className="menu-item" onClick={() => handleAction('newLink')}>
                  🔗 新建链接
                </button>
              </>
            )}
            <div className="menu-separator" />
            {isAdmin && (
              <button className="menu-item" onClick={() => handleAction('openSettings')}>
                ⚙️ 站点设置
              </button>
            )}
          </>
        )}

        {isIcon && (
          <>
            <button className="menu-item" onClick={() => handleAction('open')}>
              📂 打开
            </button>
            <div className="menu-separator" />
            {isAdmin && editMode && (
              <>
                <button className="menu-item" onClick={() => handleAction('rename')}>
                  ✏️ 重命名
                </button>
                <button className="menu-item" onClick={() => handleAction('changeIcon')}>
                  🎨 更换图标
                </button>
                <div className="menu-separator" />
                <button className="menu-item menu-item-danger" onClick={() => handleAction('delete')}>
                  🗑️ 删除
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
