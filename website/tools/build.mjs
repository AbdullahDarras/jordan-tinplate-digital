#!/usr/bin/env node
// Static site generator for Jordan Tinplate Canning. No dependencies.
//   node website/tools/build.mjs            (SITE_URL=https://example.com node ... to override the production origin)
// Reads tools/content.mjs, writes en/, ar/, sitemap.xml, robots.txt, index.html (language chooser), 404.html.
// The generated files are committed; re-run this script after editing content.mjs.
//
// Every page (home and inner) shares one chrome: header, footer, tokens, cursor, page transitions and the 3D "stage" engine
// (assets/js/engine/). All text is written into the HTML at build time, in the page's own language: the 3D layer, the
// entrance, the animations and the lab controls are progressive enhancements on top of readable, linkable pages.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SITE, LANGS, UI, PAGES as ALL_PAGES, NEWS, NAV, MARQUEE, FINISH_LAB, SHAPES_LAB, RANGE, IND_LIST, SEASONS, STORY, STEPS, PROOF_TBC, CERTS, VIDEOS, PHOTOS, GALLERY, SHOW_PENDING } from './content.mjs';
import { logoSprite, logoSvg } from './logo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const L = Object.keys(LANGS);                       // ['en', 'ar']
// Items that wait for management (blocks of kind 'tbc', rows with tbc: true, the proof boxes, the draft notice) are hidden unless
// SHOW_PENDING is true in content.mjs. A section whose blocks are all hidden disappears with them. See website/PENDING.md.
const keepBlock = (b) => SHOW_PENDING || b.k !== 'tbc';
const PAGES = ALL_PAGES.map((p) => SHOW_PENDING ? p : ({
  ...p,
  sections: p.sections
    .map((s) => (s.blocks ? { ...s, blocks: s.blocks.filter(keepBlock).map((b) => (b.k === 'specs' ? { ...b, rows: b.rows.filter((r) => !r.tbc) } : b)) } : s))
    .filter((s) => !s.blocks || s.blocks.length)
}));
const byId = Object.fromEntries(PAGES.map((p) => [p.id, p]));

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tx = (v, lang) => (v && typeof v === 'object' ? v[lang] : v);        // bilingual object -> string
const T = (v, lang) => esc(tx(v, lang));
const rel = (lang, page) => `/${lang}/${page.path}`;                          // site-relative URL
const abs = (lang, page) => SITE.origin + rel(lang, page);
const other = (lang) => L.find((l) => l !== lang);
const hashOf = (f) => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 8);
const V = { css: hashOf('assets/css/site.css'), pend: hashOf('assets/css/pending.css'), js: hashOf('assets/js/site.js'), eng: hashOf('assets/js/engine/main.js') };
const brandName = (lang) => (lang === 'ar' ? SITE.nameAr : SITE.name);   // display name per language
const OG_IMG = SITE.origin + '/assets/img/og-default.png';
const pad2 = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------- tin illustrations (inline SVG): the no-3D fallback inside every stage
const ART = {
  round: `<ellipse class="a-shadow" cx="100" cy="150" rx="82" ry="18"/><path class="a-body" d="M20 60V120C20 133 56 144 100 144S180 133 180 120V60Z"/><path class="a-band" d="M20 84C20 97 56 108 100 108S180 97 180 84V102C180 115 144 126 100 126S20 115 20 102Z"/><ellipse class="a-top" cx="100" cy="60" rx="80" ry="24"/><ellipse class="a-ln" cx="100" cy="60" rx="64" ry="18"/><use class="a-gear" href="#lg-gear" transform="translate(80 85) scale(.145)"/>`,
  oval: `<ellipse class="a-shadow" cx="100" cy="148" rx="90" ry="16"/><path class="a-body" d="M14 64V104C14 124 52 140 100 140S186 124 186 104V64Z"/><path class="a-band" d="M14 84C14 104 52 118 100 118S186 104 186 84V98C186 118 148 132 100 132S14 118 14 98Z"/><ellipse class="a-top" cx="100" cy="64" rx="86" ry="32"/><ellipse class="a-ln" cx="100" cy="64" rx="70" ry="25"/>`,
  square: `<ellipse class="a-shadow" cx="100" cy="162" rx="84" ry="12"/><path class="a-l" d="M24 62L100 94V160L24 128Z"/><path class="a-r" d="M176 62L100 94V160L176 128Z"/><path class="a-band" d="M24 90L100 122V138L24 106Z"/><path class="a-band2" d="M176 90L100 122V138L176 106Z"/><path class="a-top" d="M100 30L176 62L100 94L24 62Z"/><path class="a-ln" d="M100 42L162 68L100 86L38 68Z"/>`,
  rect: `<ellipse class="a-shadow" cx="100" cy="160" rx="88" ry="12"/><path class="a-l" d="M14 74L88 104V150L14 120Z"/><path class="a-r" d="M186 62L88 104V150L186 108Z"/><path class="a-band" d="M14 96L88 126V138L14 108Z"/><path class="a-band2" d="M186 82L88 124V136L186 94Z"/><path class="a-top" d="M14 74L112 32L186 62L88 104Z"/><path class="a-ln" d="M34 74L112 42L168 63L90 94Z"/>`,
  can: `<ellipse class="a-shadow" cx="100" cy="166" rx="56" ry="10"/><path class="a-body" d="M56 40V146C56 156 76 164 100 164S144 156 144 146V40Z"/><path class="a-band" d="M56 76C56 86 76 94 100 94S144 86 144 76V108C144 118 124 126 100 126S56 118 56 108Z"/><ellipse class="a-top" cx="100" cy="40" rx="44" ry="12"/><ellipse class="a-ln" cx="100" cy="40" rx="34" ry="8"/><use class="a-gear" href="#lg-gear" transform="translate(82 96) scale(.13)"/>`,
  oil: `<ellipse class="a-shadow" cx="100" cy="170" rx="58" ry="8"/><path class="a-l" d="M52 70H148V158Q148 168 138 168H62Q52 168 52 158Z"/><path class="a-band" d="M52 100H148V136H52Z"/><path class="a-top" d="M52 70L78 44H122L148 70Z"/><rect class="a-r" x="92" y="22" width="16" height="24"/><rect class="a-band2" x="87" y="14" width="26" height="9" rx="3"/><path class="a-ln2" d="M126 52C172 34 178 84 148 88"/>`
};
const SHAPE_ART = { round: 'round', square: 'square', rect: 'rect', oval: 'oval', oil: 'oil', oil1: 'oil', oil4: 'oil', oil8: 'oil', oil16: 'oil', can: 'can', cheese: 'can', tuna: 'oval', milk: 'can', box70: 'square', tall: 'square', coffee: 'square', paint: 'can' };
const art = (key, cls = '') => {
  if (key === 'hero') {
    return `<svg class="art ${cls}" viewBox="0 0 520 420" aria-hidden="true" focusable="false"><svg x="240" y="8" width="250" height="225" viewBox="0 0 200 180">${ART.can}</svg><svg x="0" y="130" width="320" height="288" viewBox="0 0 200 180">${ART.round}</svg><svg x="300" y="210" width="210" height="190" viewBox="0 0 200 180">${ART.square}</svg></svg>`;
  }
  return `<svg class="art ${cls}" viewBox="0 0 200 180" aria-hidden="true" focusable="false">${ART[key] || ART.round}</svg>`;
};
const GRADIENT_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="g-body" x1="0" x2="1" y1="0" y2="0"><stop offset="0" class="stop-a"/><stop offset=".38" class="stop-b"/><stop offset=".7" class="stop-c"/><stop offset="1" class="stop-a"/></linearGradient></defs></svg>`;
const ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const DOWN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>`;
const EXT = `<svg class="ext" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>`;
const PLAY = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L9.4 4.7a.6.6 0 0 0-.9.5z"/></svg>`;
const ZOOM = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M10.5 8v5M8 10.5h5"/></svg>`;
const SKIPI = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l8 7-8 7M14 5l8 7-8 7"/></svg>`;
// The brand mark is the factory's final vector logo (gear + wordmark + Arabic line), drawn once per page in a hidden sprite (#lg-gear, #lg-word)
// and referenced with <use>, so it takes the CSS colour: Pantone navy in light mode, white in dark mode and on the navy sections.
const MARK = logoSvg('logo');

