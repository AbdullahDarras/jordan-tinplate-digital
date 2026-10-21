// Procedural "printed tinplate" artwork. Every texture is drawn on a canvas (the logo from its SVG path data with Path2D), so the 3D tins need no image files.
//
// Premium tin (theme "brand"): Pantone 294 C navy lacquer, champagne-gold foil logo (gear mark + wordmark, from brand/logo/logo-vertical.svg),
// foil lines, a fine trellis and an embossed rim. Industry tins keep their own colourways and carry the logo as a gold seal.
//
// Each printed surface is drawn up to three times from the same code, so colour, metal and relief always line up:
//   mode 'color'  : the picture (map)
//   mode 'orm'    : G = roughness, B = metalness (gold foil is smoother and fully metallic, the lacquer is not)
//   mode 'relief' : height (foil is raised) -> bump map; variants 'plain', 'rough' (+ grain) and 'emboss' (+ raised trellis) follow the Finish Lab
import * as THREE from 'three';
import { LOGO_V } from './logo-paths.js';

const FD = '"Bricolage Grotesque","Readex Pro",system-ui,sans-serif';
const FA = '"Readex Pro","Bricolage Grotesque",system-ui,sans-serif';

// The blue system: tints and shades of PANTONE 294 C (#002F6C). Mirrors the tokens at the top of assets/css/site.css.
export const PAL = {
  n50: '#e9eef6', n100: '#d8e0ec', n200: '#b5c4d7', n300: '#879ebc', n400: '#53739d', n500: '#274f83',
  n600: '#002F6C', n700: '#002a61', n800: '#002352', n900: '#00193b', n950: '#00132d',
  amber: '#f2a93b'
};
// champagne gold foil: highlight, light, mid, shadow
const GOLD = ['#fffaE6', '#f7e0a0', '#d9b560', '#a07a30'];
const NAVY_FOIL = ['#3f78c4', '#1a508f', '#002F6C', '#00193b'];

// Colourways of the premium tin. The first one is the signature navy-and-gold tin; the others keep the same logo and foil work.
export const COLORWAYS = [
  { name: 'navy', body: ['#003c82', '#00234f'], foil: GOLD, accent: '#d9b45a', line: '#d9b45a' },
  { name: 'copper', body: ['#b4521f', '#4a1a08'], foil: GOLD, accent: '#e6c98a', line: '#e6c98a' },
  { name: 'teal', body: ['#0e6f69', '#042f2c'], foil: GOLD, accent: '#e0c070', line: '#e0c070' },
  { name: 'cream', body: ['#f6edd8', '#d8c59c'], foil: NAVY_FOIL, accent: '#002F6C', line: '#b58d3a' }
];

// Per-theme palette for the industry tins: [dark, light, accent]; used by the lids and the seal.
const THEMES = {
  olive: { accent: '#d9a93c' }, eid: { accent: '#e9bd5a' }, cheese: { accent: PAL.n600 }, milk: { accent: PAL.n600 }, coffee: { accent: '#c8943c' }, industrial: { accent: '#e8662a' }
};

