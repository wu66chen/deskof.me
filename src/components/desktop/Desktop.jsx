import { useState, useCallback, useRef, useEffect } from 'react';
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
  onMoveItemIntoFolder, iconSize, parallaxEnabled, parallaxStrength,
}) {
  const [wallpaperOffset, setWallpaperOffset] = useState({ x: 0, y: 0 });
  const desktopRef = useRef(null);
  const dragState = useRef(null);

  // 应用图标大小 CSS 变量
  useEffect(() => {
    document.documentElement.style.setProperty('--icon-size', `${iconSize || 72}px`);
    document.documentElement.style.setProperty('--icon-size-large', `${(iconSize || 72) * 1.67}px`);
  }, [iconSize]);

  const handleMouseMove = useCallback((e) => {
    if (!parallaxEnabled) return;
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = (parallaxStrength || 8);
    setWallpaperOffset({
      x: ((e.clientX-rect.left)/rect.width-0.5)*-s,
      y: ((e.clientY-rect.top)/rect.height-0.5)*-s,
    });
  }, [parallaxEnabled, parallaxStrength]);

  const handleDesktopContextMenu = useCallback((e) => showContextMenu(e, 'desktop'), [showContextMenu]);
  const handleClick = useCallback(() => onSelect(null), [onSelect]);

  const handleDragStart = useCallback((e, item) => {
    if (!isEditMode) return;
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const origX = item.position.x, origY = item.position.y;
    dragState.current = { itemId: item.id, origX, origY, moved: false };
    const onMove = (ev) => {
      if (Math.abs(ev.clientX-startX)<2 && Math.abs(ev.clientY-startY)<2) return;
      dragState.current.moved = true;
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) { el.style.left=Math.max(0,origX+ev.clientX-startX)+'px'; el.style.top=Math.max(0,origY+ev.clientY-startY)+'px'; el.style.zIndex='50'; el.style.transition='none'; }
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      document.querySelectorAll('[data-drop-target]').forEach(e=>{e.style.outline='';e.style.outlineOffset='';e.removeAttribute('data-drop-target')});
      if (target) {
        const fi = target.closest('.desktop-icon');
        if (fi && fi.closest('[data-icon-id]')?.getAttribute('data-icon-id') !== item.id) {
          fi.style.outline='3px solid var(--y2k-lime)'; fi.style.outlineOffset='4px'; fi.setAttribute('data-drop-target','true');
        }
      }
    };
    const onUp = (ev) => {
      document.removeEventListener('mousemove',onMove); document.removeEventListener('mouseup',onUp);
      document.querySelectorAll('[data-drop-target]').forEach(e=>{e.style.outline='';e.removeAttribute('data-drop-target')});
      if (!dragState.current.moved) { dragState.current=null; return; }
      const nx=Math.max(0,origX+ev.clientX-startX), ny=Math.max(0,origY+ev.clientY-startY);
      const target = document.elementFromPoint(ev.clientX, ev.clientY);
      if (target) {
        const fi = target.closest('.desktop-icon');
        if (fi) {
          const fid = fi.closest('[data-icon-id]')?.getAttribute('data-icon-id');
          if (fid && fid !== item.id) {
            const folderItem = items.find(i=>i.id===fid);
            if (folderItem && (folderItem.type==='folder'||folderItem.type==='folder-large')) {
              onMoveItemIntoFolder(item.id, fid); dragState.current=null; return;
            }
          }
        }
      }
      onMoveItem(item.id, nx, ny);
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) { el.style.zIndex=''; el.style.transition=''; }
      dragState.current=null;
    };
    document.addEventListener('mousemove',onMove); document.addEventListener('mouseup',onUp);
  }, [isEditMode, onMoveItem, onMoveItemIntoFolder, items]);

  return (
    <div ref={desktopRef} className="desktop-area" onMouseMove={handleMouseMove}
      onMouseLeave={()=>setWallpaperOffset({x:0,y:0})}
      onClick={handleClick} onContextMenu={handleDesktopContextMenu}>
      <div className="desktop-wallpaper" style={{
        backgroundImage: wallpaper?`url(${wallpaper})`:undefined,
        transform: parallaxEnabled?`translate(${wallpaperOffset.x}px,${wallpaperOffset.y}px)`:undefined,
      }}>
        {!wallpaper && (<><div className="wallpaper-gradient" /><div className="wallpaper-grid-overlay" />
          <div className="wallpaper-stickers"><span className="sticker sticker-star">⭐</span><span className="sticker sticker-heart">💖</span><span className="sticker sticker-sparkle">✨</span><span className="sticker sticker-rainbow">🌈</span></div></>)}
      </div>
      <div className="desktop-icons-layer">
        {items.map(item => (
          <div key={item.id} data-icon-id={item.id}>
            <DesktopIcon item={item} isSelected={selectedId===item.id}
              isEditMode={isEditMode} renamingId={renamingId} renameValue={renameValue}
              onRenameValueChange={onRenameValueChange} onRenameConfirm={onRenameConfirm}
              onRenameCancel={onRenameCancel} inputRef={inputRef}
              onSelect={onSelect} onDoubleClick={onDoubleClickItem}
              onContextMenu={(e,it) => showContextMenu(e,'icon',it)}
              onDragStart={handleDragStart} />
          </div>
        ))}
      </div>
      <Decorations items={decorations||[]} isEditMode={isEditMode}
        onUpdate={onUpdateDecoration} onDelete={onDeleteDecoration} />
      {isEditMode && <div className="edit-mode-banner">✎ 编辑模式</div>}
      <ContextMenu menu={contextMenu} isAdmin={isAdmin} editMode={isEditMode}
        onClose={hideContextMenu} onOpen={onDoubleClickItem}
        onRename={onRenameStart} onDelete={onDeleteItem}
        onChangeIcon={onChangeIcon} onAddItem={onAddItem}
        onAddDecoration={onAddDecoration}
        onToggleEdit={onToggleEdit} onOpenSettings={onOpenSettings} />
    </div>
  );
}
