// Jordan Tinplate Canning: the creative engine, shared by every page (home and inner).
// Entrance (home, once per session), 3D stages, scroll-scrubbed journey, labs (finish / shapes / seasons), reveals, cursor.
// The page text is already in the HTML in the page's own language; this file only enhances it. Anything that fails here
// leaves a complete, readable, navigable page (see failOpen / releasePage). Menu, theme and page transitions live in /assets/js/site.js.

window.__jtBooted = true; // tells the inline guard in the page that this module started

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const html = document.documentElement;
const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
const hasLibs = !!(gsap && ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePtr = matchMedia('(hover: hover) and (pointer: fine)').matches;
const safe = (fn) => { try { return fn(); } catch (e) { return null; } };
const DATA = safe(() => JSON.parse($('#jt-data').textContent)) || {};
const lang = html.lang === 'ar' ? 'ar' : 'en';
const LD_STEPS = DATA.ld || ['Design & plates', 'Print & coat', 'Cut & form', 'Seal & ship'];
const MSG = { loading: DATA.loading || 'Loading', ready: DATA.ready || 'Page ready' };

let scene = null;
let lenis = null;
let loaderOwns = false; // while true, the loader (not the scroll) drives the journey rig
const hasStages = () => !!$('.stage');

/* ============================================================ loader / page lock helpers
   Whatever goes wrong (a library blocked, a module error, a slow device), releasePage() puts the page back in a usable
   state: loader gone, scroll unlocked, content reachable by keyboard. */
const loaderEl = () => document.getElementById('loader');
const setInert = (on) => ['#main', '#nav'].forEach((sel) => { const e = $(sel); if (e) e.inert = on; });
function releasePage() {
  const l = loaderEl(); if (l) l.remove();
  html.classList.remove('intro');
  setInert(false);
  if (lenis) lenis.start();
}
const announce = (key) => { const a = $('#ldAnnounce'); if (a) a.textContent = MSG[key]; };

/* Smooth scrolling that runs on the main thread. Native wheel scrolling is composited ahead of JavaScript, so a WebGL
   canvas that follows the page would trail the DOM by a few frames and look like it is "flying". With Lenis the scroll
   position is set in our own ticker, and the 3D is rendered in the same tick, so they stay locked together. */
function initSmoothScroll() {
  gsap.ticker.lagSmoothing(0);
  if (reduce || typeof window.Lenis === 'undefined') return;
  lenis = new window.Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  if (loaderOwns) lenis.stop(); // unlocked when the entrance is over
}
const unlockScroll = () => { if (lenis) lenis.start(); };

/* theme + menu events come from /assets/js/site.js */
window.addEventListener('jt:theme', (e) => { if (scene && !loaderOwns) scene.setTheme(e.detail); });
window.addEventListener('jt:menu', (e) => { if (lenis) { if (e.detail) lenis.stop(); else if (!loaderEl()) lenis.start(); } });
window.addEventListener('jt:lock', (e) => { if (lenis) { if (e.detail) lenis.stop(); else if (!loaderEl()) lenis.start(); } }); // lightbox open / closed

/* ============================================================ text splitting + reveals */
const splitTriggers = [];
function split(el) {
  const text = el.textContent.trim();
  el.textContent = '';
  const sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = text; el.appendChild(sr); // screen readers get the whole text once
  const words = text.split(/\s+/).map((w, i, a) => {
    const outer = document.createElement('span'); outer.className = 'w'; outer.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span'); inner.className = 'wi'; inner.textContent = w; outer.appendChild(inner);
    el.appendChild(outer); if (i < a.length - 1) el.appendChild(document.createTextNode(' '));
    return inner;
  });
  return words;
}
function initSplits() {
  if (reduce) return; // reduced motion: headings stay as plain text
  $$('[data-split]').forEach((el) => {
    const words = split(el);
    const inHero = !!el.closest('#hero');
    gsap.set(words, { yPercent: 115, rotateX: -75, opacity: 0, transformOrigin: '50% 100%' });
    if (inHero) return; // played by playHero()
    splitTriggers.push(ScrollTrigger.create({
      trigger: el, start: 'top 88%', once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.1, ease: 'power4.out', stagger: 0.07 })
    }));
  });
}
function initReveals() {
  if (reduce) return;
  const els = $$('[data-reveal]');
  els.forEach((el) => gsap.set(el, { opacity: 0, y: el.closest('#hero') ? 30 : 40 }));
  const rest = els.filter((e) => !e.closest('#hero'));
  if (rest.length) {
    ScrollTrigger.batch(rest, {
      start: 'top 92%', once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09, overwrite: true })
    });
  }
}
let heroPlayed = false;
function playHero() {
  if (heroPlayed) return; heroPlayed = true;
  if (reduce) return;
  gsap.to($$('#hero [data-split] .wi'), { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.2, ease: 'power4.out', stagger: 0.12 });
  gsap.to($$('#hero [data-reveal], #hero .eyebrow'), { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.5 });
  gsap.fromTo('#hero .scrollcue', { opacity: 0 }, { opacity: 1, delay: 1.6, duration: 1 });
}

