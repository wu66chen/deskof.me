export const defaultSiteConfig = {
  "wallpaper": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
  "desktopName": "deskof.me",
  "username": "Guest",
  "clockFormat": "12h",
  "iconSize": 156,
  "gridSnap": false,
  "showTaskbar": true,
  "soundEnabled": false,
  "githubToken": null,
  "dataVersion": 1,
  "parallaxEnabled": true,
  "parallaxStrength": 8,
  "cursorDefault": null,
  "cursorPointer": null,
  "cursorText": null,
  "cursorHotspotX": 4,
  "cursorHotspotY": 4,
  "customAssets": {
    "taskbarBg": null,
    "taskbarStartIcon": null,
    "loginBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "loginLogo": null,
    "windowTitlebarBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "windowBg": null,
    "contextMenuBg": null,
    "startMenuBg": null
  },
  "windowDefaults": {
    "folder": {
      "w": 1528,
      "h": 919
    },
    "folder-large": {
      "w": 1366,
      "h": 842
    },
    "image": {
      "w": 2155,
      "h": 1159
    },
    "video": {
      "w": 680,
      "h": 500
    },
    "markdown": {
      "w": 659,
      "h": 927
    },
    "link": {
      "w": 350,
      "h": 305
    },
    "file": {
      "w": 500,
      "h": 500
    }
  },
  "windowDecorations": {
    "folder": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "video": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "markdown": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg"
  },
  "decorations": [
    {
      "type": "text",
      "content": "delete",
      "x": 1879,
      "y": 432,
      "id": "dec-1783859832271",
      "zIndex": 5,
      "width": 166,
      "height": 145
    },
    {
      "type": "image",
      "content": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
      "x": 75,
      "y": 57,
      "width": 705,
      "height": 705,
      "id": "dec-1783859916386",
      "zIndex": 5
    }
  ],
  "startMenuItems": [
    {
      "id": "edit",
      "label": "进入编辑模式",
      "icon": "✎",
      "adminOnly": true,
      "action": "toggleEdit",
      "editLabel": "退出编辑模式",
      "editIcon": "👁️"
    },
    {
      "id": "settings",
      "label": "站点设置",
      "icon": "⚙️",
      "adminOnly": true,
      "action": "openSettings"
    },
    {
      "id": "separator-1",
      "type": "separator"
    },
    {
      "id": "github",
      "label": "GitHub",
      "icon": "⭐",
      "adminOnly": false,
      "action": "link",
      "url": "https://github.com/wu66chen"
    },
    {
      "id": "separator-2",
      "type": "separator"
    },
    {
      "id": "logout",
      "label": "退出登录",
      "icon": "🚪",
      "adminOnly": true,
      "action": "logout",
      "guestLabel": "管理员登录",
      "guestIcon": "🔑",
      "guestAction": "showLogin"
    }
  ],
  "cursor": null
};

export function loadSiteConfig() {
  try {
    const saved = localStorage.getItem('deskofme_siteConfig');
    const savedVer = saved ? JSON.parse(saved).dataVersion || 0 : -1;
    const currentVer = defaultSiteConfig.dataVersion;
    if (savedVer < currentVer) {
      localStorage.removeItem('deskofme_desktopItems');
      localStorage.removeItem('deskofme_siteConfig');
      return JSON.parse(JSON.stringify(defaultSiteConfig));
    }
    if (saved) {
      const p = JSON.parse(saved);
      return { ...defaultSiteConfig, ...p, customAssets:{...defaultSiteConfig.customAssets,...(p.customAssets||{})}, windowDefaults:{...defaultSiteConfig.windowDefaults,...(p.windowDefaults||{})}, windowDecorations:{...defaultSiteConfig.windowDecorations,...(p.windowDecorations||{})}, decorations:p.decorations||[], startMenuItems:p.startMenuItems||defaultSiteConfig.startMenuItems };
    }
  } catch(e) {}
  return JSON.parse(JSON.stringify(defaultSiteConfig));
}

export function saveSiteConfig(config) {
  try { localStorage.setItem('deskofme_siteConfig', JSON.stringify(config)); return true; } catch(e) { return false; }
}