"""Usage: python tools/subset_font.py /path/to/original/fusion-pixel.otf

Requires fonttools and brotli only for rebuilding; browsers use the shipped WOFF2.
"""
import sys
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]) if len(sys.argv) > 1 else root/'assets/fonts/fusion-pixel.otf'
text = ''.join(file.read_text(encoding='utf-8') for file in [*root.glob('*.html'), *root.glob('*.js'), *root.glob('*.css')])
options = subset.Options()
options.flavor = 'woff2'
font = subset.load_font(str(source), options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=text)
subsetter.subset(font)
output = root/'assets/fonts/fusion-pixel-subset.woff2'
subset.save_font(font, str(output), options)
print(f'{output.name}: {output.stat().st_size} bytes')
