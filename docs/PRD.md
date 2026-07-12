# deskof.me — 产品需求文档 (PRD)

> **目标**：构建一个模拟电脑桌面的个人作品网站。访客可以像操作真实桌面一样浏览内容，管理员可以自由编辑一切。
> **交付对象**：AI 编程 Agent（React + Vite）
> **版本**：v1.0

---

## 一、产品概述

### 1.1 一句话描述
一个 Y2K 手绘拼贴风格的网页版电脑桌面，用作个人作品集展示。

### 1.2 核心体验
- 访客打开网站，看到的不是传统网页，而是一个**电脑桌面**
- 桌面有图标、文件夹、任务栏，交互方式和真实桌面一致
- 管理员登录后进入编辑模式，可以像操作自己电脑桌面一样管理内容
- 所有视觉元素都可以被管理员替换成自定义图片

### 1.3 风格定位
**Y2K + 手绘蜡笔 + 纸质手工 + 可爱像素**的拼贴混合风格。
- 色彩：柔和粉彩 + 霓虹点缀（粉色、薄荷绿、淡紫、青蓝）
- 质感：Win98 窗口框架 + 胶带装饰 + 便签纸 + 手写体文字
- 氛围：怀旧、温暖、有个性，像一本数字剪贴簿

---

## 二、用户角色

| 角色 | 权限 |
|------|------|
| **管理员**（唯一） | 首次设置密码即成为管理员。可编辑桌面一切内容、发布更新 |
| **访客** | 无需登录，直接浏览桌面。只能查看和交互，不可修改 |

---

## 三、核心功能

### 3.1 管理员认证系统

**需求**：
- 管理员首次访问时设置密码（SHA-256 哈希存储于 localStorage）
- 同一浏览器记住登录状态（刷新不丢失）
- 其他浏览器/设备自动以访客身份进入，不弹登录窗口
- 管理员可从 Start 菜单手动登出或重新登录
- 访客可通过 Start 菜单 →「管理员登录」输入密码切换为管理员

**注意**：不要使用传统的注册/登录页面阻断访问。访客应该直接看到桌面。

### 3.2 桌面系统

**桌面背景**：
- 默认 CSS 渐变壁纸（柔和粉彩 + 网格纹理 + 装饰贴纸）
- 管理员可替换为任意图片 URL（支持 WebP/GIF 动图）
- 鼠标移动时有微妙的视差偏移效果（可配置开关和强度）

**桌面图标**：
- 图标可拖拽重新排列位置
- 单击选中（蓝色虚线高亮）
- 双击打开（文件夹→文件夹窗口，图片→图片查看器，等等）
- 图标支持两种尺寸：普通和大号（视觉差异明显）
- 图标 hover 时微放大，不抖动

### 3.3 文件类型系统

| 类型 | 描述 | 打开方式 | 默认图标 |
|------|------|----------|----------|
| 文件夹 (folder) | 包含子项目 | 文件夹窗口（网格布局） | 📁 |
| 大型文件夹 (folder-large) | 同文件夹，视觉更大 | 同上 | 📂 |
| 图片 (image) | 展示图片 | 图片查看器（缩放/平移） | 🖼️ |
| 视频 (video) | 播放视频 | 视频播放器（自适应窗口） | 🎬 |
| Markdown (markdown) | 富文本内容 | Markdown 渲染/编辑器 | 📝 |
| 链接 (link) | 外部超链接 | 链接卡片→新窗口打开 | 🔗 |

每种文件类型都应有：
- 自定义图标支持（管理员可替换为任意图片 URL，支持 WebP 动图）
- 管理员可重命名
- 管理员可删除

### 3.4 窗口系统

**通用要求**：
- 窗口可拖拽（标题栏）、可最小化、可关闭、可全屏
- 窗口有打开/关闭动画（弹性缩放）
- 多个窗口时，最新点击的窗口在最前（z-index 管理）
- 全屏按钮在标题栏右侧（最小化、全屏、关闭三按钮）
- 双击标题栏切换全屏
- 窗口 8 向自由缩放（拖拽边缘/角落）
- 标题栏有「💾保存默认」按钮：保存当前窗口尺寸为此类型文件的默认大小

**窗口默认尺寸**（按文件类型，自动居中，高度统一）：
- 文件夹：较宽，适合网格布局
- 图片：接近正方形
- 视频：16:9 横向
- Markdown：适合阅读的宽度
- 链接：明显更小的卡片尺寸

**窗口自定义**：
- 管理员可为每种文件类型的窗口设置背景装饰图
- 窗口标题栏、边框、按钮均可替换为自定义图片

