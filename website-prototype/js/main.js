import { AR, DYN } from './i18n.js';

window.__jtBooted = true; // tells the inline guard in index.html that this module started

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const html = document.documentElement;
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
const hasLibs = !!(gsap && ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePtr = matchMedia('(hover: hover) and (pointer: fine)').matches;
const safe = (fn) => { try { return fn(); } catch (e) { return null; } };
history.scrollRestoration = 'manual';

let lang = html.lang === 'ar' ? 'ar' : 'en';
let scene = null;
let lenis = null;
let loaderOwns = true; // while true, the loader (not the scroll) drives the journey rig

const MSG = {
  loading: { en: 'Loading', ar: 'جارٍ التحميل' },
  ready: { en: 'Page ready', ar: 'الصفحة جاهزة' }
};

/* ============================================================ loader / page lock helpers
   Whatever goes wrong (a library blocked, a module error, a slow device), releasePage() puts the page back in a usable
   state: loader gone, scroll unlocked, content reachable by keyboard. */
const loaderEl = () => document.getElementById('loader');
const setInert = (on) => ['#top', '#nav'].forEach((sel) => { const e = $(sel); if (e) e.inert = on; });
function releasePage() {
  const l = loaderEl(); if (l) l.remove();
  document.body.classList.remove('is-loading');
  setInert(false);
  if (lenis) lenis.start();
}
const announce = (key) => { const a = $('#ldAnnounce'); if (a) a.textContent = MSG[key][lang]; };

/* Smooth scrolling that runs on the main thread. Native wheel scrolling is composited ahead of JavaScript, so a WebGL
   canvas that follows the page would trail the DOM by a few frames and look like it is "flying". With Lenis the scroll
   position is set in our own ticker, and the 3D is rendered in the same tick, so they stay locked together. */
function initSmoothScroll() {
  gsap.ticker.lagSmoothing(0);
  if (reduce || typeof window.Lenis === 'undefined') return;
  lenis = new window.Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  lenis.stop(); // unlocked when the entrance is over
}
const unlockScroll = () => { if (lenis) lenis.start(); };
const ui = { finish: 'gloss', cw: 0, shape: 'round', season: 'olive' };
const SEASON = {
  olive: { shape: 'oil', theme: 'olive', finish: 'gloss' },
  eid: { shape: 'round', theme: 'eid', finish: 'emboss' },
  cheese: { shape: 'cheese', theme: 'cheese', finish: 'matte' }
};

/* ============================================================ i18n */
$$('[data-i18n]').forEach((el) => { el.dataset.en = el.innerHTML; });
$$('[data-i18n-aria]').forEach((el) => { el.dataset.enAria = el.getAttribute('aria-label') || ''; });

function setMeta(sel, value) { const m = $(sel); if (m) m.setAttribute('content', value); }
function applyLang(l) {
  $$('[data-i18n]').forEach((el) => {
    const k = el.dataset.i18n;
    el.innerHTML = l === 'ar' && AR[k] !== undefined ? AR[k] : el.dataset.en;
  });
  $$('[data-i18n-aria]').forEach((el) => {
    const k = el.dataset.i18nAria;
    el.setAttribute('aria-label', l === 'ar' && AR[k] !== undefined ? AR[k] : el.dataset.enAria);
  });
  document.title = DYN.title[l];
  setMeta('meta[name="description"]', DYN.desc[l]);
  setMeta('meta[property="og:title"]', DYN.title[l]);
  setMeta('meta[property="og:description"]', DYN.ogDesc[l]);
  setMeta('meta[property="og:locale"]', l === 'ar' ? 'ar_JO' : 'en_US');
  setMeta('meta[property="og:locale:alternate"]', l === 'ar' ? 'en_US' : 'ar_JO');
  renderDynamic();
}
function renderDynamic() {
  $('#finishDesc').textContent = DYN.finish[ui.finish][lang];
  const sh = DYN.shapes[ui.shape];
  $('#shapeName').textContent = sh.n[lang]; $('#shapeDim').textContent = sh.d[lang]; $('#shapeNote').textContent = sh.p[lang];
  $('#seasonDesc').textContent = DYN.season[ui.season][lang];
  $$('[data-marquee]').forEach((row) => {
    const items = DYN.marquee[lang];
    const one = items.map((t) => `<span>${t}</span><i></i>`).join('');
    row.innerHTML = one + one + one + one;
  });
  const cur = $('.cursor span'); if (cur) cur.textContent = DYN.cursor[lang];
}

/* ============================================================ text splitting + reveals */
const splitTriggers = [];
function split(el) {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.innerHTML = text.split(/\s+/).map((w) => `<span class="w" aria-hidden="true"><span class="wi">${w}</span></span>`).join(' ');
  return $$('.wi', el);
}
function initSplits() {
  splitTriggers.splice(0).forEach((t) => t.kill());
  $$('[data-split]').forEach((el) => {
    const words = split(el);
    const inHero = !!el.closest('#hero');
    if (el.dataset.done === '1' && !inHero) { gsap.set(words, { yPercent: 0, rotateX: 0, opacity: 1 }); return; }
    gsap.set(words, { yPercent: 115, rotateX: -75, opacity: 0, transformOrigin: '50% 100%' });
    if (inHero) return; // played by playHero()
    splitTriggers.push(ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => { el.dataset.done = '1'; gsap.to(words, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.1, ease: 'power4.out', stagger: reduce ? 0 : 0.07 }); }
    }));
  });
}
function initReveals() {
  const els = $$('[data-reveal]');
  els.forEach((el) => {
    if (el.closest('#hero')) { gsap.set(el, { opacity: 0, y: 30 }); return; }
    gsap.set(el, { opacity: 0, y: 40 });
  });
  ScrollTrigger.batch(els.filter((e) => !e.closest('#hero')), {
    start: 'top 92%', once: true,
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09, overwrite: true })
  });
}
let heroPlayed = false;
function playHero() {
  heroPlayed = true;
  const words = $$('#hero [data-split] .wi');
  gsap.to(words, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.2, ease: 'power4.out', stagger: 0.12 });
  gsap.to($$('#hero [data-reveal], #hero .eyebrow'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.5 });
  gsap.fromTo('#hero .scrollcue', { opacity: 0 }, { opacity: 1, delay: 1.6, duration: 1 });
}

