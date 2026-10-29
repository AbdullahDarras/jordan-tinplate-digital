#!/usr/bin/env node
// Website v2: the inner pages. Reads the approved copy from website/tools/content.mjs (the single source of truth for both
// sites, EN and AR) and writes website-v2/en/<path>/index.html and website-v2/ar/<path>/index.html in the v2 design: a 3D hero
// (the page title as a wall in the studio, the page's real tins in front), the finish lab, the shapes lab, the sheet-to-shelf
// journey, and the same header, CTA band and footer as the home film.
//   node website-v2/tools/build.mjs
// Items that wait for management stay hidden while SHOW_PENDING is false (see website/PENDING.md). All URLs are relative, so the
// folder works from any base path.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOGO as LOGOS } from '../../website/tools/logo.mjs';
import { SITE, UI, PAGES as ALL, NEWS, NAV, FINISH_LAB, SHAPES_LAB, RANGE, IND_LIST, STORY, STEPS, CERTS, VIDEOS, PHOTOS, GALLERY, SHOW_PENDING } from '../../website/tools/content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['en', 'ar'];
const keep = (b) => SHOW_PENDING || b.k !== 'tbc';
const PAGES = ALL.map((p) => (SHOW_PENDING ? p : {
  ...p,
  sections: p.sections.map((s) => (s.blocks ? { ...s, blocks: s.blocks.filter(keep).map((b) => (b.k === 'specs' ? { ...b, rows: b.rows.filter((r) => !r.tbc) } : b)) } : s))
    .filter((s) => !s.blocks || s.blocks.length)
}));
const byId = Object.fromEntries(PAGES.map((p) => [p.id, p]));
const t2 = (en, ar) => ({ en, ar });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const T = (v, l) => esc(v && typeof v === 'object' ? v[l] : v ?? '');
const pad2 = (n) => String(n).padStart(2, '0');
const other = (l) => (l === 'en' ? 'ar' : 'en');

// the logo, as inlined in the home page (brand/logo/logo-horizontal.svg, currentColor)
const HOME = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const LOGO = HOME.match(/<svg fill="currentColor"[^>]*viewBox="0 0 1016\.89 275\.9">[\s\S]*?<\/svg>/)[0];

// ---------------------------------------------------------------- the tins each page shows (real tins from our lines; the paint can is illustrative)
const HERO_TINS = {
  // (the olive-oil tin is Malka Olive Press's 4 L tin, from its photos)
  products: ['abed', 'qaisi', 'levelmax'], 'ind-olive': ['oil'], 'ind-dairy': ['maeen', 'abed'], 'ind-sweets': ['jgz', 'sharqi', 'bab'],
  'ind-cheese': ['laqmi'], 'ind-coffee': ['levelmax', 'suliman'], 'ind-industrial': ['paint'], capabilities: ['qaisi'],
  about: ['sufyan'], gallery: ['jgz'], news: ['bab'], contact: ['qaisi']
};
const ILLUS = new Set(['paint']);  // the paint can carries sample artwork; every other tin is a real one
// card pictures: renders of the same 3D tins (assets/img/renders, made by tools/renders.mjs)
const TILE_TIN = { 'ind-olive': 'oil', 'ind-dairy': 'maeen', 'ind-sweets': 'sharqi', 'ind-cheese': 'laqmi', 'ind-coffee': 'levelmax', 'ind-industrial': 'paint' };
const RANGE_TIN = [ 'qaisi', 'abed', 'maeen', null, 'najmah', null, 'paint' ];
// the shapes lab: the shapes we can show with a real tin of that shape
const SHAPE_TIN = { round: 'qaisi', octagon: 'najmah', square: 'bab', rect: 'jgz', bucket: 'frieds', can: 'abed', cheese: 'laqmi', tall: 'suliman' };
const RENDERS = new Set(fs.existsSync(path.join(ROOT, 'assets/img/renders')) ? fs.readdirSync(path.join(ROOT, 'assets/img/renders')).map((f) => f.replace(/\.(png|webp)$/, '')) : []);

