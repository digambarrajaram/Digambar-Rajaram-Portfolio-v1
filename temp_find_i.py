import pathlib
import re

root = pathlib.Path('src')
pattern = re.compile(r'</?i\b|createElement\(["\']i["\']\)', re.I)
found = False
for path in root.rglob('*'):
    if path.suffix in {'.ts', '.tsx', '.js', '.jsx', '.html'}:
        try:
            text = path.read_text(encoding='utf-8')
        except Exception:
            continue
        for number, line in enumerate(text.splitlines(), 1):
            if pattern.search(line):
                print(f'{path}:{number}:{line.strip()}')
                found = True
if not found:
    print('NO_MATCH')