/* ============================================================ pointer: cursor, magnetic, tilt, drag */
function initPointer() {
  const cur = $('.cursor');
  if (!cur) return;
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

/* ============================================================ labs: chips, swatches, season tabs (work without GSAP too) */
const inst = (name) => (scene && scene.instance ? scene.instance(name) : null);
function showPane(scope, id) {
  $$('[data-pane]', scope).forEach((p) => p.classList.toggle('is-on', p.dataset.pane === id));
}
function initControls() {
  // chips and swatches are toggle buttons: aria-pressed mirrors the visual state; each shows its text pane and restyles its 3D tin
  $$('[data-pick]').forEach((b) => b.addEventListener('click', () => {
    const group = b.closest('.chips, .swatches');
    $$('[data-pick]', group).forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    const kind = b.dataset.pick, id = b.dataset.id, tin = inst(b.dataset.target);
    if (kind !== 'cw' && group.parentElement) showPane(group.parentElement, id);
    if (!tin) return;
    if (kind === 'finish') tin.apply({ finish: id });
    else if (kind === 'shape') tin.apply({ shape: id });
    else if (kind === 'cw') tin.apply(id === 'h' ? { cw: 0, theme: 'halawah' } : { cw: +id, theme: 'brand' });
  }));
  // season tabs: click, or arrow keys / Home / End (roving tabindex)
  const tabs = $$('.tab[data-season]');
  const selectSeason = (b, focus) => {
    tabs.forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1; });
    const sec = b.closest('.seasons'); if (sec) { sec.dataset.season = b.dataset.season; showPane(sec, b.dataset.season); }
    if (focus) b.focus();
    const tin = inst('seasons');
    if (tin) tin.apply({ shape: b.dataset.shape, theme: b.dataset.theme, finish: b.dataset.finish, cw: 0 });
  };
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
  // years of making metal packaging
  const y = $('#years');
  if (y) { y.dataset.target = new Date().getFullYear() - +(y.dataset.countYears || 1998); y.textContent = y.dataset.target; }
}
function initMarquee() { // duplicate the row so it loops; the copies are hidden from assistive technology
  $$('[data-marquee]').forEach((row) => {
    const kids = [...row.children];
    for (let i = 0; i < 3; i++) kids.forEach((k) => { const c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); });
  });
}
// in-page jumps (skip link and any #anchor) keep keyboard focus with the target
function bindAnchors() {
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { duration: 1.4, offset: 0 });
    else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY, behavior: reduce ? 'auto' : 'smooth' });
    if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  }));
}
function jumpToHash() { // arriving with #section in the URL
  if (!location.hash || location.hash.length < 2) return;
  const t = safe(() => $(decodeURIComponent(location.hash)));
  if (!t) return;
  if (lenis) lenis.scrollTo(t, { immediate: true });
  else t.scrollIntoView();
}

/* ============================================================ journey (pinned + scrubbed) */
function initJourney() {
  const stepEls = $$('.step'), fill = $('#railFill');
  if (!fill || !$('.journey__pin')) return;
  let target = 0, shown = 0, activeIdx = -1;
  const idxFor = (p) => (p < 0.17 ? 0 : p < 0.38 ? 1 : p < 0.62 ? 2 : p < 0.86 ? 3 : 4);
  ScrollTrigger.create({
    trigger: '.journey', start: 'top top',
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
  if (!reduce && $('.marquee__track')) {
    ScrollTrigger.create({
      onUpdate: (s) => {
        const sk = gsap.utils.clamp(-10, 10, s.getVelocity() / -260);
        gsap.to('.marquee__track', { skewX: sk, duration: 0.5, ease: 'power3.out', overwrite: true });
      }
    });
  }
  const y = $('#years');
  if (y && !reduce) {
    const tgt = +y.dataset.target;
    ScrollTrigger.create({
      trigger: y, start: 'top 85%', once: true,
      onEnter: () => { const o = { v: 0 }; gsap.to(o, { v: tgt, duration: 1.8, ease: 'power3.out', onUpdate: () => { y.textContent = Math.round(o.v); } }); }
    });
  }
}

/* ============================================================ entrance: a tinplate sheet is printed, rolled and sealed */
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
    if (idx !== stepIdx) { stepIdx = idx; if (stepEl) stepEl.textContent = LD_STEPS[idx]; }
    if (scene && loaderOwns) scene.setJourney(jpOf(p));
  }
  set(0);
  return { set, ready() { const w = $('.ld__wait'); if (w) w.remove(); } };
}

