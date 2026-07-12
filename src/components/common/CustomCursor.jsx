import { useState, useEffect, useRef } from 'react';
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

  // 每 2 秒刷新配置（用户可能在设置面板改了）
  useEffect(() => {
    const t = setInterval(() => setConfig(loadSiteConfig()), 2000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const move = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      let el = document.elementFromPoint(e.clientX, e.clientY);
      let cur = 'default', d = 0;
      while (el && d < 8) {
        const c = window.getComputedStyle(el).cursor;
        if (c && c !== 'auto' && c !== 'none') { cur = c; break; }
        el = el.parentElement; d++;
      }
      if (cur === 'default') {
        const t = document.elementFromPoint(e.clientX, e.clientY);
        if (t) { const tag = t.tagName?.toLowerCase(); if (tag==='input'||tag==='textarea'||t.isContentEditable) cur='text'; }
      }
      // 标准化
      if (cur.includes('pointer')) cur = 'pointer';
      else if (cur.includes('resize')||cur.includes('nwse')||cur.includes('nesw')) cur = 'move';
      else if (cur.includes('grab')) cur = 'grabbing';
      else if (!['default','pointer','text','grabbing','move'].includes(cur)) cur = 'default';
      
      if (cur !== lastState.current) { lastState.current = cur; setCursorState(cur); }
    };

    const click = (e) => {
      const id = pidRef.current++;
      const a = Math.random()*Math.PI*2, d2 = 20+Math.random()*30;
      setClickParticles(p => [...p, {id,x:e.clientX+Math.cos(a)*d2,y:e.clientY+Math.sin(a)*d2,color:['#FF69B4','#00FFFF','#39FF14','#FFD700'][Math.floor(Math.random()*4)],size:4+Math.random()*6}]);
      setTimeout(() => setClickParticles(p => p.filter(x=>x.id!==id)), 600);
    };

    document.addEventListener('mousemove', move, {passive:true});
    document.addEventListener('click', click);
    return () => { document.removeEventListener('mousemove',move); document.removeEventListener('click',click); };
  }, []);

  // 自定义光标图片或 emoji
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
