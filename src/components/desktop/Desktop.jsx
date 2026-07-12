import { useState, useCallback, useRef } from 'react';
import DesktopIcon from './DesktopIcon';
import ContextMenu from '../common/ContextMenu';
import './Desktop.css';

export default function Desktop({
  items, wallpaper, isEditMode, selectedId, renamingId, renameValue,
  onRenameValueChange, onRenameConfirm, onRenameCancel, inputRef,
  onSelect, onDoubleClickItem, onMoveItem, onAddItem, onDeleteItem,
  onRenameStart, onChangeIcon,
  contextMenu, showContextMenu, hideContextMenu,
  isAdmin, onToggleEdit, onOpenSettings,
}) {
  const [wallpaperOffset, setWallpaperOffset] = useState({ x: 0, y: 0 });
  const desktopRef = useRef(null);
  const dragState = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;
    setWallpaperOffset({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * -8,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * -8,
    });
  }, []);

  const handleContextMenu = useCallback((e) => {
    showContextMenu(e, 'desktop');
  }, [showContextMenu]);

  const handleClick = useCallback(() => onSelect(null), [onSelect]);

  // 跟手拖拽：移动时直接操作 DOM，释放时保存
  const handleDragStart = useCallback((e, item) => {
    if (!isEditMode) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = item.position.x;
    const origY = item.position.y;
    dragState.current = { itemId: item.id, origX, origY, moved: false };

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
      dragState.current.moved = true;
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) {
        el.style.left = Math.max(0, origX + dx) + 'px';
        el.style.top = Math.max(0, origY + dy) + 'px';
        el.style.zIndex = '50';
        el.style.transition = 'none';
      }
    };

    const onUp = (ev) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (!dragState.current.moved) { dragState.current = null; return; }
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = Math.max(0, origX + dx);
      const newY = Math.max(0, origY + dy);
      onMoveItem(item.id, newX, newY);
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) { el.style.zIndex = ''; el.style.transition = ''; }
      dragState.current = null;
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isEditMode, onMoveItem]);

  return (
    <div ref={desktopRef} className="desktop-area" onMouseMove={handleMouseMove}
      onMouseLeave={() => setWallpaperOffset({x:0,y:0})}
      onClick={handleClick} onContextMenu={handleContextMenu}>
      <div className="desktop-wallpaper" style={{
        backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
        transform: `translate(${wallpaperOffset.x}px, ${wallpaperOffset.y}px)`,
      }}>
        {!wallpaper && (<><div className="wallpaper-gradient" /><div className="wallpaper-grid-overlay" />
          <div className="wallpaper-stickers">
            <span className="sticker sticker-star">⭐</span><span className="sticker sticker-heart">💖</span>
            <span className="sticker sticker-sparkle">✨</span><span className="sticker sticker-rainbow">🌈</span>
            <span className="sticker sticker-butterfly">🦋</span>
          </div></>)}
      </div>
      <div className="desktop-icons-layer">
        {items.map(item => (
          <div key={item.id} data-icon-id={item.id}>
            <DesktopIcon item={item} isSelected={selectedId === item.id}
              isEditMode={isEditMode} renamingId={renamingId} renameValue={renameValue}
              onRenameValueChange={onRenameValueChange} onRenameConfirm={onRenameConfirm}
              onRenameCancel={onRenameCancel} inputRef={inputRef}
              onSelect={onSelect} onDoubleClick={onDoubleClickItem}
              onContextMenu={(e, it) => showContextMenu(e, 'icon', it)}
              onDragStart={handleDragStart} />
          </div>
        ))}
      </div>
      {isEditMode && (<div className="edit-mode-banner">✎ 编辑模式 — 拖拽图标、右键添加/删除</div>)}
      <ContextMenu menu={contextMenu} isAdmin={isAdmin} editMode={isEditMode}
        onClose={hideContextMenu} onOpen={onDoubleClickItem} onRename={onRenameStart}
        onDelete={onDeleteItem} onChangeIcon={onChangeIcon} onAddItem={onAddItem}
        onToggleEdit={onToggleEdit} onOpenSettings={onOpenSettings} />
    </div>
  );
}
