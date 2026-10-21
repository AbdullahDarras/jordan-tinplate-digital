// Procedural "printed tinplate" artwork. Every texture is drawn on a canvas, so the prototype needs no image files.
import * as THREE from 'three';

const FD = '"Bricolage Grotesque","Readex Pro",system-ui,sans-serif';
const FA = '"Readex Pro","Bricolage Grotesque",system-ui,sans-serif';

export const COLORWAYS = [
  { a: '#002F6C', b: '#0b1330', accent: '#f2a93b', ink: '#ffffff' }, // brand navy
  { a: '#c2561f', b: '#5a1f0a', accent: '#ffe0a8', ink: '#ffffff' }, // copper
  { a: '#0f7a73', b: '#05302e', accent: '#f6d27a', ink: '#ffffff' }, // teal
  { a: '#f3e9d4', b: '#d9c6a0', accent: '#002F6C', ink: '#002F6C' }  // cream
];

const cache = new Map();

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

/* ------------------------------------------------------------------ main artwork */
function drawArt(ctx, w, h, theme, cwI, panels) {
  const cw = COLORWAYS[cwI] || COLORWAYS[0];
  const pw = w / panels.length;
  const k = Math.min(pw / 1024, h / 640);
  const cy = h / 2;

  if (theme === 'brand') {
    grad(ctx, w, h, cw.a, cw.b, 1);
    ringGrid(ctx, w, h, cw.accent, 0.1, 120 * k, 40 * k);
    ctx.fillStyle = cw.accent;
    ctx.fillRect(0, h * 0.06, w, 8 * k); ctx.fillRect(0, h * 0.94 - 8 * k, w, 8 * k);
    panels.forEach((px) => {
      txt(ctx, 'JORDAN', px, cy - 120 * k, 150 * k, cw.ink, { spacing: 4 * k, weight: 800 });
      txt(ctx, 'TINPLATE', px, cy + 8 * k, 150 * k, cw.accent, { spacing: 4 * k, weight: 800 });
      txt(ctx, 'CANNING', px, cy + 98 * k, 40 * k, cw.ink, { spacing: 22 * k, weight: 600, alpha: 0.9 });
      ctx.fillStyle = cw.accent; ctx.fillRect(px - 150 * k, cy + 134 * k, 300 * k, 5 * k);
      txt(ctx, 'WE PRINT. WE CAN.', px, cy + 172 * k, 40 * k, cw.ink, { spacing: 8 * k, weight: 600, alpha: 0.9 });
      txt(ctx, 'علب معدنية · منذ 1998', px, cy + 228 * k, 40 * k, cw.ink, { font: FA, weight: 500, alpha: 0.85 });
    });
  } else if (theme === 'olive') {
    grad(ctx, w, h, '#2a4f2d', '#0d2212', 1);
    ringGrid(ctx, w, h, '#d9a93c', 0.07, 130 * k, 44 * k);
    ctx.fillStyle = '#d9a93c'; ctx.fillRect(0, h * 0.06, w, 7 * k); ctx.fillRect(0, h * 0.94 - 7 * k, w, 7 * k);
    // branches between panels and at the wrap seam
    const bx = [0, w / 2, w];
    bx.forEach((x) => { if (pw > 300) branch(ctx, x - 40 * k, h * 0.9, h * 0.1, k); });
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
      txt(ctx, 'SAMPLE ARTWORK', px, cy + 146 * k, 18 * k, '#ffffff', { spacing: 6 * k, weight: 500, alpha: 0.5 });
    });
  } else if (theme === 'eid') {
    grad(ctx, w, h, '#2a1f73', '#0d0933', 1);
    starLattice(ctx, w, h, 150 * k, '#e9bd5a', 2 * k, 0.4);
    ctx.fillStyle = '#e9bd5a'; ctx.fillRect(0, h * 0.06, w, 8 * k); ctx.fillRect(0, h * 0.94 - 8 * k, w, 8 * k);
    panels.forEach((px) => {
      ctx.save();
      ctx.fillStyle = 'rgba(12,8,45,0.86)'; star8(ctx, px, cy, 250 * k, Math.PI / 8); ctx.fill();
      ctx.strokeStyle = '#e9bd5a'; ctx.lineWidth = 5 * k; ctx.stroke();
      // crescent
      ctx.fillStyle = '#e9bd5a'; ctx.beginPath(); ctx.arc(px, cy - 108 * k, 46 * k, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(12,8,45,1)'; ctx.beginPath(); ctx.arc(px + 18 * k, cy - 118 * k, 40 * k, 0, 7); ctx.fill();
      ctx.restore();
      txt(ctx, 'رمضان كريم', px, cy - 12 * k, 82 * k, '#ffffff', { font: FA, weight: 600 });
      txt(ctx, 'SWEETS · KA\'AK · CHOCOLATE', px, cy + 66 * k, 24 * k, '#f4d68c', { spacing: 4 * k, weight: 600 });
      txt(ctx, 'حلويات · كعك · شوكولاتة', px, cy + 112 * k, 34 * k, '#f4d68c', { font: FA, weight: 400 });
      txt(ctx, 'SAMPLE ARTWORK', px, cy + 170 * k, 16 * k, '#ffffff', { spacing: 6 * k, weight: 500, alpha: 0.45 });
    });
  } else if (theme === 'cheese') {
    grad(ctx, w, h, '#fbfaf3', '#e3ebf1', 1);
    // hills
    ctx.save();
    ctx.fillStyle = '#9ccf9b'; ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, h * 0.84 - Math.sin(x / (170 * k)) * 26 * k);
    ctx.lineTo(w, h); ctx.fill();
    ctx.fillStyle = '#5faa6e'; ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, h * 0.92 - Math.sin(x / (120 * k) + 2) * 18 * k);
    ctx.lineTo(w, h); ctx.fill();
    ctx.fillStyle = '#2a6fb8'; ctx.fillRect(0, h * 0.04, w, 12 * k);
    ctx.restore();
    panels.forEach((px) => {
      ctx.save();
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#2a6fb8'; ctx.lineWidth = 6 * k;
      ctx.beginPath(); ctx.arc(px, cy - 20 * k, 205 * k, 0, 7); ctx.fill(); ctx.stroke();
      // milk drop
      ctx.fillStyle = '#2a6fb8';
      ctx.beginPath(); ctx.moveTo(px, cy - 168 * k); ctx.quadraticCurveTo(px + 44 * k, cy - 100 * k, px, cy - 84 * k);
      ctx.quadraticCurveTo(px - 44 * k, cy - 100 * k, px, cy - 168 * k); ctx.fill();
      ctx.restore();
      txt(ctx, 'WHITE CHEESE', px, cy - 20 * k, 54 * k, '#1b4f8a', { spacing: 3 * k, weight: 800 });
      txt(ctx, 'جبنة بيضاء', px, cy + 62 * k, 70 * k, '#1b4f8a', { font: FA, weight: 600 });
      txt(ctx, 'SAMPLE ARTWORK', px, cy + 128 * k, 16 * k, '#1b4f8a', { spacing: 6 * k, weight: 500, alpha: 0.5 });
    });
  }
}

