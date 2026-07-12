export const defaultSiteConfig = {
  "wallpaper": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
  "desktopName": "deskof.me",
  "username": "Guest",
  "clockFormat": "12h",
  "iconSize": 71,
  "gridSnap": false,
  "showTaskbar": true,
  "soundEnabled": false,
  "githubToken": null,
  "dataVersion": 3,
  "parallaxEnabled": false,
  "parallaxStrength": 3,
  "cursorDefault": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
  "cursorPointer": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
  "cursorText": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
  "cursorGrabbing": null,
  "cursorMove": null,
  "cursorResize": null,
  "cursorHotspotX": 1,
  "cursorHotspotY": 1,
  "customAssets": {
    "taskbarBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "taskbarStartIcon": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "loginBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "loginLogo": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "windowTitlebarBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "windowBorder": null,
    "windowBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "windowBtnClose": null,
    "windowBtnMin": null,
    "windowBtnMax": null,
    "contextMenuBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "startMenuBg": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg"
  },
  "windowDefaults": {
    "folder": {
      "w": 1335,
      "h": 880
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
      "w": 1268,
      "h": 859
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
    "markdown": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "image": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "folder-large": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
    "link": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg"
  },
  "decorations": [
    {
      "type": "image",
      "content": "https://pub.mini-tools.uk/1-day/37db78d2-c82a-4099-850c-a289f0283c73.jpg",
      "x": 1608,
      "y": 1008,
      "width": 482,
      "height": 482,
      "id": "dec-1783859916386",
      "zIndex": 5,
      "rotation": 29
    },
    {
      "type": "text",
      "content": "|red|fffffffff",
      "x": 2029,
      "y": 1317,
      "id": "dec-1783865188334",
      "zIndex": 25000,
      "width": 208,
      "height": 196,
      "fontSize": 137,
      "rotation": -9,
      "fontFamily": "gaegu",
      "color": "#f5a50a",
      "fontWeight": "bold"
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
    },
    {
      "id": "link-1783862470663",
      "label": "新链接",
      "icon": "🔗",
      "action": "link",
      "url": "bilibili.com"
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