const cache = new Map();
const LG = {};   // Path2D objects, created lazily (needs a browser)
function paths() {
  if (!LG.gear) { LG.gear = new Path2D(LOGO_V.gear); LG.word = new Path2D(LOGO_V.word); LG.arabic = new Path2D(LOGO_V.arabic); }
  return LG;
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(2, Math.round(w));
  c.height = Math.max(2, Math.round(h));
  return c;
}
function toTex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}
function grad(ctx, w, h, a, b, angle = 0) {
  const g = angle ? ctx.createLinearGradient(0, 0, w, h) : ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function txt(ctx, s, x, y, size, color, { font = FD, weight = 700, align = 'center', spacing = 0, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align; ctx.textBaseline = 'middle';
  try { ctx.letterSpacing = spacing + 'px'; } catch (e) { /* older engines */ }
  ctx.fillStyle = color; ctx.fillText(s, x, y);
  ctx.restore();
}
function star8(ctx, cx, cy, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const rr = i % 2 === 0 ? r : r * 0.62;
    const a = rot + (i * Math.PI) / 8;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function starLattice(ctx, w, h, size, color, lw, alpha) {
  ctx.save();
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha;
  for (let y = -size / 2; y < h + size; y += size) {
    for (let x = -size / 2; x < w + size; x += size) {
      star8(ctx, x, y, size * 0.48, Math.PI / 8);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(x + size / 2, y + size / 2, size * 0.1, 0, 7); ctx.stroke();
    }
  }
  ctx.restore();
}
function ringGrid(ctx, w, h, color, alpha, step = 110, r = 38) {
  ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = 2;
  for (let y = 0; y < h + step; y += step) for (let x = ((y / step) % 2) * step / 2; x < w + step; x += step) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  }
  ctx.restore();
}
function leaf(ctx, x, y, len, ang, c1, c2) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, c1); g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -len * 0.26, len, 0);
  ctx.quadraticCurveTo(len * 0.5, len * 0.26, 0, 0);
  ctx.fill(); ctx.restore();
}
function branch(ctx, x, y0, y1, k) {
  ctx.save();
  ctx.strokeStyle = '#a8b78b'; ctx.lineWidth = 5 * k; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.quadraticCurveTo(x + 70 * k, (y0 + y1) / 2, x + 20 * k, y1); ctx.stroke();
  ctx.restore();
  const n = 9;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const bx = x + 70 * k * Math.sin(t * 2.2) * 0.55 + 10 * k * t;
    const by = y0 + (y1 - y0) * t;
    const s = (i % 2 ? 1 : -1);
    leaf(ctx, bx, by, 86 * k * (1 - t * 0.25), s * 0.55 + (s > 0 ? 0 : Math.PI) - 0.2, '#6f8a5a', '#dbe6c6');
    if (i % 3 === 1) {
      const g = ctx.createRadialGradient(bx + s * 30 * k, by + 14 * k, 2, bx + s * 30 * k, by + 14 * k, 20 * k);
      g.addColorStop(0, '#5a6b2c'); g.addColorStop(1, '#1d240d');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(bx + s * 30 * k, by + 14 * k, 15 * k, 20 * k, 0.3, 0, 7); ctx.fill();
    }
  }
}

/* ------------------------------------------------------------------ foil (gold ink) in the three modes */
const INK_METAL = 128;           // B of the lacquer in the ORM map: half of the scalar metalness (the foil is 255)
const FOIL_ROUGH = 255;          // G of the foil (the scalar roughness is the foil's)
const INK_ROUGH = 115;           // G of the lacquer: about 0.45 of the foil's roughness, so the lacquer is the glossier of the two
const orm = (g, b) => `rgb(255,${g},${b})`;
const gray = (v) => { const n = Math.round(255 * v); return `rgb(${n},${n},${n})`; };

