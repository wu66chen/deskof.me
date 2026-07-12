import { useState, useCallback, useRef } from 'react';
import './ContentViewers.css';

export function ImageViewer({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({});

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.max(0.1, Math.min(5, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    const move = (ev) => setPan({ x: dragRef.current.px + (ev.clientX - dragRef.current.x), y: dragRef.current.py + (ev.clientY - dragRef.current.y) });
    const up = () => { setDragging(false); document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up); };
    document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
  }, [pan]);

  const saveUrl = () => { if (onUpdateContent) onUpdateContent(item.id, { url }); setEditing(false); };

  return (
    <div className="viewer-container">
      {isEditMode && (<div className="viewer-toolbar">
        <button className="viewer-edit-btn" onClick={() => setEditing(!editing)}>{editing?'取消':'✏️ 编辑 URL'}</button>
        {editing && (<div className="viewer-edit-row"><input className="viewer-input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="图片 URL" /><button className="viewer-save-btn" onClick={saveUrl}>保存</button></div>)}
      </div>)}
      <div className="viewer-content viewer-image" onWheel={handleWheel}>
        {url ? (
          <div className="polaroid-frame" style={{ cursor: dragging ? 'grabbing' : 'grab', overflow:'hidden' }}>
            <img src={url} alt={item.name} className="polaroid-img" draggable={false}
              onMouseDown={handleMouseDown}
              style={{ transform: `scale(${zoom}) translate(${pan.x/zoom}px, ${pan.y/zoom}px)`, transition: dragging ? 'none' : 'transform 0.2s' }} />
            <div className="polaroid-caption">{item.name}</div>
            <div className="tape-piece tape-tl" /><div className="tape-piece tape-tr" />
            <div className="zoom-indicator">{Math.round(zoom*100)}%</div>
          </div>
        ) : (<div className="viewer-placeholder"><span>🖼️</span><p>暂无图片</p></div>)}
      </div>
    </div>
  );
}

export function VideoPlayer({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const saveUrl = () => { if (onUpdateContent) onUpdateContent(item.id, { url }); setEditing(false); };

  return (
    <div className="viewer-container" style={{background:'#000'}}>
      {isEditMode && (<div className="viewer-toolbar">
        <button className="viewer-edit-btn" onClick={() => setEditing(!editing)}>{editing?'取消':'✏️ 编辑 URL'}</button>
        {editing && (<div className="viewer-edit-row"><input className="viewer-input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="视频 URL" /><button className="viewer-save-btn" onClick={saveUrl}>保存</button></div>)}
      </div>)}
      <div className="viewer-content viewer-video" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
        {url ? (
          <video controls src={url} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}} />
        ) : (<div className="viewer-placeholder"><span>🎬</span><p>暂无视频</p></div>)}
      </div>
    </div>
  );
}

export function MarkdownViewer({ item, isEditMode, onUpdateContent }) {
  const [content, setContent] = useState(item.content || '');
  const [editing, setEditing] = useState(false);
  const save = () => { if (onUpdateContent) onUpdateContent(item.id, { content }); setEditing(false); };
  const render = (t) => {
    if (!t) return '';
    return t.replace(/^### (.*$)/gim,'<h3>$1</h3>').replace(/^## (.*$)/gim,'<h2>$1</h2>').replace(/^# (.*$)/gim,'<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/^> (.*$)/gim,'<blockquote>$1</blockquote>').replace(/^\- (.*$)/gim,'<li>$1</li>')
      .replace(/```([\s\S]*?)```/g,'<pre><code>$1</code></pre>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br/>');
  };
  return (
    <div className="viewer-container">
      {isEditMode && (<div className="viewer-toolbar">
        <button className="viewer-edit-btn" onClick={()=>setEditing(!editing)}>{editing?'👁️ 预览':'✏️ 编辑'}</button>
        {editing && <button className="viewer-save-btn" onClick={save}>💾 保存</button>}
      </div>)}
      <div className="viewer-content viewer-markdown">
        {editing ? (<textarea className="markdown-editor" value={content} onChange={e=>setContent(e.target.value)} />) :
         content ? (<div className="markdown-preview" dangerouslySetInnerHTML={{__html:render(content)}} />) :
         (<div className="viewer-placeholder"><span>📝</span><p>暂无内容</p></div>)}
      </div>
    </div>
  );
}

export function LinkLauncher({ item, isEditMode, onUpdateContent }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const save = () => { if (onUpdateContent) onUpdateContent(item.id, { url }); setEditing(false); };
  return (
    <div className="viewer-container">
      {isEditMode && (<div className="viewer-toolbar">
        <button className="viewer-edit-btn" onClick={()=>setEditing(!editing)}>{editing?'取消':'✏️ 编辑'}</button>
        {editing && (<div className="viewer-edit-row"><input className="viewer-input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="链接 URL" /><button className="viewer-save-btn" onClick={save}>保存</button></div>)}
      </div>)}
      <div className="viewer-content viewer-link">
        {url ? (<div className="link-card">
          <div className="link-icon">🔗</div><div className="link-name">{item.name}</div><div className="link-url">{url}</div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="link-open-btn">打开链接 ↗</a>
        </div>) : (<div className="viewer-placeholder"><span>🔗</span><p>暂无链接</p></div>)}
      </div>
    </div>
  );
}
