#!/usr/bin/env python3
"""Собирает страницы из src/*.html + partials/ в две версии сайта:

  sait/*.html          — основная версия «Точность»
  sait/strogo/*.html   — строгая версия: антиква в заголовках, прямые углы (assets/serif.css)

В исходниках первая строка — <!-- title | description | active | body-class | extra.css -->,
дальше разметка с {{HEADER}}, {{BOOKING:Заголовок}}, {{FOOTER}}.
Тексты общие: правка в src/ попадает в обе версии."""
import re, pathlib, hashlib

root = pathlib.Path(__file__).parent
VER = hashlib.md5(b''.join(f.read_bytes() for f in sorted((root / 'assets').glob('*.*')))).hexdigest()[:8]
P = {n: (root / 'partials' / f'{n}.html').read_text() for n in ('head', 'header', 'booking', 'footer')}

# (папка, доп. класс body, доп. стили, префикс к assets/, плашка-переключатель)
VARIANTS = [
    ('.', '', [], '', None),
    ('strogo', 'serif', ['serif.css'], '../', '<div class="variant-switch">Строгая версия<a href="../{page}">Обычная версия</a></div>\n'),
]


def render(src, body_extra, css_extra, prefix, switch):
    meta, body = src.read_text().split('\n', 1)
    parts = [x.strip() for x in meta.strip()[4:-3].split('|')] + ['', '']
    title, desc, active, body_cls, extra_css = parts[:5]
    group = 'uslugi' if active in ('lkz', 'katarakta', 'detskaya', 'diagnostika') else active
    header = re.sub(r'\{\{CUR:(\w+)\}\}', lambda m: ' aria-current="page"' if m.group(1) in (active, group) else '', P['header'])
    css = ([extra_css] if extra_css else []) + css_extra
    extra = ''.join(f'<link rel="stylesheet" href="assets/{c}?v={VER}">\n' for c in css)
    cls = ' '.join(x for x in (body_cls, body_extra) if x)
    out = P['head'].replace('{{TITLE}}', title).replace('{{DESC}}', desc).replace('{{BODY}}', cls).replace('<!--EXTRA-->', extra)
    body = body.replace('{{HEADER}}', header)
    body = body.replace('{{FOOTER}}', (switch.format(page=src.name) if switch else '') + P['footer'])
    body = re.sub(r'\{\{BOOKING:(.+?)\}\}', lambda m: P['booking'].replace('{{BOOK_TITLE}}', m.group(1)), body)
    html = (out + body).replace('assets/site.css"', f'assets/site.css?v={VER}"').replace('assets/site.js"', f'assets/site.js?v={VER}"')
    if 'id="book"' not in html:  # на странице нет формы записи — ведём к форме на главной
        html = html.replace('href="#book"', 'href="index.html#book"')
    if prefix:
        html = re.sub(r'(href|src)="assets/', rf'\1="{prefix}assets/', html)
    return html


for folder, body_extra, css_extra, prefix, switch in VARIANTS:
    out_dir = root / folder
    out_dir.mkdir(exist_ok=True)
    for src in sorted((root / 'src').glob('*.html')):
        (out_dir / src.name).write_text(render(src, body_extra, css_extra, prefix, switch))
    print(f'built {folder}: {len(list((root / "src").glob("*.html")))} pages')
