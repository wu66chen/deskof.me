import DesktopIcon from '../desktop/DesktopIcon';
import './FolderWindow.css';

/**
 * 文件夹窗口 — 网格展示子项目
 */
export default function FolderWindow({
  folderItem,
  isEditMode,
  selectedId,
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
  const children = folderItem.children || [];

  return (
    <div className="folder-window">
      {children.length === 0 ? (
        <div className="folder-empty">
          <span className="empty-icon">📂</span>
          <p>此文件夹为空</p>
          {isEditMode && <p className="empty-hint">右键桌面 → 新建项目拖入</p>}
        </div>
      ) : (
        <div className="folder-grid">
          {children.map((child, index) => (
            <div
              key={child.id}
              className="folder-grid-item"
              style={{ animationDelay: `${index * 40}ms` }}
            >
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
                onContextMenu={onContextMenu}
                onDragStart={onDragStart}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
