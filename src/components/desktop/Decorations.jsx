import { useState, useCallback, useRef } from 'react';
import './Decorations.css';

export default function Decorations({ items, isEditMode, onUpdate, onDelete, onContextMenu }) {
  return (
    <div className="decorations-layer" onContextMenu={onContextMenu}>
      {items.map(dec => (
        <DecorationItem key={dec.id} dec={dec} isEditMode={isEditMode} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}

function DecorationItem({ dec, isEditMode, onUpdate, onDelete }) {
  const [dragging, setDragging] = useState(false);
  const elRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const onMouseDown = useCallback((e) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, ox: dec.x, oy: dec.y };
    const onMove = (ev) => {
      onUpdate(dec.id, {
        x: startRef.current.ox + (ev.clientX - startRef.current.x),
        y: startRef.current.oy + (ev.clientY - startRef.current.y),
      });
    };
    const onUp = () => { setDragging(false); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  }, [isEditMode, dec.id, dec.x, dec.y, onUpdate]);

  const onContextMenu = useCallback((e) => {
    if (!isEditMode) return;
    e.stopPropagation(); e.preventDefault();
    const action = prompt('操作此装饰：输入 "delete" 删除，输入新图片URL替换：');
    if (action === 'delete') onDelete(dec.id);
    else if (action && action.length > 2) onUpdate(dec.id, { content: action });
  }, [isEditMode, dec.id, onUpdate, onDelete]);

  const style = {
    left: dec.x, top: dec.y,
    width: dec.width || 'auto', height: dec.height || 'auto',
    transform: dec.rotation ? `rotate(${dec.rotation}deg)` : undefined,
    zIndex: dec.zIndex || 5,
  };

  if (dec.type === 'image') {
    return (
      <div ref={elRef} className={`decoration-item ${isEditMode ? 'editable' : ''} ${dragging ? 'dragging' : ''}`}
        style={style} onMouseDown={onMouseDown} onContextMenu={onContextMenu} title={isEditMode ? '拖拽移动 | 右键编辑' : ''}>
        <img src={dec.content} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
        {isEditMode && <div className="dec-edit-handle" />}
      </div>
    );
  }

  return (
    <div ref={elRef} className={`decoration-item decoration-text ${isEditMode ? 'editable' : ''} ${dragging ? 'dragging' : ''}`}
      style={style} onMouseDown={onMouseDown} onContextMenu={onContextMenu} title={isEditMode ? '拖拽移动 | 右键编辑' : ''}>
      <span style={{ fontFamily: 'var(--hand-font)', fontSize: dec.fontSize || 14, color: dec.color || '#333' }}>{dec.content}</span>
      {isEditMode && <div className="dec-edit-handle" />}
    </div>
  );
}
