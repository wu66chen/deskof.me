import { useState, useEffect, useCallback, useRef } from 'react';
import './CustomCursor.css';

/**
 * 自定义光标
 * 手绘铅笔风格，支持多种状态
 */
export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default'); // default | pointer | text | grabbing
  const [clickParticles, setClickParticles] = useState([]);
  const particleId = useRef(0);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });

      // 检测下方元素类型
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      const computed = window.getComputedStyle(el);
      const cursor = computed.cursor;
      if (cursor === 'pointer') setCursorState('pointer');
      else if (cursor === 'text') setCursorState('text');
      else if (cursor === 'grabbing' || cursor === 'move') setCursorState('grabbing');
      else setCursorState('default');
    };

    const onClick = (e) => {
      // 墨水飞溅粒子
      const id = particleId.current++;
      const angle = Math.random() * Math.PI * 2;
      const distance = 20 + Math.random() * 30;
      setClickParticles(prev => [...prev, {
        id,
        x: e.clientX + Math.cos(angle) * distance,
        y: e.clientY + Math.sin(angle) * distance,
        color: ['#FF69B4', '#00FFFF', '#39FF14', '#FFD700', '#BF40BF'][Math.floor(Math.random() * 5)],
        size: 3 + Math.random() * 5,
      }]);
      setTimeout(() => {
        setClickParticles(prev => prev.filter(p => p.id !== id));
      }, 600);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const getCursorContent = () => {
    switch (cursorState) {
      case 'pointer': return '👆';
      case 'text': return '✏️';
      case 'grabbing': return '✊';
      default: return '✏️';
    }
  };

  return (
    <>
      {/* 主光标 */}
      <div
        className="custom-cursor"
        style={{
          left: pos.x - 8,
          top: pos.y - 8,
        }}
      >
        <span className={`cursor-icon state-${cursorState}`}>
          {getCursorContent()}
        </span>
      </div>

      {/* 墨水飞溅粒子 */}
      {clickParticles.map(p => (
        <div
          key={p.id}
          className="ink-particle"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
        />
      ))}
    </>
  );
}