// ---------------------------------------------------------------- links
const ctx = { lang: 'en', page: null, pre: '' };
const pageHref = (id, lang = ctx.lang) => (id === 'home' ? `${ctx.pre}index.html${lang === 'ar' ? '?lang=ar' : ''}` : `${ctx.pre}${lang}/${byId[id].path}index.html`); // explicit index.html: works on any static host, folders or not
const EXT = '<svg class="ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function link(to, label, cls = 'go') {
  const l = ctx.lang;
  if (to === 'order') return `<a class="${cls}" href="${SITE.orderUrl}" target="_blank" rel="noopener"><span>${T(label, l)}</span>${ARROW}<span class="vh"> (${T(UI.opensNew, l)})</span></a>`;
  if (to === 'catalogue') return `<a class="${cls}" href="${SITE.catalogue}" target="_blank" rel="noopener"><span>${T(label, l)}</span>${EXT}<span class="vh"> (${T(UI.opensNew, l)})</span></a>`;
  return `<a class="${cls}" href="${pageHref(to)}"><span>${T(label, l)}</span>${ARROW}</a>`;
}
const GEAR_SVG = `<svg class="gear" viewBox="0 0 274 275.9" aria-hidden="true" focusable="false"><path d="${LOGOS.H.gear}"/></svg>`;
// a card without a tin picture: a tinplate panel with the gear mark
const ph = () => `<div class="card__ph" aria-hidden="true">${GEAR_SVG}</div>`;
const img = (key, cls = 'render') => (RENDERS.has(key) ? `<img class="${cls}" src="${ctx.pre}assets/img/renders/${key}.webp" alt="" width="800" height="640" loading="lazy" decoding="async">` : '');

