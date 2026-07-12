import { useState, useCallback, useRef } from 'react';
import DesktopIcon from './DesktopIcon';
import Decorations from './Decorations';
import ContextMenu from '../common/ContextMenu';
import './Desktop.css';

export default function Desktop({
  items, wallpaper, isEditMode, selectedId, renamingId, renameValue,
  onRenameValueChange, onRenameConfirm, onRenameCancel, inputRef,
  onSelect, onDoubleClickItem, onMoveItem, onAddItem, onDeleteItem,
  onRenameStart, onChangeIcon,
  contextMenu, showContextMenu, hideContextMenu,
  isAdmin, onToggleEdit, onOpenSettings,
  decorations, onUpdateDecoration, onDeleteDecoration, onAddDecoration,
  onMoveItemIntoFolder,
}) {
  const [wallpaperOffset, setWallpaperOffset] = useState({ x: 0, y: 0 });
  const desktopRef = useRef(null);
  const dragState = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;
    setWallpaperOffset({ x: ((e.clientX-rect.left)/rect.width-0.5)*-8, y: ((e.clientY-rect.top)/rect.height-0.5)*-8 });
  }, []);

  const handleDesktopContextMenu = useCallback((e) => {
    showContextMenu(e, 'desktop');
  }, [showContextMenu]);

  const handleDecoContextMenu = useCallback((e) => {
    showContextMenu(e, 'decoration');
  }, [showContextMenu]);

  const handleClick = useCallback(() => onSelect(null), [onSelect]);

  const handleDragStart = useCallback((e, item) => {
    if (!isEditMode) return;
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origX = item.position.x, origY = item.position.y;
    dragState.current = { itemId: item.id, origX, origY, moved: false };

    const onMove = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
      dragState.current.moved = true;
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) { el.style.left = Math.max(0, origX+dx)+'px'; el.style.top = Math.max(0, origY+dy)+'px'; el.style.zIndex='50'; el.style.transition='none'; }
      // 检测是否拖到文件夹上方
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      if (target) {
        const folderIcon = target.closest('.desktop-icon');
        if (folderIcon) {
          const folderId = folderIcon.closest('[data-icon-id]')?.getAttribute('data-icon-id');
          if (folderId && folderId !== item.id) {
            // 高亮目标文件夹
            folderIcon.style.outline = '3px solid var(--y2k-lime)';
            folderIcon.style.outlineOffset = '4px';
            folderIcon.setAttribute('data-drop-target', 'true');
          }
        }
      }
      // 清除其他高亮
      document.querySelectorAll('[data-drop-target]').forEach(el => {
        if (el !== (target?.closest('.desktop-icon'))) {
          el.style.outline = ''; el.style.outlineOffset = ''; el.removeAttribute('data-drop-target');
        }
      });
    };

    const onUp = (ev) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      // 清除所有高亮
      document.querySelectorAll('[data-drop-target]').forEach(el => {
        el.style.outline = ''; el.style.outlineOffset = ''; el.removeAttribute('data-drop-target');
      });
      if (!dragState.current.moved) { dragState.current = null; return; }
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      const newX = Math.max(0, origX+dx), newY = Math.max(0, origY+dy);
      // 检测是否放在文件夹上
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      if (target) {
        const folderIcon = target.closest('.desktop-icon');
        if (folderIcon) {
          const folderId = folderIcon.closest('[data-icon-id]')?.getAttribute('data-icon-id');
          if (folderId && folderId !== item.id) {
            const folderItem = items.find(i => i.id === folderId);
            if (folderItem && (folderItem.type === 'folder' || folderItem.type === 'folder-large')) {
              onMoveItemIntoFolder(item.id, folderId);
              dragState.current = null; return;
            }
          }
        }
      }
      onMoveItem(item.id, newX, newY);
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) { el.style.zIndex=''; el.style.transition=''; }
      dragState.current = null;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isEditMode, onMoveItem, onMoveItemIntoFolder, items]);

  return (
    <div ref={desktopRef} className="desktop-area" onMouseMove={handleMouseMove}
      onMouseLeave={() => setWallpaperOffset({x:0,y:0})}
      onClick={handleClick} onContextMenu={handleDesktopContextMenu}>
      <div className="desktop-wallpaper" style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
        transform: `translate(${wallpaperOffset.x}px, ${wallpaperOffset.y}px)`,
      }}>
        {!wallpaper && (<><div className="wallpaper-gradient" /><div className="wallpaper-grid-overlay" />
          <div className="wallpaper-stickers">
            <span className="sticker sticker-star">⭐</span><span className="sticker sticker-heart">💖</span>
            <span className="sticker sticker-sparkle">✨</span><span className="sticker sticker-rainbow">🌈</span>
          </div></>)}
      </div>
      <div className="desktop-icons-layer">
        {items.map(item => (
          <div key={item.id} data-icon-id={item.id}>
            <DesktopIcon item={item} isSelected={selectedId===item.id}
              isEditMode={isEditMode} renamingId={renamingId} renameValue={renameValue}
              onRenameValueChange={onRenameValueChange} onRenameConfirm={onRenameConfirm}
              onRenameCancel={onRenameCancel} inputRef={inputRef}
              onSelect={onSelect} onDoubleClick={onDoubleClickItem}
              onContextMenu={(e, it) => showContextMenu(e, 'icon', it)}
              onDragStart={handleDragStart} />
          </div>
        ))}
      </div>
      {/* 装饰层 */}
      <Decorations items={decorations || []} isEditMode={isEditMode}
        onUpdate={onUpdateDecoration} onDelete={onDeleteDecoration}
        onContextMenu={handleDecoContextMenu} />
      {isEditMode && (<div className="edit-mode-banner">✎ 编辑模式</div>)}
      <ContextMenu menu={contextMenu} isAdmin={isAdmin} editMode={isEditMode}
        onClose={hideContextMenu} onOpen={onDoubleClickItem}
        onRename={onRenameStart} onDelete={onDeleteItem}
        onChangeIcon={onChangeIcon} onAddItem={onAddItem}
        onAddDecoration={onAddDecoration}
        onToggleEdit={onToggleEdit} onOpenSettings={onOpenSettings} />
    </div>
  );
}