// ---------------------------------------------------------------- small blocks
const tbcBadge = (lang) => `<span class="badge">${T(UI.tbc, lang)}</span>`;
const goLink = (href, label, extra = '') => `<a class="go" href="${href}"${extra}>${label}${ARROW}</a>`;
// External "Request a quote" link: the existing online order tool, new tab, rel="noopener".
const orderLink = (lang, { cls = 'btn magnetic', label, icon = ARROW } = {}) =>
  `<a class="${cls}" href="${SITE.orderUrl}" target="_blank" rel="noopener"><span>${label || T(UI.quote, lang)}</span>${icon}<span class="vh"> (${T(UI.opensNew, lang)})</span></a>`;
const ctaHref = (c, lang) => {
  if (c.to === 'order') return { href: SITE.orderUrl, ext: true, order: true };
  if (c.to === 'catalogue') return { href: SITE.catalogue, ext: true };
  return { href: rel(lang, byId[c.to]) + (c.query || ''), ext: false };
};
const eyebrow = (v, lang) => (v ? `<p class="eyebrow"><span class="dot"></span>${T(v, lang)}</p>` : '');

// 3D stage: an empty, sized box. The engine draws the tin into a canvas inside it; the SVG drawing is the fallback.
function stage(lang, { pose, shape = 'round', theme = 'brand', cw = 0, finish = 'gloss', label, cls = '', rig = 'product' }) {
  const lab = label || UI.dragTin;
  const data = rig === 'journey'
    ? `data-rig="journey" data-pose="hero"`
    : `data-rig="product" data-pose="${pose}" data-cursor="drag" data-shape="${shape}" data-theme="${theme}" data-cw="${cw}" data-finish="${finish}"`;
  return `<div class="stage ${cls}" ${data} role="img" aria-label="${T(lab, lang)}"><div class="stage__fb" aria-hidden="true">${art(rig === 'journey' ? 'hero' : (SHAPE_ART[shape] || 'round'))}</div></div>`;
}

// chips that switch the 3D tin AND the description pane ("picker"). Every pane is in the HTML; the script shows one.
function picker(lang, { kind, target, items, aria, initial, panes = true, cls = '' }) {
  const first = initial || items[0].id;
  const chips = `<div class="chips ${cls}" role="group" aria-label="${T(aria, lang)}" data-reveal>${items.map((it) =>
    `<button class="chip${it.id === first ? ' is-on' : ''}" type="button" data-pick="${kind}" data-target="${target}" data-id="${it.id}" aria-pressed="${it.id === first}">${T(it.label, lang)}</button>`).join('')}</div>`;
  if (!panes) return chips;
  const body = items.map((it) => it.desc
    ? `<p class="pane${it.id === first ? ' is-on' : ''}" data-pane="${it.id}">${T(it.desc, lang)}</p>`
    : `<div class="pane${it.id === first ? ' is-on' : ''}" data-pane="${it.id}"><div class="spec__k">${T(it.name, lang)}</div><div class="spec__v">${T(it.dim, lang)}</div><p>${T(it.note, lang)}</p></div>`).join('');
  return chips + (items[0].desc ? `<div class="finish__desc" aria-live="polite" data-reveal>${body}</div>` : `<div class="spec" aria-live="polite" data-reveal>${body}</div>`);
}