/* ============================================================ theme + language switching */
function setTheme(next, ev) {
  const apply = () => { html.dataset.theme = next; safe(() => localStorage.setItem('jt-theme', next)); if (scene) scene.setTheme(next); };
  if (document.startViewTransition && !reduce) {
    const x = ev ? ev.clientX : innerWidth - 60, y = ev ? ev.clientY : 40;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      html.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 850, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' });
    }).catch(() => {});
  } else apply();
}
let langBusy = false;
function switchLangNow(next) {
  lang = next; html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  safe(() => localStorage.setItem('jt-lang', lang));
  applyLang(lang);
}
function setLang(next) {
  if (next === lang || langBusy) return;
  if (!hasLibs) { switchLangNow(next); return; }
  langBusy = true;
  const bars = $$('#curtain i');
  gsap.set('#curtain', { display: 'flex' });
  const tl = gsap.timeline({ onComplete: () => { gsap.set('#curtain', { display: 'none' }); langBusy = false; } });
  tl.fromTo(bars, { scaleY: 0, transformOrigin: (i) => (i % 2 ? '50% 0%' : '50% 100%') }, { scaleY: 1, duration: 0.5, ease: 'power3.inOut', stagger: 0.06 })
    .add(() => {
      switchLangNow(next); initSplits(); ScrollTrigger.refresh();
      $$('#hero [data-split]').forEach((el) => { el.dataset.done = ''; });
      window.scrollTo(0, window.scrollY);
    })
    .to(bars, { scaleY: 0, duration: 0.55, ease: 'power3.inOut', stagger: 0.06, transformOrigin: (i) => (i % 2 ? '50% 100%' : '50% 0%') }, '+=0.05')
    .add(() => { if (window.scrollY < innerHeight) playHero(); else $$('#hero [data-split] .wi').forEach((w) => gsap.set(w, { yPercent: 0, rotateX: 0, opacity: 1 })); }, '-=0.5');
}