// Sets fill and stroke for a foil element spanning the box (x0,y0)-(x1,y1). level = height of the element in the relief mode.
function foil(ctx, mode, stops, x0, y0, x1, y1, level = 1) {
  let s;
  if (mode === 'orm') s = orm(FOIL_ROUGH, 255);
  else if (mode === 'relief') s = gray(level);
  else {
    // brushed-metal banding: bright, light, dark band, light, bright
    const g = ctx.createLinearGradient(x0, y0, x1 + (x1 - x0) * 0.25, y1);
    [[0, stops[1]], [0.22, stops[0]], [0.42, stops[2]], [0.58, stops[3]], [0.76, stops[2]], [0.9, stops[1]], [1, stops[0]]].forEach(([o, c]) => g.addColorStop(o, c));
    s = g;
  }
  ctx.fillStyle = s; ctx.strokeStyle = s;
  return s;
}
// fill a logo path with foil, with a soft drop shadow and a bright edge in colour mode (the "stamped foil" look)
function foilPath(ctx, mode, stops, path, bw, bh, level = 1) {
  ctx.save();
  foil(ctx, mode, stops, 0, 0, bw, bh, level);
  if (mode === 'color') { ctx.shadowColor = 'rgba(0,10,30,.55)'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 1.2; ctx.shadowOffsetY = 2.4; }
  ctx.fill(path);
  if (mode === 'color') {
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 0.9; ctx.strokeStyle = 'rgba(255,248,222,.55)'; ctx.stroke(path);
  }
  ctx.restore();
}
// The full vertical lock-up (gear on top, JORDAN CANNING, Arabic line), centred in a box.
function drawLockup(ctx, mode, stops, cx, cy, boxW, boxH, level = 1) {
  const P = paths(), s = Math.min(boxW / LOGO_V.w, boxH / LOGO_V.h);
  ctx.save();
  ctx.translate(cx - (LOGO_V.w * s) / 2, cy - (LOGO_V.h * s) / 2); ctx.scale(s, s);
  [P.gear, P.word, P.arabic].forEach((p) => foilPath(ctx, mode, stops, p, LOGO_V.w, LOGO_V.h, level));
  ctx.restore();
}
// The gear mark alone, centred, with the given diameter.
function drawGear(ctx, mode, stops, cx, cy, d, level = 1) {
  const P = paths(), [gx, gy, gw, gh] = LOGO_V.gearBox, s = d / Math.max(gw, gh);
  ctx.save();
  ctx.translate(cx - (gx + gw / 2) * s, cy - (gy + gh / 2) * s); ctx.scale(s, s);
  foilPath(ctx, mode, stops, P.gear, LOGO_V.w, LOGO_V.h, level);
  ctx.restore();
}
// a thin foil line / ring helper (colour mode: gradient across the canvas, ORM: smooth metal, relief: raised)
function line(ctx, mode, stops, x0, y0, x1, y1, lw, level = 0.85) {
  ctx.save(); foil(ctx, mode, stops, 0, y0, 0, y0 + lw * 4, level); ctx.fillRect(x0, y0 - lw / 2, x1 - x0, lw); ctx.restore();
}
function ring(ctx, mode, stops, cx, cy, r, lw, level = 0.85) {
  ctx.save(); foil(ctx, mode, stops, cx - r, cy - r, cx + r, cy + r, level); ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); ctx.restore();
}
function dots(ctx, mode, stops, x0, x1, y, r, step, level = 0.8) {
  ctx.save(); foil(ctx, mode, stops, x0, y - r, x1, y + r, level);
  for (let x = x0 + step / 2; x < x1; x += step) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  ctx.restore();
}
// diamond trellis: continuous around the wrap (the column count is a whole number)
function trellis(ctx, w, h, color, lw, alpha, cols) {
  const dx = w / cols, dy = dx * 0.62;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (let x = -dx; x <= w + dx; x += dx) for (let y = -dy; y <= h + dy; y += dy * 2) {
    ctx.moveTo(x, y); ctx.lineTo(x + dx / 2, y + dy); ctx.lineTo(x, y + 2 * dy);
    ctx.moveTo(x + dx, y); ctx.lineTo(x + dx / 2, y + dy);
    ctx.moveTo(x + dx / 2, y + dy); ctx.lineTo(x + dx, y + 2 * dy);
  }
  ctx.stroke(); ctx.restore();
}