// ---------------------------------------------------------------- plain content blocks (inner pages)
function renderBlock(b, lang, ctx) {
  const lvl = ctx.hasTitle ? 3 : 2;
  switch (b.k) {
    case 'cards':
      return `<ul class="grid" data-reveal>${b.items.map((i) => `<li class="card tilt">${i.art ? `<div class="card__ico">${art(i.art)}</div>` : ''}<h${lvl} class="h3">${T(i.h, lang)}</h${lvl}><p>${T(i.p, lang)}</p>${i.meta ? `<div class="meta"><span>${T(i.meta, lang)}</span></div>` : ''}</li>`).join('')}</ul>`;
    case 'steps':
      return `<ol class="stepgrid" data-reveal>${b.items.map((i) => `<li><h${lvl} class="h3">${T(i.h, lang)}</h${lvl}><p>${T(i.p, lang)}</p></li>`).join('')}</ol>`;
    case 'specs':
      return `<dl class="specs" data-reveal>${b.rows.map((r) => `<div class="specrow${r.art ? '' : ' specrow--noart'}${r.tbc ? ' specrow--tbc' : ''}"${r.tbc ? ' data-tbc' : ''}>${r.art ? `<div class="specrow__art">${art(r.art)}</div>` : ''}<dt>${T(r.k, lang)}</dt><dd><span class="spec__v">${T(r.v, lang)}</span>${r.tbc ? ' ' + tbcBadge(lang) : ''}${r.note ? `<br><span class="spec__n">${T(r.note, lang)}</span>` : ''}</dd></div>`).join('')}</dl>`;
    case 'tbc': {
      const items = b.cards
        ? `<ul class="tbc__cards">${b.items.map((i) => `<li>${tbcBadge(lang)}<span>${T(i, lang)}</span></li>`).join('')}</ul>`
        : `<ul>${b.items.map((i) => `<li>${T(i, lang)}</li>`).join('')}</ul>`;
      return `<div class="tbc" data-tbc data-reveal role="group" aria-labelledby="${ctx.id}-tbc">${b.cards ? '' : tbcBadge(lang)}<h${lvl} class="h3 tbc__title" id="${ctx.id}-tbc">${T(b.title, lang)}</h${lvl}>${items}${b.note ? `<p class="tbc__note">${T(b.note, lang)}</p>` : ''}</div>`;
    }
    case 'prose': return `<div class="prose" data-reveal>${b.ps.map((p) => `<p>${T(p, lang)}</p>`).join('')}</div>`;
    case 'quote': return `<blockquote class="pull" data-reveal>${T(b.text, lang)}</blockquote>`;
    case 'fine': return `<p class="fine">${T(b.text, lang)}</p>`;
    case 'link': return `<p data-reveal>${goLink(rel(lang, byId[b.to]), T(b.label, lang))}</p>`;
    default: throw new Error('unknown block ' + b.k);
  }
}

// ---------------------------------------------------------------- creative section kinds (home + shared with inner pages)
const secHead = (lang, s, def, id) => `<header class="sec-head">${eyebrow(s.eyebrow || def.eyebrow, lang)}<h2 class="h2" data-split id="${id}-h">${T(s.title || def.title, lang)}</h2>${(s.intro || def.intro) ? `<p class="lead" data-reveal>${T(s.intro || def.intro, lang)}</p>` : ''}</header>`;
const moreLink = (lang, l) => { const ls = [].concat(l || []); return ls.length ? `<p class="more more--row wrap" data-reveal>${ls.map((x) => goLink(rel(lang, byId[x.to]), T(x.label, lang))).join('')}</p>` : ''; };

// ---- video facade: a poster and a play button. The YouTube iframe (youtube-nocookie.com) is created by site.js only when the visitor clicks,
// so no third-party code loads before that click. Without JavaScript the play button is a normal link to YouTube. The poster is the only
// third-party request (an image); if it fails to load the on-brand fallback (gradient + gear + play icon) stays visible.
const YT = (id) => `https://www.youtube.com/watch?v=${id}`;
const ytLink = (lang, id) => `<a class="go go--sm" href="${YT(id)}" target="_blank" rel="noopener noreferrer">${T(UI.watchYoutube, lang)}${EXT}<span class="vh"> (${T(UI.opensNew, lang)})</span></a>`;
function facade(lang, id, label) {
  const name = T(label, lang);
  return `<div class="vid" data-vid="${id}" data-title="${name}">
      <a class="vid__play" href="${YT(id)}" target="_blank" rel="noopener noreferrer" aria-label="${T(UI.playVideo, lang)}: ${name}">
        <svg class="vid__gear" viewBox="0 0 274 275.9" aria-hidden="true" focusable="false"><use href="#lg-gear"/></svg>
        <img class="vid__poster" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async" referrerpolicy="no-referrer">
        <span class="vid__btn">${PLAY}</span>
      </a>
    </div>`;
}
const imgSize = (v) => (v && v.w && v.h ? ` width="${v.w}" height="${v.h}"` : '');

