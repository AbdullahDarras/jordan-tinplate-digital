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
  // the factory's tins from the owner's latest photos, shown as the photographs themselves (see photoTin below): their artwork is
  // too rich to rebuild in 3D faithfully. photo: the photo's width / height. pw: the width the photo shows, in mm (the diameter, or
  // the faces seen at the photo's angle), which sets the tin's real size in the scenes. Sizes are read from the photos
  // (proportions), rounded to likely catalogue sizes: treat them as approximate until the factory confirms each one.
  nejmah: { kind: 'round', photo: 1.378, pw: 230, D: 230, H: 58, fmt: ['Round gift tin', 'علبة هدايا دائرية'] },
  maamoul: { kind: 'round', photo: 1.6647, pw: 240, D: 240, H: 55, fmt: ['Round gift tin', 'علبة هدايا دائرية'] },
  marouf: { kind: 'round', photo: 1.4257, pw: 230, D: 230, H: 70, fmt: ['Round gift tin', 'علبة هدايا دائرية'] },
  habybee: { kind: 'round', photo: 2.099, pw: 261, sides: 8, D: 180, H: 58, stretch: 1.45, fmt: ['Octagonal', 'ثماني الأضلاع'] },
  jojo: { kind: 'box', photo: 2.1148, pw: 265, w: 230, d: 230, h: 50, fmt: ['Square gift tin, embossed', 'علبة هدايا مربعة بنقش بارز'] },
  melties: { kind: 'box', photo: 1.9718, pw: 255, w: 250, d: 152, h: 62, fmt: ['Rectangular gift tin', 'علبة هدايا مستطيلة'] },
  givinova: { kind: 'box', photo: 0.9382, pw: 112, w: 110, d: 110, h: 105, fmt: ['Square tin', 'علبة مربعة'] },
  shawra: { kind: 'box', photo: 0.8482, pw: 230, w: 225, d: 225, h: 235, fmt: ['Square tin with a slip lid', 'علبة مربعة بغطاء'] },
  rayhan: { kind: 'box', photo: 0.6782, pw: 80, w: 72, d: 72, h: 105, fmt: ['Tall square tin', 'علبة مربعة طويلة'] },
  kous: { kind: 'box', photo: 0.8436, pw: 135, w: 130, d: 85, h: 170, sideKey: 'kouss', fmt: ['Tea tin', 'علبة شاي'] },
  abedc: { kind: 'round', photo: 0.6645, pw: 100, D: 100, H: 130, fmt: ['Coffee can with a slip lid', 'علبة قهوة بغطاء'] },
  havana: { kind: 'round', photo: 0.7945, pw: 99, D: 99, H: 127, fmt: ['Powder can with a slip lid', 'علبة بودرة بغطاء'] },
  // for the inner pages: an olive-oil tin from its photos, and an illustrative paint can (sample artwork, no client design)
  oil: { kind: 'oil', photo: 0.8664, pw: 205, w: 175, d: 115, h: 245, front: 'malka', side: 'malkas', fmt: ['Olive-oil tin, 4 L', 'تنكة زيت زيتون 4 لتر'], dims: '175 × 115 × 245 mm' },   // Malka Olive Press
  paint: { kind: 'can', D: 110, H: 120, bail: true, fmt: ['Paint can', 'علبة دهان'], illus: true }
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
// How a printed tin is drawn: the photograph is the tin's colour, as it was shot (emissive base), so the print keeps the real
// tin's depth and saturation whatever the studio does. On top of it, a fraction of the colour takes the studio's light (so the
// relief and the body shading respond), the metal areas (gold lacquer, bare tin) take the studio's reflections, and the varnish
// gives clean highlights. The light only adds shine; it never greys the print.
const PHOTO = 0.82, LIT = 0.3;
export const FINISHES = {
  gloss: { roughness: 0.18, spec: 0.55, clearcoat: 0, clearcoatRoughness: 0.1, bump: 1, sheen: 0 },
  matte: { roughness: 0.6, spec: 0.2, clearcoat: 0, clearcoatRoughness: 0.6, bump: 1, sheen: 0.15 },
  emboss: { roughness: 0.2, spec: 0.55, clearcoat: 0, clearcoatRoughness: 0.1, bump: 4.5, sheen: 0 },
  spot: { roughness: 0.6, spec: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.03, bump: 1.4, sheen: 0.1, spot: true }
};
export function printMat(L, base = 1) {
  const m = new THREE.MeshPhysicalMaterial({
    map: L.map, color: new THREE.Color(LIT, LIT, LIT), emissiveMap: L.map, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: PHOTO,
    metalnessMap: metalMap(L), metalness: 1, roughness: 0.18, specularIntensity: 0.55, clearcoat: 0, clearcoatRoughness: 0.1,
    bumpMap: L.relief, bumpScale: base, sheenColor: new THREE.Color('#ffffff'), sheenRoughness: 0.4
  });
  m.envMapIntensity = 0.7;
  m.userData.L = L; m.userData.bump = base;
  return m;
}
export function setFinish(m, name, gsap) {
  if (!m.userData.L) return;
  const f = FINISHES[name] || FINISHES.gloss, L = m.userData.L;
  const cm = f.spot ? L.spot : null;
  if (m.clearcoatMap !== cm) { m.clearcoatMap = cm; m.needsUpdate = true; }
  const to = { roughness: f.roughness, specularIntensity: f.spec, clearcoat: f.clearcoat, clearcoatRoughness: f.clearcoatRoughness, bumpScale: m.userData.bump * f.bump, sheen: f.sheen };
  if (gsap) gsap.to(m, { ...to, duration: 0.8, ease: 'power2.out' }); else Object.assign(m, to);
}
const metal = (color, roughness = 0.2) => new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness, clearcoat: 0.4, clearcoatRoughness: 0.1 });
const lacquer = (color) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.25, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 });
const TIN = '#dfe3e8';
// The curled lip under a lid's skirt and the seams of a can. On the factory's tins they barely show: the lip is in the lid's own
// colour or a dull silver, and it is thin. (A shiny pale tube catches the studio's soft-boxes and reads as a thick white line.)
function lipMat(D) {
  const c = new THREE.Color(D.bead || D.skirt || '#9aa3ae').multiplyScalar(0.85);
  const m = new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.55, roughness: 0.4, clearcoat: 0.25, clearcoatRoughness: 0.35 });
  m.envMapIntensity = 0.45; return m;
}
const seamMat = () => { const m = new THREE.MeshPhysicalMaterial({ color: '#aeb5bf', metalness: 0.85, roughness: 0.34, clearcoat: 0.2 }); m.envMapIntensity = 0.55; return m; };

