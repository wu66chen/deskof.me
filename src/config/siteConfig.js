/**
 * 站点全局配置
 * 管理员可在设置面板中修改，修改后保存到 localStorage
 */
export const defaultSiteConfig = {
  wallpaper: null, // null = 使用 CSS 默认壁纸，或填图片 URL
  cursor: null,    // null = 使用默认像素光标
  desktopName: "deskof.me",
  username: "Guest",
  clockFormat: "12h",   // '12h' | '24h'
  iconSize: 72,         // 桌面图标尺寸 (px)
  gridSnap: true,       // 拖拽是否吸附到网格
  gridSize: 80,         // 网格大小
  showTaskbar: true,
  soundEnabled: false,
};

// 从 localStorage 加载
export function loadSiteConfig() {
  try {
    const saved = localStorage.getItem('deskofme_siteConfig');
    if (saved) {
      return { ...defaultSiteConfig, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load saved site config');
  }
  return { ...defaultSiteConfig };
}

// 保存到 localStorage
export function saveSiteConfig(config) {
  try {
    localStorage.setItem('deskofme_siteConfig', JSON.stringify(config));
    return true;
  } catch (e) {
    return false;
  }
}
