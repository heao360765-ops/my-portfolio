# 雾汐镇 · 游戏实景网站

GitHub Pages 静态站点，所有页面可直接打开，无需运行时依赖、账号或服务端。

## 页面

- `index.html`：可跳过的验票入场、白昼/暮色大厅和游戏介绍。
- `world.html`：城镇、乡野、车站与室内。
- `residents.html`：游戏中五种可选形象及居民。
- `rules.html`：三派系、昼夜、有限交流与操作说明。
- `gallery.html`：无 UI 实景图，分类浏览及键盘大图。
- `credits.html`：素材、字体和参考来源。
- `studies.html`：保留原站的风草昼夜、建筑与八向角色记录，并沿用新的像素版式。

## 本地预览

在项目目录运行 `python -m http.server 4173 --bind 127.0.0.1`，打开 `http://127.0.0.1:4173/`。

## 编辑与验证

- HTML 源内容在 `tools/build_site.py`，执行 `python tools/build_site.py` 可重新输出八个静态页面。
- `styles.css` 为共享样式，`app.js` 管理交互；没有外部 CDN、第三方统计或自动播放媒体。
- `tools/check_site.cjs` 使用 Playwright + Edge 检查 375/768/1440 像素布局、入口、菜单、角色、影像大图及图片加载；可通过 `SITE_URL` 和 `SITE_ARTIFACTS` 设置地址与检查结果目录。
- `python tools/check_links.py` 检查页面内的本地页面、图像及脚本链接。
- 实景原 PNG 存在开发工作区的截图档案；`assets/screens` 内 WebP 是同内容格式压缩。转换脚本 `tools/prepare_screens.cjs` 需要 Sharp。
- 网站字体是游戏 Fusion Pixel 的字形子集，保留 `assets/fonts/OFL.txt` 及上游许可。增加文字时应重新生成字形子集，或加载游戏中的完整字体。

本次版本基于远程 `9824fec`，保留已有 `素材/`、`资产/` 和原始创作内容，不恢复此前去掉的姓名、学校、邮箱或个人账号链接。

下载页提供 Windows 64 位完整运行包（当前开发版），在 downloads/ 中附 SHA-256 校验文件。六人在线联机尚未完成。

- `download.html`：Windows 游戏下载、解压启动说明与运行要求。
- 发布包 `downloads/WuxiTown-v0.1.1-Windows-x64.zip` 可直接由 GitHub Pages 下载；游戏不依赖网页服务运行。

## 发布、更新与克隆

网站：https://heao360765-ops.github.io/my-portfolio/

仓库：https://github.com/heao360765-ops/my-portfolio

1. **发布**：本站已初始化并发布，不必再次 Initialize 或 Publish。仓库 Settings → Pages 查看发布来源；访问上方网址确认上线。
2. **更新**：先在 VS Code 源代码管理菜单选择 Pull，再修改并保存 → 文件旁“+”暂存 → 写明修改内容 → Commit → Sync Changes。仅在已确认跟踪 `origin/main`、没有其他待发布提交的工作副本中执行。Actions 中部署成功后，打开同一网址并用 Ctrl+F5 验证。
3. **克隆学习**：打开 https://github.com/gabrielecirulli/2048 ，先读 README 与 LICENSE.txt，再点 Code → HTTPS 复制地址。VS Code 按 Ctrl+Shift+P → Git: Clone → 选择学习目录 → Open。双击克隆目录中的 index.html 即可运行；方向键合并方块。该项目采用 MIT，允许商用，分发时需保留版权与许可声明。

页面可直接编辑预览，但生成器重新运行会覆盖 HTML。长期维护请同步修改 `tools/build_site.py`，发布包版本、文件名、大小与发布日期统一维护在 `downloads/release-info.json`，再生成并验证页面。图形界面的保存、暂存、提交、同步流程不变。

GitHub Pages 只能托管本站的静态展示及浏览器资源，不会自动把 Windows 游戏变成网页游戏，也不提供多人联机服务器。本站公开源代码不代表游戏画面和其他素材自动采用 MIT；第三方素材遵循各自许可。
