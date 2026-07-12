/**
 * 默认图标映射
 * 管理员可替换为自定义图标 URL
 */
export const defaultIcons = {
  folder: null,        // null = CSS 渲染图标
  'folder-large': null,
  image: null,
  video: null,
  markdown: null,
  link: null,
  file: null,
  unknown: null,
};

// 图标 Emoji fallback（CSS 图标不可用时）
export const iconEmoji = {
  folder: '📁',
  'folder-large': '📂',
  image: '🖼️',
  video: '🎬',
  markdown: '📝',
  link: '🔗',
  file: '📄',
  unknown: '❓',
};

// 加载自定义图标
export function loadCustomIcons() {
  try {
    const saved = localStorage.getItem('deskofme_customIcons');
    if (saved) {
      return { ...defaultIcons, ...JSON.parse(saved) };
    }
  } catch (e) {}
  return { ...defaultIcons };
}

export function saveCustomIcons(icons) {
  try {
    localStorage.setItem('deskofme_customIcons', JSON.stringify(icons));
    return true;
  } catch (e) {
    return false;
  }
}
