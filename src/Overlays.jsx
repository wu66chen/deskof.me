import { useEffect, useRef, useState } from 'react';
import { dataUrlFromFile, makeDeepLink } from './lib';
import { FILE_TYPES, TYPE_EMOJI } from './data';

const stop = (event) => event.stopPropagation();

export function ContextMenu({ menu, item, isAdmin, editMode, config, onClose, actions }) {
  if (!menu) return null;
  const x = Math.min(menu.x, window.innerWidth - 230);
  const y = Math.min(menu.y, window.innerHeight - 520);
  const run = (name, payload) => {
    onClose();
    window.setTimeout(() => actions[name]?.(payload), 20);
  };
  return <div className="context-shield" onPointerDown={onClose} onContextMenu={(event) => { event.preventDefault(); onClose(); }}>
    <menu className="context-menu" style={{ left: Math.max(4, x), top: Math.max(4, y), backgroundImage: config.assets.contextMenuBg ? `url(${config.assets.contextMenuBg})` : undefined }} onPointerDown={stop}>
      {menu.kind === 'desktop' && <>
        <button onClick={() => run('github')}>⭐ <span>GitHub</span></button>
        <button onClick={() => run('desktopProperties')}>🖥️ <span>属性</span></button>
        {isAdmin && <>
          <hr />
          <button onClick={() => run('toggleEdit')}>{editMode ? '👁️' : '✎'} <span>{editMode ? '退出编辑模式' : '进入编辑模式'}</span></button>
          {editMode && <>
            <p>新建文件</p>
            {FILE_TYPES.map((type) => <button key={type.type} onClick={() => run('create', type.type)}>{type.emoji} <span>{type.label}</span></button>)}
            <p>添加装饰</p>
            <button onClick={() => run('createDecoration', 'image')}>🧷 <span>图片贴纸</span></button>
            <button onClick={() => run('createDecoration', 'text')}>🖍️ <span>拼贴文字</span></button>
            <hr />
            <button onClick={() => run('settings')}>⚙️ <span>站点设置</span></button>
          </>}
        </>}
      </>}
      {menu.kind === 'item' && item && <>
        <button onClick={() => run('open', item.id)}>📂 <span>打开</span></button>
        <button onClick={() => run('share', item.id)}>✨ <span>分享</span></button>
        <button onClick={() => run('fileProperties', item.id)}>📋 <span>属性</span></button>
        {isAdmin && editMode && <>
          <hr />
          <button onClick={() => run('rename', item.id)}>✏️ <span>重命名</span></button>
          <button onClick={() => run('icon', item.id)}>🎨 <span>换图标</span></button>
          <button className="is-danger" onClick={() => run('delete', item.id)}>🗑️ <span>删除</span></button>
        </>}
      </>}
    </menu>
  </div>;
}

export function StartMenu({ config, isAdmin, editMode, onClose, onAction }) {
  return <div className="start-shield" onPointerDown={onClose}>
    <aside className="start-menu" onPointerDown={stop} style={{ backgroundImage: config.assets.startMenuBg ? `url(${config.assets.startMenuBg})` : undefined }}>
      <div className="start-menu__rail"><strong>deskof.me</strong><small>Y2K edition</small></div>
      <div className="start-menu__items">
        {config.startMenuItems.map((item, index) => {
          if (item.type === 'separator') return <hr key={item.id || index} />;
          if (item.adminOnly && !isAdmin) return null;
          const editing = item.action === 'toggle-edit' && editMode;
          return <button key={item.id || index} onClick={() => { onClose(); onAction(item); }}>
            <span>{editing ? item.editIcon || item.icon : item.icon}</span>
            <strong>{editing ? item.editLabel || item.label : item.label}</strong>
          </button>;
        })}
      </div>
    </aside>
  </div>;
}

