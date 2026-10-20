#!/usr/bin/env node
// Static site generator for Jordan Tinplate Canning (phase 1). No dependencies.
//   node website/tools/build.mjs            (SITE_URL=https://example.com node ... to override the production origin)
// Reads tools/content.mjs, writes en/, ar/, sitemap.xml, robots.txt, index.html (language chooser), 404.html.
// The generated files are committed; re-run this script after editing content.mjs.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SITE, LANGS, UI, PAGES, NEWS, NAV } from './content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const L = Object.keys(LANGS);                       // ['en', 'ar']
const byId = Object.fromEntries(PAGES.map((p) => [p.id, p]));

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tx = (v, lang) => (v && typeof v === 'object' ? v[lang] : v);        // bilingual object -> string
const T = (v, lang) => esc(tx(v, lang));
const rel = (lang, page) => `/${lang}/${page.path}`;                          // site-relative URL
const abs = (lang, page) => SITE.origin + rel(lang, page);
const other = (lang) => L.find((l) => l !== lang);
const pageRef = (id) => (id === 'catalogue' ? null : byId[id]);
const hashOf = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 8);
const V = { css: hashOf('assets/css/site.css'), js: hashOf('assets/js/site.js') };
const brandName = (lang) => (lang === 'ar' ? SITE.nameAr : SITE.name);   // display name per language
const OG_IMG = SITE.origin + '/assets/img/og-default.png';

// ---------------------------------------------------------------- tin illustrations (inline SVG)
const ART = {
  round: `<ellipse class="a-shadow" cx="100" cy="150" rx="82" ry="18"/><path class="a-body" d="M20 60V120C20 133 56 144 100 144S180 133 180 120V60Z"/><path class="a-band" d="M20 84C20 97 56 108 100 108S180 97 180 84V102C180 115 144 126 100 126S20 115 20 102Z"/><ellipse class="a-top" cx="100" cy="60" rx="80" ry="24"/><ellipse class="a-ln" cx="100" cy="60" rx="64" ry="18"/>`,
  oval: `<ellipse class="a-shadow" cx="100" cy="148" rx="90" ry="16"/><path class="a-body" d="M14 64V104C14 124 52 140 100 140S186 124 186 104V64Z"/><path class="a-band" d="M14 84C14 104 52 118 100 118S186 104 186 84V98C186 118 148 132 100 132S14 118 14 98Z"/><ellipse class="a-top" cx="100" cy="64" rx="86" ry="32"/><ellipse class="a-ln" cx="100" cy="64" rx="70" ry="25"/>`,
  square: `<ellipse class="a-shadow" cx="100" cy="162" rx="84" ry="12"/><path class="a-l" d="M24 62L100 94V160L24 128Z"/><path class="a-r" d="M176 62L100 94V160L176 128Z"/><path class="a-band" d="M24 90L100 122V138L24 106Z"/><path class="a-band2" d="M176 90L100 122V138L176 106Z"/><path class="a-top" d="M100 30L176 62L100 94L24 62Z"/><path class="a-ln" d="M100 42L162 68L100 86L38 68Z"/>`,
  rect: `<ellipse class="a-shadow" cx="100" cy="160" rx="88" ry="12"/><path class="a-l" d="M14 74L88 104V150L14 120Z"/><path class="a-r" d="M186 62L88 104V150L186 108Z"/><path class="a-band" d="M14 96L88 126V138L14 108Z"/><path class="a-band2" d="M186 82L88 124V136L186 94Z"/><path class="a-top" d="M14 74L112 32L186 62L88 104Z"/><path class="a-ln" d="M34 74L112 42L168 63L90 94Z"/>`,
  can: `<ellipse class="a-shadow" cx="100" cy="166" rx="56" ry="10"/><path class="a-body" d="M56 40V146C56 156 76 164 100 164S144 156 144 146V40Z"/><path class="a-band" d="M56 76C56 86 76 94 100 94S144 86 144 76V108C144 118 124 126 100 126S56 118 56 108Z"/><ellipse class="a-top" cx="100" cy="40" rx="44" ry="12"/><ellipse class="a-ln" cx="100" cy="40" rx="34" ry="8"/>`,
  oil: `<ellipse class="a-shadow" cx="100" cy="170" rx="58" ry="8"/><path class="a-l" d="M52 70H148V158Q148 168 138 168H62Q52 168 52 158Z"/><path class="a-band" d="M52 100H148V136H52Z"/><path class="a-top" d="M52 70L78 44H122L148 70Z"/><rect class="a-r" x="92" y="22" width="16" height="24"/><rect class="a-band2" x="87" y="14" width="26" height="9" rx="3"/><path class="a-ln2" d="M126 52C172 34 178 84 148 88"/>`
};
let gradId = 0;
const art = (key, cls = '') => {
  if (key === 'hero') {
    return `<svg class="art ${cls}" viewBox="0 0 520 420" aria-hidden="true" focusable="false"><svg x="240" y="8" width="250" height="225" viewBox="0 0 200 180">${ART.can}</svg><svg x="0" y="130" width="320" height="288" viewBox="0 0 200 180">${ART.round}</svg><svg x="300" y="210" width="210" height="190" viewBox="0 0 200 180">${ART.square}</svg></svg>`;
  }
  gradId++;
  return `<svg class="art ${cls}" viewBox="0 0 200 180" aria-hidden="true" focusable="false">${ART[key] || ART.round}</svg>`;
};
const GRADIENT_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="g-body" x1="0" x2="1" y1="0" y2="0"><stop offset="0" class="stop-a"/><stop offset=".38" class="stop-b"/><stop offset=".7" class="stop-c"/><stop offset="1" class="stop-a"/></linearGradient></defs></svg>`;
const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const DOWN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>`;
const MARK = `<svg viewBox="0 0 40 40" class="brand__mark" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="20" cy="20" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3"/><circle cx="20" cy="20" r="3.4" fill="var(--accent)"/></svg>`;

