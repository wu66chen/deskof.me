import { useRef, useCallback } from 'react';
import DesktopIcon from '../desktop/DesktopIcon';
import './FolderWindow.css';

export default function FolderWindow({
  folderItem, isEditMode, selectedId, renamingId, renameValue,
  onRenameValueChange, onRenameConfirm, onRenameCancel, inputRef,
  onSelect, onDoubleClick, onContextMenu,
  onDragOutOfFolder, onMoveItem,
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

  // 文件夹内拖拽子项
  const handleChildDrag = useCallback((e, item) => {
    if (!isEditMode) return;
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origX = item.position?.x || 0, origY = item.position?.y || 0;
    let moved = false;

    const onMove = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      moved = true;
      
      // 检测是否拖出文件夹
      const winRect = windowRef.current?.getBoundingClientRect();
      if (winRect && (ev.clientX < winRect.left-20 || ev.clientX > winRect.right+20 || ev.clientY < winRect.top-20 || ev.clientY > winRect.bottom+20)) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (onDragOutOfFolder) onDragOutOfFolder(item.id, folderItem.id, ev.clientX-40, ev.clientY-60);
        return;
      }

      // 更新子项位置（临时）
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) { el.style.transform = `translate(${dx}px, ${dy}px)`; el.style.zIndex = '50'; }
    };

    const onUp = (ev) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (moved && onMoveItem) {
        const dx = ev.clientX - startX, dy = ev.clientY - startY;
        const el = document.querySelector(`[data-icon-id="${item.id}"]`);
        if (el) { el.style.transform = ''; el.style.zIndex = ''; }
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isEditMode, folderItem.id, onDragOutOfFolder, onMoveItem]);

  return (
    <div ref={windowRef} className="folder-window" onContextMenu={handleFolderContextMenu}>
      {children.length === 0 ? (
        <div className="folder-empty">
          <span className="empty-icon">📂</span><p>此文件夹为空</p>
        </div>
      ) : (
        <div className="folder-grid">
          {children.map((child, index) => (
            <div key={child.id} className="folder-grid-item" style={{ animationDelay: `${index*40}ms` }} data-icon-id={child.id}>
              <DesktopIcon
                item={{ ...child, position: { x: 0, y: 0 } }}
                isSelected={selectedId === child.id}
                isEditMode={isEditMode}
                renamingId={renamingId} renameValue={renameValue}
                onRenameValueChange={onRenameValueChange}
                onRenameConfirm={onRenameConfirm} onRenameCancel={onRenameCancel}
                inputRef={inputRef}
                onSelect={onSelect}
                onDoubleClick={onDoubleClick}
                onContextMenu={handleIconContextMenu}
                onDragStart={isEditMode ? handleChildDrag : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
