export const defaultSiteConfig = {
  wallpaper: null, desktopName: "deskof.me", username: "Guest",
  clockFormat: "12h", iconSize: 72, gridSnap: false,
  showTaskbar: true, soundEnabled: false, githubToken: null, dataVersion: 0,
  parallaxEnabled: true, parallaxStrength: 8,
  cursorDefault: null, cursorPointer: null, cursorText: null,
  cursorGrabbing: null, cursorMove: null, cursorResize: null,
  cursorHotspotX: 4, cursorHotspotY: 4,
  customAssets: {
    taskbarBg: null, taskbarStartIcon: null, loginBg: null, loginLogo: null,
    windowTitlebarBg: null, windowBorder: null, windowBg: null,
    windowBtnClose: null, windowBtnMin: null, windowBtnMax: null,
    contextMenuBg: null, startMenuBg: null,
  },
  windowDefaults: {
    'folder':{w:720,h:500},'folder-large':{w:760,h:500},
    'image':{w:700,h:520},'video':{w:720,h:500},
    'markdown':{w:620,h:500},'link':{w:380,h:200},
  },
  windowDecorations: {},
  decorations: [],
  // 开始菜单 — 不再有"管理员登录"入口（改为隐藏触发）
  startMenuItems: [
    {id:'edit',label:'进入编辑模式',icon:'✎',adminOnly:true,action:'toggleEdit',editLabel:'退出编辑模式',editIcon:'👁️'},
    {id:'settings',label:'站点设置',icon:'⚙️',adminOnly:true,action:'openSettings'},
    {id:'sep1',type:'separator'},
    {id:'github',label:'GitHub',icon:'⭐',action:'link',url:'https://github.com/wu66chen'},
    {id:'sep2',type:'separator'},
    {id:'logout',label:'退出登录',icon:'🚪',adminOnly:true,action:'logout'},
  ],
};

export function loadSiteConfig() {
  try {
    const s=localStorage.getItem('deskofme_siteConfig');
    const sv=s?JSON.parse(s).dataVersion||0:-1;
    const cv=defaultSiteConfig.dataVersion;
    if(sv<cv){localStorage.removeItem('deskofme_desktopItems');localStorage.removeItem('deskofme_siteConfig');return JSON.parse(JSON.stringify(defaultSiteConfig));}
    if(s){const p=JSON.parse(s);return{...defaultSiteConfig,...p,customAssets:{...defaultSiteConfig.customAssets,...(p.customAssets||{})},windowDefaults:{...defaultSiteConfig.windowDefaults,...(p.windowDefaults||{})},windowDecorations:{...defaultSiteConfig.windowDecorations,...(p.windowDecorations||{})},decorations:p.decorations||[],startMenuItems:p.startMenuItems||defaultSiteConfig.startMenuItems};}
  }catch(e){}
  return JSON.parse(JSON.stringify(defaultSiteConfig));
}
export function saveSiteConfig(c){try{localStorage.setItem('deskofme_siteConfig',JSON.stringify(c));return true}catch(e){return false}}