const KINDS = {
  marquee(lang) {
    const items = MARQUEE.map((m) => `<span>${T(m, lang)}</span><i></i>`).join('');
    return `<section class="marquee" aria-label="${T(UI.sectors, lang)}"><div class="marquee__track"><div class="marquee__row" data-marquee>${items}</div></div></section>`;
  },

  journey(lang, s) {
    const id = s.id || 'journey';
    return `<section class="journey" id="${id}" aria-labelledby="${id}-h">
  <div class="journey__pin">
    <div class="journey__grid wrap">
      <div class="journey__text">
        ${eyebrow(s.eyebrow || t2('One roof, one partner', 'سقف واحد، وشريك واحد'), lang)}
        <h2 class="h2" data-split id="${id}-h">${T(s.title || t2('From sheet to shelf.', 'من الصفيحة إلى الرف.'), lang)}</h2>
        <div class="steps" id="steps">${STEPS.map((st, i) => `<article class="step${i === 0 ? ' is-active' : ''}" data-step="${i}"><span class="step__n">${pad2(i + 1)}</span><h3>${T(st.h, lang)}</h3><p>${T(st.p, lang)}</p></article>`).join('')}</div>
        <div class="rail" aria-hidden="true"><i id="railFill"></i>${STEPS.map(() => '<b></b>').join('')}</div>
      </div>
      ${stage(lang, { rig: 'journey', label: t2('3D journey of a tinplate sheet: printed, rolled into a tin, palletised and shipped', 'رحلة الصفيحة المعدنية بثلاثية الأبعاد: تُطبع وتُشكَّل علبةً وتُرتَّب على بالتات وتُشحن') })}
    </div>
  </div>
  ${moreLink(lang, s.link)}
</section>`;
  },

  finish(lang, s) {
    const id = s.id || 'finish', F = FINISH_LAB;
    return `<section class="finish" id="${id}" aria-labelledby="${id}-h">
  <div class="finish__grid wrap">
    ${stage(lang, { pose: 'finish', label: F.aria })}
    <div class="finish__text">
      ${eyebrow(s.eyebrow || F.eyebrow, lang)}
      <h2 class="h2" data-split id="${id}-h">${T(s.title || F.title, lang)}</h2>
      <p class="lead" data-reveal>${T(s.intro || F.lead, lang)}</p>
      ${picker(lang, { kind: 'finish', target: 'finish', items: F.items, aria: F.chipsAria })}
      <div class="plate" data-reveal>
        <h3>${T(F.plate.h, lang)}</h3>
        <p>${T(F.plate.p, lang)}</p>
        <div class="swatches" role="group" aria-label="${T(F.cwAria, lang)}">${F.cws.map((c, i) => `<button class="sw${i === 0 ? ' is-on' : ''}" type="button" data-pick="cw" data-target="finish" data-id="${i}" aria-pressed="${i === 0}" style="--a:${c.a};--b:${c.b}" aria-label="${T(c.label, lang)}"></button>`).join('')}</div>
      </div>
    </div>
  </div>
</section>`;
  },

  shapes(lang, s) {
    const id = s.id || 'shapes', S = SHAPES_LAB;
    return `<section class="shapes" id="${id}" aria-labelledby="${id}-h">
  <div class="shapes__grid wrap">
    <div class="shapes__text">
      ${eyebrow(s.eyebrow || S.eyebrow, lang)}
      <h2 class="h2" data-split id="${id}-h">${T(s.title || S.title, lang)}</h2>
      ${picker(lang, { kind: 'shape', target: 'shapes', items: S.items, aria: S.chipsAria })}
      <p class="fine" data-reveal>${T(S.fine, lang)}</p>
      ${(s.after || []).map((b) => renderBlock(b, lang, { hasTitle: true, id })).join('')}
    </div>
    ${stage(lang, { pose: 'shapes', label: S.aria })}
  </div>
</section>`;
  },

  range(lang, s) {
    const id = s.id || 'range', R = RANGE;
    const card = (c, i) => `<article class="card tilt${i === 0 ? ' card--xl' : ''}${i === 3 || i === 4 ? ' card--wide' : ''}" data-reveal>
        <span class="card__idx">${pad2(i + 1)}</span>
        <h3>${T(c.h, lang)}</h3>
        <p>${T(c.p, lang)}</p>
        ${c.meta ? `<div class="card__meta"><span>${T(c.meta, lang)}</span></div>` : ''}
        ${i === 0 ? `<svg class="card__art" viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="38" rx="42" ry="14"/><path d="M18 38v44c0 8 19 14 42 14s42-6 42-14V38"/><path d="M18 56c0 8 19 14 42 14s42-6 42-14"/></svg>` : ''}
      </article>`;
    return `<section class="range" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    ${secHead(lang, s, R, id)}
    <div class="bento">${R.cards.map(card).join('')}</div>
    <div class="range__cta" data-reveal>
      <a class="btn magnetic" href="${SITE.catalogue}" target="_blank" rel="noopener"><span>${T(UI.catalogue, lang)}</span>${DOWN}<span class="vh"> (${T(UI.opensNew, lang)})</span></a>
      ${s.link ? `<a class="btn btn--ghost magnetic" href="${rel(lang, byId[s.link.to])}"><span>${T(s.link.label, lang)}</span>${ARROW}</a>` : ''}
    </div>
  </div>
</section>`;
  },

  industries(lang, s) {
    const id = s.id || 'industries';
    const inds = PAGES.filter((p) => p.id.startsWith('ind-'));
    return `<section class="industries" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    ${secHead(lang, s, IND_LIST, id)}
    <ol class="indlist" data-reveal>${inds.map((p, i) => `<li><a class="indrow" href="${rel(lang, p)}"><span class="indrow__n">${pad2(i + 1)}</span><span class="indrow__h">${T(p.tile.h, lang)}</span><span class="indrow__p">${T(p.tile.p, lang)}</span><span class="indrow__go">${ARROW}</span></a></li>`).join('')}</ol>
  </div>
</section>`;
  },

  seasons(lang, s) {
    const id = s.id || 'seasons', Z = SEASONS;
    const month = new Date().getMonth();
    return `<section class="seasons" id="${id}" data-season="olive" aria-labelledby="${id}-h">
  <div class="seasons__grid wrap">
    <div class="seasons__text">
      ${eyebrow(Z.eyebrow, lang)}
      <h2 class="h2" data-split id="${id}-h">${T(Z.title, lang)}</h2>
      <p class="lead" data-reveal>${T(Z.lead, lang)}</p>
      <div class="tabs" role="tablist" aria-orientation="vertical" aria-label="${T(Z.tabsAria, lang)}" data-reveal>${Z.tabs.map((z, i) =>
        `<button class="tab${i === 0 ? ' is-on' : ''}" role="tab" type="button" id="tab-${z.id}" data-season="${z.id}" data-shape="${z.shape}" data-theme="${z.theme}" data-finish="${z.finish}" aria-selected="${i === 0}" aria-controls="pane-${z.id}" tabindex="${i === 0 ? 0 : -1}"><span class="tab__k">${T(z.k, lang)}</span><b>${T(z.h, lang)}</b>${z.now ? `<em class="now" data-months="8-11">${T(UI.nowLabel, lang)}</em>` : ''}</button>`).join('')}</div>
      <div class="season__desc">${Z.tabs.map((z, i) =>
        `<div class="pane${i === 0 ? ' is-on' : ''}" role="tabpanel" id="pane-${z.id}" aria-labelledby="tab-${z.id}" data-pane="${z.id}"><p>${T(z.desc, lang)}</p><a class="go" href="${rel(lang, byId[z.to])}">${T(z.more, lang)}${ARROW}</a></div>`).join('')}</div>
      <p class="fine" data-reveal>${T(Z.fine, lang)}</p>
    </div>
    ${stage(lang, { pose: 'seasons', shape: 'oil', theme: 'olive', label: Z.aria })}
  </div>
</section>`;
  },

  story(lang, s) {
    const id = s.id || 'story', St = STORY;
    const years = SITE.year - 1998;
    return `<section class="story" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    ${secHead(lang, s, St, id)}
    <div class="story__grid">
      <div class="bignum" data-reveal><b id="years" data-count-years="1998">${years}</b><span>${T(UI.yearsOf, lang)}</span></div>
      <div class="story__copy" data-reveal>
        <p>${T(St.p1, lang)}</p>
        <blockquote><span>${T(St.vision, lang)}</span></blockquote>
        <p>${T(St.p2, lang)}</p>
      </div>
    </div>
    ${s.noProof || !SHOW_PENDING ? '' : `<div class="proof" data-reveal>${PROOF_TBC.items.map((i) => `<div class="proof__item" data-tbc><i>◇</i><b>${T(i, lang)}</b><span>${T(UI.tbcShort, lang)}</span></div>`).join('')}</div>`}
  </div>
  ${moreLink(lang, s.link)}
</section>`;
  },

  // Certifications: a heading and two cards, each the certificate image and only its name (no scope, numbers, dates or tables).
  // The image link opens the lightbox (site.js); without JavaScript it opens the JPEG in a new tab.
  certs(lang, s) {
    const id = s.id || 'certifications', C = CERTS;
    const card = (c, i) => `<li class="cert" style="--rest:${i % 2 ? 1 : -1}deg">
        <figure>
          <a class="cert__open tilt" href="${c.file}.jpg" target="_blank" rel="noopener" data-lightbox="certs" aria-label="${T(UI.viewLarger, lang)}: ${T(c.alt, lang)}">
            <picture><source type="image/webp" srcset="${c.file}.webp"><img src="${c.file}.jpg" width="${c.w}" height="${c.h}" alt="${T(c.alt, lang)}" loading="lazy" decoding="async"></picture>
            <span class="cert__zoom" aria-hidden="true">${ZOOM}</span>
          </a>
          <figcaption><b>${T(c.name, lang)}</b>${c.sub ? `<span>${T(c.sub, lang)}</span>` : ''}</figcaption>
        </figure>
      </li>`;
    return `<section class="certs" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    <header class="sec-head"><h2 class="h2" data-split id="${id}-h">${T(C.title, lang)}</h2></header>
    <ul class="certs__grid" data-reveal>${C.items.map(card).join('')}</ul>
  </div>
</section>`;
  },

  // The About page's featured video (SITE.mainVideoId), same click-to-load facade as the gallery.
  featuredVideo(lang, s) {
    const id = s.id || 'video', G = GALLERY.featured;
    const v = VIDEOS.find((x) => x.id === SITE.mainVideoId);
    const label = v ? v.label : G.fallback;
    return `<section class="featured" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    <header class="sec-head">${eyebrow(G.eyebrow, lang)}<h2 class="h2" data-split id="${id}-h">${T(G.title, lang)}</h2></header>
    <div class="vcard" data-reveal>
      ${facade(lang, SITE.mainVideoId, label)}
      <div class="vcard__cap">${ytLink(lang, SITE.mainVideoId)}${goLink(rel(lang, byId.gallery), T(UI.moreGallery, lang))}</div>
    </div>
  </div>
</section>`;
  },

  // Gallery: videos (facades + a card to the Facebook page).
  videos(lang, s) {
    const id = s.id || 'videos', G = GALLERY;
    return `<section class="gal" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    <header class="sec-head"><h2 class="h2" data-split id="${id}-h">${T(G.videosTitle, lang)}</h2></header>
    <div class="gal__videos">${VIDEOS.map((v) => `<figure class="vcard" data-reveal>
      ${facade(lang, v.id, v.label)}
      <figcaption class="vcard__cap"><b>${T(v.label, lang)}</b>${ytLink(lang, v.id)}</figcaption>
    </figure>`).join('\n    ')}</div>
    <div class="fbcard" data-reveal>
      <div><span class="ncard__tag">${T(G.fb.tag, lang)}</span><h3>${T(G.fb.h, lang)}</h3><p>${T(G.fb.p, lang)}</p></div>
      <a class="btn btn--ghost magnetic" href="${SITE.social.Facebook}" target="_blank" rel="noopener noreferrer"><span>${T(G.fb.cta, lang)}</span>${EXT}<span class="vh"> (${T(UI.opensNew, lang)})</span></a>
    </div>
  </div>
</section>`;
  },

  // Gallery: photos. Rendered ONLY when PHOTOS (content.mjs) has entries: an empty list leaves no section and no placeholder.
  photos(lang, s) {
    if (!PHOTOS.length) return '';
    const id = s.id || 'photos';
    const alt = (p) => esc(lang === 'ar' ? p.alt_ar : p.alt_en);
    return `<section class="gal" id="${id}" aria-labelledby="${id}-h">
  <div class="wrap">
    <header class="sec-head"><h2 class="h2" data-split id="${id}-h">${T(GALLERY.photosTitle, lang)}</h2></header>
    <ul class="photos" data-reveal>${PHOTOS.map((p) => `<li><a class="photo__open" href="${esc(p.src)}" target="_blank" rel="noopener" data-lightbox="photos" aria-label="${T(UI.viewLarger, lang)}: ${alt(p)}"><img src="${esc(p.src)}" alt="${alt(p)}"${imgSize(p)} loading="lazy" decoding="async"></a></li>`).join('')}</ul>
  </div>
</section>`;
  },

  news(lang, s) {
    const id = s.id || 'news';
    const list = s.limit ? NEWS.slice(0, s.limit) : NEWS;
    const head = s.id === 'news' ? secHead(lang, s, { eyebrow: t2('News & events', 'الأخبار والفعاليات'), title: t2('Out in the world.', 'حاضرون في الأسواق.') }, id) : '';
    const card = (n) => n.href
      ? `<a class="ncard tilt" data-reveal href="${esc(n.href)}" target="_blank" rel="noopener noreferrer"><span class="ncard__tag">${T(n.tag, lang)}</span><h3>${T(n.h, lang)}</h3><p>${T(n.p, lang)}</p><span class="ncard__go">${T(UI.read, lang)}<span class="vh"> (${T(UI.opensNew, lang)})</span></span></a>`
      : `<article class="ncard" data-reveal><span class="ncard__tag">${T(n.tag, lang)}</span><h3>${T(n.h, lang)}</h3><p>${T(n.p, lang)}</p></article>`;
    return `<section class="news" id="${id}"${head ? ` aria-labelledby="${id}-h"` : ''}>
  <div class="wrap">
    ${head}
    <div class="news__grid">${list.map(card).join('')}</div>
  </div>
  ${moreLink(lang, s.link)}
</section>`;
  }
};
function t2(en, ar) { return { en, ar }; }

