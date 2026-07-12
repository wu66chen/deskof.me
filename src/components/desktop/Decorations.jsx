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
  const startRef = useRef({});

  const onMouseDown = useCallback((e) => {
    if (!isEditMode || e.target.closest('.dec-handle')) return;
    e.stopPropagation(); e.preventDefault();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, ox: dec.x, oy: dec.y };
    const move = (ev) => onUpdate(dec.id, { x: startRef.current.ox+(ev.clientX-startRef.current.x), y: startRef.current.oy+(ev.clientY-startRef.current.y) });
    const up = () => { setDragging(false); document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [isEditMode, dec, onUpdate]);

  const onResizeStart = useCallback((e, corner) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    setResizing(true);
    startRef.current = { x: e.clientX, y: e.clientY, w: dec.width||80, h: dec.height||80 };
    const move = (ev) => {
      const dx = ev.clientX-startRef.current.x, dy = ev.clientY-startRef.current.y;
      let nw = startRef.current.w, nh = startRef.current.h;
      if (corner.includes('e')) nw = Math.max(20, startRef.current.w+dx);
      if (corner.includes('s')) nh = Math.max(20, startRef.current.h+dy);
      if (corner.includes('w')) nw = Math.max(20, startRef.current.w-dx);
      if (corner.includes('n')) nh = Math.max(20, startRef.current.h-dy);
      onUpdate(dec.id, { width: nw, height: nh, fontSize: dec.type==='text' ? Math.max(8, Math.round(nh*0.7)) : undefined });
    };
    const up = () => { setResizing(false); document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [isEditMode, dec, onUpdate]);

  // 旋转
  const onRotateStart = useCallback((e) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    setRotating(true);
    const cx = dec.x+(dec.width||80)/2, cy = dec.y+(dec.height||80)/2;
    const sa = Math.atan2(e.clientY-cy, e.clientX-cx)*180/Math.PI - (dec.rotation||0);
    startRef.current = { sa };
    const move = (ev) => {
      const a = Math.atan2(ev.clientY-cy, ev.clientX-cx)*180/Math.PI - startRef.current.sa;
      onUpdate(dec.id, { rotation: Math.round(a) });
    };
    const up = () => { setRotating(false); document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [isEditMode, dec, onUpdate]);

  const handleDelete = useCallback((e) => { e.stopPropagation(); onDelete(dec.id); }, [dec.id, onDelete]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    if (dec.type === 'text') {
      const text = prompt('编辑文字：', dec.content);
      if (text !== null) {
        const font = prompt('字体(留空=默认)：Gaegu / serif / monospace / cursive', dec.fontFamily||'');
        const color = prompt('文字颜色(留空=默认)：#333 / red / blue', dec.color||'');
        const bg = prompt('背景色(留空=透明)：white / #FFF9C4', dec.bgColor||'');
        const weight = confirm('加粗？') ? 'bold' : 'normal';
        onUpdate(dec.id, { content: text, fontFamily: font||undefined, color: color||undefined, bgColor: bg||undefined, fontWeight: weight });
      }
    } else {
      const url = prompt('编辑图片URL：', dec.content);
      if (url !== null) onUpdate(dec.id, { content: url });
    }
  }, [dec, onUpdate]);

  const style = {
    left: dec.x, top: dec.y,
    width: dec.width||'auto', height: dec.height||'auto',
    transform: (dec.rotation?`rotate(${dec.rotation}deg)`:'') + (dragging?' scale(1.02)':''),
    zIndex: dec.zIndex || 25000,
    opacity: dec.opacity ?? 1,
  };

  return (
    <div className={`decoration-item ${isEditMode?'editable':''} ${dragging?'dragging':''}`}
      style={style} onMouseDown={onMouseDown}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      {dec.type === 'image' ? (
        <img src={dec.content} alt="" draggable={false} style={{width:'100%',height:'100%',objectFit:'contain',pointerEvents:'none'}} />
      ) : (
        <span style={{
          fontFamily: dec.fontFamily || 'var(--hand-font)',
          fontSize: (dec.fontSize||14)+'px',
          color: dec.color || '#333',
          fontWeight: dec.fontWeight || 'normal',
          background: dec.bgColor || 'transparent',
          padding: dec.bgColor ? '4px 8px' : '0',
          borderRadius: dec.bgColor ? '4px' : '0',
          whiteSpace: 'pre-wrap', lineHeight: 1.3,
        }}>{dec.content}</span>
      )}
      {isEditMode && hover && (<>
        <button className="dec-handle dec-delete" onClick={handleDelete}>✕</button>
        <button className="dec-handle dec-edit" onClick={handleEdit}>✎</button>
        <button className="dec-handle dec-rotate" onMouseDown={onRotateStart} title="旋转">↻</button>
        <div className="dec-handle dec-resize-se" onMouseDown={e=>onResizeStart(e,'se')}/>
        <div className="dec-handle dec-resize-nw" onMouseDown={e=>onResizeStart(e,'nw')}/>
      </>)}
    </div>
  );
}
