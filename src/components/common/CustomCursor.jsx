import { useState, useEffect, useRef, useCallback } from 'react';
import { loadSiteConfig } from '../../config/siteConfig';
import './CustomCursor.css';

const EMOJI_MAP = { default:'✏️', pointer:'👆', text:'✍️', grabbing:'✊', move:'🤏' };

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default');
  const [config, setConfig] = useState(() => loadSiteConfig());
  const [clickParticles, setClickParticles] = useState([]);
  const pidRef = useRef(0);
  const lastState = useRef('default');
  const rafRef = useRef(null);
  const lastEl = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setConfig(loadSiteConfig()), 3000);
    return () => clearInterval(t);
  }, []);

  // 基于元素类型检测光标状态（不依赖 CSS cursor，因为全局已设为 none）
  const detectCursorState = useCallback((el) => {
    if (!el) return 'default';
    // 快速检查标签
    const tag = el.tagName?.toLowerCase();
    const cls = el.className || '';
    const role = el.getAttribute('role');
    
    // 文本输入
    if (tag === 'input' || tag === 'textarea' || el.isContentEditable) return 'text';
    // 可点击交互元素
    if (tag === 'button' || tag === 'a' || tag === 'select' || role === 'button') return 'pointer';
    // 基于 class 检测
    if (cls.includes('desktop-icon') || cls.includes('menu-item') || cls.includes('window-btn') ||
        cls.includes('taskbar-window-btn') || cls.includes('start-menu-item') || cls.includes('config-tab') ||
        cls.includes('auth-btn') || cls.includes('link-open-btn') || cls.includes('viewer-edit-btn') ||
        cls.includes('polaroid-img')) return 'pointer';
    // 缩放手柄
    if (cls.includes('resize-handle') || cls.includes('dec-resize')) return 'move';
    // 可拖拽装饰
    if (cls.includes('decoration-item') && cls.includes('editable')) return 'move';
    // 默认
    return 'default';
  }, []);

  useEffect(() => {
    const move = (e) => {
      // 用 RAF 节流
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        setPos({ x: e.clientX, y: e.clientY });
        
        // 缓存：相同元素不重复检测
        if (el === lastEl.current) return;
        lastEl.current = el;
        
        const state = detectCursorState(el);
        if (state !== lastState.current) {
          lastState.current = state;
          setCursorState(state);
        }
      });
    };

    const click = (e) => {
      const id = pidRef.current++;
      const a = Math.random()*Math.PI*2, d = 20+Math.random()*30;
      setClickParticles(p => [...p, {id,x:e.clientX+Math.cos(a)*d,y:e.clientY+Math.sin(a)*d,color:['#FF69B4','#00FFFF','#39FF14','#FFD700'][Math.floor(Math.random()*4)],size:4+Math.random()*6}]);
      setTimeout(() => setClickParticles(p => p.filter(x=>x.id!==id)), 600);
    };

    document.addEventListener('mousemove', move, {passive:true});
    document.addEventListener('click', click);
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('click', click);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [detectCursorState]);

  const cursorImg = config?.[`cursor${cursorState.charAt(0).toUpperCase()+cursorState.slice(1)}`] || null;
  const hx = config?.cursorHotspotX ?? 4, hy = config?.cursorHotspotY ?? 4;

  return (<>
    <div className="custom-cursor" style={{ left: pos.x - hx, top: pos.y - hy }}>
      {cursorImg ? (
        <img src={cursorImg} alt="" className="cursor-img" draggable={false} />
      ) : (
        <span className={`cursor-icon st-${cursorState}`}>{EMOJI_MAP[cursorState]||'✏️'}</span>
      )}
    </div>
    {clickParticles.map(p => (
      <div key={p.id} className="ink-particle" style={{ left:p.x, top:p.y, width:p.size, height:p.size, backgroundColor:p.color }} />
    ))}
  </>);
}
