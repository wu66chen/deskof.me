import { memo, useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TYPE_EMOJI } from './data';
import { safeExternalUrl } from './lib';

function WindowButton({ kind, image, hoverImage, activeImage, label, children, ...props }) {
  return <button
    className={`window-control window-control--${kind}`}
    aria-label={label}
    style={{ '--control-image': image ? `url(${image})` : 'none', '--control-hover-image': hoverImage ? `url(${hoverImage})` : 'var(--control-image)', '--control-active-image': activeImage ? `url(${activeImage})` : 'var(--control-hover-image)' }}
    {...props}
  >{children}</button>;
}

function FolderContent({ item, editMode, onOpen, onContext, onMoveOut }) {
  const ref = useRef(null);
  const children = item.children || [];
  const beginChildDrag = useCallback((event, child) => {
    if (!editMode || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    const node = event.currentTarget;
    const start = { x: event.clientX, y: event.clientY };
    let moved = false;
    document.body.classList.add('is-dragging');
    const move = (next) => {
      const dx = next.clientX - start.x;
      const dy = next.clientY - start.y;
      moved = moved || Math.abs(dx) + Math.abs(dy) > 6;
      if (moved) node.style.transform = `translate(${dx}px, ${dy}px) rotate(-2deg) scale(1.03)`;
    };
    const up = (next) => {
      document.body.classList.remove('is-dragging');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      node.style.transform = '';
      const rect = ref.current?.getBoundingClientRect();
      if (moved && rect && (next.clientX < rect.left || next.clientX > rect.right || next.clientY < rect.top || next.clientY > rect.bottom)) {
        onMoveOut(child.id, item.id, { x: Math.max(8, next.clientX - 36), y: Math.max(8, next.clientY - 36) });
      }
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  }, [editMode, item.id, onMoveOut]);

  return <div ref={ref} className="folder-content" onContextMenu={(event) => event.preventDefault()}>
    {children.length ? <div className="folder-grid">
      {children.map((child, index) => <button
        key={child.id}
        className={`folder-item ${editMode ? 'is-editable' : ''}`}
        style={{ '--folder-index': index }}
        data-folder-id={['folder', 'folder-large'].includes(child.type) ? child.id : undefined}
        onPointerDown={(event) => beginChildDrag(event, child)}
        onDoubleClick={() => onOpen(child.id)}
        onKeyDown={(event) => { if (event.key === 'Enter') onOpen(child.id); }}
        onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); onContext(event, child.id, item.id); }}
      >
        <span>{child.icon ? <img src={child.icon} alt="" /> : TYPE_EMOJI[child.type]}</span>
        <strong>{child.name}</strong>
      </button>)}
    </div> : <div className="folder-empty"><span>📂</span><p>这张纸袋还是空的</p>{editMode && <small>把桌面文件拖进来，或在桌面右键新建</small>}</div>}
  </div>;
}

function ImageViewer({ item, editMode, onUpdateItem }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  useEffect(() => setUrl(item.url || ''), [item.url]);
  const setSafeZoom = useCallback((value) => {
    const next = Math.max(0.1, Math.min(5, value));
    setZoom(next);
    if (next <= 1) setPan({ x: 0, y: 0 });
  }, []);
  const beginPan = (event) => {
    if (zoom <= 1 || event.button !== 0) return;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY, px: pan.x, py: pan.y };
    document.body.classList.add('is-grabbing');
    const move = (next) => setPan({ x: start.px + next.clientX - start.x, y: start.py + next.clientY - start.y });
    const up = () => {
      document.body.classList.remove('is-grabbing');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  };
  return <div className="viewer viewer--image">
    {editMode && <div className="viewer-toolbar">
      <button onClick={() => setEditing((value) => !value)}>图片 URL</button>
      {editing && <><input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://… 或 data URL" /><button onClick={() => { onUpdateItem(item.id, { url }); setEditing(false); }}>保存</button></>}
      <span>{Math.round(zoom * 100)}%</span>
    </div>}
    <div className="image-canvas" onWheel={(event) => { event.preventDefault(); setSafeZoom(zoom + (event.deltaY > 0 ? -0.12 : 0.12)); }}>
      {url ? <img src={url} alt={item.name} draggable="false" onPointerDown={beginPan}
        onDoubleClick={() => { if (zoom > 1) { setSafeZoom(1); setPan({ x: 0, y: 0 }); } else setSafeZoom(2.88); }}
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }} />
        : <div className="viewer-empty">🖼️<small>编辑模式下可粘贴图片 URL</small></div>}
    </div>
  </div>;
}

