import { useState, useCallback } from 'react';
import { loadSiteConfig, saveSiteConfig, defaultSiteConfig } from '../../config/siteConfig';
import './ConfigPanel.css';

export default function ConfigPanel({ onClose, onConfigChange }) {
  const [config, setConfig] = useState(() => loadSiteConfig());
  const [tab, setTab] = useState('general');

  const handleSave = useCallback(() => {
    saveSiteConfig(config);
    if (onConfigChange) onConfigChange(config);
    onClose();
  }, [config, onConfigChange, onClose]);

  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));
  const updateAsset = (key, value) => setConfig(prev => ({
    ...prev, customAssets: { ...prev.customAssets, [key]: value || null }
  }));

  // 开始菜单项的编辑
  const updateStartMenuItem = (idx, field, value) => {
    const items = [...config.startMenuItems];
    items[idx] = { ...items[idx], [field]: value };
    update('startMenuItems', items);
  };

  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel win98-window" onClick={e => e.stopPropagation()}>
        <div className="config-titlebar">
          <span className="config-title">⚙️ 站点设置</span>
          <button className="window-btn window-btn-close" onClick={onClose}>✕</button>
        </div>
        <div className="config-tabs">
          {['general','appearance','startmenu','assets'].map(t => (
            <button key={t} className={`config-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {{general:'常规',appearance:'外观',startmenu:'开始菜单',assets:'资源替换'}[t]}
            </button>
          ))}
        </div>
        <div className="config-body">
          {tab === 'general' && (<div className="config-section">
            <div className="config-field"><label>桌面名称</label><input className="win98-input" value={config.desktopName} onChange={e=>update('desktopName',e.target.value)} /></div>
            <div className="config-field"><label>用户名</label><input className="win98-input" value={config.username} onChange={e=>update('username',e.target.value)} /></div>
            <div className="config-field"><label><input type="checkbox" checked={config.showTaskbar!==false} onChange={e=>update('showTaskbar',e.target.checked)} /> 显示任务栏</label></div>
          </div>)}
          {tab === 'appearance' && (<div className="config-section">
            <div className="config-field"><label>壁纸 URL (支持 WebP/GIF/JPG/PNG)</label><input className="win98-input" value={config.wallpaper||''} onChange={e=>update('wallpaper',e.target.value||null)} placeholder="留空使用默认 CSS 壁纸" /><span className="field-hint">输入图片链接替换壁纸，支持动图 WebP</span></div>
            <div className="config-field"><label>图标尺寸 (px)</label><input type="range" min="48" max="160" value={config.iconSize} onChange={e=>update('iconSize',Number(e.target.value))} /><span className="field-hint">{config.iconSize}px</span></div>
          </div>)}
          {tab === 'startmenu' && (<div className="config-section">
            <p className="config-section-desc">编辑开始菜单项目。管理员和访客看到的项目不同。</p>
            {config.startMenuItems.map((item, idx) => (
              <div key={idx} className="config-field" style={{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                {item.type === 'separator' ? (
                  <span style={{color:'#999',fontSize:12}}>— 分隔线 —</span>
                ) : (<>
                  <input className="win98-input" style={{width:36}} value={item.icon} onChange={e=>updateStartMenuItem(idx,'icon',e.target.value)} title="图标" />
                  <input className="win98-input" style={{flex:1,minWidth:80}} value={item.label} onChange={e=>updateStartMenuItem(idx,'label',e.target.value)} title="标签" />
                  <label style={{fontSize:11,whiteSpace:'nowrap'}}><input type="checkbox" checked={!!item.adminOnly} onChange={e=>updateStartMenuItem(idx,'adminOnly',e.target.checked)} /> 仅管理员</label>
                </>)}
              </div>
            ))}
          </div>)}
          {tab === 'assets' && (<div className="config-section">
            <p className="config-section-desc">替换全站部件的图片（支持 WebP/GIF/PNG/JPG）。留空使用默认。</p>
            {Object.entries({
              taskbarBg: '任务栏背景', taskbarStartIcon: '开始按钮图标',
              loginBg: '登录页背景', loginLogo: '登录页 Logo',
              windowTitlebarBg: '窗口标题栏背景',
            }).map(([key,label]) => (
              <div className="config-field" key={key}><label>{label}</label>
                <input className="win98-input" value={config.customAssets[key]||''} onChange={e=>updateAsset(key,e.target.value)} placeholder="图片 URL（支持 WebP 动图）" />
              </div>
            ))}
          </div>)}
        </div>
        <div className="config-footer">
          <button className="auth-btn" onClick={() => { if(confirm('恢复默认设置？')) { const d = JSON.parse(JSON.stringify(defaultSiteConfig)); setConfig(d); saveSiteConfig(d); onConfigChange?.(d); onClose(); } }}>🔄 恢复默认</button>
          <button className="auth-btn" onClick={onClose}>取消</button>
          <button className="auth-btn" onClick={handleSave} style={{background:'#C0E0FF'}}>💾 保存设置</button>
        </div>
      </div>
    </div>
  );
}