function sections(lang, page) {
  return page.sections.map((s, i) => {
    if (s.kind) return KINDS[s.kind](lang, s, page);
    const id = s.id || `s${i + 1}`;
    const hasTitle = !!s.title;
    const head = hasTitle
      ? `<header class="sec-head">${eyebrow(s.eyebrow, lang)}<h2 class="h2" data-split id="${id}-h">${T(s.title, lang)}</h2>${s.intro ? `<p class="lead" data-reveal>${T(s.intro, lang)}</p>` : ''}</header>`
      : '';
    const body = s.blocks.map((b) => renderBlock(b, lang, { hasTitle, id })).join('\n');
    return `<section class="sec" id="${id}"${hasTitle ? ` aria-labelledby="${id}-h"` : ''}>
  <div class="wrap stack">
    ${head}
    ${body}
  </div>
</section>`;
  }).join('\n');
}

// ---------------------------------------------------------------- page chrome
function crumbTrail(page) {
  const trail = [];
  for (let p = page; p; p = p.parent ? byId[p.parent] : null) trail.unshift(p);
  return trail;
}

const loader = (lang) => `<div id="loader" aria-busy="true">
  <button class="ld__skip" id="ldSkip" type="button"><span>${T(UI.skipIntro, lang)}</span>${SKIPI}</button>
  <div class="stage ld__stage" data-rig="journey" data-pose="hero" aria-hidden="true"><div class="ld__wait"><i></i></div></div>
  <div class="ld__meta" aria-hidden="true">
    <div class="ld__num"><b id="loaderNum">0</b><small>%</small></div>
    <div class="ld__step" id="ldStep">${T(UI.loaderSteps[0], lang)}</div>
    ${logoSvg('ld__logo')}
  </div>
</div>
<p class="vh" id="ldAnnounce" role="status"></p>`;

