/* Jordan Tinplate: small shared script. Nav, theme, language preference, reveal, quote form.
   Everything degrades: without JS the nav is visible, the language switch is a normal link,
   and the form opens the email app through its mailto action. */
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

  /* ---------- quote form: prefill from ?industry=, then open the email app ---------- */
  var form = doc.getElementById('quote-form');
  if (form) {
    var sel = form.elements.product;
    try {
      var wanted = new URLSearchParams(location.search).get('industry');
      if (wanted && sel) for (var i = 0; i < sel.options.length; i++) if (sel.options[i].value === wanted) sel.selectedIndex = i;
    } catch (e) {}
    var note = doc.getElementById('form-note');
    form.addEventListener('submit', function (e) {
      var name = form.elements.name.value.trim(), email = form.elements.email.value.trim();
      var ok = name && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
      form.elements.name.setAttribute('aria-invalid', name ? 'false' : 'true');
      form.elements.email.setAttribute('aria-invalid', ok ? 'false' : 'true');
      e.preventDefault();
      if (!ok) { note.textContent = form.getAttribute('data-err'); (name ? form.elements.email : form.elements.name).focus(); return; }
      var lines = [
        form.getAttribute('data-l-name') + ': ' + name,
        form.getAttribute('data-l-company') + ': ' + form.elements.company.value.trim(),
        form.getAttribute('data-l-email') + ': ' + email,
        form.getAttribute('data-l-product') + ': ' + sel.options[sel.selectedIndex].text,
        '', form.elements.msg.value.trim()
      ];
      var subject = form.getAttribute('data-subject') + ': ' + sel.options[sel.selectedIndex].text;
      note.textContent = form.getAttribute('data-ok');
      location.href = 'mailto:' + form.getAttribute('data-to') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    });
  }
})();
