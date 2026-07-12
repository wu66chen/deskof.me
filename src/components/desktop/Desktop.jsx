import { useState, useCallback, useEffect, useRef } from 'react';
import DesktopIcon from './DesktopIcon';
import ContextMenu from '../common/ContextMenu';
import './Desktop.css';

/**
 * 主桌面区域
 * 壁纸 + 图标网格 + 右键菜单 + 视差效果
 */
export default function Desktop({
  items,
  wallpaper,
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
  onMoveItem,
  onAddItem,
  onDeleteItem,
  onRenameStart,
  onChangeIcon,
  contextMenu,
  showContextMenu,
  hideContextMenu,
  isAdmin,
  onToggleEdit,
  onOpenSettings,
}) {
  const [wallpaperOffset, setWallpaperOffset] = useState({ x: 0, y: 0 });
  const desktopRef = useRef(null);

  // 壁纸视差
  const handleMouseMove = useCallback((e) => {
    const rect = desktopRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setWallpaperOffset({ x: x * -8, y: y * -8 });
  }, []);

  const handleMouseLeave = () => {
    setWallpaperOffset({ x: 0, y: 0 });
  };

  // 桌面右键
  const handleContextMenu = useCallback((e) => {
    showContextMenu(e, 'desktop');
  }, [showContextMenu]);

  // 空白区域点击取消选中
  const handleClick = useCallback(() => {
    onSelect(null);
  }, [onSelect]);

  // 图标拖拽开始
  const handleDragStart = useCallback((e, item) => {
    if (!isEditMode) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = item.position.x;
    const origY = item.position.y;

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      // 实时更新位置（直接操作 DOM 更流畅）
      const el = document.querySelector(`[data-icon-id="${item.id}"]`);
      if (el) {
        const gridSnap = true ? Math.round((origX + dx) / 80) * 80 : origX + dx;
        const gridSnapY = true ? Math.round((origY + dy) / 80) * 80 : origY + dy;
        el.style.left = `${Math.max(0, gridSnap)}px`;
        el.style.top = `${Math.max(0, gridSnapY)}px`;
      }
    };

    const onUp = (ev) => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const newX = Math.max(0, Math.round((origX + dx) / 80) * 80);
      const newY = Math.max(0, Math.round((origY + dy) / 80) * 80);
      onMoveItem(item.id, newX, newY);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [isEditMode, onMoveItem]);

  return (
    <div
      ref={desktopRef}
      className="desktop-area"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {/* 壁纸层 */}
      <div
        className="desktop-wallpaper"
        style={{
          backgroundImage: wallpaper ? `url(${wallpaper})` : undefined,
          transform: `translate(${wallpaperOffset.x}px, ${wallpaperOffset.y}px)`,
        }}
      >
        {/* 默认 CSS 壁纸：彩虹渐变 + 格纹 */}
        {!wallpaper && (
          <>
            <div className="wallpaper-gradient" />
            <div className="wallpaper-grid-overlay" />
            <div className="wallpaper-stickers">
              <span className="sticker sticker-star">⭐</span>
              <span className="sticker sticker-heart">💖</span>
              <span className="sticker sticker-sparkle">✨</span>
              <span className="sticker sticker-rainbow">🌈</span>
              <span className="sticker sticker-butterfly">🦋</span>
            </div>
          </>
        )}
      </div>

      {/* 图标层 */}
      <div className="desktop-icons-layer">
        {items.map(item => (
          <div key={item.id} data-icon-id={item.id}>
            <DesktopIcon
              item={item}
              isSelected={selectedId === item.id}
              isEditMode={isEditMode}
              renamingId={renamingId}
              renameValue={renameValue}
              onRenameValueChange={onRenameValueChange}
              onRenameConfirm={onRenameConfirm}
              onRenameCancel={onRenameCancel}
              inputRef={inputRef}
              onSelect={onSelect}
              onDoubleClick={onDoubleClickItem}
              onContextMenu={(e, it) => showContextMenu(e, 'icon', it)}
              onDragStart={handleDragStart}
            />
          </div>
        ))}
      </div>

      {/* 编辑模式指示器 */}
      {isEditMode && (
        <div className="edit-mode-banner">
          ✎ 编辑模式 — 你可以拖拽图标、右键添加/删除文件
        </div>
      )}

      {/* 右键菜单 */}
      <ContextMenu
        menu={contextMenu}
        isAdmin={isAdmin}
        editMode={isEditMode}
        onClose={hideContextMenu}
        onOpen={onDoubleClickItem}
        onRename={onRenameStart}
        onDelete={onDeleteItem}
        onChangeIcon={onChangeIcon}
        onAddItem={onAddItem}
        onToggleEdit={onToggleEdit}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}