// ---------------------------------------------------------------- parts
const surface = (key, kind, aspect = 1) => HAL.surface(kind, aspect, 1, key);
// lid over an outline: printed top, skirt (the top's artwork drawn over the edge, or plain), curled lip
function lid(key, { outline, inner, topUv, skirtUv, k, aspect = 1, skirt }) {
  const D = HAL.DESIGNS[key], g = new THREE.Group();
  const top = printMat(surface(key, 'lid', aspect), D.lidRes ? 0.5 : 1); // the sharp lid's relief map is finer: less bump
  const SK = skirt * U;
  const sm = D.plainSkirt ? (D.skirtLacquer ? lacquer(D.skirt) : metal(D.skirt, 0.24)) : top; // plain gold metal (Al Qaisi) or a lacquered colour (Bab Sharqi's cream)
  g.add(new THREE.Mesh(STU.cap(inner, 0, true, topUv), top));
  g.add(new THREE.Mesh(STU.wall(outline, -SK, 0, skirtUv), sm));
  g.add(STU.ring(STU.grow(outline, k.beadOut * U * 0.5), k.beadR * U * 0.55, -SK - k.beadDrop * U * 0.5, lipMat(D)));
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
  const sm = seamMat(), seam = () => STU.ring(STU.polygon(R + k.seamOut * U - sr, 96), sr, 0, sm);
  top.add(seam()); const foot = seam(); foot.position.y = sr * 0.6;
  const bottom = new THREE.Mesh(STU.cap(STU.polygon(R, 96), 0.001, false, () => [0.5, 0.5]), metal(TIN, 0.3));
  const g = new THREE.Group(); g.add(body, top, foot, bottom);
  return { group: g, lid: top, body, print: [bm, em], size: { h: H + sr, w: 2 * R, d: 2 * R } };
}
function box(key, T) {
  const k = STU.rules({ w: T.w, d: T.d, h: T.h });
  const W = T.w * U, D = T.d * U, H = T.h * U, CR = k.corner * U;
  const sides = STU.boxSides(W / 2, D / 2, CR);
  const face = (len, k = key) => printMat(HAL.surface('face', H / len, 1, k), 0.6);
  const front = face(sides[0].total), side = face(sides[1].total, T.sideKey || key); // a tin whose narrow sides carry their own art
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
// the olive-oil tin: Malka Olive Press's 4 L tin (175 x 115 x 245 mm), from its photographs: a printed body (the front and back
// carry the brand, the two narrow sides the Arabic panel), gold seams and top panel, an open spout, and the red plastic handle
// folded flat on the top, as the factory ships it
function oilTin(key, T) {
  const k = STU.rules({ w: T.w, d: T.d, h: T.h });
  const W = T.w * U, D = T.d * U, H = T.h * U, CR = 8 * U, sr = k.seamR * U * 1.5;
  const gold = new THREE.MeshPhysicalMaterial({ color: '#c9a654', metalness: 1, roughness: 0.22, clearcoat: 0.5, clearcoatRoughness: 0.12 });
  const sides = STU.boxSides(W / 2, D / 2, CR);
  const face = (len, design) => printMat(HAL.surface('face', H / len, 1, design), 0.4);
  const front = face(sides[0].total, T.front || 'malka'), side = face(sides[1].total, T.side || 'malkas');
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  sides.forEach((pts, i) => body.add(new THREE.Mesh(STU.wall(pts, 0, H, (p, t) => [p.s / pts.total, t]), i % 2 ? side : front)));
  const out = STU.roundRect(W / 2, D / 2, CR);
  g.add(STU.ring(STU.grow(out, sr * 0.3), sr, H - sr * 0.2, gold), STU.ring(STU.grow(out, sr * 0.3), sr, sr * 0.8, gold));   // the top and bottom seams
  const top = new THREE.Mesh(STU.cap(STU.roundRect(W / 2 - sr * 0.6, D / 2 - sr * 0.6, CR), H - sr * 0.9, true, () => [0.5, 0.5]), gold); g.add(top);
  g.add(new THREE.Mesh(STU.cap(out, 0.001, false, () => [0.5, 0.5]), metal('#8d7444', 0.35)));
  // the spout: a gold neck round a dark opening, towards one end of the top
  const y0 = H - sr * 0.9, sx = -W * 0.28, sz = D * 0.04;
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.07, 48, 1, true), gold); neck.position.set(sx, y0 + 0.035, sz); g.add(neck);
  const lip = STU.ring(STU.polygon(0.2, 48), 0.022, 0, gold); lip.position.set(sx, y0 + 0.07, sz); g.add(lip);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.19, 48), new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.9 })); hole.rotation.x = -Math.PI / 2; hole.position.set(sx, y0 + 0.03, sz); g.add(hole);
  // the red handle, folded flat: a loop of red plastic held by a steel clip
  const red = new THREE.MeshPhysicalMaterial({ color: '#d4222b', roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const loop = STU.roundRect(W * 0.2, D * 0.16, D * 0.08), hx = W * 0.17, hz = -D * 0.05;
  const handle = STU.ring(loop, 0.032, 0, red); handle.position.set(hx, y0 + 0.04, hz); handle.scale.set(1, 0.6, 1); g.add(handle);
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 0.1), metal('#c9ced6', 0.25)); clip.position.set(hx - W * 0.2, y0 + 0.03, hz); g.add(clip);
  return { group: g, lid: top, body, print: [front, side], size: { h: H + 0.1, w: W, d: D } };
}
// ---------------------------------------------------------------- a tin shown as its photograph
// A tin whose artwork cannot be rebuilt in 3D faithfully stands in the studio as its real photograph (assets/img/photos/): a card
// that always faces the camera, standing on its bottom edge, with a soft shadow on the floor. As the tin "turns" (the holder's
// rotation) the card sways a little and a sheen sweeps across the metal. The photo's colours are kept as shot: the shader undoes
// the studio's tone curve (room.js) for these pixels, with a soft knee so the whites stay just under the bloom.
const PHOTOS = new URL('../../img/photos/', import.meta.url).href;
const loader = new THREE.TextureLoader();
const softShadow = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, 'rgba(0,19,45,.5)'); g.addColorStop(0.5, 'rgba(0,19,45,.18)'); g.addColorStop(1, 'rgba(0,19,45,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
function photoMat(tex, reflect) {
  const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  m.userData.u = { uSheen: { value: -1 }, uExpo: { value: 1 } };
  m.customProgramCacheKey = () => (reflect ? 'tin-photo-mirror' : 'tin-photo'); // two shaders from one function: keep them apart
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, m.userData.u);
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', `uniform float uSheen; uniform float uExpo;
float invTone( float y ) { float a = 2.51 - 2.43 * y, b = 0.03 - 0.59 * y, c = -0.14 * y; return ( -b + sqrt( b * b - 4.0 * a * c ) ) / ( 2.0 * a ); }
void main() {`)
      .replace('#include <map_fragment>', `#include <map_fragment>
  {
    float m = max( max( diffuseColor.r, diffuseColor.g ), diffuseColor.b );
    float y = m < 0.55 ? m : 0.55 + ( m - 0.55 ) * 0.51;
    diffuseColor.rgb *= invTone( y ) / uExpo / max( m, 1e-4 );
    ${reflect ? `diffuseColor.a *= 0.16 * ( 1.0 - smoothstep( 0.0, 0.32, vMapUv.y ) );` : `float d = vMapUv.x * 0.85 + ( 1.0 - vMapUv.y ) * 0.4 - uSheen;
    diffuseColor.rgb += ( exp( -d * d / 0.004 ) * 0.16 + exp( -d * d / 0.05 ) * 0.04 ) * diffuseColor.a;`}
  }`);
  };
  return m;
}
function photoTin(key, T) {
  const W = T.pw * U, H = W / T.photo;   // real size: the photo is as wide as the tin it shows
  const g = new THREE.Group(), yaw = new THREE.Group(), card = new THREE.Group(); g.add(yaw); yaw.add(card);
  let done; const ready = new Promise((r) => { done = r; });
  const tex = loader.load(PHOTOS + key + '.webp', () => done(), undefined, () => done());
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const plane = new THREE.PlaneGeometry(W, H); plane.translate(0, H / 2, 0);
  const front = new THREE.Mesh(plane, photoMat(tex, false)); front.renderOrder = 2; card.add(front);
  const mirror = new THREE.Mesh(plane, photoMat(tex, true)); mirror.scale.y = -1; mirror.renderOrder = 1; card.add(mirror);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.15, W * 0.42), new THREE.MeshBasicMaterial({ map: softShadow, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, 0.003, -W * 0.06); shadow.renderOrder = 1; yaw.add(shadow);
  const wp = new THREE.Vector3(), cp = new THREE.Vector3(), q = new THREE.Quaternion(), e = new THREE.Euler();
  let last = -1;
  const face = (renderer, scene, camera) => {
    if (last === renderer.info.render.frame + camera.id * 1e6) return; last = renderer.info.render.frame + camera.id * 1e6;
    g.getWorldPosition(wp); camera.getWorldPosition(cp);
    g.getWorldQuaternion(q); const turn = e.setFromQuaternion(q, 'YXZ').y;           // how far the tin has been turned
    yaw.lookAt(cp.x, wp.y, cp.z); yaw.rotateY(Math.sin(turn) * 0.12);                 // face the camera, swaying with the turn
    card.rotation.x = -Math.atan2(cp.y - wp.y - H * 0.4, Math.hypot(cp.x - wp.x, cp.z - wp.z)) * 0.85; // lean back towards a high camera
    mirror.rotation.x = -card.rotation.x * 2;
    const sweep = ((turn / (Math.PI * 2)) % 1 + 1) % 1;
    front.material.userData.u.uSheen.value = sweep * 2.6 - 0.8;
    front.material.userData.u.uExpo.value = mirror.material.userData.u.uExpo.value = renderer.toneMappingExposure;
    yaw.updateMatrixWorld(true);
  };
  front.onBeforeRender = mirror.onBeforeRender = shadow.onBeforeRender = face;
  return { group: g, lid: null, body: front, print: [], photo: true, ready, size: { h: H, w: W, d: W * 0.4 } };
}

export function make(key) {
  const T = TINS[key];
  if (T.photo) { const m = photoTin(key, T); m.key = key; m.T = T; return m; }
  const m = T.kind === 'box' ? box(key, T) : T.kind === 'oil' ? oilTin(key, T) : T.kind === 'can' ? seamedCan(key, T) : roundTin(key, T);
  if (T.bail) { const R = (T.D / 2) * U, b = new THREE.Mesh(new THREE.TorusGeometry(R * 0.98, 0.012, 8, 64, Math.PI), metal('#9aa3b1', 0.3)); b.position.y = T.H * U * 0.72; b.rotation.set(-1.15, 0.4, 0, 'YXZ'); m.group.add(b); }
  m.key = key; m.T = T;
  m.group.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  m.ready = Promise.all(m.print.map((p) => p.userData.L.ready));
  return m;
}
export const surfaceOf = surface;