/* ============================================================ boot */
async function loadScene(onStep) {
  const fonts = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
  if (!hasStages()) { await fonts; return null; }
  if (!safe(() => document.createElement('canvas').getContext('webgl2'))) { html.classList.add('no-gl'); await fonts; return null; }
  try {
    await fonts; onStep(20);
    const mod = await import('./scene.js'); onStep(30);
    scene = mod.createScene($('#gl'));
    scene.refreshStages(); // gives every .stage its own canvas and its own tin
    scene.setTheme(html.dataset.mode, true); // the entrance follows the page: light by default
    window.addEventListener('resize', () => { scene.resize(); });
    gsap.ticker.add(() => scene.tick()); // last in the tick: after scroll and journey updates
    window.__jt = { scene };
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
  const wantsIntro = html.classList.contains('intro') && !!loaderEl(); // home, first view this session, no ?skip, no reduced motion
  loaderOwns = wantsIntro;
  if (wantsIntro) history.scrollRestoration = 'manual';
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
    if (scene) { scene.setJourney(0); scene.setTheme(html.dataset.mode); }
    releasePage();
    if (scene && scene.pruneStages) scene.pruneStages(); // the loader's stage is gone: drop it from the render list
    if (wantsIntro) { window.scrollTo(0, 0); if (lenis) lenis.scrollTo(0, { immediate: true }); }
    unlockScroll();
    ScrollTrigger.refresh();
    jumpToHash();
    playHero();
    if (wantsIntro) announce('ready');
    revealed = true; maybeIntro();
  }
  // Skip button / Escape / watchdog: fade the loader out quickly, then finish
  function skipNow() {
    if (skipped || finished) return; skipped = true;
    safe(() => sessionStorage.setItem('jt-intro', '1'));
    if (entranceTl) entranceTl.kill();
    if (entranceResolve) entranceResolve();
    skipResolve();
    const l = loaderEl();
    if (l) gsap.to(l, { opacity: 0, duration: reduce ? 0.01 : 0.35, ease: 'power1.out', onComplete: finishLoading });
    else finishLoading();
  }

  if (wantsIntro) {
    setInert(true); // the loader covers the page: keep keyboard focus off the hidden content
    announce('loading');
    const sk = $('#ldSkip');
    if (sk) { sk.addEventListener('click', skipNow); sk.focus({ preventScroll: true }); }
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && loaderEl()) skipNow(); });
    // never leave the visitor stuck behind the loader, whatever happens to the 3D or the network
    watchdog = setTimeout(() => { console.warn('entrance watchdog: finishing early'); skipNow(); }, 14000);
  }

  initSmoothScroll();
  initSplits(); initReveals(); initPointer(); initControls(); initMarquee(); bindAnchors(); initScrollFx(); initJourney();
  window.addEventListener('load', () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  // the % is driven by real milestones (fonts, 3D module, scene, shaders); the creep just keeps it moving in between
  const towards = (v, d = 0.5, ease = 'power1.out') => gsap.to(prog, { v: Math.max(prog.v, v), duration: d, ease, overwrite: true, onUpdate: setNum });
  if (wantsIntro) towards(30, 3);
  const sceneP = loadScene((v) => { if (wantsIntro && !finished) towards(v, 0.5); }).then((sc) => { if (sc) maybeIntro(); return sc; });

  if (!wantsIntro) { // inner pages, returning visitors, ?skip, reduced motion: no entrance, the page is usable immediately
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
    gsap.killTweensOf(prog);
    const tl = entranceTl = gsap.timeline({ onComplete: res });
    tl.to(prog, { v: 100, duration: 2.2, ease: 'power1.inOut', onUpdate: setNum })
      .add(() => { if (scene) scene.setTheme(html.dataset.mode); })
      .to({}, { duration: 0.5 }) // hold on the sealed tin
      .to('.ld__meta, .ld__skip', { opacity: 0, y: 24, duration: 0.35, ease: 'power2.in' })
      .to('.ld__stage', { scale: 3.2, opacity: 0, duration: 0.95, ease: 'power3.in' }, '<')
      .add(() => playHero(), '-=0.1') // the headline writes itself under the opening iris
      .to(iris, { r: 112, duration: 1.1, ease: 'power3.inOut', onUpdate: () => { if (loader) loader.style.setProperty('--r', iris.r + '%'); } }, '-=0.5');
  });
  if (skipped) return;
  finishLoading();
}

/* ============================================================ without GSAP / ScrollTrigger: a plain, working page */
function failOpen() {
  console.warn('[jt] animation libraries are missing: running the plain page');
  html.classList.add('no-gl', 'no-fx');
  releasePage();
  safe(initControls); safe(bindAnchors);
}

if (!hasLibs) failOpen();
else boot().catch((e) => {
  console.error('boot failed', e);
  html.classList.add('no-fx');
  safe(() => { gsap.set($$('.wi, [data-reveal]'), { clearProps: 'all' }); }); // nothing may stay hidden
  releasePage(); // a bug in the entrance must never leave the loader up or the page scroll-locked
});
