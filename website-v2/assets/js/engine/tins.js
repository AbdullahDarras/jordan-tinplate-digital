// The factory's real tins, rebuilt for physically based light.
//
// Geometry: the order platform's construction rules (studio.js: lid gap, lift, skirt, curled lip, 3.5 mm corners), at each tin's
// real millimetres. Artwork: the photographs straightened in halawah.js. Light: three.js physical materials, so the metal really
// reflects the studio (gold lacquer reads as gold, bare tin as tin) and the print sits on it as ink under a clear varnish.
// 1 world unit = 100 mm.
import * as THREE from 'three';
import * as STU from './studio.js';
import * as HAL from './halawah.js';

const U = 0.01;                       // world units per mm
const TAU = Math.PI * 2;

// ---------------------------------------------------------------- the real tins (catalogue sizes where a tin matches one)
export const TINS = {
  qaisi: { kind: 'round', D: 237.6, H: 60, skirt: 15.7, fmt: ['Round 235', 'دائري 235'], dims: 'Ø 237.6 × 60 mm' },
  halawah: { kind: 'round', D: 237.6, H: 49, fmt: ['Round 235', 'دائري 235'], dims: 'Ø 237.6 × 49 mm' },
  sufyan: { kind: 'round', D: 269, H: 50, fmt: ['Round 265', 'دائري 265'], dims: 'Ø 269 × 50 mm' },
  bab: { kind: 'box', w: 194.5, d: 194.5, h: 40, fmt: ['Square 20', 'مربع 20'], dims: '194.5 × 194.5 × 40 mm' },
  jgz: { kind: 'box', w: 236.1, d: 137.7, h: 50, fmt: ['Rectangle 14 × 24', 'مستطيل 14 × 24'], dims: '236.1 × 137.7 × 50 mm' },
  najmah: { kind: 'round', sides: 8, D: 160, H: 48, stretch: 1.87, vertexFront: true, fmt: ['Octagonal', 'ثماني الأضلاع'] },
  frieds: { kind: 'round', D: 180, H: 146, taper: 0.77, skirt: 19.8, lidScale: 1.2, fmt: ['Bucket', 'سطل'] },
  laqmi: { kind: 'round', D: 100, H: 118, fmt: ['Round with slip lid', 'دائرية بغطاء'] },
  abed: { kind: 'can', D: 73, H: 91, fmt: ['Food can, peel-off end', 'علبة أغذية بطرف قابل للنزع'] },
  maeen: { kind: 'can', D: 73, H: 83, fmt: ['Milk powder can', 'علبة حليب بودرة'] },
  suliman: { kind: 'box', w: 70, d: 60, h: 88, fmt: ['Tall square tin', 'علبة مربعة طويلة'] },
  levelmax: { kind: 'box', w: 110, d: 67, h: 98, fmt: ['Tea caddy', 'علبة شاي'] }
};

