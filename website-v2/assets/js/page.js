// Website v2, inner pages: theme, language memory, menu, smooth scroll, the 3D stages (hero, labs, journey), video facades.
// All the text is already in the HTML; everything here is an enhancement.
const d = document.documentElement, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = { set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };
const lang = d.lang === 'ar' ? 'ar' : 'en';
// every page opens at its top (not where the visitor was on the page before, nor on a reload or a back step), unless a link
// points to a section (#…). scrollIntoView also scrolls any frame the page is shown in (a preview, an embed), which scrollTo
// cannot reach; it runs again once the page has loaded, unless the visitor has started scrolling.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
let touched = false;
['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach((ev) => addEventListener(ev, () => { touched = true; }, { once: true, passive: true }));
const toTop = () => {
  if (location.hash || touched) return;
  scrollTo(0, 0);
  try { if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); } catch (e) { /* smooth scroll not started yet */ }
  try { (document.body || document.documentElement).scrollIntoView({ block: 'start', inline: 'nearest' }); } catch (e) { /* old browser */ }
};
toTop();
addEventListener('DOMContentLoaded', toTop);
addEventListener('load', () => { toTop(); setTimeout(toTop, 400); });
addEventListener('pageshow', (e) => { if (e.persisted) { touched = false; toTop(); } });
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// language and theme
$('#langLink')?.addEventListener('click', (e) => store.set('jt2-lang', e.currentTarget.dataset.lang));
const stages = [];
$('#modeBtn')?.addEventListener('click', () => {
  const m = d.dataset.mode === 'dark' ? 'light' : 'dark'; d.dataset.mode = m; store.set('jt2-mode', m);
  stages.forEach((s) => s.setTheme(m)); heroTitle();
});

// menu (phones)
const menu = $('#menu'), mb = $('#menuBtn');
mb?.addEventListener('click', () => { const open = mb.getAttribute('aria-expanded') !== 'true'; mb.setAttribute('aria-expanded', String(open)); menu.hidden = !open; d.classList.toggle('menu-open', open); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && mb?.getAttribute('aria-expanded') === 'true') mb.click(); });

// smooth scroll, header state, reveals
let lenis = null;
if (window.Lenis && !REDUCED) { lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.85 }); const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
const top = $('#top'), hero = $('.phero');
const onScroll = () => { top.classList.toggle('solid', scrollY > (hero ? hero.offsetHeight - 80 : 40)); };
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const rv = $$('.sec__head, .card, .tile, .spec, .prose, .facts > div, .certs figure, .vid, .vcard, .reach > *, .lab__text > *, .story > div');
rv.forEach((el) => el.classList.add('rv'));
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
rv.forEach((el, i) => { el.style.setProperty('--d', (i % 4) * 70 + 'ms'); io.observe(el); });

// videos play inside the page: the YouTube player (no-cookie) loads in place on click. A viewer that forbids other sites in
// frames (a sandboxed preview) blocks it: then the poster stays and a short note says so, instead of an empty box.
$$('.vid[data-vid]').forEach((v) => v.querySelector('.vid__play').addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${v.dataset.vid}?autoplay=1&rel=0&playsinline=1`; f.title = v.dataset.title;
  f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
  v.querySelector('.vid__play').hidden = true; v.prepend(f); v.classList.add('playing');
}));
document.addEventListener('securitypolicyviolation', (e) => {
  if (!/youtube/.test(e.blockedURI || '')) return;
  $$('.vid.playing').forEach((v) => { v.querySelector('iframe')?.remove(); v.querySelector('.vid__play').hidden = false; v.classList.remove('playing'); v.querySelector('.vid__blocked').hidden = false; });
});
// the site's own video files: one plays at a time
$$('.vid--own video').forEach((vd) => vd.addEventListener('play', () => $$('.vid--own video').forEach((o) => { if (o !== vd) o.pause(); })));

// ---------------------------------------------------------------- 3D
let heroStage = null;
function heroTitle() {
  if (!heroStage) return;
  const text = $('#h1').textContent.trim(), font = lang === 'ar' ? '700 100px "Readex Pro"' : '800 100px "Bricolage Grotesque"';
  (document.fonts ? document.fonts.load(font, text) : Promise.resolve()).catch(() => {}).then(() => heroStage.title(text, lang, d.dataset.mode));
}
function wire(stage) { stage.setTheme(d.dataset.mode); stages.push(stage); return stage; }
import('./engine/stage.js').then((S) => {
  const hc = $('canvas[data-stage="hero"]');
  if (hc) { heroStage = wire(S.createHero(hc, { tins: hc.dataset.tins.split(',') })); heroTitle(); heroStage.ready.then(() => d.classList.add('gl-ready')); }
  // the labs start when they come near the screen
  const lazy = (el, start) => { const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { o.disconnect(); start(); } }, { rootMargin: '400px' }); o.observe(el); };
  $$('canvas[data-stage="lab"]').forEach((c) => lazy(c, () => {
    const lab = wire(S.createLab(c, { tin: c.dataset.tin })), sec = c.closest('.lab');
    $$('.chip[data-fin]', sec).forEach((b) => b.addEventListener('click', () => {
      $$('.chip[data-fin]', sec).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $('.lab__desc', sec).textContent = b.dataset.desc; lab.setFinish(b.dataset.fin);
    }));
    $$('.chip[data-tin]', sec).forEach((b) => b.addEventListener('click', () => {
      $$('.chip[data-tin]', sec).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('.pane', sec).forEach((p) => p.classList.toggle('on', p.id === b.getAttribute('aria-controls'))); lab.setTin(b.dataset.tin);
    }));
  }));
  const jc = $('canvas[data-stage="journey"]');
  if (jc) lazy(jc, () => {
    const J = wire(S.createJourney(jc)), sec = jc.closest('.jfilm'), steps = $$('.flow__step', sec), dots = $$('.flow__rail b', sec), rail = $('.flow__rail', sec);
    J.label(lang);
    const show = (s) => { steps.forEach((el, i) => el.classList.toggle('on', i === s)); dots.forEach((b, i) => b.classList.toggle('done', i <= s)); rail.style.setProperty('--f', s / 4); };
    J.onChange((st) => show(st.step)); show(0);
    (function tick() { const r = sec.getBoundingClientRect(); J.progress = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); requestAnimationFrame(tick); })();
  });
}).catch((e) => { console.warn('3D unavailable', e); d.classList.add('no-gl'); });