/* ============================================================ pointer: cursor, magnetic, tilt, drag */
function initPointer() {
  const cur = $('.cursor');
  if (!finePtr) { cur.style.display = 'none'; }
  const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' }), yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
  let seen = false; // the custom cursor (and hiding the native one) only starts once a real mouse has moved
  window.addEventListener('pointermove', (e) => {
    if (finePtr && !seen && e.pointerType === 'mouse') {
      seen = true; gsap.set(cur, { x: e.clientX, y: e.clientY });
      html.classList.add('has-cursor'); cur.classList.remove('is-hidden');
    }
    xTo(e.clientX); yTo(e.clientY);
    if (scene) scene.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const t = e.target.closest ? e.target : null;
    const link = t && t.closest('a,button,select,input,textarea,.tab,.chip,.sw');
    const drag = t && t.closest('[data-cursor="drag"]');
    cur.classList.toggle('is-link', !!link);
    cur.classList.toggle('is-drag', !!drag && !link);
  }, { passive: true });
  html.addEventListener('mouseleave', () => { if (seen) cur.classList.add('is-hidden'); });
  html.addEventListener('mouseenter', () => { if (seen) cur.classList.remove('is-hidden'); });

  if (finePtr && !reduce) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - (r.left + r.width / 2)) * 0.28, y: (e.clientY - (r.top + r.height / 2)) * 0.4, duration: 0.4, ease: 'power3.out' });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }));
    });
    $$('.tilt').forEach((c) => {
      c.addEventListener('pointermove', (e) => {
        const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', px * 100 + '%'); c.style.setProperty('--my', py * 100 + '%');
        c.style.setProperty('--ry', (px - 0.5) * 9 + 'deg'); c.style.setProperty('--rx', (0.5 - py) * 9 + 'deg');
      });
      c.addEventListener('pointerleave', () => { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); });
    });
  }
  // drag-to-spin on stages
  $$('.stage[data-cursor="drag"]').forEach((st) => {
    let down = false, lx = 0;
    st.addEventListener('pointerdown', (e) => { down = true; lx = e.clientX; st.setPointerCapture(e.pointerId); });
    st.addEventListener('pointermove', (e) => { if (!down) return; scene && scene.spin(st, e.clientX - lx); lx = e.clientX; });
    const up = () => { down = false; };
    st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
  });
}