/* ------------------------------------------------------------------ premium navy tin */
// panels = x centres of the printed panels; pw = panel width. variant: 'logo' (front of the body), 'top' (lid of a box tin)
function premium(ctx, mode, w, h, cwI, panels, pw, variant, relief = 'plain') {
  const cw = COLORWAYS[cwI] || COLORWAYS[0], F = cw.foil, cy = h / 2;
  // base
  if (mode === 'color') {
    grad(ctx, w, h, cw.body[0], cw.body[1], 1);
    const cols = Math.max(8, Math.round(w / (h * 0.2)));
    trellis(ctx, w, h, cw.line, Math.max(1, h * 0.0035), 0.13, cols);
    const sh = ctx.createLinearGradient(0, 0, 0, h); // lacquer sheen: a little lighter above the middle, darker at the foot
    sh.addColorStop(0, 'rgba(255,255,255,.07)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.08)');
    ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h);
  } else if (mode === 'orm') { ctx.fillStyle = orm(INK_ROUGH, INK_METAL); ctx.fillRect(0, 0, w, h); }
  else {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    if (relief === 'emboss') trellis(ctx, w, h, '#fff', Math.max(1.5, h * 0.006), 0.55, Math.max(8, Math.round(w / (h * 0.2))));
  }
  // foil rules and rim
  const u = Math.min(h, pw * 0.48) / 489; // 1 unit = a pixel of the 2048 x 489 round-tin wrap
  line(ctx, mode, F, 0, h * 0.052, w, h * 0.052, 11 * u, 0.9);
  line(ctx, mode, F, 0, h * 0.086, w, h * 0.086, 3.2 * u, 0.7);
  line(ctx, mode, F, 0, h * 0.948, w, h * 0.948, 11 * u, 0.9);
  line(ctx, mode, F, 0, h * 0.914, w, h * 0.914, 3.2 * u, 0.7);
  if (variant === 'top') {
    // lid of a box tin: a framed gear mark
    const cx = w / 2, d = Math.min(w, h) * 0.58;
    ring(ctx, mode, F, cx, cy, d * 0.62, 4 * u, 0.8);
    ring(ctx, mode, F, cx, cy, d * 0.68, 2.2 * u, 0.7);
    drawGear(ctx, mode, F, cx, cy, d, 1);
    return;
  }
  // the front: logo in a notched frame
  const fh = Math.min(h * 0.66, pw * 0.58), fw = Math.min(fh * 1.4, pw * 0.8);
  panels.forEach((px, i) => {
    // frame: a hairline rectangle with notched corners, doubled
    const frame = (g, lw, lvl) => {
      const x0 = px - fw / 2 - g, x1 = px + fw / 2 + g, y0 = cy - fh / 2 - g, y1 = cy + fh / 2 + g, n = Math.min(fw, fh) * 0.09 + g;
      ctx.save(); foil(ctx, mode, F, x0, y0, x1, y1, lvl); ctx.lineWidth = lw; ctx.lineJoin = 'miter';
      ctx.beginPath();
      ctx.moveTo(x0 + n, y0); ctx.lineTo(x1 - n, y0); ctx.lineTo(x1, y0 + n); ctx.lineTo(x1, y1 - n); ctx.lineTo(x1 - n, y1);
      ctx.lineTo(x0 + n, y1); ctx.lineTo(x0, y1 - n); ctx.lineTo(x0, y0 + n); ctx.closePath(); ctx.stroke(); ctx.restore();
    };
    frame(0, 3.4 * u, 0.85); frame(11 * u, 1.4 * u, 0.6);
    drawLockup(ctx, mode, F, px, cy + fh * 0.01, fw * 0.8, fh * 0.8, 1);
    // small foil text in the lower rule band
    const small = 16 * u;
    if (mode === 'color') {
      const g = ctx.createLinearGradient(px - pw * 0.2, 0, px + pw * 0.2, 0);
      [[0, F[1]], [0.5, F[0]], [1, F[1]]].forEach(([o, c]) => g.addColorStop(o, c));
      txt(ctx, i % 2 === 0 ? 'MADE IN JORDAN  ·  SINCE 1998' : 'صناعة أردنية  ·  منذ 1998', px, h * 0.876, small, g, { spacing: i % 2 === 0 ? 5 * u : 0, weight: 600, font: i % 2 === 0 ? FD : FA });
    } else if (mode === 'relief') {
      txt(ctx, i % 2 === 0 ? 'MADE IN JORDAN  ·  SINCE 1998' : 'صناعة أردنية  ·  منذ 1998', px, h * 0.876, small, gray(0.7), { spacing: i % 2 === 0 ? 5 * u : 0, weight: 600, font: i % 2 === 0 ? FD : FA });
    } else {
      txt(ctx, i % 2 === 0 ? 'MADE IN JORDAN  ·  SINCE 1998' : 'صناعة أردنية  ·  منذ 1998', px, h * 0.876, small, orm(FOIL_ROUGH, 255), { spacing: i % 2 === 0 ? 5 * u : 0, weight: 600, font: i % 2 === 0 ? FD : FA });
    }
    // beaded rows above the frame
    dots(ctx, mode, F, px - pw * 0.5, px + pw * 0.5, h * 0.118, 2.3 * u, 14 * u, 0.7);
  });
}

/* ------------------------------------------------------------------ gold seal of the factory on the industry tins */
function seal(ctx, mode, px, cy, r, accent) {
  ctx.save();
  if (mode === 'color') {
    ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = r * 0.12; ctx.shadowOffsetY = r * 0.05;
    ctx.fillStyle = PAL.n900; ctx.beginPath(); ctx.arc(px, cy, r, 0, 7); ctx.fill();
    ctx.shadowColor = 'transparent';
  } else if (mode === 'orm') { ctx.fillStyle = orm(INK_ROUGH, INK_METAL); ctx.beginPath(); ctx.arc(px, cy, r, 0, 7); ctx.fill(); }
  else { ctx.fillStyle = gray(0.25); ctx.beginPath(); ctx.arc(px, cy, r, 0, 7); ctx.fill(); }
  ctx.restore();
  ring(ctx, mode, GOLD, px, cy, r * 0.93, Math.max(1.5, r * 0.045), 0.9);
  ring(ctx, mode, GOLD, px, cy, r * 0.84, Math.max(1, r * 0.02), 0.6);
  drawGear(ctx, mode, GOLD, px, cy, r * 1.34, 1);
}