// ---------------------------------------------------------------- materials
// Where the printed sheet is metal: gold lacquer (warm, saturated, bright) or bare tin (bright, neutral). Ink and white base coat are not.
// Written into the blue channel, which three.js reads as metalness.
function metalMap(L) {
  if (L.metalTex) return L.metalTex;
  const src = L.canvas, c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; t.colorSpace = THREE.NoColorSpace;
  const draw = () => {
    const x = c.getContext('2d'), s = src.getContext('2d').getImageData(0, 0, c.width, c.height), o = x.createImageData(c.width, c.height);
    const a = s.data, b = o.data;
    for (let i = 0; i < a.length; i += 4) {
      const r = a[i] / 255, g = a[i + 1] / 255, bl = a[i + 2] / 255, mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), sat = mx ? (mx - mn) / mx : 0;
      let h = 0; if (mx > mn) { h = mx === r ? ((g - bl) / (mx - mn)) % 6 : mx === g ? (bl - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; h *= 60; if (h < 0) h += 360; }
      const gold = h > 22 && h < 62 && sat > 0.28 && mx > 0.42 ? Math.min(1, (mx - 0.42) * 4) * Math.min(1, (sat - 0.28) * 5) : 0;
      b[i] = 255; b[i + 1] = 255; b[i + 2] = Math.round(gold * 255); b[i + 3] = 255;
    }
    x.putImageData(o, 0, 0); t.needsUpdate = true;
  };
  draw(); L.ready.then(draw);
  return (L.metalTex = t);
}
// the finishes a tin can wear
export const FINISHES = {
  gloss: { roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04, bump: 1, sheen: 0 },
  matte: { roughness: 0.62, clearcoat: 0, clearcoatRoughness: 0.6, bump: 1, sheen: 0.35 },
  emboss: { roughness: 0.24, clearcoat: 0.9, clearcoatRoughness: 0.06, bump: 4.5, sheen: 0 },
  spot: { roughness: 0.66, clearcoat: 1, clearcoatRoughness: 0.02, bump: 1.4, sheen: 0.3, spot: true }
};
export function printMat(L, base = 1) {
  const m = new THREE.MeshPhysicalMaterial({
    map: L.map, metalnessMap: metalMap(L), metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.04,
    bumpMap: L.relief, bumpScale: base, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.4
  });
  m.envMapIntensity = 0.75; // the print stays readable under the bright soft-boxes; bare metal keeps the full reflection
  m.userData.L = L; m.userData.bump = base;
  return m;
}
export function setFinish(m, name, gsap) {
  if (!m.userData.L) return;
  const f = FINISHES[name] || FINISHES.gloss, L = m.userData.L;
  const cm = f.spot ? L.spot : null;
  if (m.clearcoatMap !== cm) { m.clearcoatMap = cm; m.needsUpdate = true; }
  const to = { roughness: f.roughness, clearcoat: f.clearcoat, clearcoatRoughness: f.clearcoatRoughness, bumpScale: m.userData.bump * f.bump, sheen: f.sheen };
  if (gsap) gsap.to(m, { ...to, duration: 0.8, ease: 'power2.out' }); else Object.assign(m, to);
}
const metal = (color, roughness = 0.2) => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, clearcoat: 0.4, clearcoatRoughness: 0.1 });
const lacquer = (color) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.25, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
const TIN = '#dfe3e8';