// ---------------------------------------------------------------- blocks
const tbcBadge = (lang) => `<span class="badge">${T(UI.tbc, lang)}</span>`;
const goLink = (href, label, extra = '') => `<a class="go" href="${href}"${extra}>${label}${ARROW}</a>`;
// External "Request a quote" link: the existing online order tool, new tab, rel="noopener".
const orderLink = (lang, { cls = 'btn', label, icon = ARROW } = {}) =>
  `<a class="${cls}" href="${SITE.orderUrl}" target="_blank" rel="noopener">${label || T(UI.quote, lang)}<span class="vh"> (${T(UI.opensNew, lang)})</span>${icon}</a>`;
const ctaHref = (c, lang) => {
  if (c.to === 'order') return { href: SITE.orderUrl, ext: true, order: true };
  if (c.to === 'catalogue') return { href: SITE.catalogue, ext: true };
  return { href: rel(lang, byId[c.to]) + (c.query || ''), ext: false };
};

function renderBlock(b, lang, ctx) {
  const lvl = ctx.hasTitle ? 3 : 2;
  switch (b.k) {
    case 'cards':
      return `<ul class="grid" data-reveal>${b.items.map((i) => `<li class="card">${i.art ? `<div class="card__art">${art(i.art)}</div>` : ''}<h${lvl} class="h3">${T(i.h, lang)}</h${lvl}><p>${T(i.p, lang)}</p>${i.meta ? `<div class="meta"><span>${T(i.meta, lang)}</span></div>` : ''}</li>`).join('')}</ul>`;
    case 'tiles':
      return `<ul class="grid grid--tiles" data-reveal>${b.ids.map((id) => {
        const p = byId[id];
        return `<li><a class="card tile" href="${rel(lang, p)}"><div class="card__art">${art(p.hero.art)}</div><h${lvl} class="h3">${T(p.tile.h, lang)}</h${lvl}><p>${T(p.tile.p, lang)}</p><span class="go">${T(UI.explore, lang)}${ARROW}</span></a></li>`;
      }).join('')}</ul>`;
    case 'steps':
      return `<ol class="steps" data-reveal>${b.items.map((i) => `<li><h${lvl} class="h3">${T(i.h, lang)}</h${lvl}><p>${T(i.p, lang)}</p></li>`).join('')}</ol>`;
    case 'specs':
      return `<dl class="specs" data-reveal>${b.rows.map((r) => `<div class="spec${r.art ? '' : ' spec--noart'}${r.tbc ? ' spec--tbc' : ''}"${r.tbc ? ' data-tbc' : ''}>${r.art ? `<div class="spec__art">${art(r.art)}</div>` : ''}<dt>${T(r.k, lang)}</dt><dd><span class="spec__v">${T(r.v, lang)}</span>${r.tbc ? ' ' + tbcBadge(lang) : ''}${r.note ? `<br><span class="spec__n">${T(r.note, lang)}</span>` : ''}</dd></div>`).join('')}</dl>`;
    case 'tbc': {
      const items = b.cards
        ? `<ul class="tbc__cards">${b.items.map((i) => `<li>${tbcBadge(lang)}<span>${T(i, lang)}</span></li>`).join('')}</ul>`
        : `<ul>${b.items.map((i) => `<li>${T(i, lang)}</li>`).join('')}</ul>`;
      return `<div class="tbc" data-tbc data-reveal role="group" aria-labelledby="${ctx.id}-tbc">${b.cards ? '' : tbcBadge(lang)}<h${lvl} class="h3 tbc__title" id="${ctx.id}-tbc">${T(b.title, lang)}</h${lvl}>${items}${b.note ? `<p class="tbc__note">${T(b.note, lang)}</p>` : ''}</div>`;
    }
    case 'prose': return `<div class="prose" data-reveal>${b.ps.map((p) => `<p>${T(p, lang)}</p>`).join('')}</div>`;
    case 'quote': return `<blockquote class="quote" data-reveal>${T(b.text, lang)}</blockquote>`;
    case 'fine': return `<p class="fine">${T(b.text, lang)}</p>`;
    case 'link': return `<p>${goLink(rel(lang, byId[b.to]), T(b.label, lang))}</p>`;
    case 'news': {
      const list = b.limit ? NEWS.slice(0, b.limit) : NEWS;
      return `<ul class="grid grid--2 news" data-reveal>${list.map((n) => `<li class="card"><span class="tag">${T(n.tag, lang)}</span><h${lvl} class="h3">${n.href ? `<a href="${esc(n.href)}" target="_blank" rel="noopener noreferrer">${T(n.h, lang)}<span class="vh"> (${T(UI.opensNew, lang)})</span></a>` : T(n.h, lang)}</h${lvl}><p>${T(n.p, lang)}</p>${n.href ? `<span class="go">${T(UI.read, lang)}${ARROW}</span>` : ''}${n.tbc ? `<span class="badge" data-tbc>${T(n.tbc, lang)}</span>` : ''}</li>`).join('')}</ul>`;
    }
    case 'contact': return contactBlock(lang);
    default: throw new Error('unknown block ' + b.k);
  }
}

