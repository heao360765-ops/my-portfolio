# 个人作品集与雾汐镇游戏官网

个人作品集：https://heao360765-ops.github.io/my-portfolio/

雾汐镇游戏官网（比赛投递使用此链接）：https://heao360765-ops.github.io/my-portfolio/games/wuxitown/

根网址展示个人作品集，点击“游戏开发”中的雾汐镇进入独立游戏官网。比赛链接直接展示雾汐镇，不需要先经过作品集。游戏站内导航和试玩页返回链接均留在游戏栏目。

网页试玩：https://heao360765-ops.github.io/my-portfolio/play/index.html

Windows 下载：https://heao360765-ops.github.io/my-portfolio/games/wuxitown/download.html

这是可以直接提交和发布的静态网站。首页 `index.html` 在根目录，页面、样式、图片和已导出的网页游戏均已准备好。发布不需要运行 Python、npm 或 Godot，不需要填写构建命令。GitHub Pages 设置为 **Deploy from a branch → main → /(root)**。

## 现有网站日常更新 全程按钮

1. 在 VS Code 选择 File → Open Folder，打开 `D:\AI-Work\my-portfolio`。左下角分支应显示 `main`。
2. 在开始编辑前，打开源代码管理面板（Ctrl+Shift+G），菜单“…” → Pull，取回其他设备的更新。
3. 作品集编辑根目录 `index.html` 与 `portfolio.css`；游戏官网编辑 `games/wuxitown/` 内对应 HTML，共享样式和交互仍在根目录 `styles.css`、`app.js`。按 Ctrl+S 保存，展示页面可双击相应 `index.html` 预览。
4. 在源代码管理面板检查修改，文件旁点“+”暂存，写清修改说明，点 Commit。
5. 点 Sync Changes。等仓库 Actions 中 **pages build and deployment** 成功，在原网站按 Ctrl+F5 验证。

不用重复 Initialize Repository 或 Publish to GitHub。新版 Windows 包和网页游戏都已包含在此次发布中。

## 换电脑或发布一个新网站

**继续维护现有网站**：打开仓库 https://github.com/heao360765-ops/my-portfolio → Code → HTTPS 复制地址。在 VS Code 按 Ctrl+Shift+P → Git: Clone → 粘贴地址 → 选择空的目标目录 → Open。克隆后的 `main` 已关联远程仓库，以后按上面的更新流程操作。

**用发布包新建网站**：把网站发布 ZIP 完整解压到新的英文目录，确保打开的这一层直接能看到 `index.html`，而不是只看到另一个文件夹。VS Code 打开该目录 → 源代码管理 → Initialize Repository → 确认分支名称为 main（若不是，菜单“…” → Branch → Rename Branch）→ 文件旁“+” → 填说明 → Commit → Publish to GitHub → 选 public repository。浏览器登录授权后，到新仓库 Settings → Pages → Deploy from a branch → main → /(root) → Save。等待 Actions 部署成功后打开生成的网址。

新建网站时再执行 Initialize 和 Publish；不要对现有已连接的项目重复执行。

**文件大小注意**：完整游戏含约 83 MiB 的 Windows ZIP、66 MiB 的 PCK 和38 MiB 的 WASM，均小于 Git 的 100 MiB 单文件上限，但超过 GitHub 网页 Upload files 的25 MiB 单文件上限。因此完整网站必须使用手册的 VS Code Publish / Sync 上传，不要把发布 ZIP 整个拖到 GitHub 网页，也不要把 ZIP 当作网站首页。解压后的内容才是网站文件。

## 克隆开源游戏学习

练习项目：https://github.com/gabrielecirulli/2048

先读 README 和 LICENSE.txt → Code → HTTPS 复制地址 → VS Code Ctrl+Shift+P → Git: Clone → 选择学习目录 → Open → 双击 index.html。方向键移动，New Game 重新开始。该项目采用 MIT，允许商用，分发时需保留版权和许可声明。克隆他人的仓库不会获得推送权限；要发布自己的修改，先 Fork 到自己账号。

## 页面与资源

### 作品集入场序幕