function drawLid(ctx, s, theme, cwI) {
  const cw = COLORWAYS[cwI] || COLORWAYS[0];
  const c = s / 2;
  const pal = {
    brand: [cw.a, cw.b, cw.accent],
    olive: ['#2a4f2d', '#0d2212', '#d9a93c'],
    eid: ['#2a1f73', '#0d0933', '#e9bd5a'],
    cheese: ['#ffffff', '#dfe8ef', '#2a6fb8']
  }[theme] || [cw.a, cw.b, cw.accent];
  const g = ctx.createRadialGradient(c, c, 10, c, c, c);
  g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = pal[2]; ctx.globalAlpha = 0.9;
  [0.9, 0.82, 0.5].forEach((r, i) => { ctx.lineWidth = i === 2 ? s * 0.01 : s * 0.014; ctx.beginPath(); ctx.arc(c, c, c * r, 0, 7); ctx.stroke(); });
  ctx.globalAlpha = 1;
  if (theme === 'eid') { starLattice(ctx, s, s, s * 0.16, pal[2], 2, 0.35); star8(ctx, c, c, c * 0.42, Math.PI / 8); ctx.fillStyle = pal[2]; ctx.fill(); }
  else if (theme === 'olive') { txt(ctx, 'EVOO', c, c, s * 0.2, pal[2], { weight: 800, spacing: 4 }); }
  else if (theme === 'cheese') { txt(ctx, 'جبنة', c, c - s * 0.03, s * 0.24, pal[2], { font: FA, weight: 700 }); }
  else { txt(ctx, 'JT', c, c, s * 0.34, pal[2], { weight: 800 }); }
}

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
export function wrapTexture(theme, cw, aspectHW) {
  const key = `wrap:${theme}:${cw}:${aspectHW.toFixed(2)}`;
  if (!cache.has(key)) {
    const c = canvas(2048, 2048 * aspectHW);
    drawArt(c.getContext('2d'), c.width, c.height, theme, cw, [c.width * 0.25, c.width * 0.75]);
    cache.set(key, toTex(c));
  }
  return cache.get(key);
}
export function faceTexture(theme, cw, aspectHW) {
  const key = `face:${theme}:${cw}:${aspectHW.toFixed(2)}`;
  if (!cache.has(key)) {
    const c = canvas(1024, 1024 * aspectHW);
    drawArt(c.getContext('2d'), c.width, c.height, theme, cw, [c.width / 2]);
    cache.set(key, toTex(c));
  }
  return cache.get(key);
}
export function lidTexture(theme, cw) {
  const key = `lid:${theme}:${cw}`;
  if (!cache.has(key)) {
    const c = canvas(512, 512); drawLid(c.getContext('2d'), 512, theme, cw);
    cache.set(key, toTex(c));
  }
  return cache.get(key);
}
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
  ctx.globalAlpha = 0.07; ctx.strokeStyle = '#4a5878';
  for (let y = 0; y < h; y += 5) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random() * 2 - 1)); ctx.stroke(); }
  return c;
}
export function artCanvas(theme, cw, aspectHW) {
  const c = canvas(2048, 2048 * aspectHW);
  drawArt(c.getContext('2d'), c.width, c.height, theme, cw, [c.width * 0.25, c.width * 0.75]);
  return c;
}
export function labelSprite(text, color = '#ffffff') {
  const c = canvas(512, 128), ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(8,12,30,0.78)';
  const w = 18 + text.length * 22;
  ctx.beginPath(); ctx.roundRect((512 - w) / 2, 28, w, 72, 36); ctx.fill();
  ctx.font = `600 40px ${FD}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.fillText(text, 256, 66);
  const t = toTex(c); t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}