/* ------------------------------------------------------------------ industry artwork */
function industry(ctx, mode, w, h, theme, panels, pw) {
  const pwr = pw, k = Math.min(pwr / 1024, h / 640), cy = h / 2;
  const C = mode === 'color';
  const ink = (fn) => { if (C) fn(); };                  // artwork that exists only in the colour map
  const sealAt = (px) => seal(ctx, mode, px + pwr * 0.29, cy, Math.min(h * 0.15, pwr * 0.1), THEMES[theme] && THEMES[theme].accent);
  if (!C) {
    ctx.fillStyle = mode === 'orm' ? orm(INK_ROUGH, INK_METAL) : '#000'; ctx.fillRect(0, 0, w, h);
    panels.forEach(sealAt);
    return;
  }
  if (theme === 'olive') {
    grad(ctx, w, h, '#2a4f2d', '#0d2212', 1);
    ringGrid(ctx, w, h, '#d9a93c', 0.07, 130 * k, 44 * k);
    ctx.fillStyle = '#d9a93c'; ctx.fillRect(0, h * 0.06, w, 7 * k); ctx.fillRect(0, h * 0.94 - 7 * k, w, 7 * k);
    const bx = [0, w / 2, w];
    bx.forEach((x) => { if (pwr > 300) branch(ctx, x - 40 * k, h * 0.9, h * 0.1, k); });
    panels.forEach((px) => {
      ctx.save();
      ctx.fillStyle = 'rgba(8,24,12,0.82)'; ctx.beginPath(); ctx.arc(px, cy, 220 * k, 0, 7); ctx.fill();
      ctx.strokeStyle = '#d9a93c'; ctx.lineWidth = 6 * k; ctx.beginPath(); ctx.arc(px, cy, 214 * k, 0, 7); ctx.stroke();
      ctx.lineWidth = 2 * k; ctx.beginPath(); ctx.arc(px, cy, 196 * k, 0, 7); ctx.stroke();
      ctx.restore();
      txt(ctx, 'EXTRA VIRGIN', px, cy - 92 * k, 36 * k, '#f3dd9a', { spacing: 7 * k, weight: 600 });
      txt(ctx, 'OLIVE OIL', px, cy - 26 * k, 74 * k, '#ffffff', { spacing: 3 * k, weight: 800 });
      ctx.fillStyle = '#d9a93c'; ctx.fillRect(px - 110 * k, cy + 28 * k, 220 * k, 3 * k);
      txt(ctx, 'زيت زيتون بكر ممتاز', px, cy + 86 * k, 46 * k, '#f3dd9a', { font: FA, weight: 500 });
    });
  } else if (theme === 'eid') {
    grad(ctx, w, h, PAL.n700, PAL.n950, 1);
    starLattice(ctx, w, h, 150 * k, '#e9bd5a', 2 * k, 0.4);
    ctx.fillStyle = '#e9bd5a'; ctx.fillRect(0, h * 0.06, w, 8 * k); ctx.fillRect(0, h * 0.94 - 8 * k, w, 8 * k);
    panels.forEach((px) => {
      ctx.save();
      ctx.fillStyle = 'rgba(0,19,45,0.88)'; star8(ctx, px, cy, 250 * k, Math.PI / 8); ctx.fill();
      ctx.strokeStyle = '#e9bd5a'; ctx.lineWidth = 5 * k; ctx.stroke();
      ctx.fillStyle = '#e9bd5a'; ctx.beginPath(); ctx.arc(px, cy - 108 * k, 46 * k, 0, 7); ctx.fill();
      ctx.fillStyle = PAL.n950; ctx.beginPath(); ctx.arc(px + 18 * k, cy - 118 * k, 40 * k, 0, 7); ctx.fill();
      ctx.restore();
      txt(ctx, 'رمضان كريم', px, cy - 12 * k, 82 * k, '#ffffff', { font: FA, weight: 600 });
      txt(ctx, 'SWEETS · KA\'AK · CHOCOLATE', px, cy + 66 * k, 24 * k, '#f4d68c', { spacing: 4 * k, weight: 600 });
      txt(ctx, 'حلويات · كعك · شوكولاتة', px, cy + 112 * k, 34 * k, '#f4d68c', { font: FA, weight: 400 });
    });
  } else if (theme === 'cheese') {
    grad(ctx, w, h, '#fbfaf3', PAL.n50, 1);
    ctx.save();
    ctx.fillStyle = '#9ccf9b'; ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, h * 0.84 - Math.sin(x / (170 * k)) * 26 * k);
    ctx.lineTo(w, h); ctx.fill();
    ctx.fillStyle = '#5faa6e'; ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, h * 0.92 - Math.sin(x / (120 * k) + 2) * 18 * k);
    ctx.lineTo(w, h); ctx.fill();
    ctx.fillStyle = PAL.n600; ctx.fillRect(0, h * 0.04, w, 12 * k);
    ctx.restore();
    panels.forEach((px) => {
      ctx.save();
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = PAL.n600; ctx.lineWidth = 6 * k;
      ctx.beginPath(); ctx.arc(px, cy - 20 * k, 205 * k, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.n600;
      ctx.beginPath(); ctx.moveTo(px, cy - 168 * k); ctx.quadraticCurveTo(px + 44 * k, cy - 100 * k, px, cy - 84 * k);
      ctx.quadraticCurveTo(px - 44 * k, cy - 100 * k, px, cy - 168 * k); ctx.fill();
      ctx.restore();
      txt(ctx, 'WHITE CHEESE', px, cy - 20 * k, 54 * k, PAL.n600, { spacing: 3 * k, weight: 800 });
      txt(ctx, 'جبنة بيضاء', px, cy + 62 * k, 70 * k, PAL.n600, { font: FA, weight: 600 });
    });
  } else if (theme === 'milk') {
    grad(ctx, w, h, '#f5f8fd', PAL.n100, 1);
    ctx.fillStyle = PAL.n600; ctx.fillRect(0, h * 0.05, w, 12 * k); ctx.fillRect(0, h * 0.95 - 12 * k, w, 12 * k);
    ringGrid(ctx, w, h, PAL.n600, 0.07, 120 * k, 40 * k);
    panels.forEach((px) => {
      ctx.save();
      ctx.fillStyle = PAL.n600; ctx.beginPath(); ctx.arc(px, cy - 10 * k, 215 * k, 0, 7); ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.arc(px, cy - 10 * k, 198 * k, 0, 7); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(px, cy - 168 * k); ctx.quadraticCurveTo(px + 46 * k, cy - 100 * k, px, cy - 78 * k);
      ctx.quadraticCurveTo(px - 46 * k, cy - 100 * k, px, cy - 168 * k); ctx.fill();
      ctx.restore();
      txt(ctx, 'MILK POWDER', px, cy - 10 * k, 52 * k, '#ffffff', { spacing: 3 * k, weight: 800 });
      txt(ctx, 'حليب بودرة', px, cy + 64 * k, 66 * k, PAL.n100, { font: FA, weight: 600 });
    });
  } else if (theme === 'coffee') {
    grad(ctx, w, h, '#3a2216', '#150b06', 1);
    ringGrid(ctx, w, h, '#c8943c', 0.09, 125 * k, 42 * k);
    ctx.fillStyle = '#c8943c'; ctx.fillRect(0, h * 0.06, w, 8 * k); ctx.fillRect(0, h * 0.94 - 8 * k, w, 8 * k);
    panels.forEach((px) => {
      ctx.save();
      ctx.strokeStyle = '#c8943c'; ctx.lineWidth = 5 * k;
      ctx.beginPath(); ctx.ellipse(px, cy - 96 * k, 74 * k, 46 * k, -0.35, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 60 * k, cy - 70 * k); ctx.quadraticCurveTo(px, cy - 120 * k, px + 60 * k, cy - 122 * k); ctx.stroke();
      ctx.restore();
      txt(ctx, 'COFFEE', px, cy + 10 * k, 92 * k, '#f3dcae', { spacing: 6 * k, weight: 800 });
      txt(ctx, '& TEA', px, cy + 86 * k, 54 * k, '#c8943c', { spacing: 12 * k, weight: 700 });
      txt(ctx, 'قهوة وشاي', px, cy + 156 * k, 56 * k, '#f3dcae', { font: FA, weight: 500 });
    });
  } else if (theme === 'industrial') {
    grad(ctx, w, h, '#c9d0da', '#8d97a6', 1);
    ctx.fillStyle = '#e8662a'; ctx.fillRect(0, h * 0.05, w, 16 * k); ctx.fillRect(0, h * 0.95 - 16 * k, w, 16 * k);
    ctx.save(); ctx.globalAlpha = 0.14; ctx.strokeStyle = '#2a3340'; ctx.lineWidth = 3 * k;
    for (let x = -h; x < w; x += 46 * k) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke(); }
    ctx.restore();
    panels.forEach((px) => {
      ctx.save();
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#2a3340'; ctx.lineWidth = 6 * k;
      ctx.beginPath(); ctx.roundRect(px - 235 * k, cy - 150 * k, 470 * k, 300 * k, 30 * k); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e8662a'; ctx.fillRect(px - 235 * k, cy - 150 * k, 470 * k, 70 * k);
      ctx.restore();
      txt(ctx, 'INDUSTRIAL', px, cy - 114 * k, 44 * k, '#ffffff', { spacing: 8 * k, weight: 800 });
      txt(ctx, 'PAINT · CHEMICALS', px, cy - 18 * k, 40 * k, '#2a3340', { spacing: 4 * k, weight: 700 });
      txt(ctx, 'دهانات · كيماويات', px, cy + 52 * k, 50 * k, '#2a3340', { font: FA, weight: 500 });
    });
  }
  ink(() => panels.forEach(sealAt));
}