// ---------------------------------------------------------------- parts
const surface = (key, kind, aspect = 1) => HAL.surface(kind, aspect, 1, key);
// lid over an outline: printed top, skirt (the top's artwork drawn over the edge, or plain), curled lip
function lid(key, { outline, inner, topUv, skirtUv, k, aspect = 1, skirt }) {
  const D = HAL.DESIGNS[key], g = new THREE.Group();
  const top = printMat(surface(key, 'lid', aspect), 1);
  const SK = skirt * U;
  const sm = D.plainSkirt ? metal(D.skirt, 0.24) : top;
  g.add(new THREE.Mesh(STU.cap(inner, 0, true, topUv), top));
  g.add(new THREE.Mesh(STU.wall(outline, -SK, 0, skirtUv), sm));
  const lip = D.bead ? metal(D.bead, 0.2) : metal(TIN, 0.16);
  g.add(STU.ring(STU.grow(outline, k.beadOut * U), k.beadR * U, -SK - k.beadDrop * U, lip));
  g.userData.print = [top];
  return g;
}
function roundTin(key, T) {
  const sides = T.sides || 96, round = sides > 24;
  const R = (T.D / 2) * U, H = T.H * U, k = STU.rules({ round: true, w: T.D, h: T.H });
  const skirt = T.skirt || k.skirt, SK = skirt * U, Rb = R * (T.taper || 1);
  const phi = round ? 0 : T.vertexFront ? 0 : Math.PI / sides;
  const LR = T.lidScale ? R * T.lidScale : R + k.gap * U, discR = LR - k.inset * U;
  const outline = STU.polygon(LR, sides, phi), inner = STU.polygon(discR, sides, phi);
  const topUv = (x, z) => [0.5 + x / (2 * discR), 0.5 - z / (2 * discR)];
  const strip = SK / (2 * discR);
  const skirtUv = round ? (p, t) => { const r = 0.5 - strip * t; return [0.5 + p.nx * r, 0.5 - p.nz * r]; } : STU.skirtUv(topUv, SK);
  const L = lid(key, { outline, inner, topUv, skirtUv, k, skirt });
  L.position.y = H + k.lift * U;
  // body: runs up under the skirt
  const bodyH = H - SK * 0.75;
  const bl = HAL.surface('wrap', bodyH / (TAU * R), round ? 8 : sides, key);
  const bm = printMat(bl, 0.6);
  let bg = new THREE.CylinderGeometry(R, Rb, bodyH, sides, 1, true);
  if (!round) { bg = bg.toNonIndexed(); bg.computeVertexNormals(); }
  const body = new THREE.Mesh(bg, bm); body.rotation.y = round ? -Math.PI / 2 : phi; body.position.y = bodyH / 2;
  const bottom = new THREE.Mesh(STU.cap(STU.polygon(Rb, sides, phi), 0.001, false, () => [0.5, 0.5]), metal(TIN, 0.3));
  const g = new THREE.Group(); g.add(body, bottom, L);
  if (T.stretch) g.scale.x = T.stretch;
  return { group: g, lid: L, body, print: [bm, ...L.userData.print], size: { h: H + 0.01, w: 2 * LR * (T.stretch || 1), d: 2 * LR } };
}
function seamedCan(key, T) {
  const R = (T.D / 2) * U, H = T.H * U, k = STU.rules({ round: true, w: T.D, h: T.H });
  const bl = HAL.surface('wrap', H / (TAU * R), 8, key), bm = printMat(bl, 0.6);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 96, 1, true), bm); body.rotation.y = -Math.PI / 2; body.position.y = H / 2;
  const endR = R - k.seamR * U, sr = k.seamR * U;
  const em = printMat(surface(key, 'lid'), 0.8);
  const top = new THREE.Group(); top.position.y = H;
  top.add(new THREE.Mesh(STU.cap(STU.polygon(endR, 96), -sr, true, (x, z) => [0.5 + x / (2 * endR), 0.5 - z / (2 * endR)]), em));
  const seam = () => STU.ring(STU.polygon(R + k.seamOut * U - sr, 96), sr, 0, metal(TIN, 0.16));
  top.add(seam()); const foot = seam(); foot.position.y = sr * 0.6;
  const bottom = new THREE.Mesh(STU.cap(STU.polygon(R, 96), 0.001, false, () => [0.5, 0.5]), metal(TIN, 0.3));
  const g = new THREE.Group(); g.add(body, top, foot, bottom);
  return { group: g, lid: top, body, print: [bm, em], size: { h: H + sr, w: 2 * R, d: 2 * R } };
}
function box(key, T) {
  const k = STU.rules({ w: T.w, d: T.d, h: T.h });
  const W = T.w * U, D = T.d * U, H = T.h * U, CR = k.corner * U;
  const sides = STU.boxSides(W / 2, D / 2, CR);
  const face = (len) => printMat(HAL.surface('face', H / len, 1, key), 0.6);
  const front = face(sides[0].total), side = face(sides[1].total);
  const body = new THREE.Group();
  sides.forEach((pts, i) => body.add(new THREE.Mesh(STU.wall(pts, 0, H, (p, t) => [p.s / pts.total, t]), i % 2 ? side : front)));
  body.add(new THREE.Mesh(STU.cap(STU.roundRect(W / 2, D / 2, CR), 0.001, false, () => [0.5, 0.5]), metal(TIN, 0.3)));
  const G = k.gap * U, LC = k.lidCorner * U, IN = k.inset * U, ox = W / 2 + G - IN, oz = D / 2 + G - IN;
  const topUv = (x, z) => [(x + ox) / (2 * ox), (oz - z) / (2 * oz)];
  const L = lid(key, { outline: STU.roundRect(W / 2 + G, D / 2 + G, LC), inner: STU.roundRect(ox, oz, LC - IN), topUv, skirtUv: STU.skirtUv(topUv, k.skirt * U), k, aspect: D / W, skirt: k.skirt });
  L.position.y = H + k.lift * U;
  const g = new THREE.Group(); g.add(body, L);
  return { group: g, lid: L, body, print: [front, side, ...L.userData.print], size: { h: H, w: W + 2 * G, d: D + 2 * G } };
}
export function make(key) {
  const T = TINS[key];
  const m = T.kind === 'box' ? box(key, T) : T.kind === 'can' ? seamedCan(key, T) : roundTin(key, T);
  m.key = key; m.T = T;
  m.group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  m.ready = Promise.all(m.print.map((p) => p.userData.L.ready));
  return m;
}
export const surfaceOf = surface;