### 3.5 任务栏
- 底部固定横条
- 左侧 Start 按钮（点击弹出开始菜单）
- 中间显示已打开窗口的任务按钮（点击切换/还原）
- 右侧显示管理员标识 + 时钟
- 任务栏背景、Start 图标等可替换

### 3.6 开始菜单
- Start 按钮弹出，Win98 风格
- 左侧竖排品牌标识
- 菜单项可由管理员动态配置（添加/删除/修改）
- 支持：编辑模式切换、站点设置、自定义超链接、管理员登录/登出
- 支持分隔线

### 3.7 右键菜单
- 桌面空白处右键：进入编辑模式 / 新建文件 / 添加装饰 / 站点设置
- 图标上右键：打开 / 重命名 / 更换图标 / 删除
- Win98 凸起边框风格
- 访客模式下仅显示可用选项

### 3.8 编辑模式
管理员登录后，通过 Start 菜单或桌面右键进入。

**编辑能力**：
- 桌面图标可自由拖拽（跟手移动，无延迟）
- 右键图标 → 重命名、更换图标、删除
- 右键桌面空白 → 新建各种文件
- 桌面文件拖到文件夹图标上 → 移入文件夹（绿色高亮提示）
- 文件夹内的文件可以拖出到桌面
- 文件夹内可以右键操作子文件

### 3.9 发布系统
管理员编辑的内容默认存储在 localStorage，仅自己可见。

**发布流程**：
- 管理员在站点设置中填入 GitHub Personal Access Token
- 点击「发布到 GitHub」→ 自动将当前所有内容（桌面项目、配置、装饰）commit 到 GitHub 仓库
- GitHub Pages 自动重建 → 约 1 分钟后所有访客可见
- 版本号机制：发布时递增版本，访客浏览器检测到新版本自动清空旧缓存

### 3.10 自由装饰系统
管理员可在编辑模式下在桌面上任意放置装饰元素。

**图片贴纸**：
- 支持 WebP/GIF/PNG/JPG
- 可拖拽移动、四角缩放、旋转
- 可删除
- 层级高于任务栏

**文字装饰**：
- 可设置文字内容、字体、颜色、背景色、字号、加粗
- 同样支持拖拽、缩放、旋转、删除
- Hover 时出现编辑控件（删除✕、编辑✎、旋转↻、缩放手柄）

### 3.11 自定义光标系统
- 全局隐藏系统光标，使用自定义光标
- 根据鼠标下方元素类型自动切换光标样式
- 至少支持以下状态：默认（桌面空白）、指针（按钮/图标）、文本（输入框）、拖拽中、移动中、缩放中
- 每种状态默认使用 emoji 图标
- 管理员可为每种状态设置自定义光标图片（PNG/WebP，32×32 推荐）
- 可配置光标热点（Hotspot）

---

## 四、交互细节

### 4.1 桌面交互
- 整个网站禁用浏览器原生右键菜单
- 桌面图标单击选中，双击打开
- 图标拖拽时跟手移动（不吸附网格），松手后保存位置
- 图标拖到文件夹上时，文件夹出现绿色高亮边框

### 4.2 窗口交互
- 窗口首次打开时居中显示
- 最小化后可通过任务栏按钮还原
- 关闭窗口有缩小淡出动画
- 窗口边缘 hover 时显示缩放手柄（半透明蓝色）

### 4.3 图片查看器
- 图片默认充满窗口（object-fit: contain），随窗口缩放自适应
- 滚轮缩放（10% - 500%）
- 左键拖拽平移

### 4.4 视频播放器
- 视频等比缩放充满窗口
- 使用浏览器原生 video 控件

### 4.5 动画
- 应包含但不限于：窗口弹性弹出、图标 stagger 入场、墨水飞溅点击粒子
- 动画风格应为 Y2K/Win98 感觉而非现代 material design

---

## 五、技术约束

- **框架**：React + Vite
- **部署**：GitHub Pages（完全免费）
- **存储**：localStorage（管理员数据持久化）+ GitHub 源文件（发布后的公共数据）
- **无后端**：纯前端 SPA
- **图片格式**：全面支持 WebP（动图）、PNG（透明底）、GIF、JPG
- **性能**：光标移动流畅（RAF 节流）、大组件 React.memo

---

## 六、数据结构参考

### 6.1 桌面项目
```typescript
interface DesktopItem {
  id: string;
  name: string;
  type: 'folder' | 'folder-large' | 'image' | 'video' | 'markdown' | 'link' | 'file';
  icon: string | null;          // 自定义图标 URL
  position: { x: number; y: number };
  size: 'normal' | 'large';
  content?: string;              // markdown 内容
  url?: string;                  // image/video/link URL
  children?: DesktopItem[];      // folder 的子项
}
```

