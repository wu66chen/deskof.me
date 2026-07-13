import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TYPE_EMOJI } from './data';
import { flattenItems } from './lib';

function fitPosition(item, index, viewport, iconSize, largeIconScale) {
  const large = item.type === 'folder-large';
  const width = large ? iconSize * largeIconScale : iconSize + 28;
  const height = large ? iconSize * largeIconScale + 48 : iconSize + 52;
  const x = item.position?.x ?? 30;
  const y = item.position?.y ?? 30;
  if (!viewport.w || (x <= viewport.w - width && y <= viewport.h - height)) return { x, y };
  const columns = Math.max(1, Math.floor((viewport.w - 40) / 145));
  return { x: 28 + (index % columns) * 145, y: 36 + Math.floor(index / columns) * 145 };
}

function IconArtwork({ item }) {
  return item.icon
    ? <img src={item.icon} alt="" draggable="false" />
    : <span aria-hidden="true">{TYPE_EMOJI[item.type] || '📄'}</span>;
}

const DesktopIcon = memo(function DesktopIcon({
  item, index, position, selected, editMode, config, onSelect, onOpen, onContext,
  onMove, onMoveIntoFolder, setDropTarget,
}) {
  const moved = useRef(false);
  const onPointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    onSelect(item.id);
    if (!editMode) return;
    event.preventDefault();
    const start = { x: event.clientX, y: event.clientY, px: position.x, py: position.y };
    let current = { ...position };
    moved.current = false;
    document.body.classList.add('is-dragging');
    const node = event.currentTarget;
    const move = (nextEvent) => {
      const dx = nextEvent.clientX - start.x;
      const dy = nextEvent.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
      current = {
        x: Math.max(4, Math.min(window.innerWidth - 70, start.px + dx)),
        y: Math.max(4, Math.min(window.innerHeight - 94, start.py + dy)),
      };
      node.style.left = `${current.x}px`;
      node.style.top = `${current.y}px`;
      node.style.transition = 'none';
      node.style.zIndex = '80';
      node.style.pointerEvents = 'none';
      const beneath = document.elementFromPoint(nextEvent.clientX, nextEvent.clientY);
      node.style.pointerEvents = '';
      const folder = beneath?.closest('[data-folder-id]');
      const folderId = folder?.dataset.folderId;
      setDropTarget(folderId && folderId !== item.id ? folderId : null);
    };
    const up = (endEvent) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.body.classList.remove('is-dragging');
      node.style.transition = '';
      node.style.zIndex = '';
      node.style.pointerEvents = 'none';
      const beneath = document.elementFromPoint(endEvent.clientX, endEvent.clientY);
      node.style.pointerEvents = '';
      const folderId = beneath?.closest('[data-folder-id]')?.dataset.folderId;
      setDropTarget(null);
      if (!moved.current) return;
      if (folderId && folderId !== item.id) onMoveIntoFolder(item.id, folderId);
      else onMove(item.id, current);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  }, [editMode, item, onMove, onMoveIntoFolder, onSelect, position, setDropTarget]);

  return (
    <div
      className={`desktop-icon ${item.type === 'folder-large' ? 'desktop-icon--large' : ''} ${selected ? 'is-selected' : ''} ${editMode ? 'is-editable' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        '--icon-index': index,
        '--selected-stroke': `${config.selectedStrokeWidth}px`,
        '--selected-opacity': config.selectedFillOpacity,
        '--selected-texture': config.assets.selectedTexture ? `url(${config.assets.selectedTexture})` : 'none',
      }}
      data-folder-id={['folder', 'folder-large'].includes(item.type) ? item.id : undefined}
      data-cursor="pointer"
      tabIndex="0"
      role="button"
      aria-label={`打开 ${item.name}`}
      onPointerDown={onPointerDown}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => { event.stopPropagation(); onOpen(item.id); }}
      onKeyDown={(event) => { if (event.key === 'Enter') onOpen(item.id); }}
      onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); onContext(event, item.id); }}
    >
      <span className="desktop-icon__selection" />
      <span className="desktop-icon__art" style={{ width: item.displaySize || undefined, height: item.displaySize || undefined, transform: item.rotation ? `rotate(${item.rotation}deg)` : undefined, opacity: item.opacity ?? 1 }}><IconArtwork item={item} /></span>
      <span className="desktop-icon__label">{item.name}</span>
      {editMode && <span className="desktop-icon__edit-mark">✎</span>}
    </div>
  );
});

function Decoration({ item, editMode, onUpdate, onDelete, onEdit }) {
  const beginMove = (event) => {
    if (!editMode || event.target.closest('button, .decoration__handle')) return;
    event.preventDefault(); event.stopPropagation();
    const start = { x: event.clientX, y: event.clientY, ox: item.x, oy: item.y };
    document.body.classList.add('is-moving');
    const move = (next) => onUpdate(item.id, { x: start.ox + next.clientX - start.x, y: start.oy + next.clientY - start.y });
    const up = () => {
      document.body.classList.remove('is-moving');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  };

  const beginResize = (event) => {
    event.preventDefault(); event.stopPropagation();
    const start = { x: event.clientX, y: event.clientY, w: item.width || 100, h: item.height || 80 };
    document.body.classList.add('is-resizing');
    const move = (next) => onUpdate(item.id, {
      width: Math.max(20, Math.min(400, start.w + next.clientX - start.x)),
      height: Math.max(20, Math.min(400, start.h + next.clientY - start.y)),
    });
    const up = () => {
      document.body.classList.remove('is-resizing');
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  };

  const beginRotate = (event) => {
    event.preventDefault(); event.stopPropagation();
    const cx = item.x + (item.width || 100) / 2;
    const cy = item.y + (item.height || 80) / 2;
    const startAngle = Math.atan2(event.clientY - cy, event.clientX - cx) * 180 / Math.PI - (item.rotation || 0);
    const move = (next) => onUpdate(item.id, { rotation: Math.round(Math.atan2(next.clientY - cy, next.clientX - cx) * 180 / Math.PI - startAngle) });
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up, { once: true });
  };

  return (
    <div
      className={`decoration ${editMode ? 'is-editable' : ''}`}
      style={{ left: item.x, top: item.y, width: item.width || 'auto', height: item.height || 'auto', transform: `rotate(${item.rotation || 0}deg)`, opacity: item.opacity ?? 1, zIndex: item.zIndex || 25000 }}
      onPointerDown={beginMove}
    >
      {item.type === 'image'
        ? <img src={item.content} alt="" draggable="false" />
        : <span style={{ fontFamily: item.fontFamily || 'var(--font-hand)', fontSize: item.fontSize || 18, color: item.color || 'var(--ink)', background: item.bgColor || 'transparent', fontWeight: item.fontWeight || 'normal' }}>{item.content}</span>}
      {editMode && <div className="decoration__tools">
        <button onClick={(event) => { event.stopPropagation(); onEdit(item); }} aria-label="编辑装饰">✎</button>
        <button onPointerDown={beginRotate} aria-label="旋转装饰">↻</button>
        <button onClick={(event) => { event.stopPropagation(); onDelete(item.id); }} aria-label="删除装饰">×</button>
        <i className="decoration__handle" onPointerDown={beginResize} />
      </div>}
    </div>
  );
}

export default function Desktop({
  items, decorations, config, editMode, selectedId, onSelect, onOpen,
  onContext, onDesktopContext, onMove, onMoveIntoFolder, onUpdateDecoration,
  onDeleteDecoration, onEditDecoration, pencilOpen, onPencilToggle,
}) {
  const stageRef = useRef(null);
  const [viewport, setViewport] = useState({ w: window.innerWidth, h: window.innerHeight - 42 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState(null);
  const flat = useMemo(() => flattenItems(items), [items]);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight - 42 });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const moveWallpaper = useCallback((event) => {
    if (!config.wallpaperParallax) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const strength = config.parallaxStrength || 8;
    setParallax({
      x: -((event.clientX - rect.left) / rect.width - 0.5) * strength,
      y: -((event.clientY - rect.top) / rect.height - 0.5) * strength,
    });
  }, [config.parallaxStrength, config.wallpaperParallax]);

  return <>
    <main
      ref={stageRef}
      className="desktop-stage"
      onPointerMove={moveWallpaper}
      onPointerLeave={() => setParallax({ x: 0, y: 0 })}
      onClick={() => onSelect(null)}
      onContextMenu={(event) => { event.preventDefault(); onDesktopContext(event); }}
    >
      <div className={`desktop-wallpaper ${config.assets.wallpaper ? 'has-custom-wallpaper' : ''}`} style={{ backgroundImage: config.assets.wallpaper ? `url(${config.assets.wallpaper})` : undefined, transform: `translate(${parallax.x}px, ${parallax.y}px)` }}>
        {!config.assets.wallpaper && <><i className="wallpaper-blob blob-a" /><i className="wallpaper-blob blob-b" /><i className="wallpaper-grid" /><span className="wallpaper-doodle doodle-a">✦</span><span className="wallpaper-doodle doodle-b">♡</span><span className="wallpaper-doodle doodle-c">⌁</span></>}
      </div>
      <section className="desktop-icons" aria-label="桌面文件">
        {items.map((item, index) => {
          const position = fitPosition(item, index, viewport, config.iconSize, config.largeIconScale);
          return <DesktopIcon key={item.id} item={item} index={index} position={position}
            selected={selectedId === item.id} editMode={editMode} config={config}
            onSelect={onSelect} onOpen={onOpen} onContext={onContext}
            onMove={onMove} onMoveIntoFolder={onMoveIntoFolder} setDropTarget={setDropTarget} />;
        })}
      </section>
      <section className="decorations" aria-hidden={!editMode}>
        {decorations.map((item) => <Decoration key={item.id} item={item} editMode={editMode}
          onUpdate={onUpdateDecoration} onDelete={onDeleteDecoration} onEdit={onEditDecoration} />)}
      </section>
      <button
        className={`pencil-box ${pencilOpen ? 'is-open' : ''}`}
        data-cursor="pointer"
        style={config.assets.pencilBoxIcon ? { backgroundImage: `url(${config.assets.pencilBoxIcon})` } : undefined}
        onDoubleClick={(event) => { event.stopPropagation(); if (editMode) onPencilToggle(); }}
        onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); if (editMode) onPencilToggle(); }}
        onClick={(event) => event.stopPropagation()}
        aria-label={editMode ? '双击定制光标' : '手绘笔筒'}
      >{!config.assets.pencilBoxIcon && <><span>✏️</span><span>🖍️</span><i /></>}</button>
      {editMode && <div className="edit-banner">✎ EDIT MODE · 所有更改仅保存在本机</div>}
      {dropTarget && <div className="drop-toast">放进文件夹 ✦</div>}
    </main>

    <main className="mobile-notebook" aria-label="只读作品列表">
      <header><span>deskof.me</span><small>Wesley’s pocket scrapbook</small></header>
      <p>轻点一项打开。移动端为只读浏览模式。</p>
      <div className="mobile-notebook__list">
        {flat.map(({ item, depth }) => <button key={item.id} style={{ '--depth': depth }} onClick={() => onOpen(item.id)}>
          <span>{TYPE_EMOJI[item.type]}</span><strong>{item.name}</strong><em>{item.type}</em>
        </button>)}
      </div>
    </main>
  </>;
}
