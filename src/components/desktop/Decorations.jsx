import { useState, useCallback, useRef } from 'react';
import './Decorations.css';

export default function Decorations({ items, isEditMode, onUpdate, onDelete }) {
  return (
    <div className="decorations-layer">
      {items.map(dec => (
        <DecorationItem key={dec.id} dec={dec} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}

function DecorationItem({ dec, isEditMode, onUpdate, onDelete }) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [hover, setHover] = useState(false);
  const elRef = useRef(null);
  const startRef = useRef({});

  // 拖拽移动
  const onMouseDown = useCallback((e) => {
    if (!isEditMode || e.target.closest('.dec-handle')) return;
    e.stopPropagation(); e.preventDefault();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, ox: dec.x, oy: dec.y };
    const move = (ev) => onUpdate(dec.id, { x: startRef.current.ox+(ev.clientX-startRef.current.x), y: startRef.current.oy+(ev.clientY-startRef.current.y) });
    const up = () => { setDragging(false); docRemove(); };
    const docRemove = () => { document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [isEditMode, dec.id, dec.x, dec.y, onUpdate]);

  // 缩放
  const onResizeStart = useCallback((e, corner) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    setResizing(true);
    startRef.current = { x: e.clientX, y: e.clientY, w: dec.width||80, h: dec.height||80, ox: dec.x, oy: dec.y };
    const move = (ev) => {
      const dx = ev.clientX - startRef.current.x;
      const dy = ev.clientY - startRef.current.y;
      let nw = startRef.current.w, nh = startRef.current.h;
      if (corner.includes('e')) nw = Math.max(20, startRef.current.w + dx);
      if (corner.includes('s')) nh = Math.max(20, startRef.current.h + dy);
      if (corner.includes('w')) { nw = Math.max(20, startRef.current.w - dx); }
      if (corner.includes('n')) { nh = Math.max(20, startRef.current.h - dy); }
      const ratio = dec.type==='image' ? 1 : null;
      onUpdate(dec.id, { width: nw, height: ratio ? nw/ratio : nh });
    };
    const up = () => { setResizing(false); document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [isEditMode, dec, onUpdate]);

  // 旋转（shift+拖拽顶部把手）
  const onRotateStart = useCallback((e) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    setRotating(true);
    const cx = dec.x + (dec.width||80)/2, cy = dec.y + (dec.height||80)/2;
    const startAngle = Math.atan2(e.clientY-cy, e.clientX-cx) * 180/Math.PI - (dec.rotation||0);
    startRef.current = { startAngle };
    const move = (ev) => {
      const angle = Math.atan2(ev.clientY-cy, ev.clientX-cx) * 180/Math.PI - startRef.current.startAngle;
      onUpdate(dec.id, { rotation: Math.round(angle) });
    };
    const up = () => { setRotating(false); document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [isEditMode, dec, onUpdate]);

  const handleDelete = useCallback((e) => { e.stopPropagation(); onDelete(dec.id); }, [dec.id, onDelete]);
  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    if (dec.type === 'text') {
      const text = prompt('编辑文字：', dec.content);
      if (text !== null) onUpdate(dec.id, { content: text });
    } else {
      const url = prompt('编辑图片 URL：', dec.content);
      if (url !== null) onUpdate(dec.id, { content: url });
    }
  }, [dec, onUpdate]);

  const style = {
    left: dec.x, top: dec.y,
    width: dec.width || 'auto', height: dec.height || 'auto',
    transform: (dec.rotation ? `rotate(${dec.rotation}deg)` : ''),
    zIndex: dec.zIndex || 100, // 默认高于任务栏 (10000)
    opacity: dec.opacity ?? 1,
  };

  return (
    <div ref={elRef}
      className={`decoration-item ${isEditMode?'editable':''} ${dragging?'dragging':''} ${resizing?'resizing':''}`}
      style={style}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
    >
      {dec.type === 'image' ? (
        <img src={dec.content} alt="" draggable={false} style={{ width:'100%',height:'100%',objectFit:'contain',pointerEvents:'none' }} />
      ) : (
        <span style={{
          fontFamily: dec.fontFamily || 'var(--hand-font)',
          fontSize: (dec.fontSize || 14) + 'px',
          color: dec.color || '#333',
          background: dec.bgColor || 'transparent',
          padding: dec.bgColor ? '4px 8px' : '0',
          borderRadius: dec.bgColor ? '4px' : '0',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.3,
        }}>{dec.content}</span>
      )}

      {/* 编辑控件 */}
      {isEditMode && hover && (<>
        <button className="dec-handle dec-delete" onClick={handleDelete} title="删除">✕</button>
        <button className="dec-handle dec-edit" onClick={handleEdit} title="编辑内容">✎</button>
        <div className="dec-handle dec-resize-se" onMouseDown={e => onResizeStart(e,'se')} />
        <div className="dec-handle dec-resize-sw" onMouseDown={e => onResizeStart(e,'sw')} />
        <div className="dec-handle dec-resize-ne" onMouseDown={e => onResizeStart(e,'ne')} />
        <div className="dec-handle dec-resize-nw" onMouseDown={e => onResizeStart(e,'nw')} />
      </>)}
    </div>
  );
}