// ---------------------------------------------------------------- chrome
function header(page) {
  const l = ctx.lang;
  const nav = [{ key: 'home', page: 'home', label: byId.home.crumb }, ...NAV].map((n) => `<li><a href="${pageHref(n.page)}"${page.navKey === n.key ? ' aria-current="page"' : ''}>${T(n.label, l)}</a></li>`).join('');
  return `<header class="top top--page" id="top">
  <a class="top__brand" href="${pageHref('home')}" aria-label="${T(UI.brandAria, l)}">${LOGO}</a>
  <nav class="top__nav" aria-label="${T(UI.primaryNav, l)}"><ul>${nav}</ul></nav>
  <div class="top__tools">
    <a class="pill" id="langLink" href="${pageHref(page.id, other(l))}" hreflang="${other(l)}" lang="${other(l)}" data-lang="${other(l)}" aria-label="${l === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}">${l === 'ar' ? 'English' : 'عربي'}</a>
    <button class="pill pill--icon" id="modeBtn" type="button" aria-label="${T(UI.theme, l)}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg></button>
    <a class="pill pill--solid" href="${SITE.orderUrl}" target="_blank" rel="noopener">${T(UI.quote, l)}</a>
    <button class="pill pill--icon menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu" aria-label="${T(UI.menu, l)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg></button>
  </div>
</header>
<div class="menu" id="menu" hidden><nav aria-label="${T(UI.switchMenu, l)}"><ul>${[{ page: 'home', label: byId.home.crumb }, ...NAV].map((n, i) => `<li><a href="${pageHref(n.page)}"><span class="num">${pad2(i + 1)}</span>${T(n.label, l)}</a></li>`).join('')}</ul></nav></div>`;
}
function crumbs(page) {
  const chain = []; let p = page; while (p) { chain.unshift(p); p = p.parent ? byId[p.parent] : null; }
  return `<nav class="crumbs" aria-label="${T(UI.breadcrumb, ctx.lang)}"><ol>${chain.map((c, i) => (i < chain.length - 1 ? `<li><a href="${pageHref(c.id)}">${T(c.crumb, ctx.lang)}</a></li>` : `<li aria-current="page">${T(c.crumb, ctx.lang)}</li>`)).join('')}</ol></nav>`;
}
function hero(page) {
  const l = ctx.lang, h = page.hero, tins = HERO_TINS[page.id] || ['qaisi'];
  const ctas = (h.ctas || []).map((c, i) => (c.to === 'order' ? link('order', c.label, 'btn') : link(c.to, c.label, 'btn btn--ghost'))).join('');
  const illus = tins.some((k) => ILLUS.has(k)) ? `<p class="fine">${T(t2('The 3D tin is illustrative: plain tinplate or sample artwork, not a client design.', 'العلبة ثلاثية الأبعاد توضيحية: صفيح سادة أو تصميم نموذجي، وليست تصميم عميل.'), l)}</p>` : '';
  return `<section class="phero" aria-labelledby="h1">
  <canvas class="phero__gl" data-stage="hero" data-tins="${tins.join(',')}" aria-hidden="true"></canvas>
  <div class="phero__ov">
    ${crumbs(page)}
    <h1 class="mega" id="h1">${T(h.h1, l)}</h1>
    <div class="hero__bar phero__bar">
      <div class="hero__intro">
        <p class="kick">${T(h.eyebrow, l)}</p>
        ${h.lead ? `<p class="lead">${T(h.lead, l)}</p>` : ''}
        ${illus}
      </div>
      <div class="phero__ctas">${ctas}</div>
    </div>
  </div>
</section>`;
}
function ctaBand() {
  const l = ctx.lang;
  return `<section class="cta" id="contact">
  <div class="sect__in">
    <h2 class="cta__h">${T(UI.ctaTitle, l)}</h2>
    <p class="lead">${T(UI.ctaLead, l)}</p>
    ${link('order', UI.quote, 'btn')}
    ${contactList()}
  </div>
</section>`;
}
const contactList = () => { const l = ctx.lang; return `<dl class="contact">
      <div><dt>${T(UI.mail, l)}</dt><dd class="num"><a href="mailto:${SITE.email}">${SITE.email}</a></dd></div>
      <div><dt>${T(UI.phone, l)}</dt><dd class="num" dir="ltr"><a href="tel:${SITE.tel}">${SITE.phone}</a></dd></div>
      <div><dt>${T(UI.address, l)}</dt><dd>${T(UI.addressArea, l)}</dd></div>
    </dl>`; };
function footer() {
  const l = ctx.lang;
  const inds = PAGES.filter((p) => p.parent === 'products').map((p) => `<li><a href="${pageHref(p.id)}">${T(p.crumb, l)}</a></li>`).join('');
  const comp = NAV.map((n) => `<li><a href="${pageHref(n.page)}">${T(n.label, l)}</a></li>`).join('');
  return `<footer class="foot foot--page">
  <div class="sect__in foot__grid">
    <div class="foot__id">
      <span class="foot__logo">${LOGO}</span>
      <p class="foot__blurb">${T(UI.footBlurb, l)}</p>
      <p class="foot__social">${Object.entries(SITE.social).map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener">${k}</a>`).join('')}</p>
    </div>
    <div><p class="foot__h">${T(UI.footIndustries, l)}</p><ul>${inds}</ul></div>
    <div><p class="foot__h">${T(UI.footCompany, l)}</p><ul>${comp}</ul></div>
    <div><p class="foot__h">${T(UI.footContact, l)}</p><ul><li class="num"><a href="mailto:${SITE.email}">${SITE.email}</a></li><li class="num" dir="ltr"><a href="tel:${SITE.tel}">${SITE.phone}</a></li><li>${T(UI.addressArea, l)}</li></ul></div>
  </div>
  <div class="sect__in foot__in"><p class="foot__name"><b>Jordan Tinplate Canning</b><span lang="ar" dir="rtl">${esc(SITE.nameAr)}</span></p><p class="foot__c">© ${SITE.year} Jordan Tinplate Canning. ${T(UI.rights, l)}</p></div>