function contactBlock(lang) {
  return `<div class="panel contact">
  <div data-reveal>
    <p class="eyebrow"><span class="dot"></span>${T(UI.quote, lang)}</p>
    <h2 class="h2">${T(UI.ctaTitle, lang)}</h2>
    <ul class="clist" style="margin-top:2rem">
      <li><span class="k">${T(UI.phone, lang)}</span><a href="tel:${SITE.tel}" class="ltr">${SITE.phone}</a></li>
      <li><span class="k">${T(UI.mail, lang)}</span><a href="mailto:${SITE.email}">${SITE.email}</a></li>
      <li><span class="k">${T(UI.address, lang)}</span><span>${T(UI.addressArea, lang)}<br><span class="badge" data-tbc>${T(UI.addressTbc, lang)}</span></span></li>
    </ul>
    <ul class="social">${Object.entries(SITE.social).map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${n}<span class="vh"> (${T(UI.opensNew, lang)})</span></a></li>`).join('')}</ul>
    <a class="btn btn--ghost" href="${SITE.catalogue}" target="_blank" rel="noopener noreferrer">${T(UI.catalogue, lang)}${DOWN}</a>
  </div>
  <div class="order" id="order" data-reveal>
    <h3 class="h3">${T(UI.orderTitle, lang)}</h3>
    <p>${T(UI.orderLead, lang)}</p>
    <div class="cta-row">${orderLink(lang)}</div>
    <p class="order__alt">${T(UI.orderEmail, lang)}: <a href="mailto:${SITE.email}" class="ltr">${SITE.email}</a></p>
  </div>
</div>`;
}

// ---------------------------------------------------------------- page chrome
function crumbTrail(page) {
  const trail = [];
  for (let p = page; p; p = p.parent ? byId[p.parent] : null) trail.unshift(p);
  return trail;
}

function header(lang, page) {
  const alt = other(lang), A = LANGS[lang]; // A holds the label/aria for the link that leads to the OTHER language
  const home = byId.home;
  const nav = NAV.map((n) => {
    const target = byId[n.page];
    const isPage = target.id === page.id;
    const isSection = !isPage && crumbTrail(page).some((p) => p.id === target.id);
    return `<a href="${rel(lang, target)}"${isPage ? ' aria-current="page"' : ''}${isSection ? ' class="is-current"' : ''}>${T(n.label, lang)}</a>`;
  }).join('');
  return `<a class="skip" href="#main">${T(UI.skip, lang)}</a>
