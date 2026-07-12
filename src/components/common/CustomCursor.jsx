import { useState, useEffect, useRef } from 'react';
import './CustomCursor.css';

// 光标状态 → emoji 映射
const CURSOR_MAP = {
  default:   { emoji: '✏️', label: 'deskof.me' },
  pointer:   { emoji: '👆', label: 'click!' },
  text:      { emoji: '✍️', label: 'type' },
  grabbing:  { emoji: '✊', label: 'grab' },
  move:      { emoji: '🤏', label: 'move' },
  'n-resize':  { emoji: '↕️', label: 'resize' },
  's-resize':  { emoji: '↕️', label: 'resize' },
  'e-resize':  { emoji: '↔️', label: 'resize' },
  'w-resize':  { emoji: '↔️', label: 'resize' },
  'ne-resize': { emoji: '↗️', label: 'resize' },
  'nw-resize': { emoji: '↖️', label: 'resize' },
  'se-resize': { emoji: '↘️', label: 'resize' },
  'sw-resize': { emoji: '↙️', label: 'resize' },
  'ew-resize': { emoji: '↔️', label: 'resize' },
  'ns-resize': { emoji: '↕️', label: 'resize' },
  'nesw-resize': { emoji: '↗️', label: 'resize' },
  'nwse-resize': { emoji: '↘️', label: 'resize' },
  'not-allowed': { emoji: '🚫', label: 'nope' },
  wait:      { emoji: '⏳', label: 'wait' },
  crosshair: { emoji: '➕', label: 'select' },
  help:      { emoji: '❓', label: 'help' },
};

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default');
  const [clickParticles, setClickParticles] = useState([]);
  const particleId = useRef(0);
  const lastState = useRef('default');

  useEffect(() => {
    const onMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });

      // 深度检测光标样式：逐层查找直到找到显式 cursor
      let el = document.elementFromPoint(e.clientX, e.clientY);
      let detected = 'default';
      let depth = 0;
      while (el && depth < 8) {
        const cs = window.getComputedStyle(el);
        const c = cs.cursor;
        if (c && c !== 'auto' && c !== 'none') {
          detected = c;
          break;
        }
        el = el.parentElement;
        depth++;
      }
      
      // 额外的启发式检测
      if (detected === 'default') {
        // 检查是否在文本输入区
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target) {
          const tag = target.tagName?.toLowerCase();
          const isInput = tag === 'input' || tag === 'textarea' || target.isContentEditable;
          const role = target.getAttribute('role');
          if (isInput || role === 'textbox') detected = 'text';
        }
      }

      // 标准化到已知状态
      const knownState = CURSOR_MAP[detected] ? detected : 'default';
      if (knownState !== lastState.current) {
        lastState.current = knownState;
        setCursorState(knownState);
      }
    };

    const onClick = (e) => {
      const id = particleId.current++;
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      setClickParticles(prev => [...prev, {
        id, x: e.clientX + Math.cos(angle) * dist, y: e.clientY + Math.sin(angle) * dist,
        color: ['#FF69B4','#00FFFF','#39FF14','#FFD700','#BF40BF','#FF8C00'][Math.floor(Math.random()*6)],
        size: 4 + Math.random() * 6,
      }]);
      setTimeout(() => setClickParticles(prev => prev.filter(p => p.id !== id)), 600);
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const info = CURSOR_MAP[cursorState] || CURSOR_MAP.default;

  return (
    <>
      <div className="custom-cursor" style={{ left: pos.x - 16, top: pos.y - 16 }}>
        <span className={`cursor-icon state-${cursorState.includes('resize') ? 'resize' : cursorState}`}>
          {info.emoji}
          <span className="cursor-label">{info.label}</span>
        </span>
      </div>
      {clickParticles.map(p => (
        <div key={p.id} className="ink-particle" style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color }} />
      ))}
    </>
  );
}