/* ============================================================ section UIs */
// chips and swatches are toggle buttons: aria-pressed mirrors the visual state
function pick(selector, btn) {
  $$(selector).forEach((x) => { const on = x === btn; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
}
function selectSeason(b, focus) {
  ui.season = b.dataset.season;
  $$('[data-season]').forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
  $('#seasonDesc').setAttribute('aria-labelledby', b.id);
  if (focus) b.focus();
  $('#seasons').dataset.season = ui.season;
  renderDynamic();
  scene && scene.instance('seasons').apply({ ...SEASON[ui.season], cw: 0 });
}
function initControls() {
  $$('[data-finish]').forEach((b) => b.addEventListener('click', () => {
    ui.finish = b.dataset.finish;
    pick('[data-finish]', b);
    $('#finishDesc').textContent = DYN.finish[ui.finish][lang];
    scene && scene.instance('finish').apply({ finish: ui.finish });
  }));
  $$('[data-cw]').forEach((b) => b.addEventListener('click', () => {
    ui.cw = +b.dataset.cw;
    pick('[data-cw]', b);
    scene && scene.instance('finish').apply({ cw: ui.cw, theme: 'brand' });
  }));
  $$('[data-shape]').forEach((b) => b.addEventListener('click', () => {
    ui.shape = b.dataset.shape;
    pick('[data-shape]', b);
    renderDynamic();
    scene && scene.instance('shapes').apply({ shape: ui.shape, theme: 'brand', cw: 0, finish: 'gloss' });
  }));
  // season tabs: click, or arrow keys / Home / End (roving tabindex)
  const tabs = $$('[data-season]');
  tabs.forEach((b) => {
    b.addEventListener('click', () => selectSeason(b, false));
    b.addEventListener('keydown', (e) => {
      const rtl = html.dir === 'rtl';
      const next = e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      const prev = e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
      let i = tabs.indexOf(b);
      if (next) i = (i + 1) % tabs.length; else if (prev) i = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') i = 0; else if (e.key === 'End') i = tabs.length - 1; else return;
      e.preventDefault(); selectSeason(tabs[i], true);
    });
  });
  // "in season now": autumn badge only Sep–Dec
  const m = new Date().getMonth();
  $('.now').style.display = m >= 8 && m <= 11 ? '' : 'none';
  $('#seasons').dataset.season = ui.season;

  $('#reviewBtn').addEventListener('click', () => document.body.classList.toggle('review'));
  $('#yr').textContent = new Date().getFullYear();
  const y = $('#years'); y.dataset.target = new Date().getFullYear() - 1998; y.textContent = y.dataset.target;
}

/* ============================================================ nav: menu, anchors, theme + language buttons */
const burger = $('#burger'), menu = $('#menu');
function setMenu(open, { focus = true } = {}) {
  menu.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  menu.inert = !open; // closed menu: its links leave the tab order and the accessibility tree
  const main = $('#top'); if (main) main.inert = open;
  document.body.classList.toggle('menu-open', open);
  if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  if (open && focus) { const first = $('a', menu); if (first) first.focus({ preventScroll: true }); }
  else if (!open && focus && menu.contains(document.activeElement)) burger.focus({ preventScroll: true });
}
function bindNav() {
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false, { focus: false }); burger.focus({ preventScroll: true }); }
  });
  matchMedia('(min-width: 1041px)').addEventListener('change', (e) => { if (e.matches && menu.classList.contains('is-open')) setMenu(false, { focus: false }); });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault();
    const wasOpen = menu.classList.contains('is-open');
    if (wasOpen) setMenu(false, { focus: false });
    if (lenis) lenis.scrollTo(t, { duration: 1.6, offset: 0 });
    else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: reduce ? 'auto' : 'smooth' });
    t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); // keyboard users continue from the section they jumped to
  }));
  $('#themeBtn').addEventListener('click', (e) => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark', e));
  $('#langBtn').addEventListener('click', () => setLang(lang === 'ar' ? 'en' : 'ar'));
}
function initNav() {
  const nav = $('#nav'); let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max', onUpdate: (s) => {
      const y = s.scroll();
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 240 && !menu.classList.contains('is-open') && !nav.contains(document.activeElement));
      lastY = y;
    }
  });
  bindNav();
}

/* ============================================================ journey (pinned + scrubbed) */
function initJourney() {
  const stepEls = $$('.step'), fill = $('#railFill');
  let target = 0, shown = 0, activeIdx = -1;
  const idxFor = (p) => (p < 0.17 ? 0 : p < 0.38 ? 1 : p < 0.62 ? 2 : p < 0.86 ? 3 : 4);
  ScrollTrigger.create({
    trigger: '#journey', start: 'top top',
    end: () => '+=' + Math.round(window.innerHeight * 4.2), // function + invalidateOnRefresh: recomputed on resize / rotation
    invalidateOnRefresh: true, pin: '.journey__pin', anticipatePin: 1,
    onUpdate: (s) => { target = s.progress; }
  });
  window.__jtJourney = (p) => { target = shown = p; };
  gsap.ticker.add(() => {
    shown += (target - shown) * 0.12;
    if (Math.abs(target - shown) < 0.0004) shown = target;
    if (scene && !loaderOwns) scene.setJourney(shown);
    fill.style.transform = `scaleX(${shown})`;
    const i = idxFor(shown);
    if (i !== activeIdx) { activeIdx = i; stepEls.forEach((s, k) => s.classList.toggle('is-active', k === i)); }
  });
}