</footer>`;
}

// ---------------------------------------------------------------- sections
const head = (s, def = {}) => {
  const l = ctx.lang, k = s.eyebrow || def.eyebrow, ti = s.title || def.title, intro = s.intro || def.intro;
  return (k || ti) ? `<header class="sec__head">${k ? `<p class="kick">${T(k, l)}</p>` : ''}${ti ? `<h2 class="big">${T(ti, l)}</h2>` : ''}${intro ? `<p class="lead">${T(intro, l)}</p>` : ''}</header>` : '';
};
const ARTKEY = { round: 'qaisi', square: 'bab', rect: 'jgz', can: 'abed', oil: 'oil', oval: null };
const BLOCKS = {
  cards: (b) => `<div class="cards cards--${b.cols || 3}">${b.items.map((c, i) => `<article class="card${c.soon ? ' card--soon' : ''}">${c.art && ARTKEY[c.art] ? img(ARTKEY[c.art], 'card__img') : ''}<span class="card__n" dir="ltr">${pad2(i + 1)}</span><h3>${T(c.h, ctx.lang)}</h3><p>${T(c.p, ctx.lang)}</p>${c.meta ? `<p class="card__meta num">${T(c.meta, ctx.lang)}</p>` : ''}</article>`).join('')}</div>`,
  specs: (b) => `<dl class="specs">${b.rows.map((r) => `<div class="spec">${r.art && ARTKEY[r.art] ? img(ARTKEY[r.art], 'spec__img') : '<span class="spec__img spec__img--none" aria-hidden="true"></span>'}<dt>${T(r.k, ctx.lang)}</dt><dd><b class="num">${T(r.v, ctx.lang)}</b>${r.note ? `<span>${T(r.note, ctx.lang)}</span>` : ''}</dd></div>`).join('')}</dl>`,
  prose: (b) => `<div class="prose">${b.ps.map((p) => `<p>${T(p, ctx.lang)}</p>`).join('')}</div>`,
  link: (b) => `<p class="more">${link(b.to, b.label)}</p>`,
  tbc: (b) => `<div class="tbc"><p class="kick">${T(b.title, ctx.lang)}</p><ul>${b.items.map((x) => `<li>${T(x, ctx.lang)}</li>`).join('')}</ul></div>`
};
const sect = (id, cls, inner) => `<section class="sect ${cls}"${id ? ` id="${id}"` : ''}><div class="sect__in">${inner}</div></section>`;

const KINDS = {
  industries(s) {
    const l = ctx.lang, inds = PAGES.filter((p) => p.parent === 'products');
    return sect(s.id, 'sect--tiles', head(s, IND_LIST) + `<ul class="tiles">${inds.map((p, i) => `<li><a class="tile" href="${pageHref(p.id)}">${img(TILE_TIN[p.id], 'tile__img')}<span class="tile__n" dir="ltr">${pad2(i + 1)}</span><b>${T(p.tile.h, l)}</b><span>${T(p.tile.p, l)}</span><i class="tile__go">${ARROW}</i></a></li>`).join('')}</ul>`);
  },
  range(s) {
    return sect(s.id, '', head(s, RANGE) + `<div class="cards cards--range">${RANGE.cards.map((c, i) => `<article class="card">${RANGE_TIN[i] ? img(RANGE_TIN[i], 'card__img') : ph()}<span class="card__n" dir="ltr">${pad2(i + 1)}</span><h3>${T(c.h, ctx.lang)}</h3><p>${T(c.p, ctx.lang)}</p>${c.meta ? `<p class="card__meta num">${T(c.meta, ctx.lang)}</p>` : ''}</article>`).join('')}</div>`);
  },
  finish(s) {
    const l = ctx.lang;
    const chips = FINISH_LAB.items.map((it, i) => (it.soon
      ? `<button type="button" class="chip chip--soon" disabled aria-disabled="true"><span lang="en">${T(it.label, l)}</span> <small>${T(UI.soon, l)}</small></button>`
      : `<button type="button" class="chip" data-fin="${it.id}" data-desc="${T(it.desc, l)}" aria-pressed="${i === 0}">${T(it.label, l)}</button>`)).join('');
    return `<section class="sect lab" id="${s.id}"><div class="sect__in lab__grid">
  <div class="lab__stage"><canvas data-stage="lab" data-tin="qaisi" aria-label="${T(FINISH_LAB.aria, l)}" role="img"></canvas><p class="fine lab__hint">${T(UI.dragTin, l)}</p></div>
  <div class="lab__text">
    ${head(s, FINISH_LAB)}
    <p class="lead">${T(FINISH_LAB.lead, l)}</p>
    <div class="chips" role="group" aria-label="${T(FINISH_LAB.chipsAria, l)}">${chips}</div>
    <p class="lab__desc" aria-live="polite">${T(FINISH_LAB.items[0].desc, l)}</p>
    <div class="plate"><h3>${T(FINISH_LAB.plate.h, l)}</h3><p>${T(FINISH_LAB.plate.p, l)}</p></div>
  </div>