/* ------------------------------------------------------------------ drawing entry points */
function drawArt(ctx, w, h, theme, cwI, panels, mode = 'color', relief = 'plain', variant = 'logo') {
  const pw = w / panels.length;
  if (theme === 'brand') premium(ctx, mode, w, h, cwI, panels, pw, variant, relief);
  else industry(ctx, mode, w, h, theme, panels, pw);
}

function drawLid(ctx, s, theme, cwI, mode = 'color', relief = 'plain') {
  const cw = COLORWAYS[cwI] || COLORWAYS[0], c = s / 2;
  const premiumLid = theme === 'brand';
  const F = premiumLid ? cw.foil : GOLD;
  const pal = {
    brand: cw.body, olive: ['#2a4f2d', '#0d2212'], eid: [PAL.n700, PAL.n950], cheese: ['#ffffff', PAL.n100],
    milk: ['#f5f8fd', PAL.n100], coffee: ['#3a2216', '#150b06'], industrial: ['#c9d0da', '#8d97a6']
  }[theme] || cw.body;
  if (mode === 'color') {
    const g = ctx.createRadialGradient(c, c, 10, c, c, c);
    g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    if (theme === 'eid') starLattice(ctx, s, s, s * 0.16, '#e9bd5a', 2, 0.35);
  } else { ctx.fillStyle = mode === 'orm' ? orm(INK_ROUGH, INK_METAL) : '#000'; ctx.fillRect(0, 0, s, s); }
  // foil rings, a beaded ring and fine radial ticks (the rim of the lid), then the gear mark
  ring(ctx, mode, F, c, c, c * 0.92, s * 0.014, 0.9);
  ring(ctx, mode, F, c, c, c * 0.85, s * 0.006, 0.7);
  ctx.save(); foil(ctx, mode, F, 0, 0, s, s, 0.75);
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2; ctx.beginPath(); ctx.arc(c + Math.cos(a) * c * 0.78, c + Math.sin(a) * c * 0.78, s * 0.0055, 0, 7); ctx.fill(); }
  ctx.restore();
  ring(ctx, mode, F, c, c, c * 0.68, s * 0.006, 0.7);
  drawGear(ctx, mode, F, c, c, c * 1.0, 1);
}

