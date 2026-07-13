import { publishedDeskState } from './content.generated.js';

const assetKeys = [
  'wallpaper', 'selectedTexture', 'taskbarBg', 'taskbarStartIcon', 'taskbarTaskBg',
  'startMenuBg', 'contextMenuBg', 'loginBg', 'loginLogo', 'loginButton',
  'windowTitlebarBg', 'windowBorder', 'windowContentBg',
  'windowBtnClose', 'windowBtnCloseHover', 'windowBtnCloseActive',
  'windowBtnMin', 'windowBtnMinHover', 'windowBtnMinActive',
  'windowBtnMax', 'windowBtnMaxHover', 'windowBtnMaxActive',
  'propertiesBg', 'propertiesIcon', 'propertiesPaperCut', 'propertiesTape',
  'propertiesLogBg', 'propertiesFeatIcon', 'propertiesFixIcon',
  'propertiesOptIcon', 'propertiesDoneIcon', 'coaStamp', 'digitalSignature',
  'pencilBoxIcon', 'screensaverBackground',
];

export const ASSET_FIELDS = assetKeys.map((key) => ({
  key,
  label: {
    wallpaper: '桌面壁纸', selectedTexture: '图标选中纹理', taskbarBg: '任务栏背景',
    taskbarStartIcon: 'Start 图标', taskbarTaskBg: '任务按钮背板', startMenuBg: '开始菜单背景',
    contextMenuBg: '右键菜单背景', loginBg: '登录面板背板', loginLogo: '登录徽标',
    loginButton: '登录按钮', windowTitlebarBg: '窗口标题栏', windowBorder: '窗口边框',
    windowContentBg: '窗口内容内壁', windowBtnClose: '关闭按钮',
    windowBtnCloseHover: '关闭按钮 Hover', windowBtnCloseActive: '关闭按钮按下',
    windowBtnMin: '最小化按钮', windowBtnMinHover: '最小化 Hover',
    windowBtnMinActive: '最小化按下', windowBtnMax: '最大化按钮',
    windowBtnMaxHover: '最大化 Hover', windowBtnMaxActive: '最大化按下',
    propertiesBg: '桌面属性底纸', propertiesIcon: '桌面属性图标',
    propertiesPaperCut: '屏保预览撕纸', propertiesTape: '屏保预览胶带',
    propertiesLogBg: '更新日志稿纸', propertiesFeatIcon: 'FEAT 图章',
    propertiesFixIcon: 'FIX 图章', propertiesOptIcon: 'OPT 图章',
    propertiesDoneIcon: 'DONE 图章', coaStamp: '授权证书防伪章',
    digitalSignature: '数字签名', pencilBoxIcon: '手绘笔筒',
    screensaverBackground: '屏保背景',
  }[key] || key,
}));

export const CURSOR_STATES = [
  { key: 'default', label: '默认', emoji: '✏️' },
  { key: 'pointer', label: '指针', emoji: '👆' },
  { key: 'text', label: '文本', emoji: '✍️' },
  { key: 'grabbing', label: '拖拽中', emoji: '✊' },
  { key: 'move', label: '移动中', emoji: '🤏' },
  { key: 'resize', label: '缩放中', emoji: '↘️' },
];

export const FILE_TYPES = [
  { type: 'folder', label: '文件夹', emoji: '📁' },
  { type: 'folder-large', label: '大型文件夹', emoji: '📂' },
  { type: 'markdown', label: 'Markdown', emoji: '📝' },
  { type: 'image', label: '图片', emoji: '🖼️' },
  { type: 'video', label: '视频', emoji: '🎬' },
  { type: 'link', label: '链接', emoji: '🔗' },
];

export const TYPE_EMOJI = Object.fromEntries(FILE_TYPES.map((item) => [item.type, item.emoji]));

export const DEFAULT_CONFIG = {
  desktopName: 'deskof.me',
  username: 'Wesley',
  dataVersion: 1,
  repoUrl: 'https://github.com/wu66chen/deskof.me',
  colors: {
    winBg: '#C0C0C0', paperBg: '#F5F0E8', pink: '#FF69B4',
    cyan: '#00D9E8', purple: '#BF40BF', orange: '#FF8C00', ink: '#2E294E',
  },
  assets: Object.fromEntries(assetKeys.map((key) => [key, null])),
  wallpaperParallax: true,
  parallaxStrength: 8,
  iconSize: 72,
  largeIconScale: 1.8,
  selectedStrokeWidth: 3,
  selectedFillOpacity: 0.15,
  showTaskbar: true,
  windowContentMode: 'stretch',
  windowContentOpacity: 1,
  windowDefaults: {
    folder: { w: 720, h: 500 }, 'folder-large': { w: 760, h: 500 },
    image: { w: 700, h: 520 }, video: { w: 720, h: 500 },
    markdown: { w: 620, h: 500 }, link: { w: 380, h: 220 },
  },
  windowBackgrounds: {},
  cursors: Object.fromEntries(CURSOR_STATES.map(({ key }) => [key, { url: null, hotspotX: 4, hotspotY: 4 }])),
  cpuLabel: 'Creative Brain Core @ 100% 细节控',
  ramTags: ['手冲咖啡', '婴童鞋 AI'],
  timeAllocation: [
    { label: '设计', value: 30, color: '#FF69B4' },
    { label: '编码', value: 30, color: '#00B8D4' },
    { label: '思考', value: 25, color: '#BF40BF' },
    { label: '摸鱼', value: 15, color: '#FFB347' },
  ],
  screensaver: {
    text: 'Wesley is coding...', stickers: ['⭐', '💿', '🦋', '🌈', '💖'],
    wind: 5, damping: 7,
  },
  coaHologramText: '100% Pure Human Creativity',
  changelog: [
    { id: 'welcome', type: 'feat', text: '数字桌面作品集正式开机', done: true },
    { id: 'deep-link', type: 'opt', text: '加入作品深度链接与分享', done: true },
    { id: 'paper-ui', type: 'feat', text: '完成手绘纸张属性面板', done: true },
  ],
  startMenuItems: [
    { id: 'edit', label: '进入编辑模式', editLabel: '退出编辑模式', icon: '✎', editIcon: '👁️', action: 'toggle-edit', adminOnly: true },
    { id: 'settings', label: '站点设置', icon: '⚙️', action: 'settings', adminOnly: true },
    { id: 'sep-a', type: 'separator' },
    { id: 'github', label: 'GitHub', icon: '⭐', action: 'link', url: 'https://github.com/wu66chen/deskof.me' },
    { id: 'sep-b', type: 'separator' },
    { id: 'logout', label: '退出登录', icon: '🚪', action: 'logout', adminOnly: true },
  ],
  publish: { owner: 'wu66chen', repo: 'deskof.me', branch: 'main' },
};