### 6.2 站点配置
```typescript
interface SiteConfig {
  wallpaper: string | null;
  desktopName: string;
  iconSize: number;
  parallaxEnabled: boolean;
  parallaxStrength: number;
  cursorDefault: string | null;
  cursorPointer: string | null;
  cursorText: string | null;
  // ... 更多光标状态
  cursorHotspotX: number;
  cursorHotspotY: number;
  customAssets: Record<string, string | null>;  // 全站可替换图片
  windowDefaults: Record<string, { w: number; h: number }>;
  windowDecorations: Record<string, string | null>;
  decorations: Decoration[];
  startMenuItems: StartMenuItem[];
  githubToken: string | null;
  dataVersion: number;
}
```

### 6.3 装饰元素
```typescript
interface Decoration {
  id: string;
  type: 'image' | 'text';
  content: string;
  x: number; y: number;
  width?: number; height?: number;
  rotation?: number;
  zIndex?: number;
  opacity?: number;
  // 文字专属
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bgColor?: string;
  fontWeight?: string;
}
```

### 6.4 开始菜单项
```typescript
interface StartMenuItem {
  id: string;
  label: string;
  icon: string;
  action: 'toggleEdit' | 'openSettings' | 'logout' | 'showLogin' | 'link';
  url?: string;
  adminOnly?: boolean;
  type?: 'separator';
  // 双态支持（如编辑模式切换）
  editLabel?: string;
  editIcon?: string;
  guestLabel?: string;
  guestIcon?: string;
}
```

---

## 七、部署

### 7.1 GitHub Pages
- 仓库名 `deskof.me`（或任意）
- 构建输出目录 `dist/`
- 部署到 `gh-pages` 分支
- Vite 的 `base` 配置为 `/<repo-name>/`

### 7.2 发布机制
- 管理员在设置中填入 GitHub Token（`repo` 权限）
- 发布时调用 GitHub REST API：
  - `PUT /repos/:owner/:repo/contents/src/config/desktopItems.js`
  - `PUT /repos/:owner/:repo/contents/src/config/siteConfig.js`
- 提交后 GitHub Pages 自动重建

---

## 八、风格指南

### 8.1 字体
- **像素字体**：标题栏、按钮、时钟。推荐 Press Start 2P 或类似
- **手写体**：文件名、内容、菜单。推荐 Gaegu 或类似
- **便签体**：装饰性文字。推荐 Nothing You Could Do 或类似

### 8.2 配色
- Win98 灰：`#C0C0C0`（窗口背景、任务栏）
- 标题栏蓝：渐变 `#000080 → #1084D0`
- Y2K 粉：`#FF69B4`（强调色）
- Y2K 青：`#00FFFF`（高亮）
- Y2K 橙：`#FF8C00`（编辑模式标识）

### 8.3 窗口样式
- 3D 凸起边框：亮边（白/浅灰）在左上，暗边（深灰/黑）在右下
- 按钮按下时边框反转（凹陷效果）
- 标题栏文字白色、像素字体

---

## 九、用户流程

### 9.1 首次访问（管理员）
1. 打开网站 → 直接看到桌面（空白/默认内容）
2. 点击 Start →「管理员登录」→「首次设置密码」
3. 设置密码 → 自动进入管理状态
4. Start →「进入编辑模式」→ 开始编辑

### 9.2 访客访问
1. 打开网站 → 直接看到桌面（已发布的内容）
2. 可以双击浏览所有内容
3. 无法编辑

### 9.3 日常编辑
1. 管理员登录 → 进入编辑模式
2. 添加/修改桌面内容（实时保存到 localStorage）
3. 满意后 → 设置面板 → 发布 → 访客可见

---

## 十、验收标准

- [ ] 访客打开即见桌面，无登录阻断
- [ ] 所有文件类型可双击打开对应窗口
- [ ] 窗口可拖拽、缩放、全屏、最小化、关闭
- [ ] 管理员可添加/删除/重命名桌面项目
- [ ] 管理员可拖拽文件移入/移出文件夹
- [ ] 所有可替换的视觉元素在设置面板中都有对应选项
- [ ] 发布后其他浏览器可看到更新
- [ ] 光标根据下方元素类型自动切换
- [ ] 装饰贴纸/文字可出现在任务栏上方
- [ ] 零 JS 错误（生产构建）
- [ ] 在 Chrome/Firefox/Safari 桌面端正常工作

---

> **给 Agent 的提醒**：这是一份需求文档，不是技术实现指南。你可以自由选择组件库、状态管理方案、CSS 方案。核心是让最终产品符合上述体验描述，而非精确复制某个实现。发挥你的创造力！