</div></section>`;
  },
  shapes(s) {
    const l = ctx.lang, items = SHAPES_LAB.items.filter((it) => SHAPE_TIN[it.id]);
    const chips = items.map((it, i) => `<button type="button" class="chip" data-tin="${SHAPE_TIN[it.id]}" aria-pressed="${i === 0}" aria-controls="pane-${it.id}">${T(it.label, l)}</button>`).join('');
    const panes = items.map((it, i) => `<div class="pane${i === 0 ? ' on' : ''}" id="pane-${it.id}" data-tin="${SHAPE_TIN[it.id]}"><p class="pane__k">${T(it.name, l)}</p><p class="pane__v num">${T(it.dim, l)}</p><p>${T(it.note, l)}</p></div>`).join('');
    const after = (s.after || []).map((b) => BLOCKS[b.k](b)).join('');
    return `<section class="sect lab lab--flip" id="${s.id}"><div class="sect__in lab__grid">
  <div class="lab__stage"><canvas data-stage="lab" data-tin="${SHAPE_TIN[items[0].id]}" aria-label="${T(SHAPES_LAB.aria, l)}" role="img"></canvas><p class="fine lab__hint">${T(UI.dragTin, l)}</p></div>
  <div class="lab__text">
    ${head(s, SHAPES_LAB)}
    <div class="chips" role="group" aria-label="${T(SHAPES_LAB.chipsAria, l)}">${chips}</div>
    <div class="panes" aria-live="polite">${panes}</div>
    <p class="fine">${T(t2('Every 3D tin here is a tin we have made, at its real proportions and with its real lid. Custom sizes are available on request.', 'كل علبة ثلاثية الأبعاد هنا علبة صنعناها فعلاً، بنسبها الحقيقية وغطائها الحقيقي. والمقاسات الخاصة متاحة عند الطلب.'), l)}</p>
    ${after}
  </div>
</div></section>`;
  },
  journey(s) {
    const l = ctx.lang;
    return `<section class="jfilm" id="${s.id}" aria-labelledby="${s.id}-h">
  <div class="jfilm__stage">
    <canvas data-stage="journey" aria-hidden="true"></canvas>
    <div class="ov ov--side ov--flow on">
      <p class="kick">${T(s.eyebrow || t2('One roof, one partner', 'سقف واحد، شريك واحد'), l)}</p>
      <h2 class="big" id="${s.id}-h">${T(s.title || t2('From sheet to shelf.', 'من الصفيحة إلى الرف.'), l)}</h2>
      <div class="flow" aria-live="polite">${STEPS.map((st, i) => `<article class="flow__step${i ? '' : ' on'}"><span class="flow__n" dir="ltr">${pad2(i + 1)}</span><h3>${T(st.h, l)}</h3><p>${T(st.p, l)}</p></article>`).join('')}</div>
      <div class="flow__rail" aria-hidden="true"><i></i>${STEPS.map(() => '<b></b>').join('')}</div>
    </div>
  </div>
