import { useRef, useCallback } from 'react';
import DesktopIcon from '../desktop/DesktopIcon';
import './FolderWindow.css';

export default function FolderWindow({
  folderItem, isEditMode, selectedId, renamingId, renameValue,
  onRenameValueChange, onRenameConfirm, onRenameCancel, inputRef,
  onSelect, onDoubleClick, onContextMenu, onDragStart,
  onDragOutOfFolder,
}) {
  const windowRef = useRef(null);
  const children = folderItem.children || [];

  // 子项右键
  const handleIconContextMenu = useCallback((e, item) => {
    e.preventDefault(); e.stopPropagation();
    onContextMenu(e, 'icon', item);
  }, [onContextMenu]);

  // 文件夹空白区域右键
  const handleEmptyContextMenu = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    onContextMenu(e, 'folder', folderItem);
  }, [onContextMenu, folderItem]);

  return (
    <div ref={windowRef} className="folder-window" onContextMenu={handleEmptyContextMenu}>
      {children.length === 0 ? (
        <div className="folder-empty">
          <span className="empty-icon">📂</span>
          <p>此文件夹为空</p>
          {isEditMode && <p className="empty-hint">右键此处添加项目</p>}
        </div>
      ) : (
        <div className="folder-grid">
          {children.map((child, index) => (
            <div key={child.id} className="folder-grid-item"
              style={{ animationDelay: `${index * 40}ms` }}
              data-icon-id={child.id}>
              <DesktopIcon
                item={{ ...child, position: { x: 0, y: 0 } }}
                isSelected={selectedId === child.id}
                isEditMode={isEditMode}
                renamingId={renamingId}
                renameValue={renameValue}
                onRenameValueChange={onRenameValueChange}
                onRenameConfirm={onRenameConfirm}
                onRenameCancel={onRenameCancel}
                inputRef={inputRef}
                onSelect={onSelect}
                onDoubleClick={onDoubleClick}
                onContextMenu={handleIconContextMenu}
                onDragStart={isEditMode ? onDragStart : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
