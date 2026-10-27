// Real tins made at the factory, photographed, and dressed onto the 3D models. Each design lives in assets/img/tins/ as
// <key>-<part>.jpg (colour) plus <key>-<part>-relief.png (motifs stand proud: the embossed finish) and <key>-<part>-spot.png
// (the clear coat only on the motifs: spot UV). The parts were straightened out of the photographs: a round lid ('lid'),
// a box top ('top'), and the side ('side': a band unwrapped from a can, or the front face of a box).
//
// The Halawah tin is the signature design: its side band repeats at its own proportion on any surface (staggered rows on
// tall shapes). The other designs belong to one shape each (see DESIGN_FOR in scene.js) and are fitted to it.
import * as THREE from 'three';

const BASE = new URL('../../img/tins/', import.meta.url).href;
export const RED = '#9c302e';      // the Halawah lid lacquer, sampled from the photo
export const WHITE = '#e9e5e0';    // the Halawah side band background
export const GOLD = '#d9b45a';
export const SILVER = '#d9dde4';
const BAND = 286 / 1024;           // height / width of one Halawah band tile

// skirt = the lacquer of the lid's side; rim = the rolled edges; reps = how many times a can's side band goes round
export const DESIGNS = {
  // the main tin: Al Qaisi Roastery's round tin (catalogue rd-235, 60 mm): a stamped gold lid, plain gold skirt, a dark band with gold line art.
  // tileW: the side photo's own width (px) so the band keeps its resolution; plainSkirt: the real skirt is plain gold, not the lid's art;
  // bead: the curled lip is the same gold as the skirt (the studio's silver otherwise).
  qaisi: { kind: 'can', reps: 2, skirt: '#d79242', rim: GOLD, plainSkirt: true, bead: '#d79242', tileW: 3128, lidRes: 2048 },
  halawah: { kind: 'band', skirt: RED, rim: GOLD },
  bab: { kind: 'box', skirt: '#5a2210', rim: GOLD },           // square gift tin, Beirut clock tower
  jgz: { kind: 'box', skirt: '#9a5216', rim: GOLD },           // rectangular gift tin, desert village
  suliman: { kind: 'box', skirt: '#cbbb97', rim: GOLD },       // tall square tea tin
  levelmax: { kind: 'box', skirt: '#24201d', rim: GOLD },      // square tea caddy, black and gold
  najmah: { kind: 'octagon', skirt: '#1c1d3a', rim: GOLD, stretch: 1.45 }, // elongated octagonal sweets tin
  frieds: { kind: 'can', reps: 3, skirt: '#3a1638', rim: SILVER },          // bucket
  abed: { kind: 'can', reps: 3, skirt: '#9a8a74', rim: SILVER },            // food can with a peel-off end
  maeen: { kind: 'can', reps: 3, skirt: '#c9ccd2', rim: SILVER, lid: 'abed' }, // milk powder can (closed end borrowed from abed)
  sufyan: { kind: 'can', reps: 3, skirt: '#2c2a52', rim: GOLD },           // low round sweets tin, navy with a carved door
  laqmi: { kind: 'can', reps: 3, skirt: '#1f6b3a', rim: SILVER },           // round can with a green slip lid (cheese & halawa can)
  // shapes with no photographed tin of their own wear a design that suits the shape:
  oval: { kind: 'can', reps: 3, skirt: '#9a5216', rim: GOLD, lid: ['jgz', 'top'], side: ['jgz', 'side'] }, // the desert landscape fits a wide oval lid
  paint: { kind: 'can', reps: 1, skirt: '#c4cad3', rim: SILVER },                                          // tinplate paint can, a label of paint swatches
  plain: { kind: 'plain', skirt: '#c4cad3', rim: SILVER }
};

const IMG = {};
function img(file) {
  if (!IMG[file]) {
    const i = new Image(); i.decoding = 'async';
    IMG[file] = { i, ready: new Promise((res) => { i.onload = res; i.onerror = res; }) };
    i.src = BASE + file;
  }
  return IMG[file];
}
const SUFFIX = ['.jpg', '-relief.png', '-spot.png'];
const file = (key, part, layer) => `${key}-${part}${SUFFIX[layer]}`;

