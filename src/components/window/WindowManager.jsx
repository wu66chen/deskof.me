import Window from './Window';
import FolderWindow from './FolderWindow';
import { ImageViewer, VideoPlayer, MarkdownViewer, LinkLauncher } from './ContentViewers';
import { iconEmoji } from '../../config/defaultIcons';
import { canOpenWindow } from '../../utils/fileHelpers';

/**
 * 窗口管理器 — 渲染所有打开窗口
 */
export default function WindowManager({
  windows,
  isEditMode,
  selectedId,
  renamingId,
  renameValue,
  onRenameValueChange,
  onRenameConfirm,
  onRenameCancel,
  inputRef,
  onSelect,
  onDoubleClickItem,
  onContextMenu,
  onDragStart,
  onClose,
  onMinimize,
  onFocus,
  onUpdateContent,
}) {
  /**
   * 根据类型渲染窗口内容
   */
  const renderWindowContent = (item) => {
    switch (item.type) {
      case 'folder':
      case 'folder-large':
        return (
          <FolderWindow
            folderItem={item}
            isEditMode={isEditMode}
            selectedId={selectedId}
            renamingId={renamingId}
            renameValue={renameValue}
            onRenameValueChange={onRenameValueChange}
            onRenameConfirm={onRenameConfirm}
            onRenameCancel={onRenameCancel}
            inputRef={inputRef}
            onSelect={onSelect}
            onDoubleClick={onDoubleClickItem}
            onContextMenu={onContextMenu}
            onDragStart={onDragStart}
          />
        );
      case 'image':
        return <ImageViewer item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      case 'video':
        return <VideoPlayer item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      case 'markdown':
        return <MarkdownViewer item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      case 'link':
        return <LinkLauncher item={item} isEditMode={isEditMode} onUpdateContent={onUpdateContent} />;
      default:
        return (
          <div className="viewer-placeholder" style={{ padding: 40 }}>
            <span>📄</span>
            <p>{item.name}</p>
          </div>
        );
    }
  };

  return (
    <>
      {windows.map(win => {
        if (!canOpenWindow(win.item.type)) return null;
        return (
          <Window
            key={win.id}
            id={win.id}
            title={win.item.name}
            icon={iconEmoji[win.item.type] || '📄'}
            isMinimized={win.minimized}
            onClose={onClose}
            onMinimize={onMinimize}
            onFocus={onFocus}
            zIndex={win.zIndex}
            defaultPosition={win.position}
          >
            {renderWindowContent(win.item)}
          </Window>
        );
      })}
    </>
  );
}