function header(lang, page) {
  const alt = other(lang), A = LANGS[lang]; // A holds the label/aria for the link that leads to the OTHER language
  const nav = NAV.map((n) => {
    const target = byId[n.page];
    const isPage = target.id === page.id;
    const isSection = !isPage && crumbTrail(page).some((p) => p.id === target.id);
    return `<a href="${rel(lang, target)}"${isPage ? ' aria-current="page"' : ''}${isSection ? ' class="is-current"' : ''}>${T(n.label, lang)}</a>`;
  });
  const menu = NAV.map((n) => {
    const target = byId[n.page];
    return `<a href="${rel(lang, target)}"${target.id === page.id ? ' aria-current="page"' : ''}>${T(n.label, lang)}</a>`;
  });
  return `<a class="skip" href="#main">${T(UI.skip, lang)}</a>
<header class="nav" id="nav">
  <a class="brand" href="${rel(lang, byId.home)}" aria-label="${T(UI.brandAria, lang)}">${MARK}</a>
  <nav class="nav__links" aria-label="${T(UI.primaryNav, lang)}">${nav.join('')}</nav>
  <div class="nav__tools">
    <a class="tool tool--lang" id="langBtn" href="${rel(alt, page)}" hreflang="${alt}" lang="${alt}" aria-label="${esc(A.switchAria)}" data-lang-switch>${esc(A.switchLabel)}</a>
    <button class="tool" id="themeBtn" type="button" aria-label="${T(UI.theme, lang)}" aria-pressed="false">
      <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>
      <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/></svg>
    </button>
    ${orderLink(lang, { cls: 'btn btn--sm magnetic', icon: '' })}
    <button class="burger" id="burger" type="button" aria-label="${T(UI.menu, lang)}" aria-expanded="false" aria-controls="menu"><i></i><i></i></button>
  </div>
</header>
<div class="menu" id="menu" inert>
  ${menu.join('\n  ')}
  <a href="${SITE.orderUrl}" target="_blank" rel="noopener">${T(UI.quote, lang)}<span class="vh"> (${T(UI.opensNew, lang)})</span></a>
</div>`;
}