function noise(ctx, w, h, a) {
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) img.data[i] = img.data[i + 1] = img.data[i + 2] = Math.random() * 255 * a;
  ctx.putImageData(img, 0, 0);
}
function finishRelief(c, relief) {
  const w = c.width, h = c.height;
  const out = canvas(w, h), x = out.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
  try { x.filter = 'blur(1.3px)'; } catch (e) { /* no canvas filters: harder edges */ }
  x.drawImage(c, 0, 0); x.filter = 'none';
  if (relief === 'rough') {
    // a fine grain over the whole surface, weaker than the old plain "rough touch" so the relief stays readable
    const n = canvas(w, h); noise(n.getContext('2d'), w, h, 1);
    x.globalAlpha = 0.45; x.globalCompositeOperation = 'lighter'; x.drawImage(n, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
  }
  return out;
}

// the plain "rough touch" / old emboss bump maps are still used by surfaces without layered artwork (the printed sheet of the journey)
function drawBump(ctx, w, h, kind) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
  if (kind === 'emboss') {
    ctx.filter = 'blur(2px)';
    starLattice(ctx, w, h, 150 * Math.min(w / 2048 * 2, h / 640), '#fff', 7, 1);
    ctx.filter = 'none';
  } else {
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) { const v = 90 + Math.random() * 165; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
  }
}

