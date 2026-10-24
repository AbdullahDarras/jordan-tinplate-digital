// The JC 3D Studio's tin rules and look, on the graphics card.
//
// The order platform (AbdullahDarras/jc-order-platform, js/engine/studio3d.js) draws one tin at a time on a 2D canvas. Its numbers
// were tuned on the factory's tins, so the site takes them over as they are, and runs them in WebGL so that several tins, real cast
// shadows and the finishes keep working on every page:
//   - the light: one key light from the top left in front (-0.42, -0.65, 0.62 in screen space), the same diffuse falloff,
//     Blinn-Phong tin shine (exponent 16 + 32 x shininess) and the Fresnel glint on the edges, all composited in sRGB like the canvas;
//   - the curled bead: the studio's silver stroke stack (dark under-edge, base, white highlight, fine rim glint);
//   - the sizes: the studio lays every tin out in a 540 px scene, and its gaps (lid 1.4 px wider than the body, 1 px above it,
//     bead 0.8 px outside the skirt, corners 3.5 mm) are turned back into millimetres with the same scale (studioPx).
// Nothing is read from the order platform at run time, and nothing of it is changed.
import * as THREE from 'three';

const clamp = (x, a, b) => Math.min(b, Math.max(a, x));

// ---------------------------------------------------------------- sizes (renderSceneOnTargetCanvas, render3DBoxTin, render3DCylinderCan)
// pixels per millimetre of the studio scene for a tin of this size
export function studioPx({ round, w, d = w, h }) {
  if (round) return Math.min(212 / Math.max(20, w), 236 / h);
  const maxP = Math.max(w, d, 70);
  const k = h <= maxP * 0.85 ? 206 / maxP : 230 / Math.max(w, d, h);
  return (2 * clamp((w * k) / 2, 12, 118)) / Math.max(50, w);
}
// depth of the lid's skirt in mm (getLidSkirtMm, automatic mode)
export const lidSkirtMm = (hMm, wMm) => Math.min(hMm * 0.69, 9.9 * Math.min(1, wMm / 70));
// every construction size of a tin, in mm
export function rules(o) {
  const px = studioPx(o), mm = (p) => p / px;
  const bw = Math.max(1.2, 2.5 * px * 0.85);                 // bead width, px (beadThickness 2.5 mm)
  const lipW = bw * 1.15;                                    // the skirt's curled lip
  const cornerPx = Math.min(((px * Math.max(50, o.w)) / 2) * 0.22, Math.max(3, 3.5 * px)); // cR = min(halfW x 0.22, 3.5 mm)
  return {
    px,
    gap: mm(1.4),                 // the lid is this much wider than the body on every side
    lift: mm(1),                  // and its top sits this much above the body
    inset: mm(0.6),               // the printed top stops this short of the lid's edge
    skirt: lidSkirtMm(o.h, o.w),
    corner: mm(cornerPx),         // body corner radius (3.5 mm unless the tin is tiny)
    lidCorner: mm(cornerPx + 0.8),
    beadOut: mm(0.8),             // centre line of the lip, outside the skirt
    beadCorner: mm(cornerPx + 1.3),
    beadR: mm((lipW + 1.2) / 2),  // tube radius of the lip (its dark under-edge included)
    beadDrop: mm(0.6),            // the dark under-edge makes the lip read 0.6 px lower
    lipW, seamW: bw * 1.05, seamR: mm((bw * 1.05 + 1.2) / 2), seamOut: mm(1.2)
  };
}

