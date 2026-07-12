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
  const [hover, setHover] = useState(false);
  const startRef = useRef({});

  const onMouseDown = useCallback((e) => {
    if (!isEditMode || e.target.closest('.dec-handle')) return;
    e.stopPropagation(); e.preventDefault();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, ox: dec.x, oy: dec.y };
    const m = (ev) => onUpdate(dec.id, { x: startRef.current.ox+(ev.clientX-startRef.current.x), y: startRef.current.oy+(ev.clientY-startRef.current.y) });
    const u = () => { setDragging(false); document.removeEventListener('mousemove',m); document.removeEventListener('mouseup',u); };
    document.addEventListener('mousemove',m); document.addEventListener('mouseup',u);
  }, [isEditMode, dec, onUpdate]);

  const onResizeStart = useCallback((e, corner) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    setResizing(true);
    startRef.current = { x: e.clientX, y: e.clientY, w: dec.width||80, h: dec.height||80 };
    const m = (ev) => {
      const dx=ev.clientX-startRef.current.x, dy=ev.clientY-startRef.current.y;
      let nw=startRef.current.w, nh=startRef.current.h;
      if(corner.includes('e'))nw=Math.max(20,startRef.current.w+dx);
      if(corner.includes('s'))nh=Math.max(20,startRef.current.h+dy);
      if(corner.includes('w'))nw=Math.max(20,startRef.current.w-dx);
      if(corner.includes('n'))nh=Math.max(20,startRef.current.h-dy);
      const upd = { width: nw, height: nh };
      if(dec.type==='text') upd.fontSize = Math.max(8, Math.round(nh*0.6));
      onUpdate(dec.id, upd);
    };
    const u = () => { setResizing(false); document.removeEventListener('mousemove',m); document.removeEventListener('mouseup',u); };
    document.addEventListener('mousemove',m); document.addEventListener('mouseup',u);
  }, [isEditMode, dec, onUpdate]);

  const onRotateStart = useCallback((e) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    const cx = dec.x+(dec.width||80)/2, cy = dec.y+(dec.height||80)/2;
    const sa = Math.atan2(e.clientY-cy, e.clientX-cx)*180/Math.PI - (dec.rotation||0);
    startRef.current = { sa, cx, cy };
    const m = (ev) => {
      const a = Math.atan2(ev.clientY-startRef.current.cy, ev.clientX-startRef.current.cx)*180/Math.PI - startRef.current.sa;
      onUpdate(dec.id, { rotation: Math.round(a) });
    };
    const u = () => { document.removeEventListener('mousemove',m); document.removeEventListener('mouseup',u); };
    document.addEventListener('mousemove',m); document.addEventListener('mouseup',u);
  }, [isEditMode, dec, onUpdate]);

  const handleDelete = useCallback((e) => { e.stopPropagation(); onDelete(dec.id); }, [dec.id, onDelete]);

  // 文字编辑：一行格式串 color|bg|font|weight|text
  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    if (dec.type === 'text') {
      const current = [dec.color||'#333', dec.bgColor||'', dec.fontFamily||'', dec.fontWeight||'normal', dec.content||''].join('|');
      const input = prompt('格式: 颜色|背景色|字体|粗体|文字\n例: red|white|serif|bold|Hello\n颜色=#333, 背景=透明, 字体=Gaegu', current);
      if (input !== null) {
        const parts = input.split('|');
        onUpdate(dec.id, {
          color: parts[0] || '#333',
          bgColor: parts[1] || undefined,
          fontFamily: parts[2] || undefined,
          fontWeight: parts[3] === 'bold' ? 'bold' : 'normal',
          content: parts.slice(4).join('|') || dec.content,
        });
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
    position: 'fixed',
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