function VideoViewer({ item, editMode, onUpdateItem }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  return <div className="viewer viewer--video">
    {editMode && <div className="viewer-toolbar"><button onClick={() => setEditing((value) => !value)}>视频 URL</button>{editing && <><input value={url} onChange={(event) => setUrl(event.target.value)} /><button onClick={() => { onUpdateItem(item.id, { url }); setEditing(false); }}>保存</button></>}</div>}
    {url ? <video src={url} controls playsInline /> : <div className="viewer-empty">🎬<small>暂无视频</small></div>}
  </div>;
}

function MarkdownViewer({ item, editMode, onUpdateItem }) {
  const [content, setContent] = useState(item.content || '');
  const [editing, setEditing] = useState(false);
  useEffect(() => setContent(item.content || ''), [item.content]);
  return <div className="viewer viewer--markdown">
    {editMode && <div className="viewer-toolbar"><button onClick={() => setEditing((value) => !value)}>{editing ? '预览' : '编辑'}</button>{editing && <button onClick={() => { onUpdateItem(item.id, { content }); setEditing(false); }}>保存</button>}</div>}
    {editing
      ? <textarea className="markdown-editor" value={content} onChange={(event) => setContent(event.target.value)} autoFocus />
      : <article className="markdown-paper"><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></article>}
  </div>;
}

function LinkViewer({ item, editMode, onUpdateItem }) {
  const [url, setUrl] = useState(item.url || '');
  const [editing, setEditing] = useState(false);
  const external = safeExternalUrl(url);
  return <div className="viewer viewer--link">
    {editMode && <div className="viewer-toolbar"><button onClick={() => setEditing((value) => !value)}>编辑 URL</button>{editing && <><input value={url} onChange={(event) => setUrl(event.target.value)} /><button onClick={() => { onUpdateItem(item.id, { url }); setEditing(false); }}>保存</button></>}</div>}
    <div className="link-card"><i>↗</i><strong>{item.name}</strong><small>{url || '还没有链接'}</small>{external && <a href={external} target="_blank" rel="noreferrer">打开新窗口 ✦</a>}</div>
  </div>;
}

function WindowContent(props) {
  const { item } = props;
  if (['folder', 'folder-large'].includes(item.type)) return <FolderContent {...props} />;
  if (item.type === 'image') return <ImageViewer {...props} />;
  if (item.type === 'video') return <VideoViewer {...props} />;
  if (item.type === 'markdown') return <MarkdownViewer {...props} />;
  if (item.type === 'link') return <LinkViewer {...props} />;
  return null;
}

