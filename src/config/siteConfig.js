export const defaultSiteConfig = {
  wallpaper: null, cursor: null,
  desktopName: "deskof.me", username: "Guest",
  clockFormat: "12h", iconSize: 72,
  gridSnap: false, showTaskbar: true, soundEnabled: false,
  githubToken: null, // 管理员发布用的 GitHub Token
  customAssets: { taskbarBg: null, taskbarStartIcon: null, loginBg: null, loginLogo: null, windowTitlebarBg: null },
  // 窗口默认大小/位置记忆（按类型）
  windowDefaults: {
    'folder': { w: 720, h: 500 }, 'folder-large': { w: 760, h: 500 },
    'image': { w: 600, h: 500 }, 'video': { w: 680, h: 500 },
    'markdown': { w: 620, h: 500 }, 'link': { w: 380, h: 200 }, 'file': { w: 500, h: 500 },
  },
  // 窗口自定义装饰（按类型 → 图片 URL）
  windowDecorations: {},
  // 自由装饰层：图片/文字任意放置
  decorations: [],
  // 开始菜单
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
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultSiteConfig,
        ...parsed,
        customAssets: { ...defaultSiteConfig.customAssets, ...(parsed.customAssets || {}) },
        windowDefaults: { ...defaultSiteConfig.windowDefaults, ...(parsed.windowDefaults || {}) },
        windowDecorations: { ...defaultSiteConfig.windowDecorations, ...(parsed.windowDecorations || {}) },
        decorations: parsed.decorations || defaultSiteConfig.decorations,
        startMenuItems: parsed.startMenuItems || defaultSiteConfig.startMenuItems,
      };
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultSiteConfig));
}

export function saveSiteConfig(config) {
  try { localStorage.setItem('deskofme_siteConfig', JSON.stringify(config)); return true; } catch (e) { return false; }
}
