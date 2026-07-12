import { useCallback } from 'react';
import './ContextMenu.css';

export default function ContextMenu({
  menu, isAdmin, editMode, onClose,
  onOpen, onRename, onDelete, onChangeIcon,
  onAddItem, onToggleEdit, onOpenSettings,
}) {
  if (!menu) return null;

  const handleAction = useCallback((action, data) => {
    // 先关闭菜单，用 setTimeout 确保 React 事件循环完成
    onClose();
    // 延迟执行操作
    setTimeout(() => {
      switch (action) {
        case 'open': onOpen(data); break;
        case 'rename': onRename(data.id, data.name); break;
        case 'delete': onDelete(data.id); break;
        case 'changeIcon': onChangeIcon(data.id); break;
        case 'newFolder': onAddItem({ type: 'folder', name: '新文件夹', size: 'normal' }); break;
        case 'newLargeFolder': onAddItem({ type: 'folder-large', name: '新文件夹', size: 'large' }); break;
        case 'newMarkdown': onAddItem({ type: 'markdown', name: '新文档.md', content: '# 新文档\n\n开始写点什么...' }); break;
        case 'newImage': onAddItem({ type: 'image', name: '新图片.png', url: '' }); break;
        case 'newVideo': onAddItem({ type: 'video', name: '新视频.mp4', url: '' }); break;
        case 'newLink': onAddItem({ type: 'link', name: '新链接', url: 'https://' }); break;
        case 'toggleEdit': onToggleEdit(); break;
        case 'openSettings': onOpenSettings(); break;
      }
    }, 50);
  }, [onClose, onOpen, onRename, onDelete, onChangeIcon, onAddItem, onToggleEdit, onOpenSettings]);

  const isDesktop = menu.type === 'desktop';
  const isIcon = menu.type === 'icon';
  const adjustedX = Math.min(menu.x, window.innerWidth - 200);
  const adjustedY = Math.min(menu.y, window.innerHeight - 400);

  return (
    <div className="context-menu-overlay" onClick={onClose} onContextMenu={e => { e.preventDefault(); onClose(); }}>
      <div className="context-menu win98-window" style={{ left: adjustedX, top: adjustedY }}
        onClick={e => e.stopPropagation()}>
        
        {isDesktop && (<>
          <div className="menu-section-label">操作</div>
          <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('toggleEdit'); }}>
            {editMode ? '✕ 退出编辑模式' : (isAdmin ? '✎ 进入编辑模式' : '🔑 管理员登录')}
          </button>
          <div className="menu-separator" />
          {isAdmin && editMode && (<>
            <div className="menu-section-label">新建</div>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('newFolder'); }}>📁 新建文件夹</button>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('newLargeFolder'); }}>📂 新建大型文件夹</button>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('newMarkdown'); }}>📝 新建 Markdown</button>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('newImage'); }}>🖼️ 新建图片</button>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('newVideo'); }}>🎬 新建视频</button>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('newLink'); }}>🔗 新建链接</button>
            <div className="menu-separator" />
          </>)}
          {isAdmin && (
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('openSettings'); }}>⚙️ 站点设置</button>
          )}
        </>)}

        {isIcon && (<>
          <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('open', menu.item); }}>📂 打开</button>
          <div className="menu-separator" />
          {isAdmin && editMode && (<>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('rename', { id: menu.itemId, name: menu.item.name }); }}>✏️ 重命名</button>
            <button className="menu-item" onClick={e => { e.stopPropagation(); handleAction('changeIcon', { id: menu.itemId }); }}>🎨 更换图标</button>
            <div className="menu-separator" />
            <button className="menu-item menu-item-danger" onClick={e => { e.stopPropagation(); handleAction('delete', { id: menu.itemId }); }}>🗑️ 删除</button>
          </>)}
        </>)}
      </div>
    </div>
  );
}
