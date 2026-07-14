import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ASSET_FIELDS, CURSOR_STATES, FILE_TYPES } from './data';
import { dataUrlFromFile, parseChangelog } from './lib';

const stop = (event) => event.stopPropagation();

function readFile(event, callback) {
  const file = event.target.files?.[0];
  if (file) dataUrlFromFile(file).then(callback);
}

function rebalanceAllocation(list, changedIndex, nextValue) {
  const value = Math.max(0, Math.min(100, nextValue));
  const remainder = 100 - value;
  const otherIndexes = list.map((_, index) => index).filter((index) => index !== changedIndex);
  const othersTotal = otherIndexes.reduce((total, index) => total + list[index].value, 0);
  let allocated = 0;
  return list.map((item, index) => {
    if (index === changedIndex) return { ...item, value };
    const otherPosition = otherIndexes.indexOf(index);
    const next = otherPosition === otherIndexes.length - 1
      ? remainder - allocated
      : Math.round((othersTotal ? item.value / othersTotal : 1 / otherIndexes.length) * remainder);
    allocated += next;
    return { ...item, value: Math.max(0, next) };
  });
}

function InlineValue({ editable, value, onChange, multiline = false }) {
  if (!editable) return <span>{value}</span>;
  return multiline
    ? <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    : <input value={value} onChange={(event) => onChange(event.target.value)} />;
}