export const DEFAULT_ITEMS = [
  {
    id: 'folder-about', name: 'About Me', type: 'folder-large', position: { x: 46, y: 58 }, createdAt: 1783987200000,
    children: [
      { id: 'about-intro', name: 'Hello, I’m Wesley.md', type: 'markdown', createdAt: 1783987200000, content: '# Hello! 👋\n\nI’m **Wesley Liu** — welcome to my digital desk.\n\nI make thoughtful digital products, playful interfaces, and practical AI experiences. This desktop is a living scrapbook of the things I care about.\n\n> The desk is a mirror of the mind.' },
      { id: 'about-now', name: 'Currently.txt.md', type: 'markdown', createdAt: 1783987300000, content: '## Current focus\n\n- Designing human, useful AI products\n- Building a tiny corner of the internet with personality\n- Brewing better coffee, one cup at a time ☕' },
    ],
  },
  {
    id: 'folder-projects', name: 'Selected Work', type: 'folder-large', position: { x: 210, y: 70 }, createdAt: 1783987400000,
    children: [
      { id: 'project-ai-shoes', name: 'Baby Shoes AI.md', type: 'markdown', createdAt: 1783987500000, content: '# Baby Shoes AI\n\nA product exploration for making infant footwear discovery more visual, personal, and reassuring.\n\n**Role:** Product design + AI prototyping\n\n**Focus:** Trust, detail, and a softer shopping experience.' },
      { id: 'project-desk', name: 'deskof.me.md', type: 'markdown', createdAt: 1783987600000, content: '# deskof.me\n\nA personal portfolio disguised as a hand-drawn computer desktop.\n\nIt treats browsing as play: open folders, inspect files, discover small details, and leave with a feeling for the person behind the work.' },
      { id: 'project-link', name: 'View GitHub', type: 'link', url: 'https://github.com/wu66chen', createdAt: 1783987700000 },
    ],
  },
  {
    id: 'folder-notes', name: 'Notes & Experiments', type: 'folder', position: { x: 405, y: 88 }, createdAt: 1783987800000,
    children: [
      { id: 'note-manifesto', name: 'Tiny manifesto.md', type: 'markdown', createdAt: 1783987900000, content: '# Make it useful. Make it warm.\n\nGood interfaces should explain themselves, reward curiosity, and never make people feel small.' },
    ],
  },
  { id: 'readme', name: 'README.md', type: 'markdown', position: { x: 70, y: 280 }, createdAt: 1783988000000, content: '# Welcome to my desk 🖥️\n\n- Double-click a file to open it\n- Right-click for sharing and details\n- Open **Properties** on the desktop for the full system scrapbook\n\nEverything here is built with React, paper scraps, and a slightly unreasonable love for old computers.' },
  { id: 'github', name: 'GitHub', type: 'link', position: { x: 245, y: 290 }, url: 'https://github.com/wu66chen', createdAt: 1783988100000 },
  { id: 'contact', name: 'Say hello.md', type: 'markdown', position: { x: 410, y: 300 }, createdAt: 1783988200000, content: '# Say hello ✉️\n\nThe best conversations usually start with a specific idea, a strange problem, or a good cup of coffee.\n\nFind me through GitHub and tell me what you are making.' },
];

export const DEFAULT_DECORATIONS = [
  { id: 'deco-note', type: 'text', content: 'make useful things\nwith a little magic ✦', x: 620, y: 70, width: 230, height: 86, rotation: -3, opacity: 0.96, fontSize: 23, color: '#4B3F72', bgColor: '#FFF3A6', fontFamily: 'var(--font-note)', fontWeight: 'bold', zIndex: 25000 },
  { id: 'deco-sparkle', type: 'text', content: '✦ ･ﾟ: *✧･ﾟ:*', x: 760, y: 250, width: 210, height: 50, rotation: 6, opacity: 0.8, fontSize: 28, color: '#BF40BF', bgColor: 'transparent', fontFamily: 'var(--font-hand)', zIndex: 25000 },
];

export const DEFAULT_STATE = publishedDeskState || {
  config: DEFAULT_CONFIG,
  items: DEFAULT_ITEMS,
  decorations: DEFAULT_DECORATIONS,
};