根首页通过 `intro.js` 和 `intro.css` 播放约 12 秒的浅色工业风入场动画：点阵接触 → 访问者确认 → 档案接入 → 线框展开 → 欢迎进入。一组持续变形的线框连接各镜头，使用不等速运动和短暂停顿，不再展示步骤导航、模块清单、成排 READY 或逐项讲解。全程浅灰，欢迎字样为直立窄体。

声音使用新生成的 XiaoxiaoNeural 合成女声，只保留“访问者已确认”“欢迎进入”两句；保留自然句尾与停顿，加入轻微过渡音和收尾音。播报并非真人或角色原声，未复制参考视频音轨。新音轨为 `assets/audio/intro/entry-voice-zh-v5.mp3`，旧版本音轨保留供历史版本使用。浏览器允许时自动发声，否则右上角“开启播报”可接入当前进度，支持关闭、暂停、跳过。显示的进度是入场演出，不代表真实设备自检或文件传输。

首页在解析页面时先显示浅色启动底屏，再挂载完整动画，避免先闪出作品集；动画脚本加载失败或超时后直接恢复页面。首次进入作品集时播放，当前标签页会话中播完或跳过后不再重复；页脚“重播入场序幕”可再次观看。顶部支持暂停、继续和跳过，Esc 可退出。系统设置减少动态效果时默认直接显示作品集，手动重播则短暂显示静态欢迎画面并自动退出。带栏目锚点的链接直接定位内容。

比赛专用 `games/wuxitown/` 不加载此动画。镜头时长在 `intro.js` 的 `scenes` 中定义，构图在 `intro.css` 中编辑。`tools/check_intro.cjs` 验证自动换幕和进入首页、无对白与入口选项、会话记忆、暂停、退出、重播、手机布局、减少动态效果和比赛入口隔离。

- `index.html`、`portfolio.css`：个人作品集首页，游戏开发与 Mono-01 硬件探索。
- `games/wuxitown/index.html`：原游戏官网首页，内容与视觉保持一致。
- `games/wuxitown/download.html`：v0.1.2 Windows 开发版、解压说明和 SHA-256 校验。
- `play/`：已导出的单线程网页试玩。需通过 HTTP 或 HTTPS 打开；不能双击本地文件运行。推荐电脑、键盘与支持 WebGL2 的浏览器，首次资源约104 MiB。
- `games/wuxitown/` 内的 `world.html`、`residents.html`、`rules.html`、`gallery.html`：世界、居民、玩法与实景影像。
- `games/wuxitown/` 内的 `studies.html`、`credits.html`：制作记录与素材来源。
- 根目录原有七个游戏内页：保留为兼容跳转，旧链接的查询参数与锚点会带到对应新页面；不要再编辑这些跳转页的正文。
- `assets/`、`素材/`、`资产/`：保留网站引用的画面、角色、字体及创作素材。
- `downloads/`：Windows 游戏、版本信息与校验文件。

手机可以浏览展示页面；Windows 包不能在手机运行。网页试玩尚未针对手机触屏操作适配。六人在线联机仍未完成，GitHub Pages 不提供联机服务器。

## 开发维护说明

日常文字、图片和样式更新直接编辑静态文件即可，无需生成步骤。`tools/build_site.py` 只生成 `games/wuxitown/` 下的八个游戏页面及根目录兼容跳转，不会覆盖个人作品集首页。使用该工具时须先同步自己的游戏页面改动，并维护 `downloads/release-info.json`。它不是发布流程的前置步骤。

`tools/check_links.py` 检查作品集、游戏官网与试玩页的本地引用；`tools/check_site.cjs` 使用 Playwright 检查游戏官网桌面和手机布局及交互，默认地址为 `http://127.0.0.1:4173/games/wuxitown/`；`tools/check_portfolio.cjs` 检查个人作品集、入口隔离、旧链接兼容和动态资源。游戏字体使用 Fusion Pixel，第三方许可保留在 `assets/fonts/OFL.txt`。2048 的 MIT 许可不适用于本网站的游戏、图片和其他素材；各素材遵循原有授权。

官方说明：[Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [GitHub 上传文件限制](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
