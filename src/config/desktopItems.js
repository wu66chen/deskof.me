/**
 * 桌面项目数据模型
 * 管理员可在编辑模式下修改，访客只读
 * localStorage 中的数据优先级高于此默认数据
 */
export const defaultDesktopItems = [
  {
    id: 'folder-about',
    name: '📁 About Me',
    type: 'folder-large',
    icon: null,
    position: { x: 40, y: 40 },
    size: 'large',
    children: [
      {
        id: 'md-intro',
        name: '👋 Intro.md',
        type: 'markdown',
        icon: null,
        position: { x: 0, y: 0 },
        content: `# Hello! 👋

I'm **[Your Name]** — welcome to my digital desk!

This is **deskof.me**, my personal corner of the internet.  
Feel free to look around, open folders, and explore.

---

## About This Desk

Everything you see here is part of my portfolio.  
Click around! Double-click folders to open them.  
Right-click for more options.

> *"The desk is a mirror of the mind."*`,
      },
      {
        id: 'md-skills',
        name: '🛠 Skills.md',
        type: 'markdown',
        icon: null,
        position: { x: 0, y: 0 },
        content: `# Skills & Tools\n\n- **Design:** Figma, Photoshop, Illustrator\n- **Dev:** React, TypeScript, Python\n- **3D:** Blender, Spline\n- **Video:** Premiere, After Effects\n\n> Always learning something new! 🌱`,
      },
    ],
  },
  {
    id: 'folder-projects',
    name: '🌟 Projects',
    type: 'folder-large',
    icon: null,
    position: { x: 260, y: 40 },
    size: 'large',
    children: [
      {
        id: 'proj-1',
        name: '🖼 Project Alpha.png',
        type: 'image',
        icon: null,
        position: { x: 0, y: 0 },
        url: 'https://picsum.photos/800/600?random=1',
      },
      {
        id: 'proj-2',
        name: '🎬 Demo Reel.webm',
        type: 'video',
        icon: null,
        position: { x: 0, y: 0 },
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
    ],
  },
  {
    id: 'folder-gallery',
    name: '📸 Gallery',
    type: 'folder',
    icon: null,
    position: { x: 480, y: 40 },
    size: 'normal',
    children: [
      {
        id: 'img-1',
        name: 'photo_01.png',
        type: 'image',
        icon: null,
        position: { x: 0, y: 0 },
        url: 'https://picsum.photos/800/600?random=2',
      },
      {
        id: 'img-2',
        name: 'photo_02.png',
        type: 'image',
        icon: null,
        position: { x: 0, y: 0 },
        url: 'https://picsum.photos/800/600?random=3',
      },
      {
        id: 'img-3',
        name: 'animation.webp',
        type: 'image',
        icon: null,
        position: { x: 0, y: 0 },
        url: 'https://picsum.photos/800/600?random=4',
      },
    ],
  },
  {
    id: 'md-readme',
    name: '📄 README.md',
    type: 'markdown',
    icon: null,
    position: { x: 40, y: 320 },
    content: `# Welcome to deskof.me 🖥️

This is a **Y2K-style desktop** that serves as my personal website.

## How to Navigate

- **Double-click** folders to open them
- **Drag** icons to rearrange
- **Right-click** for more options
- Click the **Start** button for system menu

## Tech Stack

Built with React + Vite. Deployed on GitHub Pages.  
100% free and open source.`,
  },
  {
    id: 'link-github',
    name: '🔗 GitHub',
    type: 'link',
    icon: null,
    position: { x: 40, y: 550 },
    url: 'https://github.com/wu66chen',
  },
  {
    id: 'link-twitter',
    name: '🐦 Twitter',
    type: 'link',
    icon: null,
    position: { x: 200, y: 550 },
    url: 'https://twitter.com',
  },
  {
    id: 'img-avatar',
    name: '🧸 my_avatar.gif',
    type: 'image',
    icon: null,
    position: { x: 680, y: 320 },
    url: 'https://picsum.photos/400/400?random=5',
  },
];

// 从 localStorage 加载，合并默认值
export function loadDesktopItems() {
  try {
    const saved = localStorage.getItem('deskofme_desktopItems');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load saved desktop items, using defaults');
  }
  return JSON.parse(JSON.stringify(defaultDesktopItems));
}

// 保存到 localStorage
export function saveDesktopItems(items) {
  try {
    localStorage.setItem('deskofme_desktopItems', JSON.stringify(items));
    return true;
  } catch (e) {
    console.error('Failed to save desktop items:', e);
    return false;
  }
}
