import { useRef, useCallback } from 'react';
import { iconEmoji } from '../../config/defaultIcons';
import './DesktopIcon.css';

/**
 * 桌面图标组件
 * 支持：拖拽（管理员/编辑模式）、选中、双击打开、重命名
 */
export default function DesktopIcon({
  item,
  isSelected,
  isEditMode,
  renamingId,
  renameValue,
  onRenameValueChange,
  onRenameConfirm,
  onRenameCancel,
  inputRef,
  onSelect,
  onDoubleClick,
  onContextMenu,
  onDragStart,
}) {
  const iconRef = useRef(null);
  const isRenaming = renamingId === item.id;

  const getIconContent = () => {
    // 自定义图标 URL
    if (item.icon) {
      return <img src={item.icon} alt="" className="desktop-icon-img" draggable={false} />;
    }
    // CSS 图标
    const emoji = iconEmoji[item.type] || iconEmoji.unknown;
    return <span className="desktop-icon-emoji">{emoji}</span>;
  };

  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation();
    if (isEditMode && !isRenaming) {
      onDoubleClick(item);
    } else if (!isEditMode) {
      onDoubleClick(item);
    }
  }, [item, isEditMode, isRenaming, onDoubleClick]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onSelect(item.id);
    if (isEditMode) {
      onDragStart(e, item);
    }
  }, [item, isEditMode, onSelect, onDragStart]);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const handleContextMenu = useCallback((e) => {
    e.stopPropagation();
    onContextMenu(e, item);
  }, [item, onContextMenu]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') onRenameConfirm();
    if (e.key === 'Escape') onRenameCancel();
  }, [onRenameConfirm, onRenameCancel]);

  const getSizeClass = () => {
    if (item.size === 'large') return 'icon-large';
    return '';
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${getSizeClass()} ${isSelected ? 'selected' : ''} ${isEditMode ? 'editable' : ''}`}
      style={{
        left: item.position.x,
        top: item.position.y,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      title={isEditMode ? `${item.name} (可拖拽)` : item.name}
    >
      <div className="desktop-icon-image">
        {getIconContent()}
      </div>
      <div className="desktop-icon-label">
        {isRenaming ? (
          <input
            ref={inputRef}
            className="rename-input"
            value={renameValue}
            onChange={(e) => onRenameValueChange(e.target.value)}
            onBlur={onRenameConfirm}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`icon-name ${isSelected ? 'name-selected' : ''}`}>
            {item.name}
          </span>
        )}
      </div>
      {isEditMode && (
        <div className="edit-badge" title="编辑模式 — 可拖拽此图标">✧</div>
      )}
    </div>
  );
}
