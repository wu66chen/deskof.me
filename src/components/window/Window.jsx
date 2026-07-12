import { useState, useCallback, useRef, useEffect } from 'react';
import './Window.css';

const TYPE_SIZES = {
  'folder': { w: 720, h: 500 }, 'folder-large': { w: 760, h: 500 },
  'image': { w: 600, h: 500 }, 'video': { w: 680, h: 500 },
  'markdown': { w: 620, h: 500 }, 'link': { w: 380, h: 200 }, 'file': { w: 500, h: 500 },
};

export default function Window({
  id, title, icon, type,
  isMinimized, onClose, onMinimize, onFocus, zIndex,
  defaultSize, onSaveDefault,
  windowDecoration,
  children,
}) {
  const sizeFromConfig = defaultSize || TYPE_SIZES[type] || { w: 500, h: 500 };
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState(sizeFromConfig);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevState, setPrevState] = useState(null);
  const windowRef = useRef(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setPosition({
        x: Math.max(20, (window.innerWidth - sizeFromConfig.w) / 2),
        y: Math.max(20, (window.innerHeight - sizeFromConfig.h - 40) / 2),
      });
      setInitialized(true);
    }
  }, [initialized, sizeFromConfig.w, sizeFromConfig.h]);

  useEffect(() => {
    const el = windowRef.current; if (!el) return;
    const handler = () => onFocus(id);
    el.addEventListener('mousedown', handler);
    return () => el.removeEventListener('mousedown', handler);
  }, [id, onFocus]);

  const onTitleMouseDown = useCallback((e) => {
    if (e.target.closest('.window-btn') || e.target.closest('.window-save-btn')) return;
    if (isFullscreen) return;
    e.preventDefault(); e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position, isFullscreen]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => setPosition({ x: Math.max(-50, Math.min(e.clientX - dragStart.x, window.innerWidth - 60)), y: Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 40)) });
    const onUp = () => setIsDragging(false);
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isDragging, dragStart]);

  const onResizeStart = useCallback((e, dir) => {
    e.preventDefault(); e.stopPropagation();
    setIsResizing(true); setResizeDir(dir);
    setDragStart({ x: e.clientX, y: e.clientY, w: size.w, h: size.h, px: position.x, py: position.y });
  }, [size, position]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e) => {
      const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
      let nw = dragStart.w, nh = dragStart.h, nx = position.x, ny = position.y;
      if (resizeDir.includes('e')) nw = Math.max(300, dragStart.w + dx);
      if (resizeDir.includes('s')) nh = Math.max(200, dragStart.h + dy);
      if (resizeDir.includes('w')) { nw = Math.max(300, dragStart.w - dx); nx = dragStart.px + dx; }
      if (resizeDir.includes('n')) { nh = Math.max(200, dragStart.h - dy); ny = dragStart.py + dy; }
      setSize({ w: nw, h: nh }); setPosition({ x: nx, y: ny });
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [isResizing, dragStart, resizeDir, position]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) { if (prevState) { setPosition(prevState.pos); setSize(prevState.size); } setIsFullscreen(false); }
    else { setPrevState({ pos: { ...position }, size: { ...size } }); setPosition({ x: 0, y: 0 }); setSize({ w: window.innerWidth, h: window.innerHeight - 40 }); setIsFullscreen(true); }
  }, [isFullscreen, prevState, position, size]);

  const handleClose = useCallback(() => { setIsClosing(true); setTimeout(() => onClose(id), 200); }, [id, onClose]);
  const handleSaveDefault = useCallback((e) => { e.stopPropagation(); onSaveDefault?.(type, { w: size.w, h: size.h }); }, [type, size, onSaveDefault]);

  if (isMinimized) return null;

  return (
    <div ref={windowRef} className={`desktop-window win98-window ${isClosing ? 'closing' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
      style={{ left: position.x, top: position.y, width: size.w, height: size.h, zIndex }}>
      <div className="window-titlebar" onMouseDown={onTitleMouseDown} onDoubleClick={toggleFullscreen}>
        <div className="window-titlebar-left">
          {icon && <span className="window-title-icon">{icon}</span>}
          <span className="window-title">{title}</span>
          <button className="window-btn window-save-btn" onClick={handleSaveDefault} title="保存当前窗口大小和位置为默认" style={{marginLeft:8,fontSize:8,padding:'0 4px'}}>💾默认</button>
        </div>
        <div className="window-titlebar-right">
          <button className="window-btn window-btn-minimize" onClick={() => onMinimize(id)}>_</button>
          <button className="window-btn window-btn-maximize" onClick={toggleFullscreen}>{isFullscreen ? '❐' : '□'}</button>
          <button className="window-btn window-btn-close" onClick={handleClose}>✕</button>
        </div>
      </div>
      <div className="window-content" style={windowDecoration ? { backgroundImage: `url(${windowDecoration})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
        {children}
      </div>
      {!isFullscreen && (<>
        <div className="resize-handle resize-n" onMouseDown={e => onResizeStart(e,'n')} />
        <div className="resize-handle resize-s" onMouseDown={e => onResizeStart(e,'s')} />
        <div className="resize-handle resize-e" onMouseDown={e => onResizeStart(e,'e')} />
        <div className="resize-handle resize-w" onMouseDown={e => onResizeStart(e,'w')} />
        <div className="resize-handle resize-ne" onMouseDown={e => onResizeStart(e,'ne')} />
        <div className="resize-handle resize-nw" onMouseDown={e => onResizeStart(e,'nw')} />
        <div className="resize-handle resize-se" onMouseDown={e => onResizeStart(e,'se')} />
        <div className="resize-handle resize-sw" onMouseDown={e => onResizeStart(e,'sw')} />
      </>)}
      <div className="window-sticky-note" />
    </div>
  );
}