// ---------------------------------------------------------------- the light
const COMMON = `
vec3 toS(vec3 c){ return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c)); }
vec3 toL(vec3 c){ return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c)); }
const vec3 SL = vec3(-0.42, 0.65, 0.62);   // the studio's key light (its screen y points down: here up)
`;
const VERT = `
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
void main(){
  vUv = uv; vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0); vP = mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
uniform sampler2D map; uniform sampler2D relief; uniform sampler2D spot;
uniform float hasMap; uniform float hasRelief; uniform float hasSpot;
uniform vec3 color; uniform float shin; uniform float spotShin; uniform float spotGain; uniform float bump;
uniform float sweepX; uniform float sweepAmt;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
${COMMON}
vec3 bumped(vec3 n, float face){ // three.js perturbNormalArb: the relief mask raises the motifs (embossing)
  vec2 dx = dFdx(vUv), dy = dFdy(vUv);
  float h0 = bump * texture2D(relief, vUv).x;
  vec2 dh = vec2(bump * texture2D(relief, vUv + dx).x - h0, bump * texture2D(relief, vUv + dy).x - h0);
  vec3 sx = normalize(dFdx(vP)), sy = normalize(dFdy(vP));
  vec3 r1 = cross(sy, n), r2 = cross(n, sx);
  float det = dot(sx, r1) * face;
  vec3 g = sign(det) * (dh.x * r1 + dh.y * r2);
  return normalize(abs(det) * n - g);
}
void main(){
  float face = gl_FrontFacing ? 1.0 : -1.0;
  vec3 n = normalize(vN) * face;
  if (hasRelief > 0.5 && bump > 0.0) n = bumped(n, face);
  vec3 base = hasMap > 0.5 ? toS(texture2D(map, vUv).rgb) : color;
  base = base * 0.98 + vec3(0.973, 0.980, 0.988) * 0.02;            // ink at 98 % over the white base coat
  float m = hasSpot > 0.5 ? texture2D(spot, vUv).r : 0.0;
  float s = mix(shin, spotShin, m), gain = mix(1.0, spotGain, m);
  vec3 L = normalize(SL);
  float nDotL = max(0.0, dot(n, L));
  float nDotH = max(0.0, dot(n, normalize(L + vec3(0.0, 0.0, 1.0))));
  float spec = pow(nDotH, 16.0 + s * 32.0);
  float fres = pow(1.0 - max(0.0, n.z), 2.5);
  float diff = nDotL - 0.52;
  float dark = diff < 0.0 ? min(0.40, -diff * 0.44) : 0.0;
  float light = diff > 0.0 ? diff * 0.16 : 0.0;
  if (spec > 0.03) light += min(0.88, spec * 0.52 * s * gain) * 0.6;
  if (fres > 0.12) light += fres * 0.26 * s;
  // the site's light sweep: a tall soft-box crossing the reflections from time to time; sharp and bright on a glossy tin, broad and faint on a matte one
  vec3 r = reflect(normalize(vP), n);
  float wid = mix(0.3, 0.035, s);
  light += exp(-pow((r.x - sweepX) / wid, 2.0)) * smoothstep(-0.15, 0.45, r.y) * sweepAmt * (0.12 + 0.6 * s * s) * gain;
  light = min(0.9, light);
  vec3 c = mix(base, vec3(15.0, 23.0, 42.0) / 255.0, dark);
  c = mix(c, vec3(1.0), light);
  gl_FragColor = vec4(toL(c), 1.0);
  #include <colorspace_fragment>
}`;
// the light sweep, shared by every tin surface (scene.js moves it)
export const SWEEP = { x: { value: 0 }, amt: { value: 0 } };
const BLANK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); BLANK.needsUpdate = true;
const srgb = (hex) => { const c = new THREE.Color(hex); return new THREE.Vector3(...c.convertLinearToSRGB().toArray()); };

// L: printed layers ({ map, relief, spot }) or null for bare / lacquered metal of colour hex
export function surfaceMat(L, hex = '#f8fafc', side = THREE.FrontSide) {
  const tex = (t) => (t && t.isTexture ? t : null), map = tex(L && L.map), relief = tex(L && L.relief), spot = tex(L && L.spot);
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side, toneMapped: false,
    uniforms: {
      map: { value: map || BLANK }, relief: { value: relief || BLANK }, spot: { value: spot || BLANK },
      hasMap: { value: map ? 1 : 0 }, hasRelief: { value: relief ? 1 : 0 }, hasSpot: { value: 0 },
      color: { value: srgb(hex) }, shin: { value: 0.85 }, spotShin: { value: 0.85 }, spotGain: { value: 1 }, bump: { value: 0 },
      sweepX: SWEEP.x, sweepAmt: SWEEP.amt
    }
  });
  m.userData.studio = true; m.userData.layers = L || null;
  return m;
}
export const setRelief = (m, tex) => { m.uniforms.relief.value = tex || BLANK; m.uniforms.hasRelief.value = tex ? 1 : 0; };
export const setSpot = (m, tex) => { m.uniforms.spot.value = tex || BLANK; m.uniforms.hasSpot.value = tex ? 1 : 0; };

