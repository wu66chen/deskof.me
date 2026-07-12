import { useState, useCallback } from 'react';
import { loadSiteConfig, saveSiteConfig } from '../../config/siteConfig';
import { loadCustomIcons, saveCustomIcons } from '../../config/defaultIcons';
import './ConfigPanel.css';

/**
 * 设置面板窗口（管理员专属）
 */
export default function ConfigPanel({ onClose, onConfigChange }) {
  const [config, setConfig] = useState(() => loadSiteConfig());
  const [customIcons, setCustomIcons] = useState(() => loadCustomIcons());
  const [tab, setTab] = useState('general');

  const handleSave = useCallback(() => {
    saveSiteConfig(config);
    saveCustomIcons(customIcons);
    if (onConfigChange) onConfigChange(config);
    onClose();
  }, [config, customIcons, onConfigChange, onClose]);

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateIcon = (type, url) => {
    setCustomIcons(prev => ({ ...prev, [type]: url || null }));
  };

  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-panel win98-window" onClick={(e) => e.stopPropagation()}>
        <div className="config-titlebar">
          <span className="config-title">⚙️ 站点设置</span>
          <button className="window-btn window-btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="config-tabs">
          <button className={`config-tab ${tab === 'general' ? 'active' : ''}`} onClick={() => setTab('general')}>
            常规
          </button>
          <button className={`config-tab ${tab === 'icons' ? 'active' : ''}`} onClick={() => setTab('icons')}>
            图标
          </button>
          <button className={`config-tab ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')}>
            关于
          </button>
        </div>

        <div className="config-body">
          {tab === 'general' && (
            <div className="config-section">
              <div className="config-field">
                <label>壁纸 URL</label>
                <input
                  className="win98-input"
                  value={config.wallpaper || ''}
                  onChange={(e) => updateConfig('wallpaper', e.target.value || null)}
                  placeholder="留空使用默认 CSS 壁纸"
                />
                <span className="field-hint">输入图片 URL 替换壁纸</span>
              </div>

              <div className="config-field">
                <label>桌面名称</label>
                <input
                  className="win98-input"
                  value={config.desktopName}
                  onChange={(e) => updateConfig('desktopName', e.target.value)}
                />
              </div>

              <div className="config-field">
                <label>用户名</label>
                <input
                  className="win98-input"
                  value={config.username}
                  onChange={(e) => updateConfig('username', e.target.value)}
                />
              </div>

              <div className="config-field">
                <label>图标尺寸</label>
                <input
                  type="range"
                  min="48"
                  max="120"
                  value={config.iconSize}
                  onChange={(e) => updateConfig('iconSize', Number(e.target.value))}
                />
                <span className="field-hint">{config.iconSize}px</span>
              </div>

              <div className="config-field">
                <label>
                  <input
                    type="checkbox"
                    checked={config.gridSnap}
                    onChange={(e) => updateConfig('gridSnap', e.target.checked)}
                  />
                  {' '}拖拽吸附到网格
                </label>
              </div>

              <div className="config-field">
                <label>
                  <input
                    type="checkbox"
                    checked={config.showTaskbar}
                    onChange={(e) => updateConfig('showTaskbar', e.target.checked)}
                  />
                  {' '}显示任务栏
                </label>
              </div>
            </div>
          )}

          {tab === 'icons' && (
            <div className="config-section">
              <p className="config-section-desc">
                为各类型文件设置自定义图标（输入图片 URL）
              </p>
              {['folder', 'folder-large', 'image', 'video', 'markdown', 'link', 'file'].map(type => (
                <div className="config-field" key={type}>
                  <label>{type} 图标</label>
                  <input
                    className="win98-input"
                    value={customIcons[type] || ''}
                    onChange={(e) => updateIcon(type, e.target.value)}
                    placeholder="留空使用默认 Emoji"
                  />
                </div>
              ))}
            </div>
          )}

          {tab === 'about' && (
            <div className="config-section config-about">
              <h3>deskof.me</h3>
              <p>Y2K 风格个人桌面网站</p>
              <p>把你的作品集放进一个可爱的电脑桌面里 🖥️</p>
              <div className="about-links">
                <p>Built with React + Vite</p>
                <p>Deployed on GitHub Pages</p>
                <p>Made with 💖</p>
              </div>
              <button
                className="auth-btn"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{ marginTop: 16, background: '#FFE0E0' }}
              >
                🗑️ 清除所有数据（重置网站）
              </button>
            </div>
          )}
        </div>

        <div className="config-footer">
          <button className="auth-btn" onClick={handleClose}>取消</button>
          <button className="auth-btn" onClick={handleSave} style={{ background: '#C0E0FF' }}>
            💾 保存设置
          </button>
        </div>
      </div>
    </div>
  );
}
