import { useState, useCallback } from 'react';
import { loadSiteConfig, saveSiteConfig, defaultSiteConfig } from '../../config/siteConfig';
import './ConfigPanel.css';

export default function ConfigPanel({ onClose, onConfigChange, onPublish }) {
  const [config, setConfig] = useState(() => loadSiteConfig());
  const [tab, setTab] = useState('general');
  const [publishStatus, setPublishStatus] = useState('');

  const handleSave = useCallback(() => {
    saveSiteConfig(config);
    if (onConfigChange) onConfigChange(config);
    onClose();
  }, [config, onConfigChange, onClose]);

  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
  const updateAsset = (key, value) => setConfig(prev => ({ ...prev, customAssets: { ...prev.customAssets, [key]: value || null } }));
  const updateWinDeco = (type, value) => setConfig(prev => ({ ...prev, windowDecorations: { ...prev.windowDecorations, [type]: value || null } }));

  const handlePublish = useCallback(async () => {
    const token = config.githubToken;
    if (!token) { setPublishStatus('❌ 请先在「常规」标签里填入 GitHub Token'); return; }
    setPublishStatus('⏳ 发布中...');
    const result = await onPublish(token);
    setPublishStatus(result.success ? '✅ ' + result.message : '❌ ' + (result.error || '发布失败'));
  }, [config.githubToken, onPublish]);

  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel win98-window" onClick={e => e.stopPropagation()} style={{width:520}}>
        <div className="config-titlebar">
          <span className="config-title">⚙️ 站点设置</span>
          <button className="window-btn window-btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="config-tabs">
          {['general','appearance','windows','startmenu','assets','publish'].map(t => (
            <button key={t} className={`config-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {{general:'常规',appearance:'外观',windows:'窗口',startmenu:'开始菜单',assets:'资源',publish:'发布'}[t]}
            </button>
          ))}
        </div>
        <div className="config-body">
          {tab === 'general' && (<div className="config-section">
            <div className="config-field"><label>桌面名称</label><input className="win98-input" value={config.desktopName} onChange={e=>update('desktopName',e.target.value)} /></div>
            <div className="config-field"><label>用户名</label><input className="win98-input" value={config.username} onChange={e=>update('username',e.target.value)} /></div>
            <div className="config-field"><label>GitHub Token (用于发布)</label><input className="win98-input" type="password" value={config.githubToken||''} onChange={e=>update('githubToken',e.target.value)} placeholder="ghp_xxxx" /><span className="field-hint">仅存储在此浏览器，用于一键发布到 GitHub</span></div>
            <div className="config-field"><label><input type="checkbox" checked={config.showTaskbar!==false} onChange={e=>update('showTaskbar',e.target.checked)} /> 显示任务栏</label></div>
          </div>)}
          {tab === 'appearance' && (<div className="config-section">
            <div className="config-field"><label>壁纸 URL</label><input className="win98-input" value={config.wallpaper||''} onChange={e=>update('wallpaper',e.target.value||null)} placeholder="留空使用默认" /><span className="field-hint">支持 WebP/GIF/JPG/PNG</span></div>
            <div className="config-field"><label>图标尺寸</label><input type="range" min="48" max="160" value={config.iconSize} onChange={e=>update('iconSize',Number(e.target.value))} /><span className="field-hint">{config.iconSize}px</span></div>
          </div>)}
          {tab === 'windows' && (<div className="config-section">
            <p className="config-section-desc">为每种窗口类型设置自定义背景装饰图（支持 WebP 动图）：</p>
            {['folder','folder-large','image','video','markdown','link'].map(t => (
              <div className="config-field" key={t}><label>{t} 窗口背景</label><input className="win98-input" value={config.windowDecorations?.[t]||''} onChange={e=>updateWinDeco(t,e.target.value)} placeholder="背景图片 URL" /></div>
            ))}
          </div>)}
          {tab === 'startmenu' && (<div className="config-section">
            {config.startMenuItems.map((item, idx) => (
              <div key={idx} className="config-field" style={{flexDirection:'row',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                {item.type==='separator' ? <span style={{color:'#999',fontSize:12}}>— 分隔线 —</span> : (<>
                  <input className="win98-input" style={{width:36}} value={item.icon} onChange={e=>{const items=[...config.startMenuItems];items[idx]={...items[idx],icon:e.target.value};update('startMenuItems',items)}} />
                  <input className="win98-input" style={{flex:1,minWidth:60}} value={item.label} onChange={e=>{const items=[...config.startMenuItems];items[idx]={...items[idx],label:e.target.value};update('startMenuItems',items)}} />
                  <label style={{fontSize:11}}><input type="checkbox" checked={!!item.adminOnly} onChange={e=>{const items=[...config.startMenuItems];items[idx]={...items[idx],adminOnly:e.target.checked};update('startMenuItems',items)}} /> 管理员</label>
                </>)}
              </div>
            ))}
          </div>)}
          {tab === 'assets' && (<div className="config-section">
            {Object.entries({taskbarBg:'任务栏背景',taskbarStartIcon:'开始按钮图标',loginBg:'登录页背景',loginLogo:'登录页 Logo',windowTitlebarBg:'窗口标题栏背景'}).map(([k,l]) => (
              <div className="config-field" key={k}><label>{l}</label><input className="win98-input" value={config.customAssets[k]||''} onChange={e=>updateAsset(k,e.target.value)} placeholder="图片 URL（WebP 动图）" /></div>
            ))}
          </div>)}
          {tab === 'publish' && (<div className="config-section">
            <p className="config-section-desc" style={{marginBottom:12}}>将当前所有更改发布到 GitHub，访客即可看到更新。发布后约 1 分钟生效。</p>
            <button className="auth-btn" onClick={handlePublish} style={{background:'#C0FFC0',fontWeight:'bold'}}>📤 发布到 GitHub</button>
            {publishStatus && <div style={{marginTop:8,padding:8,background:publishStatus.startsWith('✅')?'#E0FFE0':'#FFE0E0',borderRadius:4,fontSize:13}}>{publishStatus}</div>}
          </div>)}
        </div>
        <div className="config-footer">
          <button className="auth-btn" onClick={()=>{if(confirm('恢复默认？')){const d=JSON.parse(JSON.stringify(defaultSiteConfig));setConfig(d);saveSiteConfig(d);onConfigChange?.(d);onClose();}}}>🔄 恢复默认</button>
          <button className="auth-btn" onClick={onClose}>取消</button>
          <button className="auth-btn" onClick={handleSave} style={{background:'#C0E0FF'}}>💾 保存设置</button>
        </div>
      </div>
    </div>
  );
}