// ---------------------------------------------------------------- the curled bead (drawCurledBeadSegment3D, silver)
const BEAD_FRAG = `
uniform vec3 cBase; uniform vec3 cDark; uniform float bw; uniform float shin;
varying vec2 vUv; varying vec3 vN; varying vec3 vP;
${COMMON}
void main(){
  vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
  float T = bw + 1.2;                         // the stroke stack across the lip, in studio px, top to bottom
  float y = -bw * 0.5 + (1.0 - n.y) * 0.5 * T;
  vec3 c = cBase;
  float ws = max(0.7, bw * 0.42);
  if (abs(y + 0.5) < ws * 0.5) c = mix(c, vec3(1.0), 0.98);          // highlight
  if (abs(y + 0.8) < 0.25) c = mix(c, vec3(1.0), 0.45 * shin);         // rim glint
  if (y > bw * 0.5) c = cDark;                                          // dark under-edge
  gl_FragColor = vec4(toL(c), 1.0);
  #include <colorspace_fragment>
}`;
const BEAD_THEMES = { silver: ['#CBD5E1', '#475569'], gold: ['#D97706', '#78350F'] };
export function beadMat(widthPx, finish = 'silver') {
  // a colour instead of a name: the studio's 'custom' finish (its dark edge is the colour at 45 %)
  const custom = /^#[0-9a-f]{6}$/i.test(finish) ? [finish, '#' + new THREE.Color(finish).multiplyScalar(0.45).getHexString()] : null;
  const [b, d] = custom || BEAD_THEMES[finish] || BEAD_THEMES.silver;
  const m = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: BEAD_FRAG, toneMapped: false,
    uniforms: { cBase: { value: srgb(b) }, cDark: { value: srgb(d) }, bw: { value: widthPx }, shin: { value: 0.85 } }
  });
  m.userData.studio = true;
  return m;
}

