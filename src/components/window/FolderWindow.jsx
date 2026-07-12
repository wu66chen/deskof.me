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

  const handleIconContextMenu = useCallback((e, item) => {
    e.preventDefault(); e.stopPropagation();
    onContextMenu(e, 'icon', item);
  }, [onContextMenu]);

  const handleFolderContextMenu = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    onContextMenu(e, 'folder', folderItem);
  }, [onContextMenu, folderItem]);

  // 文件夹内子项的拖拽（支持拖出到桌面）
  const handleChildDragStart = useCallback((e, item) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const origRect = e.target.getBoundingClientRect();
    let moved = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      
      // 检查是否拖出了文件夹窗口
      const winRect = windowRef.current?.getBoundingClientRect();
      if (winRect) {
        const isOutside = ev.clientX < winRect.left || ev.clientX > winRect.right ||
                          ev.clientY < winRect.top || ev.clientY > winRect.bottom;
        if (isOutside) {
          // 拖出文件夹 → 移到桌面
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          onDragOutOfFolder?.(item.id, folderItem.id, ev.clientX - 40, ev.clientY - 40);
          return;
        }
      }
    };

    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isEditMode, folderItem.id, onDragOutOfFolder]);

  return (
    <div ref={windowRef} className="folder-window" onContextMenu={handleFolderContextMenu}>
      {children.length === 0 ? (
        <div className="folder-empty">
          <span className="empty-icon">📂</span>
          <p>此文件夹为空</p>
          {isEditMode && <p className="empty-hint">右键文件夹空白处添加项目</p>}
        </div>
      ) : (
        <div className="folder-grid">
          {children.map((child, index) => (
            <div key={child.id} className="folder-grid-item" style={{ animationDelay: `${index * 40}ms` }}>
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
