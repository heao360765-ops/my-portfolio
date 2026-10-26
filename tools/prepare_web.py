"""Publish the current Godot Web export without oversized Git objects."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
dest = root / 'play'
dest.mkdir(exist_ok=True)
for file in source.iterdir():
    if file.is_file() and file.suffix != '.pck':
        shutil.copy2(file, dest / file.name)
pack = (source / 'index.pck').read_bytes()
parts = []
for i, offset in enumerate(range(0, len(pack), 90 * 1024 * 1024)):
    data = pack[offset:offset + 90 * 1024 * 1024]
    name = f'game-v0.4.0.part{i + 1}.bin'
    (dest / name).write_bytes(data)
    parts.append({'name': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
manifest = {'version': '0.4.0', 'bytes': len(pack), 'sha256': hashlib.sha256(pack).hexdigest(), 'parts': parts}
(dest / 'pack-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
assert b''.join((dest / p['name']).read_bytes() for p in parts) == pack
old_pack = dest / 'index.pck'
if old_pack.exists():
    old_pack.unlink()
page = (dest / 'index.html').read_text(encoding='utf-8')
page = page.replace('<title>Survival25D</title>', '<title>网页试玩 v0.4.0 · 雾汐镇</title>')
page = page.replace('<body>', '''<body>
<a href="../games/wuxitown/" style="position:fixed;left:12px;top:12px;z-index:30;padding:8px 12px;color:#f1e9d3;background:#14211de8;border:1px solid #8d8463;text-decoration:none;font:14px sans-serif">← 返回游戏官网</a>
<span style="position:fixed;right:12px;top:12px;z-index:30;color:#f1e9d3;background:#14211de8;padding:8px;font:12px sans-serif">v0.4.0 · 电脑键盘试玩</span>''')
loader = '''
async function startPackedGame(options) {
    const response = await fetch('pack-manifest.json');
    if (!response.ok) throw new Error('资源清单加载失败，请刷新重试。');
    const manifest = await response.json();
    const pack = new Uint8Array(manifest.bytes);
    let offset = 0;
    for (const part of manifest.parts) {
        const result = await fetch(part.name);
        if (!result.ok) throw new Error('游戏资源下载失败，请刷新重试。');
        const reader = result.body.getReader();
        let received = 0;
        while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            if (received + value.byteLength > part.bytes) throw new Error('游戏资源长度不匹配。');
            pack.set(value, offset + received);
            received += value.byteLength;
            options.onProgress(offset + received, manifest.bytes);
        }
        if (received !== part.bytes) throw new Error('游戏资源未下载完整，请刷新重试。');
        offset += received;
    }
    await engine.init(GODOT_CONFIG.executable);
    await engine.preloadFile(pack.buffer, 'index.pck');
    return engine.start({...options, args: ['--main-pack', 'index.pck', ...GODOT_CONFIG.args]});
}
'''
page = page.replace('engine.startGame({', 'startPackedGame({')
page = page.replace("const engine = new Engine(GODOT_CONFIG);", "const engine = new Engine(GODOT_CONFIG);\n" + loader)
assert 'async function startPackedGame' in page
page = page.replace("document.title = 'Survival25D'", "document.title = '网页试玩 v0.4.0 · 雾汐镇'")
(dest / 'index.html').write_text(page, encoding='utf-8')
print(json.dumps({'web_bytes': len(pack), 'parts': len(parts), 'sha256': manifest['sha256']}))
