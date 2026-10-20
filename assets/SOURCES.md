# 网页素材来源

- `screens/town-day.webp`、`town-dusk.webp`、`countryside.webp`、`station.webp`：Survival25D 当前游戏场景关闭 UI 后的引擎截图，由本次游戏改动工作拍摄。
  - 2026-10-20 更新：六张主图（含 town-night、town-street）由游戏 10-17 精修后的 `scenes/living_world.tscn` 重拍（`tools/capture_town_website.gd`，隐藏 UI、固定机位、日 14:2 / 黄昏 18:2 / 夜 20:0 同机位），1280×720，WebP 质量 90。
- `screens/interior-*.webp`：同一项目中的酒食店、草药房、档案室；拍摄前隐藏 CanvasLayer 与 Label3D，保留真实场景和玩家。
- WebP 由原 PNG 进行格式压缩，未生成、拼接或补绘游戏里不存在的景物。
- `characters/*.png`：项目现有旅人及用户提供的 townfolk 角色头像，保留原始像素图；网页只做最近邻显示缩放。
- `fonts/fusion-pixel-subset.woff2`：游戏同款 Fusion Pixel 12px 简体中文字体的网页字形子集，来源为 TakWolf/fusion-pixel-font，许可随附于 `fonts/OFL.txt` 及 `fonts/LICENSES/`。
- `lantern.svg`：为网页绘制的像素几何灯笼标记。
- 原站的 `素材/`、`资产/` 文件保持不变，继续用于 `studies.html` 的早期场景、建筑和角色记录。
  - 2026-10-20 补充：`资产/3D/模型_GLB/` 加入游戏内 Blender 新建筑药房（Apothecary）、档案馆（Archive）、酒馆（Tavern）三栋 GLB；`资产/2D/角色帧图/` 增补西向行走帧，与游戏 `assets/characters/man/` 当前版本一致。

