import { memo, useEffect, useRef, useState } from 'react';
import { CURSOR_STATES } from './data';

const emojis = Object.fromEntries(CURSOR_STATES.map((state) => [state.key, state.emoji]));

function detectState(element) {
  if (document.body.classList.contains('is-grabbing') || document.body.classList.contains('is-dragging')) return 'grabbing';
  if (document.body.classList.contains('is-resizing')) return 'resize';
  if (document.body.classList.contains('is-moving')) return 'move';
  if (!element) return 'default';
  if (element.closest('input, textarea, [contenteditable="true"]')) return 'text';
  if (element.closest('.resize-handle, .decoration__handle')) return 'resize';
  if (element.closest('.decoration.is-editable, .window-titlebar')) return 'move';
  if (element.closest('button, a, select, [role="button"], [data-cursor="pointer"]')) return 'pointer';
  return 'default';
}

function CustomCursor({ config, previewState }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [state, setState] = useState('default');
  const [visible, setVisible] = useState(false);
  const frame = useRef(null);
  useEffect(() => {
    const move = (event) => {
      setVisible(true);
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        setPosition({ x: event.clientX, y: event.clientY });
        if (!previewState) setState(detectState(document.elementFromPoint(event.clientX, event.clientY)));
      });
    };
    const leave = () => setVisible(false);
    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [previewState]);
  const active = previewState || state;
  const cursor = config.cursors[active] || config.cursors.default;
  const size = Math.max(16, Math.min(96, Number(config.cursorSize) || 32));
  const hotspotScale = size / 32;
  const hotspotX = (Number(cursor.hotspotX) || 0) * hotspotScale;
  const hotspotY = (Number(cursor.hotspotY) || 0) * hotspotScale;
  return <div className={`custom-cursor cursor-${active} ${visible ? 'is-visible' : ''}`} style={{ left: position.x - hotspotX, top: position.y - hotspotY, '--cursor-size': `${size}px`, '--cursor-emoji-size': `${Math.round(size * 0.9)}px` }}>
    {cursor.url ? <img src={cursor.url} alt="" draggable="false" /> : <span>{emojis[active] || '✏️'}</span>}
  </div>;
}

export default memo(CustomCursor);
