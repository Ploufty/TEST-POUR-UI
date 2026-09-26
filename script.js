/* Apps1D76 — script partagé : rendu des outils, menu, recherche, préférences, animations, hors ligne */
(() => {
  'use strict';
  const d = document, root = d.documentElement;
  const $ = s => d.querySelector(s), $$ = (s, r = d) => [...r.querySelectorAll(s)];
  const mq = q => matchMedia(q);
  const motionOn = () => root.dataset.motion !== 'reduce';
  const fine = mq('(hover: hover) and (pointer: fine)').matches;
  const raf = fn => { let q = 0; return e => { if (!q) q = requestAnimationFrame(() => { q = 0; fn(e); }); }; };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ================= 1. PRÉFÉRENCES D'AFFICHAGE ================= */
  const KEY = 'apps1d-prefs', DEF = { theme: 'auto', text: '100', motion: 'auto', contrast: false };
  const VALEURS = { theme: ['auto', 'light', 'dark'], text: ['100', '115', '130'], motion: ['auto', 'on', 'reduce'] };
  const nettoyer = p => ({ // on ne garde que des valeurs connues (stockage local modifiable par l'utilisateur)
    theme: VALEURS.theme.includes(p?.theme) ? p.theme : DEF.theme,
    text: VALEURS.text.includes(String(p?.text)) ? String(p.text) : DEF.text,
    motion: VALEURS.motion.includes(p?.motion) ? p.motion : DEF.motion,
    contrast: p?.contrast === true
  });
  let prefs;
  try { prefs = nettoyer(JSON.parse(localStorage.getItem(KEY))); } catch { prefs = { ...DEF }; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* navigation privée */ } };
  const darkMq = mq('(prefers-color-scheme: dark)'), motionMq = mq('(prefers-reduced-motion: reduce)');
  const themeBtn = $('#theme-toggle'), metaTheme = $('meta[name="theme-color"]');

  function apply() {
    const dark = prefs.theme === 'dark' || (prefs.theme === 'auto' && darkMq.matches);
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.motion = prefs.motion === 'reduce' || (prefs.motion === 'auto' && motionMq.matches) ? 'reduce' : 'full';
    root.dataset.contrast = prefs.contrast ? 'high' : 'normal';
    root.style.setProperty('--text-scale', prefs.text / 100);
    themeBtn.setAttribute('aria-label', dark ? 'Activer le mode clair' : 'Activer le mode sombre');
    metaTheme.content = dark ? '#11111b' : '#000091';
    anim.refresh();
  }
  darkMq.addEventListener?.('change', () => prefs.theme === 'auto' && apply());
  motionMq.addEventListener?.('change', () => prefs.motion === 'auto' && apply());

  themeBtn.addEventListener('click', () => {
    prefs.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    save(); apply(); syncForm();
  });

  /* Panneau */
  const dlg = $('#settings'), form = dlg.querySelector('form');
  const syncForm = () => {
    ['theme', 'text', 'motion'].forEach(n => { const r = form.querySelector(`[name="${n}"][value="${prefs[n]}"]`); if (r) r.checked = true; });
    form.contrast.checked = !!prefs.contrast;
  };
  $('#settings-open').addEventListener('click', () => { syncForm(); dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', ''); });
  form.addEventListener('change', e => {
    const t = e.target;
    prefs = nettoyer({ ...prefs, [t.name]: t.type === 'checkbox' ? t.checked : t.value });
    save(); apply();
  });
  $('#reset').addEventListener('click', () => { prefs = { ...DEF }; save(); apply(); syncForm(); });
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // clic sur le fond = fermer

  /* ================= 2. RENDU DES OUTILS (window.APPS1D, défini dans outils.js) ================= */
  const data = window.APPS1D?.categories || [];
  const box = $('#categories'), nav = $('#catnav');
  box.innerHTML = data.map(c => `
    <section class="category cat-${esc(c.couleur)}" id="${esc(c.id)}">
      <div class="cat-head"><span class="cat-icon" aria-hidden="true">${esc(c.icone)}</span><div><h2>${esc(c.titre)}</h2><p>${esc(c.description)}</p></div><span class="cat-line"></span></div>
      <ul class="grid">${c.outils.map((o, i) => `
        <li style="--i:${i}"><a class="card" href="${esc(o.lien)}"><i aria-hidden="true">${esc(o.icone)}</i><h3>${esc(o.titre)}</h3><p>${esc(o.description)}</p><span>Ouvrir</span></a></li>`).join('')}
      </ul>
    </section>`).join('') || '<p class="empty">Aucun outil à afficher.</p>';
  nav.innerHTML = data.map(c => {
    const n = c.outils.length;
    return `<li><a href="#${esc(c.id)}" class="cat-${esc(c.couleur)}"><span class="long">${esc(c.titre)}</span><span class="short">${esc(c.court)}</span><span class="count" aria-label="${n} outil${n > 1 ? 's' : ''}">${n}</span></a></li>`;
  }).join('');

  const sections = $$('.category'), links = $$('a', nav);
  const linkOf = id => links.find(a => a.hash === '#' + id);

  /* Catégorie active dans le menu */
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.setAttribute('aria-current', a.hash === '#' + e.target.id));
    const a = linkOf(e.target.id);
    nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: motionOn() ? 'smooth' : 'auto' });
  }), { rootMargin: '-35% 0px -60% 0px' });

  /* Apparition au défilement */
  const reveal = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); reveal.unobserve(e.target); }
  }), { threshold: .1 });
  sections.forEach(s => { spy.observe(s); reveal.observe(s); });

  /* ================= 3. RECHERCHE (insensible aux accents) ================= */
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const items = $$('.grid > li').map(li => ({ li, sec: li.closest('.category'), txt: norm(li.textContent + ' ' + li.closest('.category').querySelector('h2').textContent) }));
  const empty = $('#empty');
  $('#q').addEventListener('input', e => {
    const q = norm(e.target.value.trim()), counts = new Map(sections.map(s => [s, 0]));
    items.forEach(it => { const ok = !q || it.txt.includes(q); it.li.hidden = !ok; if (ok) counts.set(it.sec, counts.get(it.sec) + 1); });
    counts.forEach((n, s) => { s.hidden = !n; s.classList.add('in'); linkOf(s.id).parentElement.hidden = !n; });
    empty.hidden = [...counts.values()].some(Boolean);
  });

  /* ================= 4. DÉFILEMENT : progression, fond, hero, menu collé ================= */
  const hero = $('.hero'), bar = $('.progress'), bg = $('.bg'), heroContent = $('.hero-content'), catnav = nav.parentElement;
  new IntersectionObserver(([e]) => {
    catnav.classList.toggle('stuck', !e.isIntersecting);
    if (e.isIntersecting && scrollY < hero.offsetTop + hero.offsetHeight / 2) { // retour en haut : menu neutre
      links.forEach(a => a.setAttribute('aria-current', 'false'));
      nav.scrollTo({ left: 0, behavior: motionOn() ? 'smooth' : 'auto' });
    }
  }, { threshold: [0, .5] }).observe(hero);
  const onScroll = raf(() => {
    if (!motionOn()) return;
    const y = scrollY, max = Math.max(1, root.scrollHeight - innerHeight), p = Math.min(1, y / max);
    bar.style.setProperty('--p', p);
    bg.style.setProperty('--s', p.toFixed(4));
    heroContent.style.setProperty('--h', Math.min(1, y / hero.offsetHeight).toFixed(3));
  });
  addEventListener('scroll', onScroll, { passive: true });

  /* ================= 5. SOURIS : cartes 3D + parallaxe ================= */
  if (fine) {
    d.addEventListener('pointermove', raf(e => {
      if (!motionOn()) return;
      bg.style.setProperty('--px', (e.clientX / innerWidth - .5).toFixed(3));
      bg.style.setProperty('--py', (e.clientY / innerHeight - .5).toFixed(3));
      const card = e.target.closest?.('.card');
      if (!card) return;
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.cssText = `--mx:${x * 100}%;--my:${y * 100}%;--ry:${(x - .5) * 4}deg;--rx:${(.5 - y) * 4}deg`;
    }), { passive: true });
    box.addEventListener('pointerout', e => {
      const card = e.target.closest('.card');
      if (card && !card.contains(e.relatedTarget)) requestAnimationFrame(() => { card.style.cssText = ''; });
    });
  }

  /* ================= 6. CONSTELLATION DU HERO ================= */
  const anim = (() => {
    const cv = hero.querySelector('canvas'), ctx = cv.getContext('2d');
    const LINK = 120, LINK2 = LINK * LINK;
    let W = 0, H = 0, pts = [], mx = -1e4, my = -1e4, visible = true, running = false, ca = '', cb = '', timer;
    const init = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = Array.from({ length: Math.round(Math.min(80, W * H / 12000)) }, (_, i) => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        r: Math.random() * 1.8 + 1, b: i % 5 === 0
      }));
    };
    const frame = () => {
      if (!(running = visible && motionOn() && !d.hidden)) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 22500) { const k = Math.sqrt(d2) || 1; p.x += dx / k * .8; p.y += dy / k * .8; }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], c = a.b ? cb : ca;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            ctx.strokeStyle = `rgba(${c},${(1 - Math.sqrt(d2) / LINK) * .2})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${c},.4)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    const start = () => { if (!running && visible && motionOn() && !d.hidden) { running = true; requestAnimationFrame(frame); } };
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mx = my = -1e4; });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(hero);
    d.addEventListener('visibilitychange', start);
    addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(init, 200); });
    init();
    return {
      refresh() { // appelé à chaque changement de préférences
        const cs = getComputedStyle(root);
        ca = cs.getPropertyValue('--rgb-a').trim(); cb = cs.getPropertyValue('--rgb-b').trim();
        if (motionOn()) { onScroll(); start(); }
        else { bg.style.removeProperty('--s'); heroContent.style.removeProperty('--h'); }
      }
    };
  })();

  apply();

  /* ================= 7. APPLICATION INSTALLABLE & HORS LIGNE ================= */
  const install = $('#install'), installBtn = $('#install-btn');
  const standalone = mq('(display-mode: standalone)').matches || navigator.standalone;
  let deferred;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; install.hidden = installBtn.hidden = false; });
  installBtn.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt(); await deferred.userChoice; deferred = null; install.hidden = true;
  });
  addEventListener('appinstalled', () => { install.hidden = true; });
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
  if (ios && !standalone) { // Safari ne propose pas de bouton d'installation : on explique la marche à suivre
    install.hidden = false; $('#ios-hint').hidden = false;
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