// the parts a surface draws from, per design and surface kind
function partsFor(design, kind) {
  const d = DESIGNS[design] || DESIGNS.halawah;
  const lidRef = Array.isArray(d.lid) ? d.lid : [d.lid || design, 'lid'], sideRef = d.side || [design, 'side'];
  if (d.kind === 'plain') return { plain: true };
  if (d.kind === 'band') return kind === 'lid' || kind === 'top' ? { flat: [design, 'lid'] } : { band: [design, 'side'] };
  if (d.kind === 'box') return kind === 'lid' || kind === 'top' ? { flat: [design, 'top'] } : { face: [design, 'side'] };
  /* can, octagon */ return kind === 'lid' || kind === 'top' ? { flat: lidRef } : { strip: sideRef };
}

// draw one layer (0 colour, 1 relief, 2 spot) of a surface
function paint(ctx, W, H, P, layer, reps, ground, kind) {
  ctx.fillStyle = layer ? '#000' : ground; ctx.fillRect(0, 0, W, H);
  if (P.plain) return;
  if (P.flat) {
    const i = img(file(...P.flat, layer)).i; if (!i.naturalWidth) return;
    if (P.flat[1] === 'lid' && P.flat[0] === 'halawah') { const s = Math.min(W, H); ctx.drawImage(i, (W - s) / 2, (H - s) / 2, s, s); }
    else if (P.flat[1] === 'top' && kind === 'top') { ctx.save(); ctx.translate(W, H); ctx.rotate(Math.PI); ctx.drawImage(i, 0, 0, W, H); ctx.restore(); } // a box lid's top face is mapped back to front: turn the art to read from the front
    else ctx.drawImage(i, 0, 0, W, H);
    return;
  }
  if (P.face) { const i = img(file(...P.face, layer)).i; if (i.naturalWidth) ctx.drawImage(i, 0, 0, W, H); return; }
  if (P.strip) { // a can's band, side by side round the can
    const i = img(file(...P.strip, layer)).i; if (!i.naturalWidth) return;
    const tw = W / reps; for (let c = 0; c < reps; c++) ctx.drawImage(i, c * tw, 0, tw + 1, H);
    return;
  }
  const i = img(file(...P.band, layer)).i; if (!i.naturalWidth) return; // the Halawah band, at its own proportion
  const tw = W / reps, rows = Math.max(1, Math.round(H / (tw * BAND))), th = H / rows;
  for (let r = 0; r < rows; r++) {
    const off = rows > 1 && r % 2 ? tw / 2 : 0;
    for (let c = -1; c <= reps; c++) ctx.drawImage(i, c * tw + off, r * th, tw, th);
  }
}

const cache = {};
// kind: 'lid' (round lid), 'top' (box lid), 'wrap' (around a can) or 'face' (a side of a box)
// aspect: height / width of the surface; reps: band tiles across its width (Halawah) or faces round a polygon
export function surface(kind, aspect = 1, reps = 1, design = 'halawah') {
  const d = DESIGNS[design] ? design : 'halawah', D = DESIGNS[d], P = partsFor(d, kind);
  const flat = !!P.flat || !!P.plain;
  const a = Math.max(0.02, aspect);
  const n = flat || P.face ? 1 : Math.max(1, Math.round(D.kind === 'can' ? D.reps : reps));
  const key = `${d}|${kind}|${a.toFixed(3)}|${n}`;
  if (cache[key]) return cache[key];
  let W, H;
  const R = (flat && D.lidRes) || 1024; // a sharper lid where the photo allows it (the main tin, seen close up)
  if (flat || P.face) { W = R; H = Math.max(64, Math.round(R * a)); if (H > R) { W = Math.max(64, Math.round(R / a)); H = R; } }
  else { W = Math.min(4096, Math.max(1024, n * (D.tileW || 512))); H = Math.min(4096, Math.max(96, Math.round(W * a))); }
  const ground = d === 'halawah' ? (flat ? RED : WHITE) : D.skirt;
  const out = { photo: true, metal: D.kind === 'plain' };
  const layers = [0, 1, 2].map((layer) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const t = new THREE.CanvasTexture(c);
    if (layer === 0) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    const draw = () => { paint(c.getContext('2d'), W, H, P, layer, n, ground, kind); t.needsUpdate = true; };
    draw();
    const src = P.flat || P.face || P.strip || P.band;
    return { c, t, draw, ready: src ? img(file(...src, layer)).ready : Promise.resolve() };
  });
  out.map = layers[0].t; out.relief = layers[1].t; out.spot = layers[2].t; out.canvas = layers[0].c;
  out.ready = Promise.all(layers.map((l) => l.ready.then(l.draw)));
  return (cache[key] = out);
}
