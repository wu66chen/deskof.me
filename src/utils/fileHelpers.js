/**
 * 文件类型辅助函数
 */

export function getFileExtension(name) {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

export function getDisplayName(name, type) {
  // 如果名称已含 emoji 则保留，否则添加默认 emoji
  return name;
}

export function getItemIcon(item, customIcons) {
  // 如果该项有自定义图标
  if (item.icon) return item.icon;
  // 否则使用类型默认图标
  if (customIcons && customIcons[item.type]) return customIcons[item.type];
  return null; // null = 使用 CSS/emoji 渲染
}

export function canOpenWindow(type) {
  return ['folder', 'folder-large', 'image', 'video', 'markdown', 'link'].includes(type);
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
