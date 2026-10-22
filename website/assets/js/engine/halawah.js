// The Halawah artwork (a real round tin made at the factory, photographed) dressed onto ANY surface of ANY tin:
// a round lid, a box top, a wrap around a can or a flat face of a box. Each surface is three canvases built from the
// photo files in assets/img/tins/: the colour, the relief (motifs stand proud, for the embossed finish) and the spot
// mask (the clear coat only on the motifs, for spot UV). The side band (woman, date cup, dallah) repeats across the
// surface at its own proportion, in staggered rows on tall surfaces, so a tall can never shows a stretched band.
import * as THREE from 'three';

const BASE = new URL('../../img/tins/', import.meta.url).href;
export const RED = '#9c302e';      // the lid lacquer, sampled from the photo
export const WHITE = '#e9e5e0';    // the side band background
export const GOLD = '#d9b45a';
const BAND = 286 / 1024;           // height / width of one band tile

const IMG = {};
function img(file) {
  if (!IMG[file]) {
    const i = new Image(); i.decoding = 'async';
    IMG[file] = { i, ready: new Promise((res) => { i.onload = res; i.onerror = res; }) };
    i.src = BASE + file;
  }
  return IMG[file];
}
const FILES = {
  lid: ['halawah-lid.jpg', 'halawah-lid-relief.png', 'halawah-lid-spot.png'],
  side: ['halawah-side.jpg', 'halawah-side-relief.png', 'halawah-side-spot.png']
};
const GROUND = [[RED, WHITE], ['#000', '#000'], ['#000', '#000']]; // per layer: [lid ground, band ground]

// draw one layer (0 colour, 1 relief, 2 spot) of a surface
function paint(ctx, W, H, kind, layer, reps) {
  const lidI = img(FILES.lid[layer]).i, sideI = img(FILES.side[layer]).i;
  if (kind === 'lid' || kind === 'top') {
    ctx.fillStyle = GROUND[layer][0]; ctx.fillRect(0, 0, W, H);
    const s = Math.min(W, H);
    if (lidI.naturalWidth) ctx.drawImage(lidI, (W - s) / 2, (H - s) / 2, s, s);
    return;
  }
  ctx.fillStyle = GROUND[layer][1]; ctx.fillRect(0, 0, W, H);
  if (!sideI.naturalWidth) return;
  const tw = W / reps, rows = Math.max(1, Math.round(H / (tw * BAND))), th = H / rows;
  for (let r = 0; r < rows; r++) {
    const off = rows > 1 && r % 2 ? tw / 2 : 0;
    for (let c = -1; c <= reps; c++) ctx.drawImage(sideI, c * tw + off, r * th, tw, th);
  }
}

const cache = {};
// kind: 'lid' (round lid), 'top' (box lid), 'wrap' (around a can) or 'face' (a side of a box)
// aspect: height / width of the surface; reps: how many band tiles across its width
export function surface(kind, aspect = 1, reps = 1) {
  const flat = kind === 'lid' || kind === 'top';
  const a = Math.max(0.02, aspect), n = flat ? 1 : Math.max(1, Math.round(reps));
  const key = `${flat ? kind : 'band'}|${a.toFixed(3)}|${n}`;
  if (cache[key]) return cache[key];
  let W, H;
  if (flat) { W = 1024; H = Math.max(64, Math.round(1024 * a)); if (H > 1024) { W = Math.round(1024 / a); H = 1024; } }
  else { W = Math.min(4096, Math.max(1024, n * 512)); H = Math.min(4096, Math.max(96, Math.round(W * a))); }
  const out = { photo: true };
  const layers = [0, 1, 2].map((layer) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const t = new THREE.CanvasTexture(c);
    if (layer === 0) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    const draw = () => { paint(c.getContext('2d'), W, H, kind, layer, n); t.needsUpdate = true; };
    draw();
    return { c, t, draw, files: [img(FILES.lid[layer]).ready, img(FILES.side[layer]).ready] };
  });
  out.map = layers[0].t; out.relief = layers[1].t; out.spot = layers[2].t; out.canvas = layers[0].c;
  out.ready = Promise.all(layers.map((l) => Promise.all(l.files).then(l.draw)));
  return (cache[key] = out);
}
// start the downloads early (the loader runs while they arrive)
export function preload() { Object.values(FILES).flat().forEach(img); }
