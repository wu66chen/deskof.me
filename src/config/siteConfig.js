export const defaultSiteConfig = {
  wallpaper: null, desktopName: "deskof.me", username: "Guest",
  clockFormat: "12h", iconSize: 72, gridSnap: false,
  showTaskbar: true, soundEnabled: false,
  githubToken: null,
  dataVersion: 0,
  // 壁纸视差
  parallaxEnabled: true, parallaxStrength: 8,
  // 自定义光标图片（PNG/WebP，留空=默认 emoji）
  cursorDefault: null, cursorPointer: null, cursorText: null,
  cursorHotspotX: 4, cursorHotspotY: 4,
  // 全站可替换资源（含建议尺寸）
  customAssets: {
    taskbarBg: null,          // 建议: 宽屏幕宽, 高40px 的横向纹理
    taskbarStartIcon: null,   // 建议: 24×24px 图标
    loginBg: null,            // 建议: 400×300px 背景图
    loginLogo: null,          // 建议: 64×64px Logo
    windowTitlebarBg: null,   // 建议: 1px 高横向渐变条
    windowBg: null,           // 建议: 平铺纹理 64×64px
    contextMenuBg: null,      // 建议: 200×200px 纹理
    startMenuBg: null,        // 建议: 220×300px 背景
  },
  windowDefaults: {
    'folder': { w: 720, h: 500 }, 'folder-large': { w: 760, h: 500 },
    'image': { w: 600, h: 500 }, 'video': { w: 680, h: 500 },
    'markdown': { w: 620, h: 500 }, 'link': { w: 380, h: 200 },
  },
  windowDecorations: {},
  decorations: [],
  startMenuItems: [
    { id: 'edit', label: '进入编辑模式', icon: '✎', adminOnly: true, action: 'toggleEdit', editLabel: '退出编辑模式', editIcon: '👁️' },
    { id: 'settings', label: '站点设置', icon: '⚙️', adminOnly: true, action: 'openSettings' },
    { id: 'separator-1', type: 'separator' },
    { id: 'github', label: 'GitHub', icon: '⭐', action: 'link', url: 'https://github.com/wu66chen' },
    { id: 'separator-2', type: 'separator' },
    { id: 'logout', label: '退出登录', icon: '🚪', adminOnly: true, action: 'logout', guestLabel: '管理员登录', guestIcon: '🔑', guestAction: 'showLogin' },
  ],
};

export function loadSiteConfig() {
  try {
    const saved = localStorage.getItem('deskofme_siteConfig');
    const savedVer = saved ? JSON.parse(saved).dataVersion || 0 : -1;
    const currentVer = defaultSiteConfig.dataVersion;
    // 如果 localStorage 版本比当前（源码）版本旧，用源码
    if (savedVer < currentVer) {
      localStorage.removeItem('deskofme_desktopItems');
      localStorage.removeItem('deskofme_siteConfig');
      return JSON.parse(JSON.stringify(defaultSiteConfig));
    }
    if (saved) {
      const p = JSON.parse(saved);
      return {
        ...defaultSiteConfig, ...p,
        customAssets: { ...defaultSiteConfig.customAssets, ...(p.customAssets||{}) },
        windowDefaults: { ...defaultSiteConfig.windowDefaults, ...(p.windowDefaults||{}) },
        windowDecorations: { ...defaultSiteConfig.windowDecorations, ...(p.windowDecorations||{}) },
        decorations: p.decorations || [],
        startMenuItems: p.startMenuItems || defaultSiteConfig.startMenuItems,
      };
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(defaultSiteConfig));
}

export function saveSiteConfig(config) {
  try { localStorage.setItem('deskofme_siteConfig', JSON.stringify(config)); return true; } catch(e) { return false; }
}