<header class="site-header">
  <div class="bar">
    <a class="brand" href="${rel(lang, home)}" aria-label="${T(UI.brandAria, lang)}">${MARK}<span class="brand__word">JORDAN <b>TINPLATE</b> CANNING</span></a>
    <nav class="nav" id="primary-nav" aria-label="${T(UI.primaryNav, lang)}">${nav}${orderLink(lang, { cls: 'nav__cta', label: T(UI.quote, lang), icon: '' })}</nav>
    <div class="tools">
      <a class="tool tool--lang" href="${rel(alt, page)}" hreflang="${alt}" lang="${alt}" aria-label="${esc(A.switchAria)}" data-lang-switch>${esc(A.switchLabel)}</a>
      <button class="tool" id="theme-btn" type="button" aria-label="${T(UI.theme, lang)}" aria-pressed="false">
        <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>
        <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>
      </button>
      ${orderLink(lang, { cls: 'btn btn--sm', icon: '' })}
      <button class="burger" id="menu-btn" type="button" aria-label="${T(UI.menu, lang)}" aria-expanded="false" aria-controls="primary-nav"><i></i><i></i></button>
    </div>
  </div>
</header>`;
}

function footer(lang) {
  const inds = PAGES.filter((p) => p.id.startsWith('ind-'));
  const co = ['products', 'capabilities', 'about', 'news', 'contact'].map((id) => byId[id]);
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <a class="brand" href="${rel(lang, byId.home)}" aria-label="${T(UI.brandAria, lang)}">${MARK}<span class="brand__word" style="display:inline">JORDAN <b>TINPLATE</b> CANNING</span></a>
        <p>${T(UI.footBlurb, lang)}</p>
      </div>
      <nav aria-label="${T(UI.footIndustries, lang)}"><h2>${T(UI.footIndustries, lang)}</h2><ul>${inds.map((p) => `<li><a href="${rel(lang, p)}">${T(p.tile.h, lang)}</a></li>`).join('')}</ul></nav>
      <nav aria-label="${T(UI.footCompany, lang)}"><h2>${T(UI.footCompany, lang)}</h2><ul>${co.map((p) => `<li><a href="${rel(lang, p)}">${T(p.crumb, lang)}</a></li>`).join('')}</ul></nav>
      <div><h2>${T(UI.footContact, lang)}</h2><ul>
        <li><a href="tel:${SITE.tel}" class="ltr">${SITE.phone}</a></li>
        <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        ${Object.entries(SITE.social).map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${n}<span class="vh"> (${T(UI.opensNew, lang)})</span></a></li>`).join('')}
      </ul></div>
    </div>
    <div class="foot__base">
      <span>© ${SITE.year} ${esc(brandName(lang))}. ${T(UI.rights, lang)}</span>
      <span>${T(UI.footDraft, lang)}</span>
      <button class="linkbtn" id="review-btn" type="button" aria-pressed="false">${T(UI.review, lang)}</button>
    </div>
  </div>
</footer>`;
}

function hero(lang, page) {
  const h = page.hero, isHome = page.id === 'home';
  const trail = crumbTrail(page);
  const crumbs = isHome ? '' : `<nav class="crumbs" aria-label="${T(UI.breadcrumb, lang)}"><ol>${trail.map((p, i) => i === trail.length - 1 ? `<li><span aria-current="page">${T(p.crumb, lang)}</span></li>` : `<li><a href="${rel(lang, p)}">${T(p.crumb, lang)}</a></li>`).join('')}</ol></nav>`;
  const ctas = (h.ctas || []).map((c) => {
    const { href, ext } = ctaHref(c, lang);
    const label = T(c.label, lang);
    return c.kind === 'ghost'
      ? `<a class="btn btn--ghost" href="${href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}${ext ? DOWN : ''}</a>`
      : `<a class="btn" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}${ext ? `<span class="vh"> (${T(UI.opensNew, lang)})</span>` : ''}${ARROW}</a>`;
  }).join('');
  const stats = h.stats ? `<ul class="stats">${h.stats.map((s) => `<li><b>${T(s.big, lang)}</b><span>${T(s.small, lang)}</span></li>`).join('')}</ul>` : '';
  const showArt = page.id !== 'contact';
  return `<section class="hero ${isHome ? 'hero--home' : 'hero--inner'}">
  <div class="wrap hero__grid">
    <div>
      ${crumbs}
      <p class="eyebrow"><span class="dot"></span>${T(h.eyebrow, lang)}</p>
      <h1 class="h1">${T(h.h1, lang)}</h1>
      <p class="lead">${T(h.lead, lang)}</p>
      ${ctas ? `<div class="cta-row">${ctas}</div>` : ''}
      ${stats}
    </div>
    ${showArt ? `<figure class="hero__art">${art(h.art)}<figcaption class="fine">${T(UI.illus, lang)}</figcaption></figure>` : ''}
  </div>
</section>`;
}