export function Taskbar({ config, windows, isAdmin, editMode, onTask, onLogin, onStartAction }) {
  const [startOpen, setStartOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const clicks = useRef([]);
  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const clockClick = () => {
    if (isAdmin) return;
    const now = Date.now();
    clicks.current = [...clicks.current.filter((value) => now - value <= 3000), now];
    if (clicks.current.length >= 5) { clicks.current = []; onLogin(); }
  };
  const format = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(time);
  if (!config.showTaskbar) return null;
  return <>
    {startOpen && <StartMenu config={config} isAdmin={isAdmin} editMode={editMode} onClose={() => setStartOpen(false)} onAction={onStartAction} />}
    <footer className="taskbar" style={{ backgroundImage: config.assets.taskbarBg ? `url(${config.assets.taskbarBg})` : undefined }}>
      <button className={`start-button ${startOpen ? 'is-pressed' : ''}`} onClick={() => setStartOpen((value) => !value)} aria-label="打开开始菜单">
        {config.assets.taskbarStartIcon ? <img src={config.assets.taskbarStartIcon} alt="" /> : <span>🖥️</span>}<strong>Start</strong>
      </button>
      <i className="taskbar__divider" />
      <div className="taskbar__tasks">
        {windows.map((win) => <button key={win.id} className={win.minimized ? 'is-minimized' : ''} onClick={() => onTask(win.id)} style={config.assets.taskbarTaskBg ? { backgroundImage: `url(${config.assets.taskbarTaskBg})` } : undefined}>
          <span>{TYPE_EMOJI[win.type]}</span><strong>{win.title}</strong>
        </button>)}
      </div>
      <div className="taskbar__tray">
        {isAdmin && <span title={editMode ? '编辑模式' : '管理员'}>{editMode ? '✎' : '♙'}</span>}
        <button className="taskbar__clock" onClick={clockClick} aria-label="系统时钟">{format}</button>
      </div>
    </footer>
  </>;
}

export function AuthDialog({ mode, hasPassword, config, onClose, onLogin, onSetup, onChangeMode }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setPassword(''); setConfirm(''); setError(''); }, [mode]);
  if (!mode) return null;
  const setup = mode === 'setup';
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (setup && password !== confirm) { setError('两次输入的密码不一致'); return; }
    setBusy(true);
    const result = setup ? await onSetup(password) : await onLogin(password);
    setBusy(false);
    if (!result.ok) setError(result.error);
  };
  return <div className="modal-shield auth-shield" onPointerDown={onClose}>
    <section className="auth-card paper-dialog" onPointerDown={stop} style={{ backgroundImage: config.assets.loginBg ? `url(${config.assets.loginBg})` : undefined }}>
      <header><button onClick={onClose} aria-label="关闭">×</button></header>
      <div className="auth-card__logo">{config.assets.loginLogo ? <img src={config.assets.loginLogo} alt="deskof.me" /> : <span>🖥️</span>}<strong>deskof.me</strong><small>{setup ? '首次设置管理员密码' : '管理员登录'}</small></div>
      <form onSubmit={submit}>
        <label>密码<input type="password" autoFocus value={password} onChange={(event) => setPassword(event.target.value)} placeholder="至少 4 位" /></label>
        {setup && <label>再次输入<input type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} /></label>}
        {error && <p className="form-error">{error}</p>}
        <button className="paper-button paper-button--primary" disabled={busy} style={config.assets.loginButton ? { backgroundImage: `url(${config.assets.loginButton})` } : undefined}>{busy ? '验证中…' : setup ? '🔐 设为管理员' : '🔓 登录'}</button>
      </form>
      <button className="paper-button" onClick={onClose}>👀 返回桌面</button>
      {!setup && !hasPassword && <button className="auth-card__setup" onClick={() => onChangeMode('setup')}>🆕 首次设置管理员密码</button>}
    </section>
  </div>;
}

export function EditorDialog({ editor, onClose, onSubmit }) {
  const [draft, setDraft] = useState({});
  useEffect(() => setDraft(editor?.draft || {}), [editor]);
  if (!editor) return null;
  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const upload = async (event, key) => {
    const file = event.target.files?.[0];
    if (file) set(key, await dataUrlFromFile(file));
  };
  const title = editor.mode === 'create' ? `新建${FILE_TYPES.find((item) => item.type === editor.type)?.label || '文件'}`
    : editor.mode === 'rename' ? '重命名' : editor.mode === 'icon' ? '更换图标' : editor.mode === 'decoration' ? '编辑装饰' : '编辑';
  const isContent = ['markdown', 'image', 'video', 'link'].includes(editor.type);
  return <div className="modal-shield" onPointerDown={onClose}>
    <form className="quick-editor paper-dialog" onPointerDown={stop} onSubmit={(event) => { event.preventDefault(); onSubmit(draft); }}>
      <header><strong>{title}</strong><button type="button" onClick={onClose}>×</button></header>
      {(editor.mode === 'create' || editor.mode === 'rename') && <label>名称<input autoFocus value={draft.name || ''} onChange={(event) => set('name', event.target.value)} /></label>}
      {editor.mode === 'icon' && <><AssetEdit label="图标图片" value={draft.icon || ''} onChange={(value) => set('icon', value)} onUpload={(event) => upload(event, 'icon')} /><div className="form-grid"><label>显示大小（20–400px）<input type="number" min="20" max="400" value={draft.displaySize || ''} onChange={(event) => set('displaySize', event.target.value)} placeholder="留空使用全局尺寸" /></label><label>旋转 {draft.rotation || 0}°<input type="range" min="0" max="360" value={draft.rotation || 0} onChange={(event) => set('rotation', Number(event.target.value))} /></label><label>不透明度 {Math.round((draft.opacity ?? 1) * 100)}%<input type="range" min="0" max="1" step="0.05" value={draft.opacity ?? 1} onChange={(event) => set('opacity', Number(event.target.value))} /></label></div></>}
      {editor.mode === 'create' && isContent && editor.type !== 'markdown' && <AssetEdit label={editor.type === 'link' ? '目标 URL' : '媒体 URL'} value={draft.url || ''} onChange={(value) => set('url', value)} onUpload={editor.type === 'link' ? null : (event) => upload(event, 'url')} />}
      {editor.mode === 'create' && editor.type === 'markdown' && <label>内容<textarea value={draft.content || ''} onChange={(event) => set('content', event.target.value)} /></label>}
      {editor.mode === 'decoration' && <>
        {draft.type === 'image'
          ? <AssetEdit label="贴纸图片" value={draft.content || ''} onChange={(value) => set('content', value)} onUpload={(event) => upload(event, 'content')} />
          : <><label>文字<textarea autoFocus value={draft.content || ''} onChange={(event) => set('content', event.target.value)} /></label><div className="form-grid"><label>文字颜色<input type="color" value={draft.color || '#2E294E'} onChange={(event) => set('color', event.target.value)} /></label><label>背景色<input type="color" value={draft.bgColor || '#FFF3A6'} onChange={(event) => set('bgColor', event.target.value)} /></label><label>字号<input type="number" min="8" max="72" value={draft.fontSize || 18} onChange={(event) => set('fontSize', Number(event.target.value))} /></label><label><input type="checkbox" checked={draft.fontWeight === 'bold'} onChange={(event) => set('fontWeight', event.target.checked ? 'bold' : 'normal')} /> 加粗</label></div></>}
        <div className="form-grid"><label>宽度<input type="number" min="20" max="400" value={draft.width || 100} onChange={(event) => set('width', Number(event.target.value))} /></label><label>高度<input type="number" min="20" max="400" value={draft.height || 80} onChange={(event) => set('height', Number(event.target.value))} /></label><label>旋转<input type="range" min="0" max="360" value={draft.rotation || 0} onChange={(event) => set('rotation', Number(event.target.value))} /></label><label>透明度<input type="range" min="0" max="1" step="0.05" value={draft.opacity ?? 1} onChange={(event) => set('opacity', Number(event.target.value))} /></label></div>
      </>}
      <footer><button type="button" className="paper-button" onClick={onClose}>取消</button><button className="paper-button paper-button--primary">确定</button></footer>
    </form>
  </div>;
}