</section>`;
  },
  story(s) {
    const l = ctx.lang, stats = byId.about.hero.stats;
    return sect(s.id, 'sect--story', `<div class="story story--one">
  <div>
    <p class="kick">${T(STORY.eyebrow, l)}</p>
    <h2 class="big">${T(s.title || STORY.title, l)}</h2>
    <p class="lead">${T(STORY.p1, l)}</p>
    <div class="prose"><p>${T(STORY.vision, l)}</p><p>${T(STORY.p2, l)}</p></div>
  </div>
  <dl class="facts">${stats.map((x) => `<div><dt class="num">${T(x.big, l)}</dt><dd>${T(x.small, l)}</dd></div>`).join('')}</dl>
</div>`);
  },
  certs(s) {
    const l = ctx.lang;
    return sect(s.id, 'sect--certs', `<header class="sec__head"><p class="kick">${T(CERTS.title, l)}</p></header><div class="certs certs--row">${CERTS.items.map((c) => `<figure><img src="${ctx.pre}${c.file.replace(/^\//, '')}.webp" width="${c.w}" height="${c.h}" loading="lazy" alt="${T(c.alt, l)}"><figcaption><b>${T(c.name, l)}</b>${c.sub ? `<span>${T(c.sub, l)}</span>` : ''}</figcaption></figure>`).join('')}</div>`);
  },
  featuredVideo(s) {
    const l = ctx.lang, v = VIDEOS.find((x) => x.id === SITE.mainVideoId) || VIDEOS[0];
    return sect(s.id, 'sect--video', head({}, { eyebrow: GALLERY.featured.eyebrow, title: GALLERY.featured.title }) + facade(v.id, v.label, true));
  },
  videos(s) {
    const l = ctx.lang;
    const fb = `<a class="vcard vcard--fb" href="${SITE.social.Facebook}" target="_blank" rel="noopener"><span class="kick">${T(GALLERY.fb.tag, l)}</span><b>${T(GALLERY.fb.h, l)}</b><span>${T(GALLERY.fb.p, l)}</span><span class="go"><span>${T(GALLERY.fb.cta, l)}</span>${EXT}</span></a>`;
    return sect(s.id, '', head({}, { title: GALLERY.videosTitle }) + `<div class="vids">${VIDEOS.map((v) => facade(v.id, v.label)).join('')}${fb}</div>`);
  },
  photos(s) {
    if (!PHOTOS.length) return '';
    return sect(s.id, '', head({}, { title: GALLERY.photosTitle }) + `<div class="photos">${PHOTOS.map((p) => `<img src="${ctx.pre}${p.src.replace(/^\//, '')}" alt="${esc(ctx.lang === 'ar' ? p.alt_ar : p.alt_en)}" loading="lazy">`).join('')}</div>`);
  },
  news(s) {
    const l = ctx.lang, items = NEWS.slice(0, s.limit || NEWS.length);
    return sect(s.id, '', `<div class="news">${items.map((n, i) => `<article class="card news__card"><span class="card__n" dir="ltr">${pad2(i + 1)}</span><p class="kick">${T(n.tag, l)}</p><h3>${T(n.h, l)}</h3><p>${T(n.p, l)}</p>${n.href ? `<p class="more"><a class="go" href="${n.href}" target="_blank" rel="noopener"><span>${T(UI.read, l)}</span>${EXT}<span class="vh"> (${T(UI.opensNew, l)})</span></a></p>` : ''}</article>`).join('')}</div>`);
  }
};
function facade(id, label, big = false) {
  const l = ctx.lang, name = T(label, l);
  return `<div class="vid${big ? ' vid--big' : ''}" data-vid="${id}" data-title="${name}">
    <a class="vid__play" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener" aria-label="${T(UI.playVideo, l)}: ${name}">
      <img class="vid__poster" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async" referrerpolicy="no-referrer">
      <span class="vid__btn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
      <span class="vid__t">${name}</span>
    </a>
  </div>`;
}
function contactPage() {
  const l = ctx.lang;
  return sect('reach', 'sect--reach', `<div class="reach">
  <a class="reach__order" href="${SITE.orderUrl}" target="_blank" rel="noopener"><span class="kick">${T(UI.quote, l)}</span><b>${T(UI.orderTitle, l)}</b><span>${T(UI.orderLead, l)}</span><i class="tile__go">${ARROW}</i></a>
  <a class="reach__card" href="mailto:${SITE.email}"><span class="kick">${T(UI.mail, l)}</span><b class="num">${SITE.email}</b></a>
  <a class="reach__card" href="tel:${SITE.tel}"><span class="kick">${T(UI.phone, l)}</span><b class="num" dir="ltr">${SITE.phone}</b></a>
  <div class="reach__card"><span class="kick">${T(UI.address, l)}</span><b>${T(UI.addressArea, l)}</b></div>
