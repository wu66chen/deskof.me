import { useState, useCallback, useRef, useEffect } from 'react';
import './Window.css';

/**
 * Y2K 风格窗口外壳
 * 可拖拽、可关闭、可最小化
 */
export default function Window({
  id,
  title,
  icon,
  isMinimized,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  defaultPosition,
  children,
}) {
  const [position, setPosition] = useState(defaultPosition || { x: 120, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isClosing, setIsClosing] = useState(false);
  const windowRef = useRef(null);

  // 点击窗口置顶
  useEffect(() => {
    const el = windowRef.current;
    if (!el) return;
    const handler = () => onFocus(id);
    el.addEventListener('mousedown', handler);
    return () => el.removeEventListener('mousedown', handler);
  }, [id, onFocus]);

  // 拖拽逻辑
  const onTitleMouseDown = useCallback((e) => {
    if (e.target.closest('.window-btn')) return; // 不拦截按钮
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => {
      const newX = Math.max(-50, Math.min(e.clientX - dragOffset.x, window.innerWidth - 100));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 60));
      setPosition({ x: newX, y: newY });
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, dragOffset]);

  // 关闭动画
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onClose(id), 200);
  }, [id, onClose]);

  if (isMinimized) return null;

  return (
    <div
      ref={windowRef}
      className={`desktop-window win98-window ${isClosing ? 'closing' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex,
      }}
    >
      {/* 标题栏 */}
      <div className="window-titlebar" onMouseDown={onTitleMouseDown}>
        <div className="window-titlebar-left">
          {icon && <span className="window-title-icon">{icon}</span>}
          <span className="window-title">{title}</span>
        </div>
        <div className="window-titlebar-right">
          <button
            className="window-btn window-btn-minimize"
            onClick={() => onMinimize(id)}
            title="最小化"
          >
            _
          </button>
          <button
            className="window-btn window-btn-close"
            onClick={handleClose}
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="window-content">
        {children}
      </div>

      {/* 纸质便签装饰 */}
      <div className="window-sticky-note" />
    </div>
  );
}
