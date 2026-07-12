import { useRef, useCallback } from 'react';
import { iconEmoji } from '../../config/defaultIcons';
import './DesktopIcon.css';

// 去除名字中的 emoji 前缀（因为图标已经显示了类型 emoji）
function stripEmoji(name) {
  return name.replace(/^[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{200D}\u{FE0F}\u{20E3}\u{3299}\u{3297}\u{303D}\u{3030}\u{24C2}\u{203C}\u{2049}\u{25AA}-\u{25FE}\u{2615}\u{2614}\u{26A0}-\u{26FF}\u{2702}-\u{27B0}\u{2934}\u{2935}\u{00A9}\u{00AE}\u{2122}\u{2139}\u{2328}\u{23CF}\u{24C2}\u{25B6}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{200D}\u{FE0F}]+\s*/u, '');
}

export default function DesktopIcon({
  item, isSelected, isEditMode, renamingId, renameValue,
  onRenameValueChange, onRenameConfirm, onRenameCancel, inputRef,
  onSelect, onDoubleClick, onContextMenu, onDragStart,
}) {
  const iconRef = useRef(null);
  const isRenaming = renamingId === item.id;
  const displayName = stripEmoji(item.name);

  const getIconContent = () => {
    if (item.icon) return <img src={item.icon} alt="" className="desktop-icon-img" draggable={false} />;
    const emoji = iconEmoji[item.type] || iconEmoji.unknown;
    return <span className="desktop-icon-emoji">{emoji}</span>;
  };

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    onDoubleClick(item);
  }, [item, onDoubleClick]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(item.id);
    if (isEditMode) onDragStart(e, item);
  }, [item, isEditMode, onSelect, onDragStart]);

  const handleClick = useCallback((e) => { e.stopPropagation(); }, []);
  const handleContextMenu = useCallback((e) => {
    e.stopPropagation();
    onContextMenu(e, item);
  }, [item, onContextMenu]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') onRenameConfirm();
    if (e.key === 'Escape') onRenameCancel();
  }, [onRenameConfirm, onRenameCancel]);

  return (
    <div ref={iconRef}
      className={`desktop-icon ${item.size === 'large' ? 'icon-large' : ''} ${isSelected ? 'selected' : ''} ${isEditMode ? 'editable' : ''}`}
      style={{ left: item.position.x, top: item.position.y }}
      onMouseDown={handleMouseDown} onClick={handleClick}
      onDoubleClick={handleDoubleClick} onContextMenu={handleContextMenu}
      title={isEditMode ? `${displayName} (可拖拽)` : displayName}>
      <div className="desktop-icon-image">{getIconContent()}</div>
      <div className="desktop-icon-label">
        {isRenaming ? (
          <input ref={inputRef} className="rename-input" value={renameValue}
            onChange={e => onRenameValueChange(e.target.value)}
            onBlur={onRenameConfirm} onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()} />
        ) : (
          <span className={`icon-name ${isSelected ? 'name-selected' : ''}`}>{displayName}</span>
        )}
      </div>
      {isEditMode && <div className="edit-badge" title="编辑模式 — 可拖拽">✧</div>}
    </div>
  );
}