/* ------------------------------------------------------------------ public API */
// size / panels of every kind of surface
function spec(kind, aspectHW) {
  if (kind === 'wrap') { const w = 2048, h = Math.round(2048 * aspectHW); return { w, h, panels: [w * 0.25, w * 0.75], variant: 'logo' }; }
  if (kind === 'top') { const w = 1024, h = Math.round(1024 * aspectHW); return { w, h, panels: [w / 2], variant: 'top' }; }
  if (kind === 'lid') return { w: 512, h: 512 };
  return { w: 1024, h: Math.round(1024 * aspectHW), panels: [512], variant: 'logo' };   // 'face'
}
function render(kind, theme, cw, aspectHW, mode, relief) {
  const sp = spec(kind, aspectHW), c = canvas(sp.w, sp.h), ctx = c.getContext('2d');
  if (kind === 'lid') drawLid(ctx, sp.w, theme, cw, mode, relief);
  else drawArt(ctx, sp.w, sp.h, theme, cw, sp.panels, mode, relief, sp.variant);
  return c;
}
const keyOf = (kind, theme, cw, aspectHW) => `${kind}:${theme}:${cw}:${(+aspectHW || 0).toFixed(2)}`;

// All the maps of one printed surface. kind: 'wrap' (round body), 'face' (side of a box tin), 'top' (lid of a box tin), 'lid' (round lid).
export function layers(kind, theme, cw = 0, aspectHW = 1) {
  const key = keyOf(kind, theme, cw, aspectHW);
  if (!cache.has(key)) {
    const color = render(kind, theme, cw, aspectHW, 'color');
    const o = toTex(render(kind, theme, cw, aspectHW, 'orm'), false);
    cache.set(key, { key, kind, theme, cw, aspectHW, map: toTex(color), orm: o, relief: {} });
  }
  return cache.get(key);
}
// The bump map of a surface for one finish variant ('plain' | 'rough' | 'emboss'), made on demand.
export function reliefMap(L, variant = 'plain') {
  if (!L.relief[variant]) {
    const t = toTex(finishRelief(render(L.kind, L.theme, L.cw, L.aspectHW, 'relief', variant), variant), false);
    L.relief[variant] = t;
  }
  return L.relief[variant];
}
export const wrapTexture = (theme, cw, aspectHW) => layers('wrap', theme, cw, aspectHW).map;
export const faceTexture = (theme, cw, aspectHW) => layers('face', theme, cw, aspectHW).map;
export const lidTexture = (theme, cw) => layers('lid', theme, cw, 1).map;
export function bumpTexture(kind) {
  const key = 'bump:' + kind;
  if (!cache.has(key)) {
    const c = canvas(1024, 512); drawBump(c.getContext('2d'), 1024, 512, kind);
    const t = toTex(c, false); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1);
    cache.set(key, t);
  }
  return cache.get(key);
}
export function blankSheetCanvas(w, h) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#dfe4ec'); g.addColorStop(0.5, '#f4f6fa'); g.addColorStop(1, '#c9d0dc');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 0.07; ctx.strokeStyle = PAL.n400;
  for (let y = 0; y < h; y += 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random() * 2 - 1)); ctx.stroke(); }
  return c;
}
export function artCanvas(theme, cw, aspectHW) {
  return render('wrap', theme, cw, aspectHW, 'color');
}
export function labelSprite(text, color = '#ffffff') {
  const c = canvas(512, 128), ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,19,45,0.8)';
  const w = 18 + text.length * 22;
  ctx.beginPath(); ctx.roundRect((512 - w) / 2, 28, w, 72, 36); ctx.fill();
  ctx.font = `600 40px ${FD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(text, 256, 66);
  const t = toTex(c); t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}