function AssetEdit({ label, value, onChange, onUpload }) {
  return <label>{label}<div className="asset-edit"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="图片或 URL" />{onUpload && <span className="paper-button">上传<input type="file" accept="image/*,video/*" onChange={onUpload} /></span>}</div></label>;
}

function useImageDimensions(item) {
  const [dimensions, setDimensions] = useState('—');
  useEffect(() => {
    if (item?.type !== 'image' || !item.url) { setDimensions('—'); return; }
    const image = new Image();
    image.onload = () => setDimensions(`${image.naturalWidth} × ${image.naturalHeight}px`);
    image.onerror = () => setDimensions('无法读取');
    image.src = item.url;
  }, [item]);
  return dimensions;
}

export function FileProperties({ item, parentName, onClose, onShare }) {
  const [tab, setTab] = useState('general');
  const dimensions = useImageDimensions(item);
  if (!item) return null;
  const created = item.createdAt || Number(item.id.match(/\d{13}/)?.[0]);
  const typeName = FILE_TYPES.find((type) => type.type === item.type)?.label || item.type;
  const words = item.type === 'markdown' ? (item.content || '').trim().split(/\s+/).filter(Boolean).length : null;
  const details = item.type === 'image' ? ['分辨率', dimensions]
    : item.type === 'link' ? ['目标 URL', item.url || '—']
      : item.type === 'markdown' ? ['字数', String(words)]
        : ['子项目', String(item.children?.length || 0)];
  return <div className="modal-shield" onPointerDown={onClose}>
    <section className="file-properties classic-dialog" onPointerDown={stop}>
      <header><strong>{item.name} 属性</strong><button onClick={onClose}>×</button></header>
      <nav className="classic-tabs"><button className={tab === 'general' ? 'is-active' : ''} onClick={() => setTab('general')}>常规</button><button className={tab === 'details' ? 'is-active' : ''} onClick={() => setTab('details')}>详细信息</button></nav>
      <div className="file-properties__body">
        {tab === 'general' ? <>
          <div className="file-properties__hero"><span>{item.icon ? <img src={item.icon} alt="" /> : TYPE_EMOJI[item.type]}</span><strong>{item.name}</strong></div>
          <dl><dt>类型</dt><dd>{typeName}</dd><dt>位置</dt><dd>{parentName ? `${parentName} 文件夹` : '桌面'}</dd><dt>创建时间</dt><dd>{created ? new Date(created).toLocaleString('zh-CN') : '未知'}</dd></dl>
        </> : <dl><dt>自定义图标</dt><dd>{item.icon || '默认图标'}</dd><dt>{details[0]}</dt><dd>{details[1]}</dd><dt>深度链接</dt><dd>{makeDeepLink(item.id)}</dd></dl>}
      </div>
      <footer><button className="paper-button" onClick={() => onShare(item.id)}>✨ 复制分享链接</button><button className="paper-button paper-button--primary" onClick={onClose}>确定</button></footer>
    </section>
  </div>;
}

export function Toast({ message }) {
  return message ? <div className="copy-toast">{message}</div> : null;
}
