// Прозрение — общие скрипты сайта
(() => {
  // мобильное меню
  const menu = document.getElementById('menu');
  document.querySelectorAll('[data-open-menu]').forEach(b => b.addEventListener('click', () => menu.showModal()));
  menu?.querySelectorAll('[data-close-menu], nav a').forEach(el => el.addEventListener('click', () => menu.close()));

  // ---------- версия для слабовидящих: действует на всех страницах и запоминается ----------
  const A11Y_KEY = 'prozrenie-a11y', KEYS = ['fs', 'scheme', 'img', 'ls', 'lh', 'ff'];
  const A11Y_DEF = { on: true, fs: '2', scheme: 'bw', img: 'on', ls: '1', lh: '1', ff: '' };
  const html = document.documentElement;
  const loadA = () => { try { return JSON.parse(localStorage.getItem(A11Y_KEY) || 'null'); } catch (e) { return null; } };
  const saveA = st => { try { localStorage.setItem(A11Y_KEY, JSON.stringify(st)); } catch (e) {} };
  let A = loadA() || { on: false };
  const applyA = () => {
    if (A.on) { html.setAttribute('data-a11y', ''); KEYS.forEach(k => A[k] ? html.setAttribute('data-' + k, A[k]) : html.removeAttribute('data-' + k)); }
    else { html.removeAttribute('data-a11y'); KEYS.forEach(k => html.removeAttribute('data-' + k)); }
    document.querySelectorAll('[data-a11y-set]').forEach(b => b.setAttribute('aria-pressed', String(A.on && A[b.dataset.a11ySet] === b.dataset.val)));
    document.querySelectorAll('[data-a11y-toggle]').forEach(b => b.setAttribute('aria-pressed', String(!!A.on)));
  };
  document.querySelectorAll('[data-a11y-toggle]').forEach(b => b.addEventListener('click', () => {
    if (menu && menu.open) menu.close();
    if (!A.on) A = { ...A11Y_DEF, ...(A.saved || {}), on: true };
    saveA(A); applyA();
    scrollTo({ top: 0, behavior: 'auto' });
    document.querySelector('#a11yPanel button')?.focus();
  }));
  document.querySelectorAll('[data-a11y-set]').forEach(b => b.addEventListener('click', () => {
    A[b.dataset.a11ySet] = b.dataset.val; saveA(A); applyA();
  }));
  document.querySelector('[data-a11y-reset]')?.addEventListener('click', () => { A = { ...A11Y_DEF }; saveA(A); applyA(); });
  document.querySelector('[data-a11y-exit]')?.addEventListener('click', () => {
    const { on, saved, ...cur } = A; A = { on: false, saved: cur }; saveA(A); applyA();
    document.querySelector('[data-a11y-toggle]')?.focus();
  });
  applyA();

  // выпадающее меню «Услуги»: наведение на десктопе, клик и клавиатура везде
  document.querySelectorAll('.dd').forEach(dd => {
    const btn = dd.querySelector('.dd-btn');
    let t;
    const set = open => { dd.classList.toggle('open', open); btn.setAttribute('aria-expanded', open); };
    btn.addEventListener('click', () => set(!dd.classList.contains('open')));
    dd.addEventListener('mouseenter', () => { clearTimeout(t); set(true); });
    dd.addEventListener('mouseleave', () => { t = setTimeout(() => set(false), 150); });
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dd.classList.contains('open')) { set(false); btn.focus(); } });
    document.addEventListener('click', e => { if (!dd.contains(e.target)) set(false); });
  });

  // видеоотзывы: YouTube открывается во всплывающем окне
  const vm = document.getElementById('vmodal');
  const vf = vm?.querySelector('iframe');
  document.querySelectorAll('[data-video]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    vf.src = `https://www.youtube-nocookie.com/embed/${el.dataset.video}?autoplay=1&rel=0`;
    vm.showModal();
  }));
  vm?.addEventListener('close', () => { vf.src = ''; });
  vm?.addEventListener('click', e => { if (e.target === vm) vm.close(); });
  vm?.querySelector('[data-close-video]')?.addEventListener('click', () => vm.close());

  // ---------- форма записи ----------
  // имя: только буквы, пробел, дефис
  document.querySelectorAll('input[data-name]').forEach(inp => inp.addEventListener('input', () => {
    const v = inp.value.replace(/[^A-Za-zА-Яа-яЁё\s'-]/g, '').replace(/\s{2,}/g, ' ');
    if (v !== inp.value) inp.value = v;
  }));

  // телефон: только цифры, маска +7 (999) 123-45-67
  const fmtPhone = raw => {
    let d = raw.replace(/\D/g, '');
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    let out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  };
  document.querySelectorAll('input[data-phone]').forEach(inp => {
    const err = inp.parentElement.querySelector('.ferr');
    inp.addEventListener('input', () => {
      inp.value = fmtPhone(inp.value);
      inp.classList.remove('bad'); if (err) err.textContent = '';
    });
    inp.addEventListener('blur', () => { if (inp.value.replace(/\D/g, '').length <= 1) inp.value = ''; });
  });

  // демо-формы: проверяем номер и ничего не отправляем
  document.querySelectorAll('form[data-demo]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const ph = f.querySelector('input[data-phone]');
    if (ph && ph.value.replace(/\D/g, '').length !== 11) {
      ph.classList.add('bad');
      const err = ph.parentElement.querySelector('.ferr');
      if (err) err.textContent = 'Введите номер полностью: 10 цифр после +7';
      ph.focus();
      return;
    }
    f.classList.add('sent');
  }));

  // свои выпадающие списки вместо системных: наведение на компьютере, нажатие на телефоне, клавиатура
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  document.querySelectorAll('form select').forEach((sel, n) => {
    const wrap = document.createElement('div');
    wrap.className = 'dsel';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('dsel-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const lbl = sel.getAttribute('aria-labelledby');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'dsel-btn'; btn.id = 'dsel-btn-' + n;
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    if (lbl) btn.setAttribute('aria-labelledby', lbl + ' ' + btn.id);
    btn.innerHTML = '<span class="dsel-val"></span><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.5 6 8.5l4-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    const list = document.createElement('ul');
    list.className = 'dsel-list'; list.setAttribute('role', 'listbox'); list.id = 'dsel-list-' + n;
    if (lbl) list.setAttribute('aria-labelledby', lbl);
    btn.setAttribute('aria-controls', list.id);
    [...sel.options].forEach((o, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option'); li.id = list.id + '-' + i; li.dataset.value = o.value; li.textContent = o.textContent;
      list.appendChild(li);
    });
    wrap.append(btn, list);
    const items = [...list.children];
    let active = sel.selectedIndex, t;
    const sync = () => {
      btn.querySelector('.dsel-val').textContent = sel.options[sel.selectedIndex].textContent;
      items.forEach((li, i) => li.setAttribute('aria-selected', i === sel.selectedIndex));
    };
    const mark = i => { active = (i + items.length) % items.length; items.forEach((li, k) => li.classList.toggle('active', k === active)); btn.setAttribute('aria-activedescendant', items[active].id); };
    const open = () => { clearTimeout(t); wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); mark(sel.selectedIndex); };
    const close = () => { wrap.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant'); };
    const choose = i => { sel.selectedIndex = i; sel.dispatchEvent(new Event('change')); close(); btn.focus(); };
    btn.addEventListener('click', () => wrap.classList.contains('open') ? close() : open());
    if (finePointer) {
      wrap.addEventListener('mouseenter', open);
      wrap.addEventListener('mouseleave', () => { t = setTimeout(close, 180); });
    }
    items.forEach((li, i) => {
      li.addEventListener('click', () => choose(i));
      li.addEventListener('mousemove', () => mark(i));
    });
    btn.addEventListener('keydown', e => {
      const isOpen = wrap.classList.contains('open');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!isOpen) open(); else mark(active + (e.key === 'ArrowDown' ? 1 : -1)); }
      else if (e.key === 'Home' && isOpen) { e.preventDefault(); mark(0); }
      else if (e.key === 'End' && isOpen) { e.preventDefault(); mark(items.length - 1); }
      else if ((e.key === 'Enter' || e.key === ' ') && isOpen) { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape' && isOpen) { e.preventDefault(); close(); }
      else if (e.key === 'Tab') close();
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) close(); });
    sel.addEventListener('change', sync);
    sync();
  });

  // «Записаться» на услугу или к врачу: выбираем пункт в форме без перезагрузки
  const pick = (name, val) => {
    const sel = document.querySelector(`#book select[name="${name}"]`);
    if (sel && val && [...sel.options].some(o => o.value === val)) { sel.value = val; sel.dispatchEvent(new Event('change')); }
  };
  const q = new URLSearchParams(location.search);
  pick('service', q.get('service')); pick('doc', q.get('doc'));
  document.querySelectorAll('a[data-service], a[data-doc]').forEach(a => a.addEventListener('click', () => {
    pick('service', a.dataset.service); pick('doc', a.dataset.doc);
  }));

  // шаги: загораются по очереди, когда блок попадает на экран (один раз).
  // До старта остаётся обычное состояние (горит последний шаг).
  if (document.documentElement.classList.contains('anim')) {
    document.querySelectorAll('.steps').forEach(box => {
      const items = [...box.querySelectorAll('.step')];
      if (items.length < 2) return;
      let started = false;
      const run = () => {
        started = true;
        box.classList.add('seq');
        let i = 0;
        const next = () => {
          items.forEach((el, k) => el.classList.toggle('lit', k === i));
          if (i === items.length - 1) return;
          setTimeout(() => { items[i].classList.add('flow'); setTimeout(() => { i++; next(); }, 700); }, 650);
        };
        next();
      };
      const check = () => {
        if (started) return;
        const r = box.getBoundingClientRect();
        if (r.top < innerHeight * 0.7 && r.bottom > innerHeight * 0.2) { removeEventListener('scroll', check); run(); }
      };
      addEventListener('scroll', check, { passive: true });
      check();
    });
  }

  // FAQ: плавное раскрытие и сворачивание ответов
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.faq details').forEach(d => {
    const sum = d.querySelector('summary');
    let anim = null;
    sum.addEventListener('click', e => {
      if (calm) return;
      e.preventDefault();
      if (anim) { anim.cancel(); anim = null; }
      if (d.classList.contains('closing')) { d.classList.remove('closing'); return; }
      const from = d.offsetHeight;
      if (d.open) {
        d.classList.add('closing');
        anim = d.animate({ height: [from + 'px', sum.offsetHeight + 'px'] }, { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
        const done = () => { if (!d.classList.contains('closing')) return; d.open = false; d.classList.remove('closing'); anim = null; };
        anim.onfinish = done; setTimeout(done, 450);
      } else {
        d.open = true;
        d.classList.add('opening');
        const to = d.offsetHeight;
        setTimeout(() => d.classList.remove('opening'), 30);
        anim = d.animate({ height: [from + 'px', to + 'px'] }, { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  // шаги операции (.jr): подсвечиваются по очереди.
  // В одну колонку (телефон) горит шаг, до которого долистали; в несколько колонок — по очереди, один раз.
  if (html.classList.contains('anim')) {
    document.querySelectorAll('.jr').forEach(list => {
      const items = [...list.children];
      if (items.length < 2) return;
      const oneCol = () => Math.abs(items[0].getBoundingClientRect().left - items[1].getBoundingClientRect().left) < 2;
      const light = i => items.forEach((li, k) => li.classList.toggle('lit', k === i));
      let timed = false;
      const onScroll = () => {
        const r = list.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        if (!list.classList.contains('seq')) list.classList.add('seq');
        if (oneCol()) {
          const mid = innerHeight * 0.5;
          let best = 0, dist = Infinity;
          items.forEach((li, k) => { const b = li.getBoundingClientRect(); const d = Math.abs((b.top + b.bottom) / 2 - mid); if (d < dist) { dist = d; best = k; } });
          light(best);
        } else if (!timed && r.top < innerHeight * 0.7) {
          timed = true;
          let i = 0;
          const next = () => { light(i); if (i < items.length - 1) setTimeout(() => { i++; next(); }, 900); };
          next();
        }
      };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
      onScroll();
    });
  }

  // оверлей сетки: G — колонки, Shift+G — плюс базовая линия 8px, ?grid в адресе — сразу включено
  const root = document.documentElement, badge = document.querySelector('.grid-badge');
  const label = () => { if (badge) badge.textContent = `Сетка ${getComputedStyle(root).getPropertyValue('--cols').trim()} кол. · ${getComputedStyle(root).getPropertyValue('--gutter').trim()}${root.classList.contains('show-base') ? ' · база 8px' : ''} · G`; };
  if (new URLSearchParams(location.search).has('grid')) { root.classList.add('show-grid'); label(); }
  addEventListener('resize', label);
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() !== 'g' && e.key.toLowerCase() !== 'п' || e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input,textarea,select')) return;
    if (e.shiftKey) { root.classList.add('show-grid'); root.classList.toggle('show-base'); }
    else root.classList.toggle('show-grid');
    label();
  });
})();
