export const defaultSiteConfig = {
  wallpaper: null,
  cursor: null,
  desktopName: "deskof.me",
  username: "Guest",
  clockFormat: "12h",
  iconSize: 72,
  gridSnap: false,
  showTaskbar: true,
  soundEnabled: false,
  // 自定义资产（支持 WebP/PNG/JPG/GIF）
  customAssets: {
    taskbarBg: null,
    taskbarStartIcon: null,
    loginBg: null,
    loginLogo: null,
    windowTitlebarBg: null,
  },
  // 开始菜单可配置项目
  startMenuItems: [
    { id: 'edit', label: '进入编辑模式', icon: '✎', adminOnly: true, action: 'toggleEdit', editLabel: '退出编辑模式', editIcon: '👁️' },
    { id: 'settings', label: '站点设置', icon: '⚙️', adminOnly: true, action: 'openSettings' },
    { id: 'separator-1', type: 'separator' },
    { id: 'github', label: 'GitHub', icon: '⭐', adminOnly: false, action: 'link', url: 'https://github.com/wu66chen' },
    { id: 'separator-2', type: 'separator' },
    { id: 'logout', label: '退出登录', icon: '🚪', adminOnly: true, action: 'logout', guestLabel: '管理员登录', guestIcon: '🔑', guestAction: 'showLogin' },
  ],
};

export function loadSiteConfig() {
  try {
    const saved = localStorage.getItem('deskofme_siteConfig');
    if (saved) return { ...defaultSiteConfig, ...JSON.parse(saved), customAssets: { ...defaultSiteConfig.customAssets, ...(JSON.parse(saved).customAssets || {}) }, startMenuItems: JSON.parse(saved).startMenuItems || defaultSiteConfig.startMenuItems };
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultSiteConfig));
}

export function saveSiteConfig(config) {
  try { localStorage.setItem('deskofme_siteConfig', JSON.stringify(config)); return true; } catch (e) { return false; }
}
