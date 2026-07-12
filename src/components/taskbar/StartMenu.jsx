import './StartMenu.css';

/**
 * 开始菜单
 */
export default function StartMenu({
  isAdmin,
  editMode,
  onToggleEdit,
  onOpenSettings,
  onLogout,
  onClose,
}) {
  return (
    <div className="start-menu-overlay" onClick={onClose}>
      <div className="start-menu win98-window" onClick={(e) => e.stopPropagation()}>
        {/* 侧边栏 */}
        <div className="start-menu-sidebar">
          <span className="start-menu-brand">deskof.me</span>
          <span className="start-menu-version">Y2K Edition</span>
        </div>

        {/* 菜单项 */}
        <div className="start-menu-items">
          {isAdmin && (
            <button
              className="start-menu-item"
              onClick={() => { onToggleEdit(); onClose(); }}
            >
              <span className="menu-item-icon">{editMode ? '👁️' : '✎'}</span>
              <span>{editMode ? '退出编辑模式' : '进入编辑模式'}</span>
            </button>
          )}

          {isAdmin && (
            <button
              className="start-menu-item"
              onClick={() => { onOpenSettings(); onClose(); }}
            >
              <span className="menu-item-icon">⚙️</span>
              <span>站点设置</span>
            </button>
          )}

          <div className="start-menu-separator" />

          <button
            className="start-menu-item"
            onClick={() => window.open('https://github.com/wu66chen/deskof.me', '_blank')}
          >
            <span className="menu-item-icon">⭐</span>
            <span>GitHub</span>
          </button>

          <div className="start-menu-separator" />

          {isAdmin ? (
            <button
              className="start-menu-item"
              onClick={() => { onLogout(); onClose(); }}
            >
              <span className="menu-item-icon">🚪</span>
              <span>退出登录</span>
            </button>
          ) : (
            <button
              className="start-menu-item"
              onClick={() => { onClose(); /* 触发登录 */ }}
            >
              <span className="menu-item-icon">🔑</span>
              <span>管理员登录</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
