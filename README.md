# deskof.me

一个从零实现的 Y2K 手绘拼贴风个人桌面网站。访客像操作电脑一样浏览作品；管理员则可直接在桌面上编辑、保存并发布内容。

## 使用方式

- 双击桌面图标打开文件，右键可分享或查看属性。
- 桌面空白处右键可打开 GitHub 与四页“桌面属性”。
- 管理员入口不会出现在菜单中：3 秒内点击右下角时钟 5 次，或在网址后加 `?admin`。
- 窄屏与触屏设备会自动切换为只读手账列表。

## 本地运行

```bash
npm install
npm run auth:dev
npm run dev
npm run lint
npm run build
```

本地前端需要把 `.env.example` 复制为 `.env`，认证服务需要把 `worker/.dev.vars.example` 复制为 `worker/.dev.vars` 并更换开发密钥。

## 唯一管理员

管理员身份由 Cloudflare Worker 与 D1 数据库统一管理，不再保存在单个浏览器里。数据库只有一个固定主键为 `1` 的管理员记录；两个设备即使同时发起创建请求，也只有第一个写入会成功，后续请求一律返回 `409 ADMIN_ALREADY_EXISTS`，只能使用第一位管理员的密码登录。

浏览器只保存 30 天登录凭证。认证服务不可用时，管理员入口会安全停用，不会退回浏览器本地创建。旧版 `deskofme_admin_v21` 和 `deskofme_session_v21` 记录会自动失效。

## 发布

站点通过 `npm run deploy` 发布到 `gh-pages` 分支。

管理员也可在“站点设置 → 发布”中填写只对当前仓库有 Contents 读写权限的 Fine-grained token。发布时会同时更新源码分支的 `src/content.generated.js` 与线上分支的 `desk-data.json`，因此访客刷新页面即可看到新版本，不需要 workflow 权限。

## 全新源码结构

```text
src/
├── App.jsx               # 桌面状态与交互编排
├── Desktop.jsx           # 桌面、图标、装饰、移动端列表
├── Windows.jsx           # 窗口系统与六类内容查看器
├── Overlays.jsx          # 菜单、任务栏、认证、文件属性
├── Properties.jsx        # 桌面属性、屏保、设置与光标气泡
├── CustomCursor.jsx      # RAF 自定义光标
├── data.js               # 默认内容与配置矩阵
├── content.generated.js  # 发布后的公共桌面数据
├── lib.js                # 文件树与分享工具
├── useDesk.js            # 本地内容、全局认证客户端与 GitHub 发布
└── styles.css            # 完整视觉、动效与响应式系统

worker/
├── src/index.js          # 唯一管理员认证 API
├── db/schema.sql         # D1 数据结构
└── wrangler.jsonc        # Worker 与数据库绑定
```

产品规格见 [`docs/PRD v2.1.md`](docs/PRD%20v2.1.md)。
