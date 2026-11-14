// Прозрение — общие скрипты сайта
(() => {
  // мобильное меню
  const menu = document.getElementById('menu');
  document.querySelectorAll('[data-open-menu]').forEach(b => b.addEventListener('click', () => menu.showModal()));
  menu?.querySelectorAll('[data-close-menu], nav a').forEach(el => el.addEventListener('click', () => menu.close()));

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

  // демо-формы: ничего не отправляют
  document.querySelectorAll('form[data-demo]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault(); f.classList.add('sent');
  }));

  // «Записаться» на услугу или к врачу: выбираем пункт в форме без перезагрузки
  const pick = (name, val) => {
    const sel = document.querySelector(`#book select[name="${name}"]`);
    if (sel && val) [...sel.options].forEach(o => { if (o.value === val) o.selected = true; });
  };
  const q = new URLSearchParams(location.search);
  pick('service', q.get('service')); pick('doc', q.get('doc'));
  document.querySelectorAll('a[data-service], a[data-doc]').forEach(a => a.addEventListener('click', () => {
    pick('service', a.dataset.service); pick('doc', a.dataset.doc);
  }));

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