// ---------------------------------------------------------------- outlines
// a closed outline, counter-clockwise seen from above (x right, z towards the visitor): points with outward normals and arc length
// rounded rectangle: half sizes hw, hd, corner radius r
export function roundRect(hw, hd, r, steps = 10) {
  r = Math.min(r, hw, hd);
  const pts = [], C = [[hw - r, hd - r, 0], [hw - r, -hd + r, -Math.PI / 2], [-hw + r, -hd + r, -Math.PI], [-hw + r, hd - r, -1.5 * Math.PI]];
  // start at the middle of the front edge, go right (+x), round the front-right corner, up the right side …
  pts.push({ x: 0, z: hd, nx: 0, nz: 1 });
  C.forEach(([cx, cz, a0]) => {
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI / 2 + a0 - (i / steps) * (Math.PI / 2);
      pts.push({ x: cx + r * Math.cos(a), z: cz + r * Math.sin(a), nx: Math.cos(a), nz: Math.sin(a) });
    }
  });
  pts.push({ x: 0, z: hd, nx: 0, nz: 1 });
  return withLength(pts);
}
// the four printed sides of a box body [front, right, back, left], each running from the middle of one rounded corner to the middle
// of the next, left to right as seen from outside (so its artwork reads upright and wraps a little round each corner, like the sheet)
export function boxSides(hw, hd, r, steps = 10) {
  r = Math.min(r, hw, hd);
  const half = Math.max(2, Math.round(steps / 2));
  // corner centres from the front-right one, going round: front-right, back-right, back-left, front-left; a = angle of the face normal
  const C = [[hw - r, hd - r], [hw - r, -hd + r], [-hw + r, -hd + r], [-hw + r, hd - r]];
  const faceA = [Math.PI / 2, 0, -Math.PI / 2, -Math.PI]; // front (+z), right (+x), back (-z), left (-x); angle of (cos a, sin a) = (x, z)
  const arc = (c, a0, a1) => { const out = []; for (let i = 0; i <= half; i++) { const a = a0 + (a1 - a0) * (i / half); out.push({ x: c[0] + r * Math.cos(a), z: c[1] + r * Math.sin(a), nx: Math.cos(a), nz: Math.sin(a) }); } return out; };
  return faceA.map((a, k) => {
    const cPrev = C[(k + 3) % 4], cNext = C[k];
    const pts = [...arc(cPrev, a + Math.PI / 4, a), ...arc(cNext, a, a - Math.PI / 4)];
    return withLength(pts);
  });
}
// circle (n > 24) or regular polygon of n sides, radius R, phi = angle of the first corner from +z
export function polygon(R, n, phi = 0) {
  const pts = [];
  if (n > 24) {
    for (let i = 0; i <= 128; i++) { const a = phi + (i / 128) * Math.PI * 2; pts.push({ x: R * Math.sin(a), z: R * Math.cos(a), nx: Math.sin(a), nz: Math.cos(a) }); }
    return withLength(pts);
  }
  for (let i = 0; i < n; i++) { // flat faces: each side is its own pair of points with the face normal
    const a0 = phi + (i / n) * Math.PI * 2, a1 = phi + ((i + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2;
    pts.push({ x: R * Math.sin(a0), z: R * Math.cos(a0), nx: Math.sin(am), nz: Math.cos(am), cut: i > 0 });
    pts.push({ x: R * Math.sin(a1), z: R * Math.cos(a1), nx: Math.sin(am), nz: Math.cos(am) });
  }
  return withLength(pts);
}
function withLength(pts) {
  let s = 0; pts.forEach((p, i) => { if (i) s += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z); p.s = s; });
  pts.total = s; return pts;
}

// an upright wall along an outline, from y0 to y1. uvAt(p, t) gives the texture coordinate of outline point p at height t (0 bottom … 1 top).
export function wall(pts, y0, y1, uvAt) {
  const pos = [], nor = [], uv = [], idx = [];
  pts.forEach((p) => {
    for (const t of [0, 1]) { pos.push(p.x, t ? y1 : y0, p.z); nor.push(p.nx, 0, p.nz); uv.push(...uvAt(p, t)); }
  });
  for (let i = 0; i + 1 < pts.length; i++) {
    if (pts[i + 1].cut) continue; // polygon: no face between two sides' duplicated corner points
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}
// a flat cap (top or bottom) filling an outline, planar uv from uvAt(x, z)
export function cap(pts, y, up, uvXZ) {
  const pos = [0, y, 0], nor = [0, up ? 1 : -1, 0], uv = [...uvXZ(0, 0)], idx = [];
  pts.forEach((p) => { pos.push(p.x, y, p.z); nor.push(0, up ? 1 : -1, 0); uv.push(...uvXZ(p.x, p.z)); });
  for (let i = 1; i < pts.length; i++) up ? idx.push(0, i, i + 1) : idx.push(0, i + 1, i);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}
// a tube along a closed outline (the curled lip, a double seam)
export function ring(pts, r, y, mat) {
  const v = pts.filter((p, i) => i === 0 || Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z) > 1e-6);
  if (Math.hypot(v[0].x - v[v.length - 1].x, v[0].z - v[v.length - 1].z) < 1e-6) v.pop();
  const curve = new THREE.CatmullRomCurve3(v.map((p) => new THREE.Vector3(p.x, 0, p.z)), true, 'centripetal');
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(96, v.length * 2), r, 10, true), mat);
  m.position.y = y; return m;
}
// grow an outline outwards by d (corners keep their centres: the radius grows)
export const grow = (pts, d) => withLength(pts.map((p) => ({ ...p, x: p.x + p.nx * d, z: p.z + p.nz * d })));

// The lid's skirt shows the outer band of the top artwork, drawn down over the edge (getLidSkirtUvStrip):
// its lower edge is the artwork's edge, its upper edge lies one skirt-depth inside it.
export const skirtUv = (topUv, depth) => (p, t) => topUv(p.x - p.nx * depth * t, p.z - p.nz * depth * t);
