#!/usr/bin/env python3
"""Собирает страницы: src/*.html + partials/ -> *.html в этой папке.
В исходниках: первая строка — <!-- title | description | active -->,
дальше разметка с {{HEADER}}, {{BOOKING:Заголовок}}, {{FOOTER}}."""
import re, pathlib
root = pathlib.Path(__file__).parent
import hashlib
VER = hashlib.md5(b''.join(f.read_bytes() for f in sorted((root / 'assets').glob('*.*')))).hexdigest()[:8]
P = {n: (root / 'partials' / f'{n}.html').read_text() for n in ('head', 'header', 'booking', 'footer')}
for src in sorted((root / 'src').glob('*.html')):
    text = src.read_text()
    meta, body = text.split('\n', 1)
    parts = [x.strip() for x in meta.strip()[4:-3].split('|')] + ['', '']
    title, desc, active, body_cls, extra_css = parts[:5]
    group = 'uslugi' if active in ('lkz', 'katarakta', 'detskaya', 'diagnostika') else active
    header = re.sub(r'\{\{CUR:(\w+)\}\}', lambda m: ' aria-current="page"' if m.group(1) in (active, group) else '', P['header'])
    extra = f'<link rel="stylesheet" href="assets/{extra_css}?v={VER}">\n' if extra_css else ''
    out = P['head'].replace('{{TITLE}}', title).replace('{{DESC}}', desc).replace('{{BODY}}', body_cls).replace('<!--EXTRA-->', extra)
    body = body.replace('{{HEADER}}', header).replace('{{FOOTER}}', P['footer'])
    body = re.sub(r'\{\{BOOKING:(.+?)\}\}', lambda m: P['booking'].replace('{{BOOK_TITLE}}', m.group(1)), body)
    out, body = out.replace('assets/site.css', f'assets/site.css?v={VER}'), body.replace('assets/site.js', f'assets/site.js?v={VER}')
    (root / src.name).write_text(out + body)
    print('built', src.name)
