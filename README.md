# 🖥️ deskof.me

**Y2K 风格个人桌面作品网站** — 把你的作品集放进一个可爱的电脑桌面里。

![screenshot](docs/screenshot.png)

## ✨ 功能

- 🖥️ **完整的桌面隐喻** — 图标、文件夹、窗口、任务栏、开始菜单
- 🎨 **Y2K 手绘拼贴风格** — 像素艺术 + 手绘 + 纸质手工质感
- 🔐 **管理员系统** — 首次访问设密码 = 唯一管理员，访客只读
- ✏️ **在线编辑** — 管理员可直接在网站上添加/删除/重命名/换图标
- 📂 **多种文件类型** — 文件夹（普通/大型）、图片、视频、Markdown、链接
- 🪄 **趣味交互** — 像素抖动、墨水飞溅粒子、壁纸视差、弹性动画
- 🎯 **高度自定义** — 壁纸、图标、光标、桌面名称全部可配置
- 📱 **零后端** — 纯前端 SPA，所有数据存 localStorage

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 预览构建结果
npm run preview
```

## 📦 免费部署 (GitHub Pages)

### 方式一：GitHub Actions（推荐，自动部署）

1. 在 GitHub 创建仓库 `deskof.me`
2. 推送到 `main` 分支
3. 在仓库 Settings → Pages → Source 选择 "GitHub Actions"
4. 每次推送自动部署

### 方式二：手动部署

```bash
npm run deploy
```

## 🔧 管理员使用

1. **首次访问**：设置管理员密码
2. **登录后**：点击 Start → 进入编辑模式，或桌面右键 → 进入编辑模式
3. **编辑模式**：
   - 拖拽图标重新排列
   - 右键图标 → 重命名 / 更换图标 / 删除
   - 桌面右键 → 新建各种文件
   - Start → 站点设置 → 自定义壁纸、图标等
4. **访客访问**：无需登录，只能浏览，不能修改

## 🖼️ 自定义图像

用 `docs/image-prompts.md` 中的提示词（适用于 Gemini-3-Pro-Image / GPT-Image-2）生成自定义图标和壁纸，然后在设置面板中替换。

## 🛠️ 技术栈

- React 19 + Vite 8
- CSS3 (动画、渐变、自定义属性)
- localStorage (数据持久化)
- GitHub Pages (免费托管)

## 📁 项目结构

```
src/
├── components/
│   ├── auth/          # 登录/注册界面
│   ├── common/        # 光标、右键菜单、设置面板
│   ├── desktop/       # 桌面、图标
│   ├── taskbar/       # 任务栏、开始菜单
│   └── window/        # 窗口系统、内容查看器
├── config/            # 数据模型、默认配置
├── hooks/             # 认证、拖拽、窗口管理、重命名
├── styles/            # 主题 CSS
└── utils/             # 工具函数
```

## 📄 License

MIT
