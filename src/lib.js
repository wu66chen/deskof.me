export const clone = (value) => JSON.parse(JSON.stringify(value));

export function mergeState(defaultState, saved) {
  if (!saved) return clone(defaultState);
  return {
    ...clone(defaultState),
    ...saved,
    config: {
      ...clone(defaultState.config),
      ...(saved.config || {}),
      colors: { ...defaultState.config.colors, ...(saved.config?.colors || {}) },
      assets: { ...defaultState.config.assets, ...(saved.config?.assets || {}) },
      cursors: { ...defaultState.config.cursors, ...(saved.config?.cursors || {}) },
      windowDefaults: { ...defaultState.config.windowDefaults, ...(saved.config?.windowDefaults || {}) },
      windowBackgrounds: { ...defaultState.config.windowBackgrounds, ...(saved.config?.windowBackgrounds || {}) },
      publish: { ...defaultState.config.publish, ...(saved.config?.publish || {}) },
      screensaver: { ...defaultState.config.screensaver, ...(saved.config?.screensaver || {}) },
    },
    items: saved.items || clone(defaultState.items),
    decorations: saved.decorations || clone(defaultState.decorations),
  };
}

export function findItem(items, id) {
  for (const item of items) {
    if (item.id === id) return item;
    const nested = item.children && findItem(item.children, id);
    if (nested) return nested;
  }
  return null;
}

export function findParent(items, id, parent = null) {
  for (const item of items) {
    if (item.id === id) return parent;
    const nested = item.children && findParent(item.children, id, item);
    if (nested) return nested;
  }
  return null;
}

export function updateItem(items, id, updates) {
  return items.map((item) => item.id === id
    ? { ...item, ...updates }
    : item.children ? { ...item, children: updateItem(item.children, id, updates) } : item);
}

export function removeItem(items, id) {
  let removed = null;
  const walk = (list) => list.reduce((acc, item) => {
    if (item.id === id) { removed = item; return acc; }
    acc.push(item.children ? { ...item, children: walk(item.children) } : item);
    return acc;
  }, []);
  return { items: walk(items), removed };
}

export function insertIntoFolder(items, folderId, child) {
  return items.map((item) => {
    if (item.id === folderId && ['folder', 'folder-large'].includes(item.type)) {
      return { ...item, children: [...(item.children || []), { ...child, position: undefined }] };
    }
    return item.children ? { ...item, children: insertIntoFolder(item.children, folderId, child) } : item;
  });
}

export function moveIntoFolder(items, itemId, folderId) {
  const result = removeItem(items, itemId);
  if (!result.removed || result.removed.id === folderId) return items;
  return insertIntoFolder(result.items, folderId, result.removed);
}

export function moveToDesktop(items, itemId, position) {
  const result = removeItem(items, itemId);
  return result.removed ? [...result.items, { ...result.removed, position }] : items;
}

export function countItems(items) {
  return items.reduce((total, item) => total + 1 + (item.children ? countItems(item.children) : 0), 0);
}

export function flattenItems(items, depth = 0) {
  return items.flatMap((item) => [{ item, depth }, ...(item.children ? flattenItems(item.children, depth + 1) : [])]);
}

export function createItem(type, values = {}) {
  const createdAt = Date.now();
  const defaults = {
    folder: { name: '新文件夹', children: [] },
    'folder-large': { name: '新作品集', children: [] },
    markdown: { name: '新文档.md', content: '# 新文档\n\n开始写点什么…' },
    image: { name: '新图片.png', url: '' },
    video: { name: '新视频.mp4', url: '' },
    link: { name: '新链接', url: 'https://' },
  }[type] || { name: '新文件' };
  return { id: `${type}-${createdAt}`, type, createdAt, ...defaults, ...values };
}

export function dataUrlFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function makeDeepLink(id) {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('file', id);
  return url.toString();
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}

export function parseChangelog(input) {
  const marker = input.trim()[0];
  const type = marker === '+' ? 'feat' : marker === '-' ? 'fix' : 'opt';
  return { id: `log-${Date.now()}`, type, text: ['+', '-', '*'].includes(marker) ? input.trim().slice(1).trim() : input.trim(), done: false };
}

export function safeExternalUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}
