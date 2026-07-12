import { useState, useCallback, useRef, useEffect } from 'react';
import './Window.css';

const TYPE_SIZES = {
  'folder':{w:720,h:500},'folder-large':{w:760,h:500},'image':{w:700,h:520},
  'video':{w:720,h:500},'markdown':{w:620,h:500},'link':{w:380,h:200},'file':{w:500,h:500},
};

export default function Window({
  id, title, icon, type, isMinimized,
  onClose, onMinimize, onFocus, zIndex,
  defaultSize, onSaveDefault, windowDecoration, customAssets,
  children,
}) {
  const sz = defaultSize || TYPE_SIZES[type] || {w:500,h:500};
  const [pos, setPos] = useState({x:0,y:0});
  const [size, setSize] = useState(sz);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({});
  const [resizing, setResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState('');
  const [closing, setClosing] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [prevState, setPrevState] = useState(null);
  const ref = useRef(null);
  const [init, setInit] = useState(false);

  useEffect(() => { if(!init){setPos({x:Math.max(20,(window.innerWidth-sz.w)/2),y:Math.max(20,(window.innerHeight-sz.h-40)/2)});setInit(true);} },[init,sz.w,sz.h]);
  useEffect(() => {const el=ref.current;if(!el)return;const h=()=>onFocus(id);el.addEventListener('mousedown',h);return()=>el.removeEventListener('mousedown',h);},[id,onFocus]);

  const onTitleDown = useCallback((e) => {
    if(e.target.closest('.window-btn')||e.target.closest('.window-save-btn'))return;
    if(fullscreen)return;e.preventDefault();e.stopPropagation();
    setDragging(true);setDragStart({x:e.clientX-pos.x,y:e.clientY-pos.y});
  },[pos,fullscreen]);

  useEffect(()=>{if(!dragging)return;const m=(e)=>setPos({x:Math.max(-50,Math.min(e.clientX-dragStart.x,window.innerWidth-60)),y:Math.max(0,Math.min(e.clientY-dragStart.y,window.innerHeight-40))});const u=()=>setDragging(false);document.addEventListener('mousemove',m);document.addEventListener('mouseup',u);return()=>{document.removeEventListener('mousemove',m);document.removeEventListener('mouseup',u);};},[dragging,dragStart]);

  const onResize = useCallback((e,dir)=>{
    e.preventDefault();e.stopPropagation();
    setResizing(true);setResizeDir(dir);
    setDragStart({x:e.clientX,y:e.clientY,w:size.w,h:size.h,px:pos.x,py:pos.y});
  },[size,pos]);

  useEffect(()=>{if(!resizing)return;
    const m=(e)=>{const dx=e.clientX-dragStart.x,dy=e.clientY-dragStart.y;let nw=dragStart.w,nh=dragStart.h,nx=pos.x,ny=pos.y;
    if(resizeDir.includes('e'))nw=Math.max(300,dragStart.w+dx);if(resizeDir.includes('s'))nh=Math.max(200,dragStart.h+dy);
    if(resizeDir.includes('w')){nw=Math.max(300,dragStart.w-dx);nx=dragStart.px+dx;}
    if(resizeDir.includes('n')){nh=Math.max(200,dragStart.h-dy);ny=dragStart.py+dy;}
    setSize({w:nw,h:nh});setPos({x:nx,y:ny});};
    const u=()=>setResizing(false);
    document.addEventListener('mousemove',m);document.addEventListener('mouseup',u);
    return()=>{document.removeEventListener('mousemove',m);document.removeEventListener('mouseup',u);};
  },[resizing,dragStart,resizeDir,pos]);

  const toggleFs = useCallback(()=>{
    if(fullscreen){if(prevState){setPos(prevState.pos);setSize(prevState.size);}setFullscreen(false);}
    else{setPrevState({pos:{...pos},size:{...size}});setPos({x:0,y:0});setSize({w:window.innerWidth,h:window.innerHeight-40});setFullscreen(true);}
  },[fullscreen,prevState,pos,size]);

  const handleClose = useCallback(()=>{setClosing(true);setTimeout(()=>onClose(id),200);},[id,onClose]);
  const handleSaveDef = useCallback((e)=>{e.stopPropagation();onSaveDefault?.(type,{w:size.w,h:size.h});},[type,size,onSaveDefault]);

  if (isMinimized) return null;

  const assets = customAssets || {};

  return (
    <div ref={ref} className={`desktop-window win98-window ${closing?'closing':''} ${fullscreen?'fullscreen':''}`}
      style={{
        left:pos.x,top:pos.y,width:size.w,height:size.h,zIndex,
        borderImage: assets.windowBorder ? `url(${assets.windowBorder}) 4 stretch` : undefined,
      }}>
      <div className="window-titlebar" onMouseDown={onTitleDown} onDoubleClick={toggleFs}
        style={assets.windowTitlebarBg ? {backgroundImage:`url(${assets.windowTitlebarBg})`,backgroundSize:'cover'} : {}}>
        <div className="window-titlebar-left">
          {icon && <span className="window-title-icon">{icon}</span>}
          <span className="window-title">{title}</span>
          <button className="window-btn window-save-btn" onClick={handleSaveDef} title="保存默认大小" style={{marginLeft:8,fontSize:8,padding:'0 4px'}}>💾默认</button>
        </div>
        <div className="window-titlebar-right">
          <button className="window-btn window-btn-minimize" onClick={()=>onMinimize(id)}
            style={assets.windowBtnMin?{backgroundImage:`url(${assets.windowBtnMin})`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center',color:'transparent'}:{}}>_</button>
          <button className="window-btn window-btn-maximize" onClick={toggleFs}
            style={assets.windowBtnMax?{backgroundImage:`url(${assets.windowBtnMax})`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center',color:'transparent'}:{}}>{fullscreen?'❐':'□'}</button>
          <button className="window-btn window-btn-close" onClick={handleClose}
            style={assets.windowBtnClose?{backgroundImage:`url(${assets.windowBtnClose})`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center',color:'transparent'}:{}}>✕</button>
        </div>
      </div>
      <div className="window-content" style={windowDecoration?{backgroundImage:`url(${windowDecoration})`}:{}}>
        {children}
      </div>
      {!fullscreen&&(<>
        <div className="resize-handle resize-n" onMouseDown={e=>onResize(e,'n')}/>
        <div className="resize-handle resize-s" onMouseDown={e=>onResize(e,'s')}/>
        <div className="resize-handle resize-e" onMouseDown={e=>onResize(e,'e')}/>
        <div className="resize-handle resize-w" onMouseDown={e=>onResize(e,'w')}/>
        <div className="resize-handle resize-ne" onMouseDown={e=>onResize(e,'ne')}/>
        <div className="resize-handle resize-nw" onMouseDown={e=>onResize(e,'nw')}/>
        <div className="resize-handle resize-se" onMouseDown={e=>onResize(e,'se')}/>
        <div className="resize-handle resize-sw" onMouseDown={e=>onResize(e,'sw')}/>
      </>)}
    </div>
  );
}
