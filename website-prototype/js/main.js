import { AR, DYN } from './i18n.js';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const html = document.documentElement;
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePtr = matchMedia('(hover: hover) and (pointer: fine)').matches;
const safe = (fn) => { try { return fn(); } catch (e) { return null; } };
history.scrollRestoration = 'manual';

let lang = html.lang === 'ar' ? 'ar' : 'en';
let scene = null;
let lenis = null;

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

function applyLang(l) {
  $$('[data-i18n]').forEach((el) => {
    const k = el.dataset.i18n;
    el.innerHTML = l === 'ar' && AR[k] !== undefined ? AR[k] : el.dataset.en;
  });
  document.title = DYN.title[l];
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
function playHero() {
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
function setLang(next) {
  if (next === lang || langBusy) return;
  langBusy = true;
  const bars = $$('#curtain i');
  gsap.set('#curtain', { display: 'flex' });
  const tl = gsap.timeline({ onComplete: () => { gsap.set('#curtain', { display: 'none' }); langBusy = false; } });
  tl.fromTo(bars, { scaleY: 0, transformOrigin: (i) => (i % 2 ? '50% 0%' : '50% 100%') }, { scaleY: 1, duration: 0.5, ease: 'power3.inOut', stagger: 0.06 })
    .add(() => {
      lang = next; html.lang = lang; html.dir = lang === 'ar' ? 'rtl' : 'ltr';
      safe(() => localStorage.setItem('jt-lang', lang));
      applyLang(lang); initSplits(); ScrollTrigger.refresh();
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
  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX); yTo(e.clientY);
    if (scene) scene.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    const t = e.target.closest ? e.target : null;
    const link = t && t.closest('a,button,select,input,textarea,.tab,.chip,.sw');
    const drag = t && t.closest('[data-cursor="drag"]');
    cur.classList.toggle('is-link', !!link);
    cur.classList.toggle('is-drag', !!drag && !link);
  }, { passive: true });
  document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
  document.addEventListener('pointerenter', () => cur.classList.remove('is-hidden'));

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
function initControls() {
  $$('[data-finish]').forEach((b) => b.addEventListener('click', () => {
    ui.finish = b.dataset.finish;
    $$('[data-finish]').forEach((x) => x.classList.toggle('is-on', x === b));
    $('#finishDesc').textContent = DYN.finish[ui.finish][lang];
    scene && scene.instance('finish').apply({ finish: ui.finish });
  }));
  $$('[data-cw]').forEach((b) => b.addEventListener('click', () => {
    ui.cw = +b.dataset.cw;
    $$('[data-cw]').forEach((x) => x.classList.toggle('is-on', x === b));
    scene && scene.instance('finish').apply({ cw: ui.cw, theme: 'brand' });
  }));
  $$('[data-shape]').forEach((b) => b.addEventListener('click', () => {
    ui.shape = b.dataset.shape;
    $$('[data-shape]').forEach((x) => x.classList.toggle('is-on', x === b));
    renderDynamic();
    scene && scene.instance('shapes').apply({ shape: ui.shape, theme: 'brand', cw: 0, finish: 'gloss' });
  }));
  $$('[data-season]').forEach((b) => b.addEventListener('click', () => {
    ui.season = b.dataset.season;
    $$('[data-season]').forEach((x) => x.classList.toggle('is-on', x === b));
    $('#seasons').dataset.season = ui.season;
    renderDynamic();
    scene && scene.instance('seasons').apply({ ...SEASON[ui.season], cw: 0 });
  }));
  // "in season now": autumn badge only Sep–Dec
  const m = new Date().getMonth();
  $('.now').style.display = m >= 8 && m <= 11 ? '' : 'none';
  $('#seasons').dataset.season = ui.season;

  // form -> mailto (prototype)
  $('#quote').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target, n = f.name.value.trim(), em = f.email.value.trim();
    const note = $('#formNote');
    if (!n || !/^\S+@\S+\.\S+$/.test(em)) { note.textContent = DYN.formErr[lang]; return; }
    const body = `Name: ${n}\nCompany: ${f.company.value}\nEmail: ${em}\nProduct: ${f.product.value}\n\n${f.msg.value}`;
    note.textContent = DYN.formOk[lang];
    location.href = 'mailto:sales@jordantinplate.com?subject=' + encodeURIComponent('Quote request — ' + (f.company.value || n)) + '&body=' + encodeURIComponent(body);
  });
  $('#reviewBtn').addEventListener('click', () => document.body.classList.toggle('review'));
  $('#yr').textContent = new Date().getFullYear();
  const y = $('#years'); y.dataset.target = new Date().getFullYear() - 1998; y.textContent = y.dataset.target;
}

function initNav() {
  const nav = $('#nav'); let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max', onUpdate: (s) => {
      const y = s.scroll();
      nav.classList.toggle('is-solid', y > 40);
      nav.classList.toggle('is-hidden', y > lastY && y > 240 && !$('#menu').classList.contains('is-open'));
      lastY = y;
    }
  });
  const burger = $('#burger'), menu = $('#menu');
  const close = () => { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); document.body.classList.remove('menu-open'); if (lenis) lenis.start(); };
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-hidden', String(!open)); document.body.classList.toggle('menu-open', open);
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); close();
    if (lenis) lenis.scrollTo(t, { duration: 1.6, offset: 0 });
    else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: reduce ? 'auto' : 'smooth' });
  }));
  $('#themeBtn').addEventListener('click', (e) => setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark', e));
  $('#langBtn').addEventListener('click', () => setLang(lang === 'ar' ? 'en' : 'ar'));
}