function sections(lang, page) {
  return page.sections.map((s, i) => {
    const id = s.id || `s${i + 1}`;
    const hasTitle = !!s.title;
    const head = hasTitle
      ? `<div class="sec__head" data-reveal>${s.eyebrow ? `<p class="eyebrow"><span class="dot"></span>${T(s.eyebrow, lang)}</p>` : ''}<h2 class="h2" id="${id}-h">${T(s.title, lang)}</h2>${s.intro ? `<p class="lead">${T(s.intro, lang)}</p>` : ''}</div>`
      : '';
    const body = s.blocks.map((b) => renderBlock(b, lang, { hasTitle, id: `${id}` })).join('\n');
    return `<section class="sec" id="${id}"${hasTitle ? ` aria-labelledby="${id}-h"` : ''}>
  <div class="wrap stack">
    ${head}
    ${body}
  </div>
</section>`;
  }).join('\n');
}

function ctaBand(lang) {
  return `<section class="cta" aria-labelledby="cta-h">
  <div class="wrap">
    <div class="panel" data-reveal>
      <p class="eyebrow"><span class="dot"></span>${T(UI.quote, lang)}</p>
      <h2 class="h2" id="cta-h">${T(UI.ctaTitle, lang)}</h2>
      <p class="lead">${T(UI.ctaLead, lang)}</p>
      <div class="cta-row">${orderLink(lang)}<a class="btn btn--ghost" href="mailto:${SITE.email}"><span class="ltr">${SITE.email}</span></a><a class="btn btn--ghost" href="tel:${SITE.tel}"><span class="ltr">${SITE.phone}</span></a></div>
    </div>
  </div>
</section>`;
}

