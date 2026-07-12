export const defaultDesktopItems = [
  {
    "id": "folder-about",
    "name": "📁 About Me",
    "type": "folder-large",
    "icon": null,
    "position": {
      "x": 1360,
      "y": 720
    },
    "size": "large",
    "children": [
      {
        "id": "md-intro",
        "name": "👋 Intro.md",
        "type": "markdown",
        "icon": null,
        "position": {
          "x": 0,
          "y": 0
        },
        "content": "# Hello! 👋\n\nI'm **[Your Name]** — welcome to my digital desk!\n\nThis is **deskof.me**, my personal corner of the internet.  \nFeel free to look around, open folders, and explore.\n\n---\n\n## About This Desk\n\nEverything you see here is part of my portfolio.  \nClick around! Double-click folders to open them.  \nRight-click for more options.\n\n> *\"The desk is a mirror of the mind.\"*"
      },
      {
        "id": "md-skills",
        "name": "🛠 Skills.md",
        "type": "markdown",
        "icon": null,
        "position": {
          "x": 0,
          "y": 0
        },
        "content": "# Skills & Tools\n\n- **Design:** Figma, Photoshop, Illustrator\n- **Dev:** React, TypeScript, Python\n- **3D:** Blender, Spline\n- **Video:** Premiere, After Effects\n\n> Always learning something new! 🌱"
      }
    ]
  },
  {
    "id": "folder-projects",
    "name": "🌟 Projects",
    "type": "folder-large",
    "icon": null,
    "position": {
      "x": 1429,
      "y": 254
    },
    "size": "large",
    "children": [
      {
        "id": "proj-1",
        "name": "🖼 Project Alpha.png",
        "type": "image",
        "icon": null,
        "position": {
          "x": 0,
          "y": 0
        },
        "url": "https://picsum.photos/800/600?random=1"
      },
      {
        "id": "proj-2",
        "name": "🎬 Demo Reel.webm",
        "type": "video",
        "icon": null,
        "position": {
          "x": 0,
          "y": 0
        },
        "url": "https://www.w3schools.com/html/mov_bbb.mp4"
      }
    ]
  },
  {
    "id": "folder-gallery",
    "name": "📸 Gallery",
    "type": "folder",
    "icon": null,
    "position": {
      "x": 1423,
      "y": 548
    },
    "size": "normal",
    "children": [
      {
        "id": "img-1",
        "name": "photo_01.png",
        "type": "image",
        "icon": null,
        "position": {
          "x": 0,
          "y": 0
        },
        "url": "https://picsum.photos/800/600?random=2"
      },
      {
        "id": "img-2",
        "name": "photo_02.png",
        "type": "image",
        "icon": null,
        "position": {
          "x": 0,
          "y": 0
        },
        "url": "https://picsum.photos/800/600?random=3"
      },
      {
        "id": "img-3",
        "name": "animation.webp",
        "type": "image",
        "icon": null,
        "position": {
          "x": 0,
          "y": 0
        },
        "url": "https://picsum.photos/800/600?random=4"
      }
    ]
  },
  {
    "id": "md-readme",
    "name": "📄 README.md",
    "type": "markdown",
    "icon": null,
    "position": {
      "x": 1200,
      "y": 800
    },
    "content": "# Welcome to deskof.me 🖥️\n\nThis is a **Y2K-style desktop** that serves as my personal website.\n\n## How to Navigate\n\n- **Double-click** folders to open them\n- **Drag** icons to rearrange\n- **Right-click** for more options\n- Click the **Start** button for system menu\n\n## Tech Stack\n\nBuilt with React + Vite. Deployed on GitHub Pages.  \n100% free and open source."
  },
  {
    "id": "link-github",
    "name": "🔗 GitHub",
    "type": "link",
    "icon": null,
    "position": {
      "x": 960,
      "y": 720
    },
    "url": "https://github.com/wu66chen"
  },
  {
    "id": "link-twitter",
    "name": "🐦 Twitter",
    "type": "link",
    "icon": null,
    "position": {
      "x": 880,
      "y": 640
    },
    "url": "https://twitter.com"
  },
  {
    "id": "img-avatar",
    "name": "12.jpg",
    "type": "image",
    "icon": "https://pub.mini-tools.uk/1-day/e705a7c4-908e-4e3b-a468-ff0fb49f61c2.png",
    "position": {
      "x": 1654,
      "y": 549
    },
    "url": "https://picsum.photos/400/400?random=5"
  },
  {
    "type": "folder-large",
    "name": "新文件夹",
    "size": "large",
    "position": {
      "x": 1563,
      "y": 257
    },
    "id": "folder-large-1783854603219",
    "icon": null
  },
  {
    "type": "folder-large",
    "name": "新文件夹",
    "size": "large",
    "position": {
      "x": 1676,
      "y": 256
    },
    "id": "folder-large-1783854703274",
    "icon": null
  },
  {
    "type": "folder",
    "name": "新文件夹",
    "size": "normal",
    "position": {
      "x": 1528,
      "y": 551
    },
    "id": "folder-1783854708067",
    "icon": null
  }
];

export function loadDesktopItems() {
  try {
    const saved = localStorage.getItem('deskofme_desktopItems');
    if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length > 0) return p; }
  } catch (e) {}
  return JSON.parse(JSON.stringify(defaultDesktopItems));
}

export function saveDesktopItems(items) {
  try { localStorage.setItem('deskofme_desktopItems', JSON.stringify(items)); return true; } catch (e) { return false; }
}