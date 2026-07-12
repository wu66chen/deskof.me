import { useState, useEffect, useCallback } from 'react';
import StartMenu from './StartMenu';
import './Taskbar.css';

/**
 * 底部任务栏
 */
export default function Taskbar({
  windows,
  isAdmin,
  editMode,
  onRestoreWindow,
  onToggleEdit,
  onOpenSettings,
  onLogout,
}) {
  const [time, setTime] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);

  // 时钟更新
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const formatDate = (date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const y = date.getFullYear();
    const mo = date.getMonth() + 1;
    const d = date.getDate();
    const day = days[date.getDay()];
    return `${y}/${mo}/${d} 周${day}`;
  };

  const toggleStart = useCallback(() => {
    setStartOpen(prev => !prev);
  }, []);

  return (
    <>
      {startOpen && (
        <StartMenu
          isAdmin={isAdmin}
          editMode={editMode}
          onToggleEdit={onToggleEdit}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
          onClose={() => setStartOpen(false)}
        />
      )}

      <div className="taskbar">
        {/* 开始按钮 */}
        <button
          className={`taskbar-start-btn ${startOpen ? 'active' : ''}`}
          onClick={toggleStart}
        >
          <span className="start-icon">🖥️</span>
          <span className="start-text">Start</span>
        </button>

        <div className="taskbar-divider" />

        {/* 已打开窗口 */}
        <div className="taskbar-windows">
          {windows.filter(w => !w.minimized || true).map(win => (
            <button
              key={win.id}
              className={`taskbar-window-btn ${win.minimized ? 'minimized' : ''}`}
              onClick={() => onRestoreWindow(win.id)}
              title={win.item.name}
            >
              <span className="taskbar-win-icon">
                {win.item.type === 'folder' || win.item.type === 'folder-large' ? '📁' :
                 win.item.type === 'image' ? '🖼️' :
                 win.item.type === 'video' ? '🎬' :
                 win.item.type === 'markdown' ? '📝' :
                 win.item.type === 'link' ? '🔗' : '📄'}
              </span>
              <span className="taskbar-win-name">{win.item.name}</span>
            </button>
          ))}
        </div>

        {/* 托盘区 */}
        <div className="taskbar-tray">
          {isAdmin && (
            <span className="tray-item admin-indicator" title={editMode ? '编辑模式' : '管理员'}>
              {editMode ? '✎' : '👤'}
            </span>
          )}
          <div className="tray-item tray-time">
            <span className="time-text">{formatTime(time)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