// One lightbox per page that has an image to enlarge (certificates, photos). site.js drives it; it stays closed (and invisible) without JavaScript.
const LB_CLOSE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const lightbox = (lang) => `<dialog class="lb" id="lightbox" aria-label="${T(UI.lbLabel, lang)}">
  <button class="lb__x" type="button" aria-label="${T(UI.lbClose, lang)}">${LB_CLOSE}</button>
  <button class="lb__nav lb__prev" type="button" aria-label="${T(UI.lbPrev, lang)}" hidden>${ARROW}</button>
  <div class="lb__stage"></div>
  <button class="lb__nav lb__next" type="button" aria-label="${T(UI.lbNext, lang)}" hidden>${ARROW}</button>
</dialog>`;
const needsLightbox = (page) => page.sections.some((s) => s.kind === 'certs' || (s.kind === 'photos' && PHOTOS.length));

function contactSection(lang, page) {
  const onContact = page.id === 'contact';
  return `<section class="contact" id="contact"${onContact ? '' : ' aria-labelledby="contact-h"'}>
  <div class="wrap contact__grid">
    <div>
      ${eyebrow(UI.letsTalk, lang)}
      <h2 class="mega" data-split id="contact-h">${T(UI.ctaTitle, lang)}</h2>
      <ul class="contact__list" data-reveal>
        <li><span>${T(UI.phone, lang)}</span><a href="tel:${SITE.tel}" dir="ltr">${SITE.phone}</a></li>
        <li><span>${T(UI.mail, lang)}</span><a href="mailto:${SITE.email}">${SITE.email}</a></li>
        <li><span>${T(UI.address, lang)}</span><em>${T(UI.addressArea, lang)}</em></li>
      </ul>
      <ul class="social" data-reveal>${Object.entries(SITE.social).map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${n === 'LinkedIn' ? n : `${n} <bdi dir="ltr">${SITE.handle}</bdi>`}<span class="vh"> (${T(UI.opensNew, lang)})</span></a></li>`).join('')}</ul>
    </div>
    <div class="quote" id="order" data-reveal>
      <h3 class="quote__t">${T(UI.orderTitle, lang)}</h3>
      <p class="quote__p">${T(UI.ctaLead, lang)} ${T(UI.orderLead, lang)}</p>
      ${orderLink(lang, { cls: 'btn magnetic', label: t2('Open the order tool', 'افتح أداة الطلب')[lang], icon: EXT })}
      <p class="quote__alt">${T(UI.orderEmail, lang)}: <a href="mailto:${SITE.email}"><bdi dir="ltr">${SITE.email}</bdi></a></p>
    </div>
  </div>
</section>`;
}

function footer(lang) {
  const inds = PAGES.filter((p) => p.id.startsWith('ind-'));
  const co = ['products', 'capabilities', 'about', 'gallery', 'news', 'contact'].map((id) => byId[id]);
  return `<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <a class="brand" href="${rel(lang, byId.home)}" aria-label="${T(UI.brandAria, lang)}">${MARK}</a>
        <p>${T(UI.footBlurb, lang)}</p>
      </div>
      <nav aria-label="${T(UI.footIndustries, lang)}"><h2>${T(UI.footIndustries, lang)}</h2><ul>${inds.map((p) => `<li><a href="${rel(lang, p)}">${T(p.tile.h, lang)}</a></li>`).join('')}</ul></nav>
      <nav aria-label="${T(UI.footCompany, lang)}"><h2>${T(UI.footCompany, lang)}</h2><ul>${co.map((p) => `<li><a href="${rel(lang, p)}">${T(p.crumb, lang)}</a></li>`).join('')}</ul></nav>
    </div>
    <div class="foot__base">
      <span class="foot__c">© <bdi>${SITE.year}</bdi> <bdi>${esc(brandName(lang))}</bdi>. ${T(UI.rights, lang)}</span>
      ${SHOW_PENDING ? `<span>${T(UI.footDraft, lang)}</span>` : ''}
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
      ? `<a class="btn btn--ghost magnetic" href="${href}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}><span>${label}</span>${ext ? DOWN : ARROW}${ext ? `<span class="vh"> (${T(UI.opensNew, lang)})</span>` : ''}</a>`
      : `<a class="btn magnetic" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}><span>${label}</span>${ARROW}${ext ? `<span class="vh"> (${T(UI.opensNew, lang)})</span>` : ''}</a>`;
  }).join('');
  const stats = h.stats ? `<ul class="facts" data-reveal>${h.stats.map((s) => `<li><b>${T(s.big, lang)}</b><span>${T(s.small, lang)}</span></li>`).join('')}</ul>` : '';
  const title = isHome
    ? `<h1 class="display" id="heroTitle">${h.lines.map((l, i) => `<span class="line${i ? ' line--accent' : ''}" data-split>${T(l, lang)}</span>`).join('')}</h1>`
    : `<h1 class="h1" data-split>${T(h.h1, lang)}</h1>`;
  const st = h.stage;
  const pick = h.picker ? picker(lang, h.picker) : '';
  return `<section class="hero ${isHome ? 'hero--home' : 'hero--inner'}" id="hero">
  <div class="hero__grid wrap${st ? '' : ' hero__grid--solo'}">
    <div class="hero__text">
      ${crumbs}
      ${eyebrow(h.eyebrow, lang)}
      ${title}
      <p class="lead" data-reveal>${T(h.lead, lang)}</p>
      ${ctas ? `<div class="hero__cta" data-reveal>${ctas}</div>` : ''}
      ${pick}
      ${stats}
    </div>
    ${st ? stage(lang, { pose: 'hero', ...st }) : ''}
  </div>
  ${isHome ? `<div class="scrollcue" aria-hidden="true"><i></i><span>${T(UI.scroll, lang)}</span></div>` : ''}
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
// Runs before first paint: theme (no flash), the "js" flag, the entrance (home only, once per session, never with ?skip or reduced motion)
// and the page-transition curtain that was started by the previous page.
const headScript = (isHome) => `<script>(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('jt-theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.setAttribute('data-theme',t)}catch(e){}try{if(sessionStorage.getItem('jt-arrive')){sessionStorage.removeItem('jt-arrive');d.classList.add('arrive')}}catch(e){}${isHome
  ? `try{if(!/[?&]skip/.test(location.search)&&!sessionStorage.getItem('jt-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro')}catch(e){}`
  : `try{sessionStorage.setItem('jt-intro','1')}catch(e){}`}})()</script>`;
const THEME_ONLY = `<script>(function(){var d=document.documentElement;try{var t=localStorage.getItem('jt-theme');if(t==='dark'||t==='light')d.setAttribute('data-theme',t)}catch(e){}})()</script>`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=DM+Sans:wght@400;500;600&family=Readex+Pro:wght@300..700&display=swap">`;
const IMPORTMAP = `<script type="importmap">{"imports":{"three":"/assets/vendor/three/three.module.min.js","three/addons/":"/assets/vendor/three/addons/"}}</script>`;
const CURTAIN = `<div id="curtain" aria-hidden="true"><i style="--n:0"></i><i style="--n:1"></i><i style="--n:2"></i><i style="--n:3"></i><i style="--n:4"></i></div>`;

