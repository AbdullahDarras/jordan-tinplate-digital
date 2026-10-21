/* Jordan Tinplate: small shared script. Nav, theme, language preference, reveal, review mode.
   Everything degrades: without JS the nav is visible and the language switch is a normal link.
   "Request a quote" is a plain external link to the online order tool (no script needed). */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- theme (initial value is set by the inline script in <head>) ---------- */
  var themeBtn = doc.getElementById('theme-btn');
  function currentTheme() {
    return root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', currentTheme() === 'dark' ? 'true' : 'false');
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store.set('jt-theme', next);
      themeBtn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
  }

  /* ---------- language: remember the choice. The switch itself is a real link to the equivalent page ---------- */
  var langLink = doc.querySelector('[data-lang-switch]');
  if (langLink) {
    langLink.addEventListener('click', function () { store.set('jt-lang', langLink.getAttribute('hreflang')); });
  }
  store.set('jt-lang', root.lang);

  /* ---------- mobile nav ---------- */
  var burger = doc.getElementById('menu-btn'), nav = doc.getElementById('primary-nav');
  function setMenu(open) {
    if (!burger || !nav) return;
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
    });
    doc.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- review mode: outline every "to be confirmed" placeholder ---------- */
  var review = doc.getElementById('review-btn');
  if (review) {
    review.addEventListener('click', function () {
      var on = doc.body.classList.toggle('review');
      review.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* ---------- reveal on scroll ---------- */
  var items = doc.querySelectorAll('[data-reveal]');
  if (items.length) {
    if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      items.forEach(function (el) { io.observe(el); });
      setTimeout(function () { items.forEach(function (el) { el.classList.add('is-in'); }); }, 4000); // safety net
    } else {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }
  }
})();