const DeskWindow = memo(function DeskWindow({
  win, item, config, editMode, onFocus, onClose, onMinimize, onRect,
  onToggleMax, onSaveDefault, onOpen, onContext, onUpdateItem, onMoveOut,
}) {
  const [closing, setClosing] = useState(false);
  const rect = win.rect;
  if (win.minimized) return null;
  const assets = config.assets;

  const beginDrag = (event) => {
    if (event.target.closest('button') || win.maximized || event.button !== 0) return;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY, rect };
    document.body.classList.add('is-moving');
    const move = (next) => onRect(win.id, {
      ...rect,
      x: Math.max(-rect.w + 80, Math.min(window.innerWidth - 80, start.rect.x + next.clientX - start.x)),
      y: Math.max(0, Math.min(window.innerHeight - 62, start.rect.y + next.clientY - start.y)),
    });
    const up = () => {
      document.body.classList.remove('is-moving');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  };

  const beginResize = (event, direction) => {
    event.preventDefault(); event.stopPropagation();
    const start = { x: event.clientX, y: event.clientY, rect };
    document.body.classList.add('is-resizing');
    const move = (next) => {
      const dx = next.clientX - start.x;
      const dy = next.clientY - start.y;
      let { x, y, w, h } = start.rect;
      if (direction.includes('e')) w = Math.max(300, w + dx);
      if (direction.includes('s')) h = Math.max(210, h + dy);
      if (direction.includes('w')) { const nw = Math.max(300, w - dx); x += w - nw; w = nw; }
      if (direction.includes('n')) { const nh = Math.max(210, h - dy); y += h - nh; h = nh; }
      onRect(win.id, { x, y, w, h });
    };
    const up = () => {
      document.body.classList.remove('is-resizing');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  };

  const close = () => { setClosing(true); window.setTimeout(() => onClose(win.id), 180); };
  const contentBg = config.windowBackgrounds[item.type] || assets.windowContentBg;
  const control = (kind) => ({
    image: assets[`windowBtn${kind}`],
    hoverImage: assets[`windowBtn${kind}Hover`],
    activeImage: assets[`windowBtn${kind}Active`],
  });

  return <section
    className={`desk-window ${closing ? 'is-closing' : ''} ${win.maximized ? 'is-maximized' : ''}`}
    style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: win.z, '--window-border-image': assets.windowBorder ? `url(${assets.windowBorder})` : 'none' }}
    onPointerDown={() => onFocus(win.id)}
  >
    <header className="window-titlebar" onPointerDown={beginDrag} onDoubleClick={() => onToggleMax(win.id)} style={assets.windowTitlebarBg ? { backgroundImage: `url(${assets.windowTitlebarBg})` } : undefined}>
      <div><span>{TYPE_EMOJI[item.type]}</span><strong>{item.name}</strong>{editMode && <button className="save-window-default" onClick={(event) => { event.stopPropagation(); onSaveDefault(item.type, { w: rect.w, h: rect.h }); }}>💾 默认</button>}</div>
      <nav>
        <WindowButton kind="Min" label="最小化" {...control('Min')} onClick={() => onMinimize(win.id)}>_</WindowButton>
        <WindowButton kind="Max" label={win.maximized ? '还原' : '最大化'} {...control('Max')} onClick={() => onToggleMax(win.id)}>{win.maximized ? '❐' : '□'}</WindowButton>
        <WindowButton kind="Close" label="关闭" {...control('Close')} onClick={close}>×</WindowButton>
      </nav>
    </header>
    <div className="window-content" style={{ '--content-bg': contentBg ? `url(${contentBg})` : 'none', '--content-size': config.windowContentMode === 'tile' ? 'auto' : 'cover', '--content-repeat': config.windowContentMode === 'tile' ? 'repeat' : 'no-repeat', '--content-opacity': config.windowContentOpacity }}>
      <WindowContent item={item} editMode={editMode} onOpen={onOpen} onContext={onContext} onUpdateItem={onUpdateItem} onMoveOut={onMoveOut} />
    </div>
    {!win.maximized && ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((direction) => <i key={direction} className={`resize-handle resize-${direction}`} onPointerDown={(event) => beginResize(event, direction)} />)}
  </section>;
});

export default function Windows(props) {
  const { windows, itemsById } = props;
  return <div className="windows-layer">
    {windows.map((win) => {
      const item = itemsById(win.itemId);
      return item ? <DeskWindow key={win.id} {...props} win={win} item={item} /> : null;
    })}
  </div>;
}