/* ============================================================ journey (pinned + scrubbed) */
function initJourney() {
  const stepEls = $$('.step'), fill = $('#railFill');
  let target = 0, shown = 0, activeIdx = -1;
  const idxFor = (p) => (p < 0.17 ? 0 : p < 0.38 ? 1 : p < 0.62 ? 2 : p < 0.86 ? 3 : 4);
  ScrollTrigger.create({
    trigger: '#journey', start: 'top top', end: '+=' + Math.round(innerHeight * 4.2), pin: '.journey__pin', anticipatePin: 1,
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
  $$('.stage').forEach((s) => {});
}

/* ============================================================ entrance: a tinplate sheet is printed, rolled and sealed */
const LD_STEPS = {
  en: ['Design & plates', 'Print & coat', 'Cut & form', 'Seal & ship'],
  ar: ['التصميم والألواح', 'الطباعة والطلاء', 'القص والتشكيل', 'الإحكام والشحن']
};
// The entrance uses the real 3D tin pipeline: the loading % scrubs the same sheet -> print -> roll -> lid sequence as the
// Journey section, rendered by the same metal materials, inside the loader's own stage.
let loaderOwns = true; // while true, the loader (not the scroll) drives the journey rig
const jpOf = (v) => Math.min(v, 100) * 0.0068; // 0-100 % -> journey progress 0-0.68 (sheet, print, roll, lid)
function initLoader() {
  const numEl = $('#loaderNum'), stepEl = $('#ldStep');
  let stepIdx = -1;
  function set(p) {
    numEl.textContent = Math.round(p);
    const idx = p < 12 ? 0 : p < 40 ? 1 : p < 78 ? 2 : 3;
    if (idx !== stepIdx) { stepIdx = idx; stepEl.textContent = LD_STEPS[lang][idx]; }
    if (scene && loaderOwns) scene.setJourney(jpOf(p));
  }
  set(0);
  return { set, ready() { const w = $('.ld__wait'); if (w) w.remove(); } };
}

/* ============================================================ boot */
async function boot() {
  const ld = initLoader(); window.__jtLoader = ld;
  initSmoothScroll();
  const setNum = (v) => ld.set(v);
  const prog = { v: 0 };
  const isSkip = /[?&]skip/.test(location.search);
  if (isSkip) loaderOwns = false;
  // while modules and shaders load, creep up to 30%; the rest plays out once everything is ready
  const tw = gsap.to(prog, { v: 30, duration: 3, ease: 'power1.out', onUpdate: () => setNum(prog.v) });

  if (lang === 'ar') applyLang('ar'); else renderDynamic();
  html.dataset.theme = html.dataset.theme || 'light';

  const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
  let glOk = !!safe(() => document.createElement('canvas').getContext('webgl2'));
  let mod = null;
  if (glOk) {
    try { await fonts; mod = await import('./scene.js'); } catch (e) { console.warn('3D unavailable', e); glOk = false; }
  }
  if (glOk) {
    try {
      scene = mod.createScene($('#gl'));
      scene.refreshStages(); // gives every .stage its own canvas and its own tin
      scene.setTheme(isSkip ? html.dataset.theme : 'dark', true); // the entrance is always shown in the moody dark lighting
      window.addEventListener('resize', () => { scene.resize(); });
    } catch (e) { console.warn('scene failed', e); glOk = false; scene = null; }
  }
  if (!glOk) html.classList.add('no-gl'); else await fonts;

  initSplits(); initReveals(); initPointer(); initControls(); initNav(); initScrollFx(); initJourney();
  if (scene) gsap.ticker.add(() => scene.tick()); // last in the tick: after scroll and journey updates
  window.addEventListener('load', () => ScrollTrigger.refresh());

  if (scene) { window.__jt = { scene, ui }; await Promise.race([scene.warm(), new Promise((r) => setTimeout(r, 8000))]); }

  // finish loading UI
  tw.kill(); ld.ready();
  if (isSkip) { // review/testing shortcut: no loader
    $('#loader').remove(); document.body.classList.remove('is-loading'); unlockScroll(); ScrollTrigger.refresh(); playHero(); if (scene) scene.intro(); return;
  }
  // the sheet is printed, rolled into a tin and sealed while the % runs from where it is to 100
  await new Promise((res) => gsap.to(prog, { v: 100, duration: reduce ? 0.4 : 3.2, ease: 'power1.inOut', onUpdate: () => setNum(prog.v), onComplete: res }));
  const loader = $('#loader'), iris = { r: 0 };
  await new Promise((res) => {
    const t = gsap.timeline({ onComplete: res });
    t.add(() => { if (scene) scene.setTheme(html.dataset.theme); }, 0.2)
      .to({}, { duration: reduce ? 0 : 0.7 }) // hold on the sealed tin
      .to('.ld__meta', { opacity: 0, y: 24, duration: 0.35, ease: 'power2.in' })
      .to('.ld__stage', { scale: 3.2, opacity: 0, duration: reduce ? 0.2 : 0.95, ease: 'power3.in' }, '<')
      .to(iris, { r: 112, duration: reduce ? 0.2 : 1.1, ease: 'power3.inOut', onUpdate: () => loader.style.setProperty('--r', iris.r + '%') }, '-=0.45');
  });
  loaderOwns = false; if (scene) scene.setJourney(0);
  loader.remove(); document.body.classList.remove('is-loading');
  window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true });
  unlockScroll();
  ScrollTrigger.refresh();
  playHero();
  if (scene && !reduce) scene.intro();
}
boot();