export function DesktopProperties({ config, editMode, itemCount, decorationCount, onClose, onApply, onPreview }) {
  const [tab, setTab] = useState('general');
  const [draft, setDraft] = useState(config);
  const [logInput, setLogInput] = useState('');
  useEffect(() => setDraft(config), [config]);
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const pie = useMemo(() => {
    let cursor = 0;
    return `conic-gradient(${draft.timeAllocation.map((item) => {
      const start = cursor; cursor += item.value;
      return `${item.color} ${start}% ${cursor}%`;
    }).join(', ')})`;
  }, [draft.timeAllocation]);
  const cdKey = `${(draft.username || 'GUEST').replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 8) || 'GUEST'}-${new Date().getFullYear()}-${String(itemCount).padStart(4, '0')}-OK`;
  const assets = draft.assets;
  return <div className="modal-shield properties-shield" onPointerDown={onClose}>
    <section className="desktop-properties paper-dialog" onPointerDown={stop} style={{ backgroundImage: assets.propertiesBg ? `url(${assets.propertiesBg})` : undefined }}>
      <header className="properties-titlebar"><strong>🖥️ {draft.desktopName} 属性</strong><button onClick={onClose}>×</button></header>
      <nav className="paper-tabs">
        {[['general', '常规'], ['screensaver', '屏幕保护程序'], ['about', '关于'], ['changelog', '更新日志']].map(([key, label]) => <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </nav>
      <div className={`properties-page properties-page--${tab}`}>
        {tab === 'general' && <div className="general-properties">
          <div className="system-card">
            <div className="system-card__icon">{assets.propertiesIcon ? <img src={assets.propertiesIcon} alt="" /> : <span>🖥️</span>}</div>
            <dl><dt>系统名称</dt><dd>{draft.desktopName}</dd><dt>数据版本</dt><dd>v{draft.dataVersion}</dd><dt>注册给</dt><dd>{draft.username}</dd><dt>CD-KEY</dt><dd>{cdKey}</dd><dt>桌面物件</dt><dd>{itemCount} 个文件 · {decorationCount} 个装饰</dd></dl>
          </div>
          <section className="hardware-card">
            <label>CPU · 脑力主频<InlineValue editable={editMode} value={draft.cpuLabel} onChange={(cpuLabel) => update({ cpuLabel })} /></label>
            <label>RAM · 当前关注点<InlineValue editable={editMode} value={draft.ramTags.join(', ')} onChange={(value) => update({ ramTags: value.split(',').map((tag) => tag.trim()).filter(Boolean) })} /></label>
            <div className="ram-chips">{draft.ramTags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          </section>
          <section className="allocation-card">
            <div className="crayon-pie" style={{ background: pie }}><i /></div>
            <div>{draft.timeAllocation.map((item, index) => <label key={item.label}><span style={{ '--chip': item.color }}>{item.label} {item.value}%</span><input type="range" disabled={!editMode} min="0" max="100" value={item.value} onChange={(event) => update({ timeAllocation: rebalanceAllocation(draft.timeAllocation, index, Number(event.target.value)) })} /></label>)}</div>
          </section>
        </div>}
        {tab === 'screensaver' && <div className="screensaver-properties">
          <div className="screensaver-mini" style={{ backgroundImage: assets.propertiesPaperCut ? `url(${assets.propertiesPaperCut})` : undefined }}>
            <i className="screensaver-mini__tape" style={{ backgroundImage: assets.propertiesTape ? `url(${assets.propertiesTape})` : undefined }} />
            <div>{draft.screensaver.text.split('').slice(0, 24).map((char, index) => <span key={`${char}-${index}`} style={{ '--i': index }}>{char === ' ' ? '\u00a0' : char}</span>)}</div>
            <small>{draft.screensaver.stickers.slice(0, 4).join('  ')}</small>
          </div>
          {editMode && <div className="screensaver-form">
            <label>剪报弹跳字<input value={draft.screensaver.text} onChange={(event) => update({ screensaver: { ...draft.screensaver, text: event.target.value } })} /></label>
            <label>漂落贴纸（逗号分隔 emoji 或图片 URL）<textarea value={draft.screensaver.stickers.join(', ')} onChange={(event) => update({ screensaver: { ...draft.screensaver, stickers: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) } })} /></label>
            <label>风力 {draft.screensaver.wind}<input type="range" min="1" max="10" value={draft.screensaver.wind} onChange={(event) => update({ screensaver: { ...draft.screensaver, wind: Number(event.target.value) } })} /></label>
            <label>空气阻尼 {draft.screensaver.damping}<input type="range" min="2" max="12" value={draft.screensaver.damping} onChange={(event) => update({ screensaver: { ...draft.screensaver, damping: Number(event.target.value) } })} /></label>
          </div>}
          <button className="paper-button paper-button--primary" onClick={() => { onApply(draft); onPreview(draft); }}>▶ 全屏预览</button>
          <p>移动鼠标只会吹动纸片；快速挥动、点击或按任意键可退出。</p>
        </div>}
        {tab === 'about' && <div className="certificate">
          <p className="certificate__kicker">CERTIFICATE OF AUTHENTICITY</p>
          <h2>This desk was made by a human.</h2>
          <p>It contains imperfect lines, unfinished thoughts, tiny experiments, and care.</p>
          <div className="certificate__stamp" style={{ backgroundImage: assets.coaStamp ? `url(${assets.coaStamp})` : undefined }}>
            {assets.coaStamp ? null : <InlineValue editable={editMode} value={draft.coaHologramText} onChange={(coaHologramText) => update({ coaHologramText })} />}
          </div>
          <div className="certificate__signature">{assets.digitalSignature ? <img src={assets.digitalSignature} alt="数字签名" /> : <strong>{draft.username}</strong>}<small>digitally signed with care</small></div>
          {editMode && <label className="asset-inline">签名图片 URL<input value={assets.digitalSignature || ''} onChange={(event) => update({ assets: { ...assets, digitalSignature: event.target.value || null } })} /><span className="paper-button">上传<input type="file" accept="image/*" onChange={(event) => readFile(event, (digitalSignature) => update({ assets: { ...assets, digitalSignature } }))} /></span></label>}
        </div>}
        {tab === 'changelog' && <div className="changelog-paper" style={{ backgroundImage: assets.propertiesLogBg ? `url(${assets.propertiesLogBg})` : undefined }}>
          <h2>desk notes / 更新日志</h2>
          <ol>{draft.changelog.map((log) => <li key={log.id}>
            <span className={`log-icon log-icon--${log.type}`} style={assets[`properties${log.type[0].toUpperCase()}${log.type.slice(1)}Icon`] ? { backgroundImage: `url(${assets[`properties${log.type[0].toUpperCase()}${log.type.slice(1)}Icon`]})` } : undefined}>{log.type === 'feat' ? '🆕' : log.type === 'fix' ? '🩹' : '⚡'}</span>
            <strong>{log.text}</strong>{log.done && <em style={assets.propertiesDoneIcon ? { backgroundImage: `url(${assets.propertiesDoneIcon})` } : undefined}>DONE</em>}
          </li>)}</ol>
          {editMode && <form onSubmit={(event) => { event.preventDefault(); if (!logInput.trim()) return; update({ changelog: [...draft.changelog, parseChangelog(logInput)] }); setLogInput(''); }}><label>✏️ 用 + / - / * 开头记录 FEAT / FIX / OPT<textarea value={logInput} onChange={(event) => setLogInput(event.target.value)} placeholder="+ 新增了一个有趣功能" /></label><button className="paper-button">写进日志</button></form>}
        </div>}
      </div>
      <footer className="properties-actions"><button className="paper-button" onClick={onClose}>取消</button><button className="paper-button" onClick={() => onApply(draft)}>应用</button><button className="paper-button paper-button--primary" onClick={() => { onApply(draft); onClose(); }}>确定</button></footer>
    </section>
  </div>;
}

export function CursorPopover({ config, onUpdate, onClose, onPreview }) {
  const updateCursor = (key, patch) => onUpdate({ ...config, cursors: { ...config.cursors, [key]: { ...config.cursors[key], ...patch } } });
  const drop = async (event, key) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) updateCursor(key, { url: await dataUrlFromFile(file) });
  };
  return <aside className="cursor-popover paper-dialog" onPointerDown={stop}>
    <header><strong>✏️ 光标定制气泡</strong><button onClick={onClose}>×</button></header>
    <p>把图片拖进状态框，悬停即可实时预览热点。</p>
    <label className="cursor-global-size"><strong>全局光标大小</strong><span>{config.cursorSize || 32}px · 统一应用于 6 种状态</span><input type="range" min="16" max="96" value={config.cursorSize || 32} onChange={(event) => onUpdate({ ...config, cursorSize: Number(event.target.value) })} /></label>
    <div className="cursor-popover__list">
      {CURSOR_STATES.map((state) => {
        const value = config.cursors[state.key];
        return <section key={state.key} onPointerEnter={() => onPreview(state.key)} onPointerLeave={() => onPreview(null)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => drop(event, state.key)}>
          <div className="cursor-preview">{value.url ? <img src={value.url} alt="" /> : <span>{state.emoji}</span>}</div>
          <div><strong>{state.label}</strong><input value={value.url || ''} onChange={(event) => updateCursor(state.key, { url: event.target.value || null })} placeholder="图片 URL" /><label>X {value.hotspotX}<input type="range" min="0" max="31" value={value.hotspotX} onChange={(event) => updateCursor(state.key, { hotspotX: Number(event.target.value) })} /></label><label>Y {value.hotspotY}<input type="range" min="0" max="31" value={value.hotspotY} onChange={(event) => updateCursor(state.key, { hotspotY: Number(event.target.value) })} /></label></div>
        </section>;
      })}
    </div>
  </aside>;
}

