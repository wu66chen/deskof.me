import { useState, useCallback } from 'react';
import { loadSiteConfig, saveSiteConfig, defaultSiteConfig } from '../../config/siteConfig';
import './ConfigPanel.css';

const SIZE_HINTS = {
  taskbarBg: '建议: 1920×40px 横向纹理或纯色',
  taskbarStartIcon: '建议: 24×24px 图标',
  loginBg: '建议: 400×300px',
  loginLogo: '建议: 64×64px',
  windowTitlebarBg: '建议: 1×28px 横向渐变条',
  windowBg: '建议: 64×64px 平铺纹理',
  contextMenuBg: '建议: 200×200px',
  startMenuBg: '建议: 220×300px',
};

export default function ConfigPanel({ onClose, onConfigChange, onPublish }) {
  const [config, setConfig] = useState(() => loadSiteConfig());
  const [tab, setTab] = useState('general');
  const [pubStatus, setPubStatus] = useState('');

  const handleSave = useCallback(() => { saveSiteConfig(config); onConfigChange?.(config); onClose(); }, [config, onConfigChange, onClose]);
  const update = (k, v) => setConfig(p => ({...p, [k]: v}));
  const updateAsset = (k, v) => setConfig(p => ({...p, customAssets: {...p.customAssets, [k]: v||null}}));
  const updateWinDeco = (t, v) => setConfig(p => ({...p, windowDecorations: {...p.windowDecorations, [t]: v||null}}));

  const handlePublish = useCallback(async () => {
    const token = config.githubToken;
    if (!token) { setPubStatus('❌ 请先填入 GitHub Token'); return; }
    setPubStatus('⏳ 发布中...');
    const finalConfig = { ...config, dataVersion: (config.dataVersion||0)+1 };
    saveSiteConfig(finalConfig);
    setConfig(finalConfig);
    const result = await onPublish(token, finalConfig.dataVersion);
    setPubStatus(result.success ? '✅ '+result.message : '❌ '+(result.error||'失败'));
  }, [config, onPublish]);

  // 开始菜单添加链接
  const addStartMenuItem = () => {
    const items = [...config.startMenuItems];
    items.push({ id: 'link-'+Date.now(), label: '新链接', icon: '🔗', action: 'link', url: 'https://' });
    update('startMenuItems', items);
  };
  const updateSM = (idx, field, value) => {
    const items = [...config.startMenuItems];
    items[idx] = { ...items[idx], [field]: value };
    update('startMenuItems', items);
  };

  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel win98-window" onClick={e=>e.stopPropagation()} style={{width:540,maxHeight:'85vh'}}>
        <div className="config-titlebar"><span className="config-title">⚙️ 站点设置</span><button className="window-btn window-btn-close" onClick={onClose}>✕</button></div>
        <div className="config-tabs">
          {['general','appearance','cursor','windows','deco','assets','startmenu','publish'].map(t=>(
            <button key={t} className={`config-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {{general:'常规',appearance:'外观',cursor:'光标',windows:'窗口',deco:'装饰',assets:'资源',startmenu:'菜单',publish:'发布'}[t]}
            </button>
          ))}
        </div>
        <div className="config-body">
          {tab==='general'&&(<div className="config-section">
            <div className="config-field"><label>桌面名称</label><input className="win98-input" value={config.desktopName} onChange={e=>update('desktopName',e.target.value)}/></div>
            <div className="config-field"><label>用户名</label><input className="win98-input" value={config.username} onChange={e=>update('username',e.target.value)}/></div>
            <div className="config-field"><label>GitHub Token</label><input className="win98-input" type="password" value={config.githubToken||''} onChange={e=>update('githubToken',e.target.value)} placeholder="ghp_xxxx"/><span className="field-hint">用于发布功能，仅存此浏览器</span></div>
            <div className="config-field"><label><input type="checkbox" checked={config.showTaskbar!==false} onChange={e=>update('showTaskbar',e.target.checked)}/> 显示任务栏</label></div>
          </div>)}
          {tab==='appearance'&&(<div className="config-section">
            <div className="config-field"><label>壁纸 URL</label><input className="win98-input" value={config.wallpaper||''} onChange={e=>update('wallpaper',e.target.value||null)} placeholder="留空=默认CSS壁纸"/><span className="field-hint">支持 WebP/GIF/JPG/PNG</span></div>
            <div className="config-field"><label>图标尺寸: {config.iconSize}px</label><input type="range" min="48" max="160" value={config.iconSize} onChange={e=>update('iconSize',Number(e.target.value))}/></div>
            <div className="config-field"><label><input type="checkbox" checked={config.parallaxEnabled!==false} onChange={e=>update('parallaxEnabled',e.target.checked)}/> 壁纸视差效果</label></div>
            {config.parallaxEnabled!==false&&<div className="config-field"><label>视差强度: {config.parallaxStrength||8}</label><input type="range" min="2" max="20" value={config.parallaxStrength||8} onChange={e=>update('parallaxStrength',Number(e.target.value))}/></div>}
          </div>)}
          {tab==='cursor'&&(<div className="config-section">
            <p className="config-section-desc">自定义光标图片（留空使用默认 emoji）。支持 PNG/WebP。</p>
            <div className="config-field"><label>默认光标(default) 图片 URL</label><input className="win98-input" value={config.cursorDefault||''} onChange={e=>update('cursorDefault',e.target.value||null)} placeholder="建议: 32×32px PNG"/></div>
            <div className="config-field"><label>指针光标(pointer) 图片 URL</label><input className="win98-input" value={config.cursorPointer||''} onChange={e=>update('cursorPointer',e.target.value||null)} placeholder="建议: 32×32px PNG"/></div>
            <div className="config-field"><label>文字光标(text) 图片 URL</label><input className="win98-input" value={config.cursorText||''} onChange={e=>update('cursorText',e.target.value||null)} placeholder="建议: 32×32px PNG"/></div>
            <div className="config-field"><label>热点(Hotspot) X: {config.cursorHotspotX||4}px</label><input type="range" min="0" max="31" value={config.cursorHotspotX||4} onChange={e=>update('cursorHotspotX',Number(e.target.value))}/></div>
            <div className="config-field"><label>热点(Hotspot) Y: {config.cursorHotspotY||4}px</label><input type="range" min="0" max="31" value={config.cursorHotspotY||4} onChange={e=>update('cursorHotspotY',Number(e.target.value))}/></div>
          </div>)}
          {tab==='windows'&&(<div className="config-section">
            <p className="config-section-desc">窗口背景装饰图。调整好窗口大小后点标题栏「💾默认」保存默认尺寸。</p>
            {['folder','folder-large','image','video','markdown','link'].map(t=>(
              <div className="config-field" key={t}><label>{t} 窗口背景</label><input className="win98-input" value={config.windowDecorations?.[t]||''} onChange={e=>updateWinDeco(t,e.target.value)} placeholder="背景图片 URL（支持 WebP 动图）"/></div>
            ))}
          </div>)}
          {tab==='deco'&&(<div className="config-section">
            <p className="config-section-desc">管理所有装饰元素。每行一个，编辑模式下也可拖拽操作。</p>
            {(!config.decorations||config.decorations.length===0)&&<p style={{color:'#999',fontSize:13}}>暂无装饰。编辑模式下右键桌面添加。</p>}
            {(config.decorations||[]).map((d,i)=>(
              <div key={d.id} className="config-field" style={{flexDirection:'row',alignItems:'center',gap:6,padding:'4px 0',borderBottom:'1px solid #eee'}}>
                <span style={{fontSize:11,flex:1}}>{d.type==='image'?'🖼️':'📝'} {d.content?.substring(0,30)}</span>
                <button className="viewer-edit-btn" onClick={()=>{const decs=[...config.decorations];decs.splice(i,1);update('decorations',decs)}}>✕</button>
              </div>
            ))}
          </div>)}
          {tab==='assets'&&(<div className="config-section">
            <p className="config-section-desc">全站可替换的视觉资源。</p>
            {Object.entries(SIZE_HINTS).map(([k,label])=>(
              <div className="config-field" key={k}><label>{k}</label><input className="win98-input" value={config.customAssets[k]||''} onChange={e=>updateAsset(k,e.target.value)} placeholder="图片 URL"/><span className="field-hint">{label}</span></div>
            ))}
          </div>)}
          {tab==='startmenu'&&(<div className="config-section">
            {config.startMenuItems.map((item,idx)=>(
              <div key={idx} className="config-field" style={{flexDirection:'row',alignItems:'center',gap:4,flexWrap:'wrap',padding:'2px 0'}}>
                {item.type==='separator'?<span style={{color:'#999',fontSize:12}}>— 分隔线 —</span>:(<>
                  <input className="win98-input" style={{width:32}} value={item.icon} onChange={e=>updateSM(idx,'icon',e.target.value)}/>
                  <input className="win98-input" style={{flex:1,minWidth:60}} value={item.label} onChange={e=>updateSM(idx,'label',e.target.value)}/>
                  {item.action==='link'&&<input className="win98-input" style={{width:120}} value={item.url||''} onChange={e=>updateSM(idx,'url',e.target.value)} placeholder="URL"/>}
                  <label style={{fontSize:10}}><input type="checkbox" checked={!!item.adminOnly} onChange={e=>updateSM(idx,'adminOnly',e.target.checked)}/>管理</label>
                  <button className="viewer-edit-btn" onClick={()=>{const items=[...config.startMenuItems];items.splice(idx,1);update('startMenuItems',items)}}>✕</button>
                </>)}
              </div>
            ))}
            <button className="auth-btn" onClick={addStartMenuItem} style={{marginTop:8,fontSize:12}}>➕ 添加链接</button>
          </div>)}
          {tab==='publish'&&(<div className="config-section">
            <p className="config-section-desc">将当前所有更改发布到 GitHub，发布后所有访客都能看到更新。（约1分钟生效）</p>
            <button className="auth-btn" onClick={handlePublish} style={{background:'#C0FFC0',fontWeight:'bold',fontSize:14}}>📤 发布到 GitHub</button>
            {pubStatus&&<div style={{marginTop:8,padding:8,background:pubStatus.startsWith('✅')?'#E0FFE0':'#FFE0E0',borderRadius:4,fontSize:13}}>{pubStatus}</div>}
          </div>)}
        </div>
        <div className="config-footer">
          <button className="auth-btn" onClick={()=>{if(confirm('恢复默认？')){const d=JSON.parse(JSON.stringify(defaultSiteConfig));setConfig(d);saveSiteConfig(d);onConfigChange?.(d);onClose();}}}>🔄 恢复</button>
          <button className="auth-btn" onClick={onClose}>取消</button>
          <button className="auth-btn" onClick={handleSave} style={{background:'#C0E0FF'}}>💾 保存</button>
        </div>
      </div>
    </div>
  );
}