// ---------------------------------------------------------------- structured data
function jsonLd(lang, page) {
  const url = abs(lang, page);
  const org = {
    '@type': 'Organization', '@id': SITE.origin + '/#organization', name: brandName(lang), alternateName: brandName(other(lang)), url: abs('en', byId.home),
    foundingDate: SITE.founded, telephone: SITE.phone, email: SITE.email,
    description: lang === 'ar'
      ? 'علب معدنية مخصّصة لعلامات الأغذية والمشروبات، صناعة أردنية منذ عام 1998.'
      : 'Custom tinplate packaging for food and beverage brands, made in Jordan since 1998.',
    address: { '@type': 'PostalAddress', addressLocality: 'Al-Zmailat – Al-Muwaqqar, Amman', addressCountry: 'JO' },
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 250 },
    contactPoint: { '@type': 'ContactPoint', contactType: 'sales', telephone: SITE.phone, email: SITE.email },
    sameAs: Object.values(SITE.social)
  };
  const site = { '@type': 'WebSite', '@id': SITE.origin + '/#website', url: abs('en', byId.home), name: brandName(lang), alternateName: brandName(other(lang)), inLanguage: L, publisher: { '@id': SITE.origin + '/#organization' } };
  const graph = [org, site];
  const webpage = { '@type': 'WebPage', '@id': url + '#webpage', url, name: tx(page.title, lang), description: tx(page.description, lang), inLanguage: lang, isPartOf: { '@id': SITE.origin + '/#website' } };
  graph.push(webpage);
  if (page.id !== 'home') {
    const trail = crumbTrail(page);
    graph.push({
      '@type': 'BreadcrumbList', '@id': url + '#breadcrumb',
      itemListElement: trail.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: tx(p.crumb, lang), item: abs(lang, p) }))
    });
    webpage.breadcrumb = { '@id': url + '#breadcrumb' };
  }
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 1).replace(/</g, '\\u003c')}</script>`;
}

// ---------------------------------------------------------------- full document
const THEME_SCRIPT = `<script>(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('jt-theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(e){}})()</script>`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=DM+Sans:wght@400;500;600&family=Readex+Pro:wght@300..700&display=swap">`;

function renderPage(lang, page) {
  const Lg = LANGS[lang], alt = other(lang);
  const title = tx(page.title, lang), desc = tx(page.description, lang), url = abs(lang, page);
  const hreflangs = [...L.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(l, page)}">`), `<link rel="alternate" hreflang="x-default" href="${abs('en', page)}">`].join('\n');
  const noCta = page.noCta;
  return `<!doctype html>
<html lang="${lang}" dir="${Lg.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
${hreflangs}
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#213469">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(brandName(lang))}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:locale" content="${Lg.locale}">
<meta property="og:locale:alternate" content="${LANGS[alt].locale}">
<meta property="og:image" content="${OG_IMG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(brandName(lang))}: ${lang === 'ar' ? 'علب معدنية مخصّصة لعلامات الأغذية والمشروبات' : 'custom tinplate packaging for food and beverage brands'}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${OG_IMG}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${THEME_SCRIPT}
${FONTS}
<link rel="stylesheet" href="/assets/css/site.css?v=${V.css}">
${jsonLd(lang, page)}
</head>
<body>
${GRADIENT_DEFS}
${header(lang, page)}
<main id="main" tabindex="-1">
${hero(lang, page)}
${sections(lang, page)}
${noCta ? '' : ctaBand(lang)}
</main>
${footer(lang)}
<script src="/assets/js/site.js?v=${V.js}" defer></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- root files
function write(rel_, content) {
  const f = path.join(ROOT, rel_);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}

function chooser() {
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Jordan Tinplate Canning | English / العربية</title>
<meta name="description" content="Choose your language: Jordan Tinplate Canning, custom tinplate packaging for food and beverage brands. اختر اللغة.">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${SITE.origin}/">
<meta name="theme-color" content="#213469">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${THEME_SCRIPT}
<link rel="stylesheet" href="/assets/css/site.css?v=${V.css}">
<script>(function(){try{var l=localStorage.getItem('jt-lang');if(!l){var n=(navigator.language||'en').toLowerCase();l=n.indexOf('ar')===0?'ar':'en'}if(l==='ar'||l==='en')location.replace('/'+l+'/')}catch(e){}})()</script>
</head>
<body>
<main class="chooser" id="main">
  <div>
    <a class="brand" href="/en/" aria-label="Jordan Tinplate Canning">${MARK}<span class="brand__word" style="display:inline">JORDAN <b>TINPLATE</b> CANNING</span></a>
    <h1>Custom tinplate packaging · علب معدنية مخصّصة</h1>
    <p>Choose your language · اختر اللغة</p>
    <div class="cta-row"><a class="btn" href="/en/" hreflang="en" lang="en">English</a><a class="btn btn--ghost" href="/ar/" hreflang="ar" lang="ar" dir="rtl">العربية</a></div>
  </div>
</main>
</body>
</html>
`;
}

function notFound() {
  return `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found | الصفحة غير موجودة</title>
<meta name="robots" content="noindex">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${THEME_SCRIPT}
<link rel="stylesheet" href="/assets/css/site.css?v=${V.css}">
</head>
<body>
<main class="chooser" id="main">
  <div>
    <h1>Page not found · الصفحة غير موجودة</h1>
    <p>The page you are looking for does not exist or has moved. · الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
    <div class="cta-row"><a class="btn" href="/en/" hreflang="en" lang="en">English home</a><a class="btn btn--ghost" href="/ar/" hreflang="ar" lang="ar" dir="rtl">الصفحة الرئيسية</a></div>
  </div>
</main>
</body>
</html>
`;
}

function sitemap() {
  const urls = [];
  for (const p of PAGES) for (const l of L) {
    urls.push(`  <url>
    <loc>${abs(l, p)}</loc>
${L.map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${abs(x, p)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${abs('en', p)}"/>
  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

const robots = () => `User-agent: *
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`;

// ---------------------------------------------------------------- run
for (const l of L) fs.rmSync(path.join(ROOT, l), { recursive: true, force: true });
let n = 0;
for (const l of L) for (const p of PAGES) { write(`${l}/${p.path}index.html`, renderPage(l, p)); n++; }
write('index.html', chooser());
write('404.html', notFound());
write('sitemap.xml', sitemap());
write('robots.txt', robots());
console.log(`built ${n} pages (${L.join(', ')}) for ${SITE.origin}`);
