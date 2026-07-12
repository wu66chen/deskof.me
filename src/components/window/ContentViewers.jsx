import { useState, useCallback, useRef } from 'react';

export function ImageViewer({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({});

  const handleWheel = useCallback((e) => { e.preventDefault(); setZoom(z => Math.max(0.1, Math.min(5, z + (e.deltaY > 0 ? -0.15 : 0.15)))); }, []);
  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return; setDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    const move = (ev) => setPan({ x: dragRef.current.px + (ev.clientX - dragRef.current.x), y: dragRef.current.py + (ev.clientY - dragRef.current.y) });
    const up = () => { setDragging(false); document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [pan]);
  const save = () => { onUpdateContent?.(item.id, { url }); setEditing(false); };

  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#1a1a1a'}}>
      {isEditMode && <div style={{display:'flex',gap:4,padding:'2px 6px',background:'#333',alignItems:'center'}}>
        <button onClick={()=>setEditing(!editing)} style={{border:'1px solid #666',background:'#444',color:'#ccc',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>{editing?'取消':'URL'}</button>
        {editing&&<><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="图片URL" style={{flex:1,background:'#222',color:'#fff',border:'1px solid #555',padding:'1px 4px',fontSize:11}}/><button onClick={save} style={{border:'1px solid #666',background:'#555',color:'#fff',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>保存</button></>}
        <span style={{color:'#888',fontSize:9,marginLeft:'auto'}}>{Math.round(zoom*100)}%</span>
      </div>}
      <div onWheel={handleWheel} style={{flex:1,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {url ? <img src={url} alt="" draggable={false} onMouseDown={handleMouseDown}
          style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain',transform:`scale(${zoom}) translate(${pan.x/zoom}px,${pan.y/zoom}px)`}} /> :
          <div style={{color:'#666',textAlign:'center'}}><span style={{fontSize:48}}>🖼️</span><p>暂无图片</p></div>}
      </div>
    </div>
  );
}

export function VideoPlayer({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const save = () => { onUpdateContent?.(item.id, { url }); setEditing(false); };
  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:'#000'}}>
      {isEditMode && <div style={{display:'flex',gap:4,padding:'2px 6px',background:'#1a1a1a'}}>
        <button onClick={()=>setEditing(!editing)} style={{border:'1px solid #555',background:'#333',color:'#ccc',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>{editing?'取消':'URL'}</button>
        {editing&&<><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="视频URL" style={{flex:1,background:'#111',color:'#fff',border:'1px solid #555',padding:'1px 4px',fontSize:11}}/><button onClick={save} style={{border:'1px solid #555',background:'#444',color:'#fff',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>保存</button></>}
      </div>}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:'#000'}}>
        {url ? <video controls src={url} style={{width:'100%',height:'100%',objectFit:'contain'}} /> :
          <div style={{color:'#666',textAlign:'center'}}><span style={{fontSize:48}}>🎬</span><p>暂无视频</p></div>}
      </div>
    </div>
  );
}

export function MarkdownViewer({ item, isEditMode, onUpdateContent }) {
  const [content, setContent] = useState(item.content || '');
  const [editing, setEditing] = useState(false);
  const save = () => { onUpdateContent?.(item.id, { content }); setEditing(false); };
  const render = (t) => t?t.replace(/^### (.*$)/gim,'<h3>$1</h3>').replace(/^## (.*$)/gim,'<h2>$1</h2>').replace(/^# (.*$)/gim,'<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/^> (.*$)/gim,'<blockquote>$1</blockquote>').replace(/^\- (.*$)/gim,'<li>$1</li>').replace(/```([\\s\\S]*?)```/g,'<pre><code>$1</code></pre>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br/>'):'';
  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
      {isEditMode && <div style={{display:'flex',gap:4,padding:'2px 6px',background:'#f0f0f0',borderBottom:'1px solid #ddd'}}>
        <button onClick={()=>setEditing(!editing)} style={{border:'1px solid #aaa',background:'#e0e0e0',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>{editing?'👁️':'✏️'}</button>
        {editing&&<button onClick={save} style={{border:'1px solid #aaa',background:'#c0e0ff',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>💾</button>}
      </div>}
      <div style={{flex:1,overflow:'auto',padding:'12px 16px',fontFamily:'var(--hand-font)',fontSize:14,lineHeight:1.8,background:'#FFFEF9'}}>
        {editing ? <textarea value={content} onChange={e=>setContent(e.target.value)} style={{width:'100%',height:'100%',border:'1px dashed #999',padding:8,fontFamily:'var(--hand-font)',fontSize:14,resize:'none'}}/> :
         content ? <div dangerouslySetInnerHTML={{__html:render(content)}}/> : <div style={{color:'#999',textAlign:'center',padding:40}}><span style={{fontSize:48}}>📝</span><p>暂无</p></div>}
      </div>
    </div>
  );
}

export function LinkLauncher({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const save = () => { onUpdateContent?.(item.id, { url }); setEditing(false); };
  return (
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
      {isEditMode && <div style={{display:'flex',gap:4,padding:'2px 6px',background:'#f0f0f0',borderBottom:'1px solid #ddd'}}>
        <button onClick={()=>setEditing(!editing)} style={{border:'1px solid #aaa',background:'#e0e0e0',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>{editing?'取消':'✏️'}</button>
        {editing&&<><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="URL" style={{flex:1,border:'1px solid #aaa',padding:'1px 4px',fontSize:11}}/><button onClick={save} style={{border:'1px solid #aaa',background:'#c0e0ff',fontSize:10,padding:'1px 6px',cursor:'pointer'}}>保存</button></>}
      </div>}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
        {url ? <div style={{textAlign:'center',padding:20}}>
          <div style={{fontSize:40}}>🔗</div>
          <div style={{fontWeight:'bold',margin:'8px 0'}}>{item.name}</div>
          <div style={{fontSize:10,color:'#999',wordBreak:'break-all',marginBottom:12}}>{url}</div>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{display:'inline-block',padding:'6px 16px',background:'linear-gradient(90deg,#000080,#1084D0)',color:'white',textDecoration:'none',fontSize:11,border:'2px solid #fff',boxShadow:'1px 1px 0 #000'}}>打开链接 ↗</a>
        </div> : <div style={{color:'#999',textAlign:'center'}}><span style={{fontSize:48}}>🔗</span><p>暂无</p></div>}
      </div>
    </div>
  );
}