/* ============================================================ misc scroll effects */
function initScrollFx() {
  ScrollTrigger.create({
    onUpdate: (s) => {
      const sk = gsap.utils.clamp(-10, 10, s.getVelocity() / -260);
      gsap.to('.marquee__track', { skewX: sk, duration: 0.5, ease: 'power3.out', overwrite: true });
    }
  });
  const y = $('#years'), tgt = +y.dataset.target;
  ScrollTrigger.create({
    trigger: y, start: 'top 85%', once: true,
    onEnter: () => { const o = { v: 0 }; gsap.to(o, { v: tgt, duration: 1.8, ease: 'power3.out', onUpdate: () => { y.textContent = Math.round(o.v); } }); }
  });
}

/* ============================================================ entrance: a tinplate sheet is printed, rolled and sealed */
const LD_STEPS = {
  en: ['Design & plates', 'Print & coat', 'Cut & form', 'Seal & ship'],
  ar: ['التصميم والألواح', 'الطباعة والطلاء', 'القص والتشكيل', 'الإحكام والشحن']
};
// The entrance uses the real 3D tin pipeline: the loading % scrubs the same sheet -> print -> roll -> lid sequence as the
// Journey section, rendered by the same metal materials, inside the loader's own stage.
const jpOf = (v) => Math.min(v, 100) * 0.0068; // 0-100 % -> journey progress 0-0.68 (sheet, print, roll, lid)
function initLoader() {
  const numEl = $('#loaderNum'), stepEl = $('#ldStep');
  let stepIdx = -1;
  function set(p) {
    if (!numEl) return;
    numEl.textContent = Math.round(p);
    const idx = p < 12 ? 0 : p < 40 ? 1 : p < 78 ? 2 : 3;
    if (idx !== stepIdx) { stepIdx = idx; stepEl.textContent = LD_STEPS[lang][idx]; }
    if (scene && loaderOwns) scene.setJourney(jpOf(p));
  }
  set(0);
  return { set, ready() { const w = $('.ld__wait'); if (w) w.remove(); } };
}

/* ============================================================ boot */
const hasStage = () => $$('.stage').length > 0;
async function loadScene(onStep) {
  const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
  if (!safe(() => document.createElement('canvas').getContext('webgl2'))) { html.classList.add('no-gl'); await fonts; return null; }
  try {
    await fonts; onStep(20);
    const mod = await import('./scene.js'); onStep(30);
    scene = mod.createScene($('#gl'));
    scene.refreshStages(); // gives every .stage its own canvas and its own tin
    scene.setTheme(loaderOwns ? 'dark' : html.dataset.theme, true); // the entrance is always shown in the moody dark lighting
    window.addEventListener('resize', () => { scene.resize(); });
    gsap.ticker.add(() => scene.tick()); // last in the tick: after scroll and journey updates
    window.__jt = { scene, ui };
    onStep(38);
    await Promise.race([scene.warm(), new Promise((r) => setTimeout(r, 8000))]); onStep(45);
    return scene;
  } catch (e) {
    console.warn('3D unavailable', e);
    html.classList.add('no-gl'); scene = null;
    return null;
  }
}