</div>
<p class="more">${link('catalogue', UI.catalogue)}</p>`);
}
function section(s) {
  if (s.kind) return KINDS[s.kind] ? KINDS[s.kind](s) : '';
  const split = s.blocks.every((b) => b.k === 'prose' || b.k === 'link') && (s.title || s.eyebrow);
  if (split) return sect(s.id, 'sect--split', `<div class="split">${head(s)}<div>${s.blocks.map((b) => BLOCKS[b.k](b)).join('')}</div></div>`);
  return sect(s.id, '', head(s) + s.blocks.map((b) => BLOCKS[b.k](b)).join(''));
}

// ---------------------------------------------------------------- the page
function render(page, lang) {
  ctx.lang = lang; ctx.page = page; ctx.pre = '../'.repeat(1 + page.path.split('/').filter(Boolean).length);
  const dir = lang === 'ar' ? 'rtl' : 'ltr', pre = ctx.pre;
  const body = page.id === 'contact' ? contactPage() : page.sections.map(section).join('\n');
  const related = page.parent === 'products'
    ? sect('', 'sect--related', `<p class="kick">${T(UI.related, lang)}</p><ul class="chips chips--links">${PAGES.filter((p) => p.parent === 'products' && p.id !== page.id).map((p) => `<li><a class="chip" href="${pageHref(p.id)}">${T(p.crumb, lang)}</a></li>`).join('')}</ul>`) : '';
  return `<!doctype html>
