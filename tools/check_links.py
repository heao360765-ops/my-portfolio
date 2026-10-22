"""Validate local page/asset links without fetching third-party sites."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

root = Path(__file__).resolve().parents[1]
errors = []
checked = 0

class Links(HTMLParser):
    def handle_starttag(self, tag, attrs):
        global checked
        for name, value in attrs:
            if name not in ('href', 'src') or not value:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            path = (self.page.parent / unquote(url.path)).resolve()
            if path.is_dir():
                path = path / 'index.html'
            checked += 1
            if not path.is_file():
                errors.append(f'{self.page}: missing {url.path}')

for page in [*root.glob('*.html'), *root.glob('games/**/*.html'), *root.glob('play/*.html')]:
    parser = Links()
    parser.page = page
    parser.feed(page.read_text(encoding='utf-8'))

print(f'{checked} local page and image references; {len(errors)} missing')
for error in errors:
    print(error)
raise SystemExit(bool(errors))