function renderPage(lang, page) {
  const Lg = LANGS[lang], alt = other(lang);
  const title = tx(page.title, lang), desc = tx(page.description, lang), url = abs(lang, page);
  const isHome = page.id === 'home';
  const hreflangs = [...L.map((l) => `<link rel="alternate" hreflang="${l}" href="${abs(l, page)}">`), `<link rel="alternate" hreflang="x-default" href="${abs('en', page)}">`].join('\n');
  const data = { lang, ld: UI.loaderSteps.map((s) => tx(s, lang)), cursor: tx(UI.cursorDrag, lang), loading: tx(UI.loading, lang), ready: tx(UI.ready, lang), home: isHome };
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
<meta name="theme-color" content="#002F6C">
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
<meta name="twitter:site" content="${SITE.handle}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${OG_IMG}">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${headScript(isHome)}
${FONTS}
<link rel="stylesheet" href="/assets/css/site.css?v=${V.css}">
${SHOW_PENDING ? `<link rel="stylesheet" href="/assets/css/pending.css?v=${V.pend}">` : ''}
${IMPORTMAP}
${jsonLd(lang, page)}
</head>
<body>
${GRADIENT_DEFS}
${logoSprite()}
<canvas id="gl" aria-hidden="true"></canvas>
<div class="grain" aria-hidden="true"></div>
<div class="cursor is-hidden" aria-hidden="true"><i></i><span>${T(UI.cursorDrag, lang)}</span></div>
${isHome ? loader(lang) : ''}
${CURTAIN}
${header(lang, page)}
<main id="main" tabindex="-1">
${hero(lang, page)}
${sections(lang, page)}
${contactSection(lang, page)}
</main>
${footer(lang)}
${needsLightbox(page) ? lightbox(lang) : ''}
<script type="application/json" id="jt-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="/assets/js/site.js?v=${V.js}" defer></script>
<script src="/assets/vendor/gsap/gsap.min.js" defer></script>
<script src="/assets/vendor/gsap/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/lenis/lenis.min.js" defer></script>
<script type="module" src="/assets/js/engine/main.js?v=${V.eng}"></script>
<script>
  // Last-resort guard: if the engine never starts (blocked, old browser) the page must not stay covered or scroll-locked.
  setTimeout(function () {
    if (window.__jtBooted) return;
    var l = document.getElementById('loader'); if (l) l.remove();
    var h = document.documentElement; h.classList.remove('intro'); h.classList.add('no-fx');
  }, 8000);
</script>
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
<meta name="theme-color" content="#002F6C">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
${THEME_ONLY}
${FONTS}
<link rel="stylesheet" href="/assets/css/site.css?v=${V.css}">
<script>(function(){try{var l=localStorage.getItem('jt-lang');if(!l){var n=(navigator.language||'en').toLowerCase();l=n.indexOf('ar')===0?'ar':'en'}if(l==='ar'||l==='en')location.replace('/'+l+'/')}catch(e){}})()</script>
</head>
<body class="plain">
<main class="chooser" id="main">
  <div>
    ${logoSprite()}
    <a class="brand" href="/en/" aria-label="Jordan Tinplate Canning">${MARK}</a>
    <h1>Custom tinplate packaging · علب معدنية مخصّصة</h1>
    <p>Choose your language · اختر اللغة</p>
    <div class="cta-row"><a class="btn" href="/en/" hreflang="en" lang="en"><span>English</span></a><a class="btn btn--ghost" href="/ar/" hreflang="ar" lang="ar" dir="rtl"><span>العربية</span></a></div>
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
${THEME_ONLY}
${FONTS}
<link rel="stylesheet" href="/assets/css/site.css?v=${V.css}">
</head>
<body class="plain">
<main class="chooser" id="main">
  <div>
    <h1>Page not found · الصفحة غير موجودة</h1>
    <p>The page you are looking for does not exist or has moved. · الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
    <div class="cta-row"><a class="btn" href="/en/" hreflang="en" lang="en"><span>English home</span></a><a class="btn btn--ghost" href="/ar/" hreflang="ar" lang="ar" dir="rtl"><span>الصفحة الرئيسية</span></a></div>
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