function AssetField({ label, value, onChange }) {
  return <label className="asset-field"><span>{label}</span><input value={value || ''} onChange={(event) => onChange(event.target.value || null)} placeholder="URL / data:image…" /><span className="paper-button">上传<input type="file" accept="image/*" onChange={(event) => readFile(event, onChange)} /></span>{value && <button type="button" onClick={() => onChange(null)}>清除</button>}</label>;
}

export function SiteSettings({ config, token, setToken, onClose, onSave, onReset, onPublish }) {
  const [tab, setTab] = useState('general');
  const [draft, setDraft] = useState(config);
  const [status, setStatus] = useState('');
  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const publish = async () => {
    setStatus('⏳ 正在提交桌面数据…');
    try { const version = await onPublish(token, draft); setStatus(`✅ 已发布 v${version}，访客刷新后即可看到`); }
    catch (error) { setStatus(`❌ ${error.message}`); }
  };
  const addMenu = (type) => update({ startMenuItems: [...draft.startMenuItems, type === 'separator' ? { id: `sep-${Date.now()}`, type } : { id: `link-${Date.now()}`, icon: '🔗', label: '新链接', action: 'link', url: 'https://' }] });
  const updateMenu = (index, patch) => update({ startMenuItems: draft.startMenuItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  const removeMenu = (index) => update({ startMenuItems: draft.startMenuItems.filter((_, itemIndex) => itemIndex !== index) });
  const tabs = [['general', '常规'], ['appearance', '外观'], ['cursors', '光标'], ['windows', '窗口'], ['assets', '全部件'], ['menu', '菜单'], ['publish', '发布']];
  return <div className="modal-shield settings-shield" onPointerDown={onClose}>
    <section className="site-settings classic-dialog" onPointerDown={stop}>
      <header><strong>⚙️ 站点设置</strong><button onClick={onClose}>×</button></header>
      <nav className="settings-tabs">{tabs.map(([key, label]) => <button key={key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{label}</button>)}</nav>
      <div className="settings-body">
        {tab === 'general' && <div className="settings-section"><label>桌面名称<input value={draft.desktopName} onChange={(event) => update({ desktopName: event.target.value })} /></label><label>管理员用户名<input value={draft.username} onChange={(event) => update({ username: event.target.value })} /></label><label>GitHub 展示链接<input value={draft.repoUrl} onChange={(event) => update({ repoUrl: event.target.value })} /></label><label><input type="checkbox" checked={draft.showTaskbar} onChange={(event) => update({ showTaskbar: event.target.checked })} /> 显示任务栏</label></div>}
        {tab === 'appearance' && <div className="settings-section">
          <AssetField label="桌面壁纸" value={draft.assets.wallpaper} onChange={(wallpaper) => update({ assets: { ...draft.assets, wallpaper } })} />
          <label><input type="checkbox" checked={draft.wallpaperParallax} onChange={(event) => update({ wallpaperParallax: event.target.checked })} /> 壁纸视差</label><label>视差强度 {draft.parallaxStrength}<input type="range" min="2" max="20" value={draft.parallaxStrength} onChange={(event) => update({ parallaxStrength: Number(event.target.value) })} /></label><label>普通图标尺寸 {draft.iconSize}px<input type="range" min="48" max="140" value={draft.iconSize} onChange={(event) => update({ iconSize: Number(event.target.value) })} /></label><label>大文件夹倍率 {draft.largeIconScale.toFixed(1)}×<input type="range" min="1.5" max="2.2" step="0.1" value={draft.largeIconScale} onChange={(event) => update({ largeIconScale: Number(event.target.value) })} /></label><label>选中线宽 {draft.selectedStrokeWidth}px<input type="range" min="1" max="8" value={draft.selectedStrokeWidth} onChange={(event) => update({ selectedStrokeWidth: Number(event.target.value) })} /></label><label>选中填充 {Math.round(draft.selectedFillOpacity * 100)}%<input type="range" min="0.05" max="0.4" step="0.01" value={draft.selectedFillOpacity} onChange={(event) => update({ selectedFillOpacity: Number(event.target.value) })} /></label>
          <div className="color-grid">{Object.entries(draft.colors).map(([key, value]) => <label key={key}>{key}<input type="color" value={value} onChange={(event) => update({ colors: { ...draft.colors, [key]: event.target.value } })} /></label>)}</div>
        </div>}
        {tab === 'cursors' && <div className="settings-section"><label className="settings-global-cursor"><strong>全局光标大小</strong><span>{draft.cursorSize || 32}px · 六种光标统一缩放</span><input type="range" min="16" max="96" value={draft.cursorSize || 32} onChange={(event) => update({ cursorSize: Number(event.target.value) })} /></label>{CURSOR_STATES.map((state) => <section className="settings-cursor" key={state.key}><strong>{state.emoji} {state.label}</strong><AssetField label="图片" value={draft.cursors[state.key].url} onChange={(url) => update({ cursors: { ...draft.cursors, [state.key]: { ...draft.cursors[state.key], url } } })} /><label>Hotspot X {draft.cursors[state.key].hotspotX}<input type="range" min="0" max="31" value={draft.cursors[state.key].hotspotX} onChange={(event) => update({ cursors: { ...draft.cursors, [state.key]: { ...draft.cursors[state.key], hotspotX: Number(event.target.value) } } })} /></label><label>Hotspot Y {draft.cursors[state.key].hotspotY}<input type="range" min="0" max="31" value={draft.cursors[state.key].hotspotY} onChange={(event) => update({ cursors: { ...draft.cursors, [state.key]: { ...draft.cursors[state.key], hotspotY: Number(event.target.value) } } })} /></label></section>)}</div>}
        {tab === 'windows' && <div className="settings-section"><label>内壁显示<select value={draft.windowContentMode} onChange={(event) => update({ windowContentMode: event.target.value })}><option value="stretch">拉伸</option><option value="tile">平铺</option></select></label><label>内壁不透明度 {draft.windowContentOpacity}<input type="range" min="0" max="1" step="0.05" value={draft.windowContentOpacity} onChange={(event) => update({ windowContentOpacity: Number(event.target.value) })} /></label>{FILE_TYPES.map((type) => <section className="window-setting" key={type.type}><strong>{type.emoji} {type.label}</strong><label>宽<input type="number" min="300" max="1400" value={draft.windowDefaults[type.type]?.w || 600} onChange={(event) => update({ windowDefaults: { ...draft.windowDefaults, [type.type]: { ...draft.windowDefaults[type.type], w: Number(event.target.value) } } })} /></label><label>高<input type="number" min="210" max="1000" value={draft.windowDefaults[type.type]?.h || 500} onChange={(event) => update({ windowDefaults: { ...draft.windowDefaults, [type.type]: { ...draft.windowDefaults[type.type], h: Number(event.target.value) } } })} /></label><AssetField label="窗口背景" value={draft.windowBackgrounds[type.type]} onChange={(value) => update({ windowBackgrounds: { ...draft.windowBackgrounds, [type.type]: value } })} /></section>)}</div>}
        {tab === 'assets' && <div className="settings-section asset-matrix">{ASSET_FIELDS.map((field) => <AssetField key={field.key} label={field.label} value={draft.assets[field.key]} onChange={(value) => update({ assets: { ...draft.assets, [field.key]: value } })} />)}</div>}
        {tab === 'menu' && <div className="settings-section menu-editor">{draft.startMenuItems.map((item, index) => item.type === 'separator' ? <div key={item.id || index}><span>—— 分隔线 ——</span><button onClick={() => removeMenu(index)}>×</button></div> : <div key={item.id || index}><input className="menu-icon-input" value={item.icon || ''} onChange={(event) => updateMenu(index, { icon: event.target.value })} /><input value={item.label || ''} onChange={(event) => updateMenu(index, { label: event.target.value })} />{item.action === 'link' && <input value={item.url || ''} onChange={(event) => updateMenu(index, { url: event.target.value })} />}<label><input type="checkbox" checked={Boolean(item.adminOnly)} onChange={(event) => updateMenu(index, { adminOnly: event.target.checked })} />仅管理</label><button onClick={() => removeMenu(index)}>×</button></div>)}<footer><button className="paper-button" onClick={() => addMenu('link')}>＋ 链接</button><button className="paper-button" onClick={() => addMenu('separator')}>＋ 分隔线</button></footer></div>}
        {tab === 'publish' && <div className="settings-section publish-panel"><p>本地编辑仅自己可见。发布会把当前桌面数据存档到源码分支，同时把实时数据写入 Pages；其他访客刷新后即可看到。</p><div className="form-grid"><label>Owner<input value={draft.publish.owner} onChange={(event) => update({ publish: { ...draft.publish, owner: event.target.value } })} /></label><label>Repo<input value={draft.publish.repo} onChange={(event) => update({ publish: { ...draft.publish, repo: event.target.value } })} /></label><label>源码分支<input value={draft.publish.branch} onChange={(event) => update({ publish: { ...draft.publish, branch: event.target.value } })} /></label></div><label>GitHub Personal Access Token<input type="password" value={token} onChange={(event) => setToken(event.target.value)} placeholder="仅保存在当前浏览器" /></label><small>建议使用 Fine-grained token，仅授予此仓库 Contents 读写权限；不需要 workflow 权限。</small><button className="paper-button paper-button--publish" onClick={() => { onSave(draft); publish(); }}>📤 发布到 GitHub</button>{status && <output>{status}</output>}<p>当前数据版本：v{draft.dataVersion}</p></div>}
      </div>
      <footer className="settings-actions"><button className="paper-button" onClick={() => { if (window.confirm('恢复源代码中的默认桌面？')) onReset(); }}>恢复默认</button><span /><button className="paper-button" onClick={onClose}>取消</button><button className="paper-button paper-button--primary" onClick={() => { onSave(draft); onClose(); }}>保存设置</button></footer>
    </section>
  </div>;
}

function isUrl(value) { return /^https?:|^data:image/i.test(value); }

export function ScreenSaver({ config, onExit }) {
  const [closing, setClosing] = useState(false);
  const [breeze, setBreeze] = useState({ x: 0, y: 0 });
  const last = useRef(null);
  const exit = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onExit, 520);
  }, [closing, onExit]);
  useEffect(() => {
    const key = () => exit();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [exit]);
  const move = (event) => {
    const now = performance.now();
    if (last.current) {
      const distance = Math.hypot(event.clientX - last.current.x, event.clientY - last.current.y);
      if (distance > 160 && now - last.current.t < 240) { exit(); return; }
    }
    last.current = { x: event.clientX, y: event.clientY, t: now };
    setBreeze({ x: (event.clientX / window.innerWidth - 0.5) * config.screensaver.wind * 8, y: (event.clientY / window.innerHeight - 0.5) * 10 });
  };
  const stickers = config.screensaver.stickers.length ? config.screensaver.stickers : ['⭐', '💿', '🦋'];
  return <div className={`screensaver ${closing ? 'is-closing' : ''}`} onPointerMove={move} onPointerDown={exit} style={{ backgroundImage: config.assets.screensaverBackground ? `url(${config.assets.screensaverBackground})` : undefined, '--wind': `${breeze.x}px`, '--breeze-y': `${breeze.y}px`, '--damping': config.screensaver.damping }}>
    <div className="screensaver__text">{config.screensaver.text.split('').map((char, index) => <span key={`${char}-${index}`} style={{ '--i': index, '--tilt': `${((index * 17) % 13) - 6}deg` }}>{char === ' ' ? '\u00a0' : char}</span>)}</div>
    <div className="screensaver__rain">{Array.from({ length: 18 }, (_, index) => {
      const sticker = stickers[index % stickers.length];
      return <i key={index} style={{ '--i': index, '--left': `${(index * 37) % 96}%`, '--duration': `${13 + (index % 7) * 1.4}s`, '--delay': `${-(index % 9) * 1.9}s` }}>{isUrl(sticker) ? <img src={sticker} alt="" /> : sticker}</i>;
    })}</div>
    <p>轻轻移动会吹动纸片 · 快速挥动 / 点击 / 按键退出</p>
  </div>;
}