async function boot() {
  const skipIntro = html.classList.contains('skip-intro') || !loaderEl(); // ?skip, or the entrance was already seen in this session
  const ld = initLoader(); window.__jtLoader = ld;
  const prog = { v: 0 };
  const setNum = () => ld.set(prog.v);
  let skipped = false, finished = false, revealed = false, introDone = false, entranceTl = null, entranceResolve = null, watchdog = 0;
  let skipResolve; const skippedP = new Promise((r) => { skipResolve = r; });

  const maybeIntro = () => { if (revealed && scene && !introDone && !reduce) { introDone = true; scene.intro(); } };
  function finishLoading() {
    if (finished) return; finished = true; clearTimeout(watchdog);
    gsap.killTweensOf(prog);
    loaderOwns = false;
    if (scene) { scene.setJourney(0); scene.setTheme(html.dataset.theme); }
    releasePage();
    if (scene && scene.pruneStages) scene.pruneStages(); // the loader's stage is gone: drop it from the render list
    window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true });
    unlockScroll();
    ScrollTrigger.refresh();
    if (!heroPlayed) playHero();
    announce('ready');
    revealed = true; maybeIntro();
  }
  // Skip button / Escape / watchdog: fade the loader out quickly, then finish
  function skipNow() {
    if (skipped || finished) return; skipped = true;
    if (entranceTl) entranceTl.kill();
    if (entranceResolve) entranceResolve();
    skipResolve();
    const l = loaderEl();
    if (l) gsap.to(l, { opacity: 0, duration: reduce ? 0.01 : 0.35, ease: 'power1.out', onComplete: finishLoading });
    else finishLoading();
  }

  if (skipIntro) loaderOwns = false;
  else {
    setInert(true); // the loader covers the page: keep keyboard focus off the hidden content
    announce('loading');
    const sk = $('#ldSkip');
    if (sk) { sk.addEventListener('click', skipNow); sk.focus({ preventScroll: true }); }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && loaderEl()) skipNow(); });
    // never leave the visitor stuck behind the loader, whatever happens to the 3D or the network
    watchdog = setTimeout(() => { console.warn('entrance watchdog: finishing early'); skipNow(); }, 14000);
  }

  initSmoothScroll();
  if (lang === 'ar') applyLang('ar'); else renderDynamic();
  html.dataset.theme = html.dataset.theme || 'light';

  initSplits(); initReveals(); initPointer(); initControls(); initNav(); initScrollFx(); initJourney();
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  // the % is driven by real milestones (fonts, 3D module, scene, shaders); the creep just keeps it moving in between
  const towards = (v, d = 0.5, ease = 'power1.out') => gsap.to(prog, { v: Math.max(prog.v, v), duration: d, ease, overwrite: true, onUpdate: setNum });
  if (!skipIntro) towards(30, 3);
  const sceneP = loadScene((v) => { if (!skipIntro && !finished) towards(v, 0.5); }).then((sc) => { if (sc) maybeIntro(); return sc; });

  if (skipIntro) { // returning visitor / ?skip: no entrance, the page is usable immediately
    ld.ready(); finishLoading();
    return;
  }

  await Promise.race([sceneP, skippedP]);
  if (skipped || finished) return;
  clearTimeout(watchdog); // assets are ready: the remaining entrance is a short, fixed-length animation
  ld.ready();
  safe(() => sessionStorage.setItem('jt-intro', '1')); // once per session
  const loader = loaderEl(), iris = { r: 0 };
  await new Promise((res) => {
    entranceResolve = res;
    // the sheet is printed, rolled into a tin and sealed while the % runs from where it is to 100
    const tl = entranceTl = gsap.timeline({ onComplete: res });
    tl.to(prog, { v: 100, duration: reduce ? 0.4 : 2.2, ease: 'power1.inOut', onUpdate: setNum })
      .add(() => { if (scene) scene.setTheme(html.dataset.theme); })
      .to({}, { duration: reduce ? 0 : 0.5 }) // hold on the sealed tin
      .to('.ld__meta, .ld__skip', { opacity: 0, y: 24, duration: 0.35, ease: 'power2.in' })
      .to('.ld__stage', { scale: 3.2, opacity: 0, duration: reduce ? 0.2 : 0.95, ease: 'power3.in' }, '<')
      .add(() => { if (!heroPlayed) playHero(); }, '-=0.1') // the headline writes itself under the opening iris
      .to(iris, { r: 112, duration: reduce ? 0.2 : 1.1, ease: 'power3.inOut', onUpdate: () => { if (loader) loader.style.setProperty('--r', iris.r + '%'); } }, '-=0.5');
  });
  if (skipped) return;
  finishLoading();
}

/* ============================================================ without GSAP / ScrollTrigger: a plain, working page */
function failOpen() {
  console.warn('[jt] animation libraries are missing: running the plain page');
  html.classList.add('no-gl');
  releasePage();
  if (lang === 'ar') applyLang('ar'); else renderDynamic();
  html.dataset.theme = html.dataset.theme || 'light';
  safe(initControls); safe(bindNav);
}

if (!hasLibs) failOpen();
else boot().catch((e) => {
  console.error('boot failed', e);
  releasePage(); // a bug in the entrance must never leave the loader up or the page scroll-locked
});
