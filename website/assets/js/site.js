/* Jordan Tinplate Canning: shared page script (classic script, no libraries, runs before and without the 3D engine).
   Menu, theme, language preference, header behaviour, page transitions, "in season now" badge.
   The engine (assets/js/engine/main.js) listens to the events this file dispatches (jt:theme, jt:menu).
   Everything degrades: without JS the navigation is visible, the language switch is a normal link and every link is a plain link. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  function fire(name, detail) { try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) { /* very old browser */ } }

  /* ---------- theme (initial value is set by the inline script in <head>) ---------- */
  var themeBtn = doc.getElementById('themeBtn');
  function currentTheme() {
    return root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function applyTheme(next) {
    root.setAttribute('data-theme', next);
    store.set('jt-theme', next);
    if (themeBtn) themeBtn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    fire('jt:theme', next);
  }
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', currentTheme() === 'dark' ? 'true' : 'false');
    themeBtn.addEventListener('click', function (ev) {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      if (doc.startViewTransition && !reduce) { // circular reveal from the button
        var x = ev.clientX || innerWidth - 60, y = ev.clientY || 40;
        var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        var vt = doc.startViewTransition(function () { applyTheme(next); });
        vt.ready.then(function () {
          root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
            { duration: 800, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' });
        }).catch(function () {});
      } else applyTheme(next);
    });
  }

  /* ---------- language: remember the choice. The switch itself is a real link to the equivalent page ---------- */
  var langLink = doc.querySelector('[data-lang-switch]');
  if (langLink) langLink.addEventListener('click', function () { store.set('jt-lang', langLink.getAttribute('hreflang')); });
  store.set('jt-lang', root.lang);

  /* ---------- menu (mobile): inert + hidden when closed, Escape closes, focus returns to the burger ---------- */
  var burger = doc.getElementById('burger'), menu = doc.getElementById('menu');
  var shell = [doc.getElementById('main'), doc.querySelector('footer.foot')];
  function setMenu(open, focus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.inert = !open; // a closed menu leaves the tab order and the accessibility tree
    shell.forEach(function (el) { if (el) el.inert = open; });
    doc.body.classList.toggle('menu-open', open);
    fire('jt:menu', open);
    if (open && focus !== false) { var first = menu.querySelector('a'); if (first) first.focus({ preventScroll: true }); }
    else if (!open && focus !== false && menu.contains(doc.activeElement)) burger.focus({ preventScroll: true });
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false, false); burger.focus({ preventScroll: true }); }
    });
    matchMedia('(min-width: 1041px)').addEventListener('change', function (e) { if (e.matches && menu.classList.contains('is-open')) setMenu(false, false); });
  }

  /* ---------- header: solid after a little scroll, tucks away on the way down ---------- */
  var nav = doc.getElementById('nav'), lastY = 0, tick = false;
  function onScroll() {
    tick = false;
    var y = window.scrollY || 0;
    if (!nav) return;
    nav.classList.toggle('is-solid', y > 40);
    var open = menu && menu.classList.contains('is-open');
    nav.classList.toggle('is-hidden', y > lastY && y > 240 && !open && !nav.contains(doc.activeElement));
    lastY = y;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if (nav) { nav.addEventListener('focusin', function () { nav.classList.remove('is-hidden'); }); onScroll(); }

  /* ---------- "in season now" badge: autumn only (September to December) ---------- */
  var m = new Date().getMonth();
  Array.prototype.forEach.call(doc.querySelectorAll('[data-months]'), function (el) {
    var r = el.getAttribute('data-months').split('-'); if (m < +r[0] || m > +r[1]) el.style.display = 'none';
  });

  /* ---------- page transitions: bars sweep across, then the next page sweeps them away (the arrival is pure CSS) ---------- */
  function leave(href) {
    root.classList.remove('arrive'); root.classList.add('leaving');
    try { sessionStorage.setItem('jt-arrive', '1'); } catch (e) { /* ignore */ }
    setTimeout(function () { location.href = href; }, 460);
    setTimeout(function () { root.classList.remove('leaving'); }, 3500); // never leave a covered page behind if the navigation was cancelled
  }
  if (!reduce) {
    doc.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u;
      try { u = new URL(a.href, location.href); } catch (err) { return; }
      if (u.origin !== location.origin || !/^https?:$/.test(u.protocol)) return;
      if (u.pathname === location.pathname && u.search === location.search) return; // same page / in-page anchor
      e.preventDefault();
      leave(u.href);
    });
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) { root.classList.remove('leaving', 'arrive'); } });
  setTimeout(function () { root.classList.remove('arrive'); }, 2500);
})();
