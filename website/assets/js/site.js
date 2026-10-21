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

  /* ---------- click-to-load video facades: the YouTube iframe is created only on click, so no third-party code loads before that ---------- */
  function press(el, fn) { // a link that behaves as a button (Enter is native, Space is added)
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); el.click(); } });
    el.addEventListener('click', function (e) { if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); fn(e); });
  }
  Array.prototype.forEach.call(doc.querySelectorAll('.vid[data-vid]'), function (box) {
    var id = box.getAttribute('data-vid'), play = box.querySelector('.vid__play'), img = box.querySelector('.vid__poster');
    if (!play || !/^[\w-]{11}$/.test(id)) return;
    function good() { box.classList.remove('is-fallback'); box.classList.add('has-poster'); }
    function bad() { box.classList.remove('has-poster'); box.classList.add('is-fallback'); }
    if (img) { // a missing or blocked thumbnail leaves the gradient + gear + play-icon fallback in place
      img.addEventListener('load', function () { if (img.naturalWidth > 120) good(); else bad(); });
      img.addEventListener('error', bad);
      if (img.complete) { if (img.naturalWidth > 120) good(); else if (img.currentSrc) bad(); }
    }
    press(play, function () {
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = box.getAttribute('data-title') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.setAttribute('allowfullscreen', ''); f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      box.appendChild(f); box.classList.add('is-playing');
      play.remove(); f.focus();
    });
  });

  /* ---------- lightbox (certificates, photos): a modal <dialog>. Esc, the close button and a click on the backdrop close it,
     focus is trapped inside (natively by showModal(), by hand where it is missing) and returns to the image that opened it ---------- */
  var lb = doc.getElementById('lightbox');
  if (lb) {
    var stage = lb.querySelector('.lb__stage'), bx = lb.querySelector('.lb__x'), bp = lb.querySelector('.lb__prev'), bn = lb.querySelector('.lb__next');
    var items = [], cur = -1, group = '', modal = typeof lb.showModal === 'function', rtl = root.dir === 'rtl', lockEls = [doc.getElementById('main'), doc.getElementById('nav'), doc.querySelector('footer.foot')];
    function show(i) {
      cur = i; var src = items[i].querySelector('picture') || items[i].querySelector('img'); if (!src) return;
      var node = src.cloneNode(true), im = node.tagName === 'IMG' ? node : node.querySelector('img');
      if (im) { im.removeAttribute('loading'); im.removeAttribute('class'); lb.setAttribute('aria-label', im.getAttribute('alt') || lb.getAttribute('aria-label')); }
      stage.innerHTML = ''; stage.appendChild(node);
      bp.hidden = bn.hidden = items.length < 2;
    }
    function openLb(a) {
      group = a.getAttribute('data-lightbox');
      items = Array.prototype.filter.call(doc.querySelectorAll('[data-lightbox]'), function (x) { return x.getAttribute('data-lightbox') === group; });
      show(items.indexOf(a));
      if (modal) lb.showModal(); else { lb.setAttribute('open', ''); lockEls.forEach(function (el) { if (el) el.inert = true; }); }
      root.classList.add('lb-open'); fire('jt:lock', true);
      bx.focus({ preventScroll: true });
    }
    function closeLb() { if (modal) { if (lb.open) lb.close(); } else if (lb.hasAttribute('open')) { lb.removeAttribute('open'); afterClose(); } }
    function afterClose() {
      root.classList.remove('lb-open'); fire('jt:lock', false);
      if (!modal) lockEls.forEach(function (el) { if (el) el.inert = false; });
      var back = items[cur]; if (back) back.focus({ preventScroll: true }); // focus returns to the image that was last shown
      stage.innerHTML = '';
    }
    function step(d) { if (items.length > 1) { show((cur + d + items.length) % items.length); } }
    Array.prototype.forEach.call(doc.querySelectorAll('[data-lightbox]'), function (a) { press(a, function () { openLb(a); }); a.setAttribute('aria-haspopup', 'dialog'); });
    bx.addEventListener('click', closeLb); bp.addEventListener('click', function () { step(-1); }); bn.addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (!(e.target.closest && e.target.closest('button, img'))) closeLb(); }); // backdrop / empty space
    if (modal) lb.addEventListener('close', afterClose);
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal) { e.preventDefault(); closeLb(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(rtl ? 1 : -1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(rtl ? -1 : 1); }
      else if (e.key === 'Tab') { // focus never leaves the dialog (showModal() already confines it; this also covers the browser-UI hop and old browsers)
        var f = Array.prototype.filter.call(lb.querySelectorAll('button'), function (b) { return !b.hidden; });
        if (!f.length) return; var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var sx = null; // swipe left / right on touch screens
    stage.addEventListener('pointerdown', function (e) { sx = e.pointerType === 'touch' ? e.clientX : null; });
    stage.addEventListener('pointerup', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 50) step((e.clientX < sx ? 1 : -1) * (rtl ? -1 : 1)); sx = null; });
  }

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
