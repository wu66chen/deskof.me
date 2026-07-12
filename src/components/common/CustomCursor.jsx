import { useState, useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default');
  const [clickParticles, setClickParticles] = useState([]);
  const particleId = useRef(0);

  useEffect(() => {
    const onMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      const computed = window.getComputedStyle(el);
      const c = computed.cursor;
      if (c === 'pointer') setCursorState('pointer');
      else if (c === 'text') setCursorState('text');
      else if (c === 'grabbing' || c === 'move') setCursorState('grabbing');
      else setCursorState('default');
    };

    const onClick = (e) => {
      const id = particleId.current++;
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      setClickParticles(prev => [...prev, {
        id, x: e.clientX + Math.cos(angle) * dist, y: e.clientY + Math.sin(angle) * dist,
        color: ['#FF69B4','#00FFFF','#39FF14','#FFD700','#BF40BF'][Math.floor(Math.random()*5)],
        size: 4 + Math.random() * 6,
      }]);
      setTimeout(() => setClickParticles(prev => prev.filter(p => p.id !== id)), 600);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('click', onClick);
    };
  }, []);

  const getEmoji = () => {
    switch (cursorState) {
      case 'pointer': return '👆';
      case 'text': return '✏️';
      case 'grabbing': return '✊';
      default: return '✏️';
    }
  };

  return (
    <>
      <div className="custom-cursor" style={{ left: pos.x - 14, top: pos.y - 14 }}>
        <span className={`cursor-icon state-${cursorState}`}>{getEmoji()}</span>
      </div>
      {clickParticles.map(p => (
        <div key={p.id} className="ink-particle" style={{ left: p.x, top: p.y, width: p.size, height: p.size, backgroundColor: p.color }} />
      ))}
    </>
  );
}
