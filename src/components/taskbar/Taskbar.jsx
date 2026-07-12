import { useState, useEffect, useCallback, useRef } from 'react';
import StartMenu from './StartMenu';
import './Taskbar.css';

export default function Taskbar({
  windows, isAdmin, editMode, onRestoreWindow, onToggleEdit,
  onOpenSettings, onLogout, onShowLogin, startMenuItems,
}) {
  const [time, setTime] = useState(new Date());
  const [startOpen, setStartOpen] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (date) => {
    const h = date.getHours(), m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // 时钟连击检测：5 次点击在 3 秒内 → 触发登录
  const handleClockClick = useCallback((e) => {
    e.stopPropagation();
    if (isAdmin) return; // 已是管理员，不触发
    clickCount.current++;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 5) {
      clickCount.current = 0;
      onShowLogin?.();
    } else {
      clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 3000);
    }
  }, [isAdmin, onShowLogin]);

  return (<>
    {startOpen && (
      <StartMenu isAdmin={isAdmin} editMode={editMode}
        onToggleEdit={onToggleEdit} onOpenSettings={onOpenSettings}
        onLogout={onLogout} onClose={() => setStartOpen(false)}
        startMenuItems={startMenuItems} />
    )}
    <div className="taskbar">
      <button className={`taskbar-start-btn ${startOpen?'active':''}`} onClick={()=>setStartOpen(p=>!p)}>
        <span className="start-icon">🖥️</span><span className="start-text">Start</span>
      </button>
      <div className="taskbar-divider" />
      <div className="taskbar-windows">
        {windows.map(win => (
          <button key={win.id} className={`taskbar-window-btn ${win.minimized?'minimized':''}`}
            onClick={() => onRestoreWindow(win.id)} title={win.item.name}>
            <span className="taskbar-win-name">{win.item.name}</span>
          </button>
        ))}
      </div>
      <div className="taskbar-tray">
        {isAdmin && <span className="tray-item admin-indicator" title={editMode?'编辑模式':'管理员'}>{editMode?'✎':'👤'}</span>}
        <div className="tray-item tray-time" onClick={handleClockClick} title={isAdmin?'':undefined} style={{cursor:'pointer'}}>
          <span className="time-text">{formatTime(time)}</span>
        </div>
      </div>
    </div>
  </>);
}
