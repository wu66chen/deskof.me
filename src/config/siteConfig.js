export const defaultSiteConfig = {
  "wallpaper": null,
  "cursor": null,
  "desktopName": "deskof.me",
  "username": "Guest",
  "clockFormat": "12h",
  "iconSize": 147,
  "gridSnap": false,
  "showTaskbar": true,
  "soundEnabled": false,
  "githubToken": null,
  "customAssets": {
    "taskbarBg": null,
    "taskbarStartIcon": null,
    "loginBg": null,
    "loginLogo": null,
    "windowTitlebarBg": null
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
      "w": 620,
      "h": 500
    },
    "link": {
      "w": 380,
      "h": 200
    },
    "file": {
      "w": 500,
      "h": 500
    }
  },
  "windowDecorations": {},
  "decorations": [],
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
  ]
};

export function loadSiteConfig() { /* ... */ }
export function saveSiteConfig(config) { /* ... */ }