<html lang="${lang}" dir="${dir}" data-mode="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${T(page.title, lang)}</title>
<meta name="description" content="${T(page.description, lang)}">
<meta name="theme-color" content="#002F6C">
<link rel="alternate" hreflang="${other(lang)}" href="${pageHref(page.id, other(lang))}">
<link rel="icon" href="${pre}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=DM+Sans:opsz,wght@9..40,400..600&family=Readex+Pro:wght@300..700&display=swap">
<link rel="stylesheet" href="${pre}assets/css/v3.css">
<link rel="stylesheet" href="${pre}assets/css/pages.css">
<script>
(function(){var d=document.documentElement,q=new URLSearchParams(location.search),m='light';
try{m=localStorage.getItem('jt2-mode')||'light';localStorage.setItem('jt2-lang','${lang}')}catch(e){}
if(q.get('mode')==='dark'||q.get('mode')==='light')m=q.get('mode');d.setAttribute('data-mode',m);d.classList.add('js')})();
</script>
<script type="importmap">{"imports":{"three":"${pre}assets/vendor/three/three.module.min.js","three/addons/":"${pre}assets/vendor/three/addons/"}}</script>
</head>
<body class="page" data-page="${page.id}">
<a class="skip" href="#main">${T(UI.skip, lang)}</a>
${header(page)}
<main id="main">
${hero(page)}
${body}
${related}
${page.noCta ? '' : ctaBand()}
</main>
${footer()}
<script src="${pre}assets/vendor/gsap/gsap.min.js"></script>
<script src="${pre}assets/vendor/lenis/lenis.min.js"></script>
<script type="module" src="${pre}assets/js/page.js"></script>
</body>
</html>
`;
}

let n = 0;
for (const page of PAGES) {
  if (page.id === 'home') continue;
  for (const lang of LANGS) {
    const out = path.join(ROOT, lang, page.path, 'index.html');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, render(page, lang)); n++;
  }
}

// the home page's header gets the same navigation (between markers in index.html; app.js switches the links' language)
{
  ctx.pre = ''; ctx.lang = 'en';
  // the home tab first; on the home page itself it is the current page and stays on index.html
  const items = [{ key: 'home', path: '', en: byId.home.crumb.en, ar: byId.home.crumb.ar }, ...NAV.map((x) => ({ key: x.key, path: byId[x.page].path + 'index.html', en: x.label.en, ar: x.label.ar }))];
  const nav = `<!--nav--><nav class="top__nav" aria-label="Primary" data-i18n-aria="primaryNav"><ul>${items.map((x) => (x.key === 'home' ? `<li><a href="index.html" aria-current="page" data-i18n="nav.home">${esc(x.en)}</a></li>` : `<li><a href="en/${x.path}" data-path="${x.path}" data-i18n="nav.${x.key}">${esc(x.en)}</a></li>`)).join('')}</ul></nav><!--/nav-->`;
  const btn = `<!--menubtn--><button class="pill pill--icon menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="menu" aria-label="Menu" data-i18n-aria="menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg></button><!--/menubtn-->`;
  const menu = `<!--menu--><div class="menu" id="menu" hidden><nav aria-label="Main menu" data-i18n-aria="menu"><ul>${items.map((x, i) => `<li><a href="${x.key === 'home' ? 'index.html' : `en/${x.path}`}"${x.key === 'home' ? '' : ` data-path="${x.path}"`}><span class="num">${pad2(i + 1)}</span><span data-i18n="nav.${x.key}">${esc(x.en)}</span></a></li>`).join('')}</ul></nav></div><!--/menu-->`;
  let h = HOME;
  const put = (mark, html, fallback) => { const re = new RegExp(`<!--${mark}-->[\\s\\S]*?<!--/${mark}-->`); h = re.test(h) ? h.replace(re, html) : fallback(h, html); };
  put('nav', nav, (x, v) => x.replace('  <div class="top__tools">', `  ${v}\n  <div class="top__tools">`));
  put('menubtn', btn, (x, v) => x.replace(/(<a class="pill pill--solid"[^\n]*\n)(  <\/div>\n<\/header>)/, `$1    ${v}\n$2`));
  put('menu', menu, (x, v) => x.replace('</header>\n', `</header>\n${v}\n`));
  fs.writeFileSync(path.join(ROOT, 'index.html'), h);
  const ar = Object.fromEntries(items.map((x) => [`nav.${x.key}`, x.ar]));
  fs.writeFileSync(path.join(ROOT, 'assets/js/nav-ar.js'), `// GENERATED by tools/build.mjs: the Arabic labels of the home page's navigation\nexport const NAV_AR = ${JSON.stringify({ ...ar, primaryNav: UI.primaryNav.ar, menu: UI.menu.ar })};\n`);
}
console.log(`wrote ${n} pages`);
