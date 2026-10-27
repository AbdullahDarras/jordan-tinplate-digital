// The site as one continuous 3D film. A full-screen canvas inside a tall sticky stage; the scroll position is the film's
// time (0 … 1). The camera travels a fixed path of shots, and every object poses itself from the same time value:
//   0  hero      the main tin (Al Qaisi), large, under a light the visitor moves with the pointer
//   1  macro     the camera drops onto the stamped gold lid; depth of field; a raking light runs across the relief
//   2  layers    a printed lid builds up layer by layer: tinplate, base coat, the four separations (drawn in brand navy), varnish
//   3  ring      the factory's other tins rise around the main tin; scrolling turns the ring
//   4  lab       back on the main tin: finishes, drag to turn it
//   5  journey   from sheet to shelf: a printed sheet of the main tin's body blanks, cut and rolled into the tin, packed on a
//                pallet, shipped from Amman
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as TIN from './tins.js';
import * as HAL from './halawah.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (t) => t * t * (3 - 2 * t);
const seg = (p, a, b) => sm(clamp((p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// chapter windows on the film's time line (start, end); the camera moves between them
export const CHAPTERS = [[0, 0.08], [0.14, 0.21], [0.27, 0.41], [0.46, 0.59], [0.64, 0.7], [0.75, 1]];
const AX = 9; // where the layer rig stands (to the side of the main tin)
const SHOTS = [
  { pos: V(0, 1.05, 5.4), tgt: V(0, 0.5, 0), fov: 30 },           // hero: the tin in front of the title wall
  { pos: V(0.42, 1.12, 1.18), tgt: V(0.08, 0.6, -0.08), fov: 30 }, // macro on the lid
  { pos: V(AX - 1.15, 3.3, 5.0), tgt: V(AX - 1.0, 0.25, 0), fov: 30 }, // layers: the rig to the right of the text
  { pos: V(0, 3.4, 10.6), tgt: V(0, 1.4, 2.2), fov: 30 },          // ring
  { pos: V(-2.7, 1.5, 4.2), tgt: V(-0.55, 0.28, 0), fov: 30 },      // lab: the tin to the side away from the card
  null                                                             // from sheet to shelf: the journey rig moves its own camera
];
const RING_KEYS = ['sharqi', 'bab', 'najmah', 'frieds', 'jgz', 'laqmi', 'sufyan', 'suliman', 'abed', 'levelmax', 'maeen'];

// Tone mapping that keeps colour. The stock filmic curve squeezes each channel on its own, so bright gold drifts to white and
// printed colour goes pale. This curve shapes the brightness of the brightest channel and scales the colour by the same factor,
// so hue and saturation survive; only the very hottest glints roll off towards white, as they do on camera.
const HUE_KEEPING_TONE = `
vec3 ACESFilmicToneMapping( vec3 color ) {
  color *= toneMappingExposure;
  float m = max( max( color.r, color.g ), color.b );
  float t = ( m * ( 2.51 * m + 0.03 ) ) / ( m * ( 2.43 * m + 0.59 ) + 0.14 );
  vec3 c = color * ( t / max( m, 1e-5 ) );
  c = mix( c, vec3( t ), smoothstep( 3.0, 10.0, m ) * 0.7 );
  return mix( c, ACESFilmicToneMappingStock( color / max( toneMappingExposure, 1e-5 ) ), 0.3 ); // a touch of the stock curve: highlights on gold turn pale yellow, as on camera
}`;
if (!THREE.ShaderChunk.tonemapping_pars_fragment.includes('ACESFilmicToneMappingStock')) {
  THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace('vec3 ACESFilmicToneMapping( vec3 color )', 'vec3 ACESFilmicToneMappingStock( vec3 color )') + HUE_KEEPING_TONE;
}

export function createFilm(canvas) {
  const COARSE = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.localClippingEnabled = true; // the press reveals the print on the sheet
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, COARSE ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 200);

  // ---------------------------------------------------------------- backdrop: the brand's navy scale as a studio sweep
  const bgCanvas = document.createElement('canvas'); bgCanvas.width = 8; bgCanvas.height = 512;
  const bgTex = new THREE.CanvasTexture(bgCanvas); bgTex.colorSpace = THREE.SRGBColorSpace; scene.background = bgTex;
  function backdrop(mode) {
    const x = bgCanvas.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 512);
    if (mode === 'dark') { g.addColorStop(0, '#002352'); g.addColorStop(0.55, '#00193b'); g.addColorStop(1, '#00132d'); }
    else { g.addColorStop(0, '#f5f8fd'); g.addColorStop(0.55, '#e9eef6'); g.addColorStop(1, '#d8e0ec'); }
    x.fillStyle = g; x.fillRect(0, 0, 8, 512); bgTex.needsUpdate = true;
  }
  backdrop('light');

  // ---------------------------------------------------------------- the studio the metal reflects
  {
    const st = new THREE.Scene();
    // A dark studio with defined soft-boxes, like a product photographer's: the metal shows bright, clean highlights against deep
    // reflections, and the print keeps its blacks. (A bright grey surround puts a grey veil over every surface.)
    st.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 p; void main(){ float y = normalize(p).y; vec3 c = mix(vec3(0.018,0.022,0.03), vec3(0.06,0.065,0.075), smoothstep(-0.2, 0.9, y)); gl_FragColor = vec4(c, 1.0); }'
    })));
    const box = (w, h, x, y, z, k, tint = [1, 1, 1]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * k, tint[1] * k, tint[2] * k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); st.add(m);
    };
    box(22, 22, 0, 26, 0, 2.2);                        // overhead: the lids read gold from above
    box(36, 9, 0, 9, -18, 3.2);                        // the long soft-box behind: the bright band a lid reflects at a low camera angle
    box(10, 20, -15, 6, 13, 6.5);                      // key, front left: the long highlight on the body
    box(3, 24, 16, 3, 10, 8, [0.94, 0.96, 1]);         // strip, front right
    box(4, 22, -21, 4, -9, 4, [0.72, 0.82, 1]);        // cool rim, back left (the brand's blue in the edges)
    box(4, 22, 21, 4, -11, 3.5, [0.8, 0.88, 1]);       // cool rim, back right
    box(30, 10, 0, -15, 6, 0.25);                      // a faint floor bounce
    scene.environment = new THREE.PMREMGenerator(renderer).fromScene(st, 0.02).texture;
  }
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.castShadow = true;
  key.shadow.mapSize.set(COARSE ? 1024 : 2048, COARSE ? 1024 : 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xbcd0f0, 0.9); rim.position.set(4, 3, -6); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb5c4d7, 0.85));          // the print's daylight: the dark studio only shapes the reflections
  const fillL = new THREE.DirectionalLight(0xffffff, 0.9); scene.add(fillL);  // from the camera, so no printed face falls into shadow
  const hand = new THREE.PointLight(0xfffaf2, 0, 20, 1.5); scene.add(hand);   // the visitor's light
  const rake = new THREE.SpotLight(0xfff1d8, 0, 8, 0.5, 0.6, 1.2); scene.add(rake, rake.target); // macro: the light across the relief

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.18, transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const soft = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, 'rgba(0,19,45,.45)'); g.addColorStop(0.55, 'rgba(0,19,45,.15)'); g.addColorStop(1, 'rgba(0,19,45,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
  const contact = (w) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.45, w * 1.45), new THREE.MeshBasicMaterial({ map: soft, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.002; return m; };

  const ready = [];
  // ---------------------------------------------------------------- the hero's title, set as a wall behind the tin
  // The headline is drawn into the 3D studio itself, so the tin stands in front of the words (the page keeps it as real text too).
  const TW = 5.1, TH = TW * 1600 / 4096;
  const typeCanvas = document.createElement('canvas'); typeCanvas.width = 4096; typeCanvas.height = 1600;
  const typeTex = new THREE.CanvasTexture(typeCanvas); typeTex.colorSpace = THREE.SRGBColorSpace; typeTex.anisotropy = 8;
  const typeMat = new THREE.MeshBasicMaterial({ map: typeTex, transparent: true, depthWrite: false, toneMapped: false });
  const typeWall = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH), typeMat);
  typeWall.position.set(0, 1.22, -2.6); typeWall.lookAt(SHOTS[0].pos.x, 1.22, SHOTS[0].pos.z); typeWall.renderOrder = -1; scene.add(typeWall);
  function drawType(lines, lang, mode) {
    const x = typeCanvas.getContext('2d'); x.clearRect(0, 0, 4096, 1600);
    const face = lang === 'ar' ? '700 {s}px "Readex Pro", sans-serif' : '800 {s}px "Bricolage Grotesque", sans-serif';
    let size = 760; x.font = face.replace('{s}', size);
    const widest = Math.max(...lines.map((l) => x.measureText(l).width));
    size = Math.floor(size * Math.min(1, 3980 / widest)); x.font = face.replace('{s}', size);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.direction = lang === 'ar' ? 'rtl' : 'ltr';
    if ('letterSpacing' in x) x.letterSpacing = lang === 'ar' ? '0px' : Math.round(-size * 0.035) + 'px';
    const cols = mode === 'dark' ? ['#e9eef6', '#879ebc'] : ['#00132d', '#002F6C'];
    if (lang === 'ar') { size = Math.floor(size * 0.86); x.font = face.replace('{s}', size); } // Arabic letters stand taller: a little smaller, a little higher
    const lh = size * (lang === 'ar' ? 1.02 : 0.9), y0 = 800 - lh / 2 + size * (lang === 'ar' ? 0.18 : 0.36);
    lines.forEach((l, i) => { x.fillStyle = cols[i]; x.fillText(l, 2048, y0 + i * lh); });
    typeTex.needsUpdate = true;
  }

  // ---------------------------------------------------------------- the main tin
  const main = TIN.make('qaisi'); ready.push(main.ready);
  main.print.forEach((m) => TIN.setFinish(m, 'gloss'));
  const mainSpin = new THREE.Group(); mainSpin.add(main.group); scene.add(mainSpin);
  scene.add(contact(main.size.w));

  // ---------------------------------------------------------------- the layer rig (the painted Bab Sharqi lid: a full-colour print, so the separations show)
  const LR = 1.15;
  const layers = (() => {
    const g = new THREE.Group(); g.position.set(AX, 0, 0); scene.add(g);
    const disc = new THREE.CircleGeometry(LR, 160); disc.rotateX(-Math.PI / 2);
    const L = HAL.surface('lid', 1, 1, 'sharqi'); ready.push(L.ready);
    const N = 768, plates = [0, 1, 2, 3].map(() => { const c = document.createElement('canvas'); c.width = c.height = N; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, t }; });
    L.ready.then(() => { // RGB -> C, M, Y, K coverage; each plate drawn in the brand navy
      const s = document.createElement('canvas'); s.width = s.height = N; const sx = s.getContext('2d', { willReadFrequently: true }); sx.drawImage(L.canvas, 0, 0, N, N);
      const px = sx.getImageData(0, 0, N, N).data;
      plates.forEach((p, i) => {
        const x = p.c.getContext('2d'), o = x.createImageData(N, N), d = o.data;
        for (let j = 0; j < px.length; j += 4) {
          const r = px[j] / 255, gg = px[j + 1] / 255, b = px[j + 2] / 255, K = 1 - Math.max(r, gg, b);
          const v = i === 3 ? K : K >= 0.999 ? 0 : (1 - [r, gg, b][i] - K) / (1 - K);
          const q = j / 4, xx = (q % N) - N / 2, yy = Math.floor(q / N) - N / 2;
          d[j] = 0; d[j + 1] = 47; d[j + 2] = 108; d[j + 3] = Math.hypot(xx, yy) < N / 2 - 1 ? Math.round(clamp(v) * 230) : 0;
        }
        x.putImageData(o, 0, 0); p.t.needsUpdate = true;
      });
    });
    const mk = (mat, ro) => { const m = new THREE.Mesh(disc, mat); m.renderOrder = ro; m.castShadow = true; g.add(m); return m; };
    const steel = mk(new THREE.MeshPhysicalMaterial({ color: '#e7ebf0', metalness: 1, roughness: 0.16, transparent: true }), 0);
    const coat = mk(new THREE.MeshPhysicalMaterial({ color: '#f7f8fa', roughness: 0.38, clearcoat: 0.6, transparent: true }), 1);
    const inks = plates.map((p, i) => mk(new THREE.MeshBasicMaterial({ map: p.t, transparent: true, depthWrite: false, side: THREE.DoubleSide }), 2 + i));
    const fm = TIN.printMat(L, 1); TIN.setFinish(fm, 'gloss'); fm.transparent = true; fm.envMapIntensity = 0.55;
    const final = mk(fm, 7);
    const varnish = mk(new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.2, depthWrite: false }), 8);
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(LR, LR, 0.03, 160, 1, true), new THREE.MeshPhysicalMaterial({ color: '#c9ced6', metalness: 1, roughness: 0.25 })); edge.position.y = -0.015; g.add(edge);
    g.add(contact(LR * 2));
    return { g, steel, coat, inks, final, fm, varnish, edge };
  })();

  // ---------------------------------------------------------------- the other tins: a ring round the main tin
  const RING_R = 4.8;
  const ring = RING_KEYS.map((k, i) => {
    const m = TIN.make(k); ready.push(m.ready); m.print.forEach((p) => TIN.setFinish(p, 'gloss'));
    const holder = new THREE.Group(); holder.add(m.group); holder.add(contact(Math.max(m.size.w, m.size.d))); holder.scale.setScalar(0.001); scene.add(holder);
    return { key: k, m, holder, i };
  });
  // ---------------------------------------------------------------- from sheet to shelf: the main tin's own story, at its real size
  // A printed tinplate sheet carrying five body blanks of the Al Qaisi tin: the prepress marks are drawn, the press runs across it,
  // the middle blank is cut out, rolled into the body and closed with its lid; the tin then joins a wrapped pallet of its twins,
  // and the pallet leaves for the globe with routes out of Amman. Everything poses itself from the chapter's own time (0 … 1).
  const JX = -13, J0 = V(JX, 0, 0), JV = V(JX, 0.6, 0);
  // three.js copies userData through JSON when cloning, and our userData holds the artwork's textures: clone without it
  const lean = (o, f) => { const kept = []; const strip = (x) => { kept.push([x, x.userData]); x.userData = {}; }; if (o.isMaterial) strip(o); else o.traverse(strip); const c = f(o); kept.forEach(([x, u]) => { x.userData = u; }); return c; };
  const journey = (() => {
    const U = 0.01, TQ = TIN.TINS.qaisi, R = (TQ.D / 2) * U, H = TQ.H * U, SK = TQ.skirt * U;
    const JH = H - SK * 0.75, JW = Math.PI * 2 * R;          // the body blank: as tall as the body, as long as its circumference
    const ROWS = 5, GAP = 0.13, MX = 0.34, MY = 0.3;          // five blanks on the sheet, with room for the press marks
    const SW = JW + 2 * MX, SH = ROWS * JH + (ROWS - 1) * GAP + 2 * MY;
    const rowY = (r) => (r - (ROWS - 1) / 2) * (JH + GAP);    // centre of row r on the sheet
    const PLATE_S = 0.66, PLATE_Y = 1.3, TILT = 0.34;

    // the bare sheet and its prepress marks (brand navy), drawn as the chapter opens
    const BW = 4096, BH = Math.round((BW * SH) / SW), k = BW / SW;
    const bc = document.createElement('canvas'); bc.width = BW; bc.height = BH;
    const bt = new THREE.CanvasTexture(bc); bt.colorSpace = THREE.SRGBColorSpace; bt.anisotropy = 8;
    const grain = (() => { // the brushed grain of tinplate, drawn once
      const c = document.createElement('canvas'); c.width = BW; c.height = BH; const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, BW, BH);
      g.addColorStop(0, '#aab3c0'); g.addColorStop(0.28, '#eef1f5'); g.addColorStop(0.5, '#b9c1cc'); g.addColorStop(0.74, '#f2f4f7'); g.addColorStop(1, '#a3acb9');
      x.fillStyle = g; x.fillRect(0, 0, BW, BH);
      for (let y = 0; y < BH; y += 2) { x.globalAlpha = 0.035 + Math.random() * 0.05; x.fillStyle = Math.random() < 0.5 ? '#53739d' : '#ffffff'; x.fillRect(0, y, BW, 1); }
      return c;
    })();
    let lastGuides = -1;
    function drawBlank(gd) {
      if (Math.abs(gd - lastGuides) < 0.01 && !(gd === 1 && lastGuides !== 1)) return; lastGuides = gd;
      const x = bc.getContext('2d'); x.globalAlpha = 1; x.drawImage(grain, 0, 0);
      const px = (u) => (u + SW / 2) * k, py = (v) => (SH / 2 - v) * k;   // sheet units -> canvas
      const ease = (a, b) => sm(clamp((gd - a) / (b - a)));
      x.strokeStyle = '#002F6C'; x.fillStyle = '#002F6C'; x.lineCap = 'round';
      // 1. trim lines around each blank (dashed), drawn left to right
      x.lineWidth = 11; x.setLineDash([40, 22]); x.globalAlpha = 0.85;
      for (let r = 0; r < ROWS; r++) {
        const e = ease(0.05 + r * 0.06, 0.4 + r * 0.06); if (e <= 0) continue;
        const y0 = py(rowY(r) + JH / 2), y1 = py(rowY(r) - JH / 2), x0 = px(-JW / 2), x1 = px(-JW / 2 + JW * e);
        x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y0); x.moveTo(x0, y1); x.lineTo(x1, y1); x.stroke();
        if (e > 0.98) { x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0, y1); x.moveTo(x1, y0); x.lineTo(x1, y1); x.stroke(); }
      }
      x.setLineDash([]);
      // 2. crop marks at the corners, registration targets at the edges, a colour bar along the gripper edge
      const e2 = ease(0.45, 0.75);
      if (e2 > 0) {
        x.globalAlpha = e2; x.lineWidth = 11;
        const L = 0.2 * k, G = 0.06 * k;
        [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([sx, sy]) => {
          const cx = px((sx * JW) / 2), cy = py(sy * (rowY(ROWS - 1) + JH / 2));
          x.beginPath(); x.moveTo(cx + sx * G, cy); x.lineTo(cx + sx * (G + L), cy); x.moveTo(cx, cy - sy * G); x.lineTo(cx, cy - sy * (G + L)); x.stroke();
        });
        const reg = (u, v) => { const cx = px(u), cy = py(v), r = 0.085 * k; x.beginPath(); x.arc(cx, cy, r * 0.6, 0, Math.PI * 2); x.moveTo(cx - r, cy); x.lineTo(cx + r, cy); x.moveTo(cx, cy - r); x.lineTo(cx, cy + r); x.stroke(); };
        reg(0, SH / 2 - MY / 2); reg(0, -SH / 2 + MY / 2); reg(-SW / 2 + MX / 2, 0); reg(SW / 2 - MX / 2, 0);
      }
      const e3 = ease(0.7, 1);
      if (e3 > 0) { // the colour bar: the brand's navy scale and the amber, the patches a press operator reads
        const tints = ['#002F6C', '#274f83', '#53739d', '#879ebc', '#b5c4d7', '#d98b14', '#f4b34c', '#00132d'];
        const n = 28, w = (JW * 0.62) / n, y = py(-SH / 2 + MY * 0.58), h = MY * 0.36 * k;
        for (let i = 0; i < n * e3; i++) { x.globalAlpha = 0.9; x.fillStyle = tints[i % tints.length]; x.fillRect(px(-JW * 0.31 + i * w), y, w * k - 3, h); }
      }
      x.globalAlpha = 1; bt.needsUpdate = true;
    }
    drawBlank(0);

    // the printed artwork: the same photo-true surface the finished tin wears; the press reveals it with a clipping plane
    const L = HAL.surface('wrap', JH / JW, 8, 'qaisi'); ready.push(L.ready);
    const cut = new THREE.Plane(V(-1, 0, 0), -1e4);
    const ink = TIN.printMat(L, 0.6); TIN.setFinish(ink, 'gloss');
    Object.assign(ink, { clippingPlanes: [cut], polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const inkRest = lean(ink, (o) => o.clone()); Object.assign(inkRest, { clippingPlanes: [cut], transparent: true });
    const tinplate = (opts) => new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0.45, roughness: 0.3, clearcoat: 0.5, clearcoatRoughness: 0.2, ...opts });
    // the bare sheet: bright like polished tinplate (its own light), with the studio's soft-boxes running over it
    const sheetLook = { color: new THREE.Color(0.5, 0.5, 0.5), emissiveMap: bt, emissive: new THREE.Color(0.5, 0.5, 0.5), metalness: 0.85, roughness: 0.17 };

    const plate = new THREE.Group(); plate.position.set(JX, PLATE_Y, 0); plate.rotation.x = -TILT; plate.scale.setScalar(PLATE_S); scene.add(plate);
    const blankMat = tinplate({ map: bt, side: THREE.DoubleSide, transparent: true, ...sheetLook });
    const blank = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), blankMat); blank.castShadow = true; plate.add(blank);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(SW, SH, 0.02), tinplate({ color: '#c9d0da', transparent: true })); edge.position.z = -0.011; plate.add(edge);
    const rest = [];
    const stripGeo = new THREE.PlaneGeometry(JW, JH);
    for (let r = 0; r < ROWS; r++) {
      if (r === (ROWS - 1) / 2) continue;
      const m = new THREE.Mesh(stripGeo, inkRest); m.position.set(0, rowY(r), 0.004); m.userData.r = r; plate.add(m); rest.push(m);
    }
    // the press: a bar of light running across the sheet as the print appears behind it
    const headMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#f4b34c').multiplyScalar(2.2), toneMapped: false, transparent: true });
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.035, SH + 0.24, 0.035), headMat); head.position.z = 0.06; plate.add(head);
    const glowTex = (() => { const c = document.createElement('canvas'); c.width = 64; c.height = 4; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, 64, 0); g.addColorStop(0, 'rgba(244,179,76,0)'); g.addColorStop(0.5, 'rgba(244,179,76,.55)'); g.addColorStop(1, 'rgba(244,179,76,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 4); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, SH + 0.1), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    glow.position.z = 0.03; plate.add(glow);

    // the middle blank: cut out of the sheet, rolled into the body (the geometry bends from flat to a cylinder)
    const N = 200, geo = new THREE.BufferGeometry();
    const pos = new Float32Array((N + 1) * 6), nor = new Float32Array((N + 1) * 6), uv = new Float32Array((N + 1) * 4), idx = [];
    for (let i = 0; i <= N; i++) for (let j = 0; j < 2; j++) { const q = i * 2 + j; uv[q * 2] = i / N; uv[q * 2 + 1] = j; }
    for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    geo.setIndex(idx); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    let lastBend = -1;
    function bend(b) {
      if (Math.abs(b - lastBend) < 1e-4) return; lastBend = b;
      for (let i = 0; i <= N; i++) {
        const s = (i / N - 0.5) * JW; let x = s, z = 0, nx = 0, nz = 1;
        if (b > 1e-4) { const r = R / b, ph = s / r; x = r * Math.sin(ph); z = -r * (1 - Math.cos(ph)) + R * b; nx = Math.sin(ph); nz = Math.cos(ph); }
        for (let j = 0; j < 2; j++) { const q = (i * 2 + j) * 3; pos[q] = x; pos[q + 1] = j ? JH : 0; pos[q + 2] = z; nor[q] = nx; nor[q + 1] = 0; nor[q + 2] = nz; }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true; geo.computeBoundingSphere();
    }
    bend(0);
    const hero = new THREE.Group(); scene.add(hero);
    const heroInk = new THREE.Mesh(geo, ink); heroInk.castShadow = true;
    const heroBack = new THREE.Mesh(geo, tinplate({ color: '#e3e7ed', metalness: 0.8, roughness: 0.22, side: THREE.DoubleSide })); heroBack.castShadow = true;
    const tin = TIN.make('qaisi'); ready.push(tin.ready); tin.print.forEach((m) => TIN.setFinish(m, 'gloss'));
    const proto = lean(tin.group, (o) => o.clone());     // the finished tin, for the pallet
    tin.body.visible = false;                             // the rolled blank is the body
    const lidY = tin.lid.position.y;
    hero.add(heroBack, heroInk, tin.group);
    const startPose = new THREE.Object3D(); startPose.position.set(0, -JH / 2, 0.006); plate.add(startPose);

    // the pallet: 3 x 3 tins a layer, four layers, a wooden pallet, stretch film
    const PS = 0.42, PITCH = 2.46, STEP = H + 0.04, LAY = 4;
    const pallet = new THREE.Group(); pallet.position.copy(J0); pallet.scale.setScalar(PS); scene.add(pallet);
    const woodTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#c29a66'; x.fillRect(0, 0, 256, 64); for (let i = 0; i < 70; i++) { x.globalAlpha = 0.08 + Math.random() * 0.12; x.fillStyle = Math.random() < 0.5 ? '#8a6238' : '#e2c49a'; x.fillRect(0, Math.random() * 64, 256, 1 + Math.random() * 2); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 });
    const base = new THREE.Group(); pallet.add(base);
    const PW = 3 * PITCH + 0.1, BOARD = 0.09, BLOCK = 0.42;
    const bx = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; base.add(m); };
    for (let i = 0; i < 3; i++) bx(PW, BOARD, 0.7, 0, BOARD / 2, (i - 1) * (PW / 2 - 0.35));            // bottom boards
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) bx(0.8, BLOCK, 0.8, (i - 1) * (PW / 2 - 0.4), BOARD + BLOCK / 2, (j - 1) * (PW / 2 - 0.4)); // blocks
    for (let i = 0; i < 7; i++) bx(PW, BOARD, 0.86, 0, BOARD * 1.5 + BLOCK, (i - 3) * ((PW - 0.86) / 6)); // top deck
    const BASE = 2 * BOARD + BLOCK;
    const tins = [], slotOf = (ix, iz, l) => V((ix - 1) * PITCH, BASE + l * STEP + 0.03, (iz - 1) * PITCH);
    const HERO_SLOT = slotOf(1, 2, LAY - 1);
    for (let l = 0; l < LAY; l++) {
      for (let iz = 0; iz < 3; iz++) for (let ix = 0; ix < 3; ix++) {
        if (l === LAY - 1 && ix === 1 && iz === 2) continue;   // the hero's place
        const g = lean(proto, (o) => o.clone()); g.position.copy(slotOf(ix, iz, l)); g.rotation.y = -0.55 + (ix * 7 + iz * 3) * 0.37; g.userData.k = tins.length; g.userData.p = g.position.clone();
        pallet.add(g); tins.push(g);
      }
    }
    const filmMat = new THREE.MeshPhysicalMaterial({ color: '#e9eef6', roughness: 0.08, metalness: 0, clearcoat: 1, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const wrapH = LAY * STEP + 0.05, wrap = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.08, wrapH, PW + 0.08), filmMat); wrap.position.y = BASE + wrapH / 2; wrap.renderOrder = 3; pallet.add(wrap);
    const pc = contact(PW * 0.95); pallet.add(pc);

    // the globe: a navy planet with the land in dots of champagne gold, and routes from Amman in amber
    const globe = new THREE.Group(); globe.position.set(JX, 1.75, 0); scene.add(globe);
    const tilt = new THREE.Group(); globe.add(tilt);
    const GR = 1.25;
    const ll = (lat, lon, r = GR) => { const a = THREE.MathUtils.degToRad(lat), o = THREE.MathUtils.degToRad(lon); return V(r * Math.cos(a) * Math.sin(o), r * Math.sin(a), r * Math.cos(a) * Math.cos(o)); };
    const lit = (body) => `varying vec3 vN; void main(){ ${body}
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
    const vN = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    tilt.add(new THREE.Mesh(new THREE.SphereGeometry(GR * 0.985, 72, 48), new THREE.ShaderMaterial({ vertexShader: vN,
      fragmentShader: lit('float f = pow(1.0 - abs(vN.z), 2.4); vec3 c = mix(vec3(0.0, 0.028, 0.155), vec3(0.06, 0.2, 0.42), f) + vec3(0.0, 0.01, 0.03) * (vN.y * 0.5 + 0.5); gl_FragColor = vec4(c, 1.0);') })));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(GR * 1.1, 64, 48), new THREE.ShaderMaterial({ vertexShader: vN, transparent: true, depthWrite: false, side: THREE.BackSide,
      fragmentShader: lit('float f = pow(1.0 - abs(vN.z), 3.0); gl_FragColor = vec4(vec3(0.0, 0.1, 0.3), f * 0.4);') }));
    globe.add(halo);
    const DOTS = COARSE ? 6000 : 11000, dp = new Float32Array(DOTS * 3), dc = new Float32Array(DOTS * 3), lonlat = new Float32Array(DOTS * 2);
    const sea = new THREE.Color('#274f83').multiplyScalar(0.55), landC = new THREE.Color('#e3c06c');
    for (let i = 0; i < DOTS; i++) {
      const y = 1 - (i / (DOTS - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i, x = Math.cos(th) * r, z = Math.sin(th) * r;
      dp.set([x * GR, y * GR, z * GR], i * 3); lonlat[i * 2] = (Math.atan2(x, z) * 180) / Math.PI; lonlat[i * 2 + 1] = (Math.asin(y) * 180) / Math.PI;
      dc.set([sea.r, sea.g, sea.b], i * 3);
    }
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3)); dg.setAttribute('color', new THREE.BufferAttribute(dc, 3));
    const dots = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, depthWrite: false, toneMapped: false })); tilt.add(dots);
    fetch(new URL('../../data/land-110m.geojson', import.meta.url)).then((r) => r.json()).then((gj) => {
      const W = 1440, Hh = 720, cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
      const cx = cv.getContext('2d', { willReadFrequently: true }); cx.fillStyle = '#fff';
      const ringP = (rg) => { rg.forEach(([lo, la], q) => { const x = ((lo + 180) / 360) * W, y = ((90 - la) / 180) * Hh; q ? cx.lineTo(x, y) : cx.moveTo(x, y); }); cx.closePath(); };
      gj.features.forEach((f) => { (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).forEach((poly) => { cx.beginPath(); poly.forEach(ringP); cx.fill('evenodd'); }); });
      const px = cx.getImageData(0, 0, W, Hh).data;
      for (let i = 0; i < DOTS; i++) {
        const xx = Math.min(W - 1, Math.max(0, Math.floor(((lonlat[i * 2] + 180) / 360) * W))), yy = Math.min(Hh - 1, Math.max(0, Math.floor(((90 - lonlat[i * 2 + 1]) / 180) * Hh)));
        if (px[(yy * W + xx) * 4] > 128) dc.set([landC.r, landC.g, landC.b], i * 3);
      }
      dg.attributes.color.needsUpdate = true;
    }).catch((e) => console.warn('globe land map unavailable', e));
    const home = ll(31.95, 35.93);
    const amber = new THREE.MeshBasicMaterial({ color: new THREE.Color('#f4b34c').multiplyScalar(1.6), toneMapped: false });
    const homeDot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 20, 20), amber); homeDot.position.copy(home); tilt.add(homeDot);
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.075, 48), new THREE.MeshBasicMaterial({ color: '#f4b34c', transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
    pulse.position.copy(home).multiplyScalar(1.002); pulse.lookAt(home.clone().multiplyScalar(2)); tilt.add(pulse);
    // routes: the region the factory serves (no city names: only the home city is labelled)
    const DEST = [[24.71, 46.68], [25.2, 55.27], [33.31, 44.37], [29.38, 47.99], [25.29, 51.53], [23.59, 58.41], [33.89, 35.5], [30.04, 31.24]];
    const arcs = DEST.map(([la, lo]) => {
      const p1 = ll(la, lo), mid = home.clone().add(p1).multiplyScalar(0.5); mid.setLength(GR + 0.1 + home.distanceTo(p1) * 0.5);
      const tg = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(home, mid, p1), 64, 0.011, 6, false);
      const line = new THREE.Mesh(tg, amber); tg.setDrawRange(0, 0); tilt.add(line);
      const end = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false })); end.position.copy(p1); end.visible = false; tilt.add(end);
      return { tg, end, n: tg.index.count };
    });
    const lblC = document.createElement('canvas'); lblC.width = 512; lblC.height = 160;
    const lblT = new THREE.CanvasTexture(lblC); lblT.colorSpace = THREE.SRGBColorSpace;
    const lbl = new THREE.Sprite(new THREE.SpriteMaterial({ map: lblT, transparent: true, depthTest: false, toneMapped: false })); lbl.scale.set(0.78, 0.244, 1); lbl.renderOrder = 5;
    lbl.position.copy(home).multiplyScalar(1.08).add(V(-0.4, 0.06, 0.1)); tilt.add(lbl);
    function label(lang) {
      const x = lblC.getContext('2d'); x.clearRect(0, 0, 512, 160);
      const t = lang === 'ar' ? 'عمّان' : 'Amman';
      x.font = lang === 'ar' ? '600 64px "Readex Pro", sans-serif' : '700 60px "Bricolage Grotesque", sans-serif';
      const w = x.measureText(t).width + 64;
      x.fillStyle = 'rgba(0,19,45,.82)'; x.beginPath(); x.roundRect(256 - w / 2, 30, w, 100, 50); x.fill();
      x.strokeStyle = 'rgba(244,179,76,.9)'; x.lineWidth = 3; x.stroke();
      x.fillStyle = '#f4b34c'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = lang === 'ar' ? 'rtl' : 'ltr'; x.fillText(t, 256, 82);
      lblT.needsUpdate = true;
    }
    label('en');
    const GY = -THREE.MathUtils.degToRad(36); tilt.rotation.set(0.42, GY, 0);

    // ------------------------------------------------------------ the chapter's time line
    // 0 design & plates · 0.14 print · 0.34 cut & form · 0.56 pack · 0.8 ship
    const STEPS = [0, 0.14, 0.34, 0.56, 0.8];
    const sp = V(0, 0, 0), sq = new THREE.Quaternion(), ss = V(0, 0, 0), q1 = new THREE.Quaternion(), spinQ = new THREE.Quaternion(), Y = V(0, 1, 0);
    const lin = (p, a, b) => clamp((p - a) / (b - a));
    function pose(p, t) {
      const vis = p > 0 || T > CHAPTERS[4][1];   // built only once the camera heads this way
      const gd = seg(p, 0.0, 0.13), pr = lin(p, 0.15, 0.31);
      const cutA = seg(p, 0.35, 0.41), up = seg(p, 0.37, 0.45), bn = seg(p, 0.43, 0.52), lid = seg(p, 0.51, 0.555);
      const rise = seg(p, 0.57, 0.63), land = seg(p, 0.72, 0.78), wrapF = seg(p, 0.76, 0.8);
      const gl = seg(p, 0.81, 0.9), leave = seg(p, 0.8, 0.88);
      // the sheet
      drawBlank(gd);
      plate.visible = vis && cutA < 0.999;
      const handX = (u) => plate.position.x + u * PLATE_S;   // sheet x -> world x (the sheet is not turned about y)
      cut.constant = pr >= 1 ? 1e4 : handX(-JW / 2 + JW * pr);
      head.visible = glow.visible = pr > 0 && pr < 1; head.position.x = glow.position.x = -JW / 2 + JW * pr;
      headMat.opacity = Math.min(1, pr * 20, (1 - pr) * 20);
      blankMat.opacity = edge.material.opacity = 1 - cutA; inkRest.opacity = 1 - cutA;
      rest.forEach((m) => { const dir = Math.sign(m.userData.r - (ROWS - 1) / 2); m.position.y = rowY(m.userData.r) + dir * cutA * 0.6; m.position.z = 0.004 - cutA * 0.3; });
      blank.position.z = -cutA * 0.4; edge.position.z = -0.011 - cutA * 0.4;
      plate.rotation.y = (REDUCED ? 0 : Math.sin(t * 0.25) * 0.035) + ptr.sx * 0.04;
      // the hero blank: from its place on the sheet to the floor, rolled, closed, lifted, landed on the pallet
      plate.updateMatrixWorld(true); startPose.matrixWorld.decompose(sp, sq, ss);
      bend(bn);
      heroBack.visible = cutA > 0.001;
      hero.visible = vis && gl < 0.999;
      tin.group.visible = bn > 0.97;
      tin.lid.visible = lid > 0.001; tin.lid.position.y = lidY + (1 - lid) * (1 - lid) * 2.4;
      const spin = seg(p, 0.42, 0.58) * Math.PI * 2 + (REDUCED ? 0 : t * 0.12 * seg(p, 0.55, 0.62));
      spinQ.setFromAxisAngle(Y, spin);
      const flat = V(J0.x, J0.y, J0.z), hover = V(JX, 2.35, 0.2), slot = HERO_SLOT.clone().multiplyScalar(PS).add(pallet.position);
      const P = sp.clone().lerp(flat, up).lerp(hover, rise).lerp(slot, land);
      hero.position.copy(P);
      q1.identity(); hero.quaternion.copy(sq).slerp(q1, up).multiply(spinQ);
      hero.scale.setScalar(lerp(lerp(ss.x, 1, bn), PS, rise));
      // the pallet: the tins arrive in order, then the film; then it leaves for the globe
      const build = lin(p, 0.58, 0.73);
      pallet.visible = vis && p > 0.56 && gl < 0.999;
      tins.forEach((g) => { const a = clamp(build * (tins.length + 6) - g.userData.k, 0, 6) / 6, e = 1 - (1 - a) * (1 - a); g.visible = a > 0; g.position.y = g.userData.p.y + (1 - e) * 2.2; g.scale.setScalar(Math.max(0.001, e)); });
      
      filmMat.opacity = 0.09 * wrapF;
      const ps = PS * (1 - leave * 0.85);
      pallet.scale.setScalar(Math.max(0.001, ps)); pallet.position.set(JX, leave * 1.4, 0);
      if (leave > 0) hero.position.copy(HERO_SLOT.clone().multiplyScalar(ps).add(pallet.position)), hero.scale.setScalar(Math.max(0.001, ps));
      // the globe
      globe.visible = vis && gl > 0.001; globe.scale.setScalar(Math.max(0.001, sm(gl)));
      tilt.rotation.y = GY + (REDUCED ? 0 : Math.sin(t * 0.3) * 0.06) + ptr.sx * 0.15 + (1 - gl) * 0.8;
      arcs.forEach((a, i) => { const e = clamp((p - 0.86 - i * 0.012) / 0.1); a.tg.setDrawRange(0, Math.floor((a.n * e) / 6) * 6); a.end.visible = e > 0.98; });
      pulse.scale.setScalar(1 + ((t * 0.8) % 1) * 2.2); pulse.material.opacity = 1 - ((t * 0.8) % 1);
      lbl.material.opacity = seg(p, 0.86, 0.92);
      let s = 0; STEPS.forEach((v, i) => { if (p >= v) s = i; });
      return s;
    }
    // the camera inside the chapter: wide on the sheet, close on the tin, high on the pallet, level on the globe
    const KEYS = [
      [0, { pos: V(-1.25, 3.4, 12.8), tgt: V(-1.2, 1.1, 0) }],
      [0.36, { pos: V(-1.25, 3.4, 12.8), tgt: V(-1.2, 1.1, 0) }],
      [0.44, { pos: V(-1.25, 2.6, 8.4), tgt: V(-1.1, 0.5, 0) }],
      [0.53, { pos: V(-1.3, 2.35, 6.7), tgt: V(-1.2, 0.36, 0) }],
      [0.565, { pos: V(-1.3, 2.35, 6.7), tgt: V(-1.2, 0.36, 0) }],
      [0.64, { pos: V(-1.6, 4.3, 9.8), tgt: V(-1.4, 0.95, 0) }],
      [0.8, { pos: V(-1.6, 4.3, 9.8), tgt: V(-1.4, 0.95, 0) }],
      [0.88, { pos: V(-1.3, 2.2, 9.4), tgt: V(-1.2, 1.75, 0) }],
      [1, { pos: V(-1.3, 2.2, 9.4), tgt: V(-1.2, 1.75, 0) }]
    ];
    const out = { pos: V(0, 0, 0), tgt: V(0, 0, 0), fov: 30 };
    function shotAt(p, mirror, portrait) {
      let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
      const [pa, A] = KEYS[i], [pb, B] = KEYS[i + 1], e = sm(clamp((p - pa) / Math.max(1e-6, pb - pa)));
      out.pos.lerpVectors(A.pos, B.pos, e); out.tgt.lerpVectors(A.tgt, B.tgt, e);
      if (portrait) { const dx = out.tgt.x; out.pos.x -= dx; out.tgt.x -= dx; out.tgt.y -= 0.55; out.pos.y -= 0.3; } // the card sits below: the subject centred, a little higher
      if (mirror) { out.pos.x = -out.pos.x; out.tgt.x = -out.tgt.x; }
      out.pos.x += JX; out.tgt.x += JX;
      return out;
    }
    return { pose, shotAt, label, plate };
  })();

  // ---------------------------------------------------------------- post: bloom on the glints, depth of field in the macro shot
  let composer = null, bokeh = null, bloom = null;
  if (!COARSE) {
    const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
    composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    bokeh = new BokehPass(scene, camera, { focus: 1.2, aperture: 0.002, maxblur: 0.006 }); composer.addPass(bokeh);
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.12, 0.4, 0.97); composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // ---------------------------------------------------------------- input
  const ptr = { x: 0.2, y: -0.2, sx: 0.2, sy: -0.2 };
  addEventListener('pointermove', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  let dragYaw = 0, dragV = 0, dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; });
  addEventListener('pointerup', () => { dragging = false; });
  addEventListener('pointermove', (e) => { if (!dragging) return; dragV = (e.clientX - lastX) * 0.006; lastX = e.clientX; dragYaw += dragV; });

  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) { composer.setSize(w, h); bloom.resolution.set(w / 2, h / 2); }
  }
  addEventListener('resize', resize); resize();

  // ---------------------------------------------------------------- the film
  let T = 0, theme = 'light', lab = 'gloss';
  const listeners = [];
  const state = { chapter: 0, layer: 0, ring: 0, step: 0 };
  // the text cards sit on the reading side; in Arabic the side shots are mirrored so the subject stays clear of the card
  const MIRROR_AT = { 1: 0, 2: AX, 4: 0 };
  const mirrored = SHOTS.map((sh, i) => (sh && i in MIRROR_AT ? { pos: V(2 * MIRROR_AT[i] - sh.pos.x, sh.pos.y, sh.pos.z), tgt: V(2 * MIRROR_AT[i] - sh.tgt.x, sh.tgt.y, sh.tgt.z), fov: sh.fov } : sh));
  const rtl = () => document.documentElement.dir === 'rtl';
  const shot = (i) => (i === 5 ? journey.shotAt(local(5), rtl(), camera.aspect < 0.9) : rtl() ? mirrored[i] : SHOTS[i]);
  const shotAt = (t) => { // the camera between shots: hold inside a chapter, travel between chapters
    let i = 0; while (i < CHAPTERS.length - 1 && t > CHAPTERS[i][1]) i++;
    const [a] = CHAPTERS[i];
    if (i === 0 || t >= a) return { i, k: 0, ia: i, ib: i, A: shot(i), B: shot(i) };
    const pe = CHAPTERS[i - 1][1], k = sm(clamp((t - pe) / (a - pe)));
    return { i: k < 0.5 ? i - 1 : i, k, ia: i - 1, ib: i, A: shot(i - 1), B: shot(i) };
  };
  const tmpP = V(0, 0, 0), tmpT = V(0, 0, 0);
  const local = (i) => clamp((T - CHAPTERS[i][0]) / (CHAPTERS[i][1] - CHAPTERS[i][0]));
  const t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;
    ptr.sx += (ptr.x - ptr.sx) * 0.07; ptr.sy += (ptr.y - ptr.sy) * 0.07;
    dragV *= 0.94; if (!dragging) dragYaw += dragV;
    const S = shotAt(T);
    tmpP.lerpVectors(S.A.pos, S.B.pos, S.k); tmpT.lerpVectors(S.A.tgt, S.B.tgt, S.k);
    // a gentle drift with the pointer, more in the wide shots
    const drift = S.i === 1 ? 0.04 : S.i === 5 ? 0.1 : 0.18;
    tmpP.x += ptr.sx * drift; tmpP.y -= ptr.sy * drift * 0.5;
    // tall screens: step back so the subject keeps its width
    const backOf = (i) => Math.max(1, (i === 5 ? 1.0 : 0.95) / camera.aspect);
    const back = lerp(backOf(S.ia), backOf(S.ib), S.k);
    camera.position.copy(tmpT).addScaledVector(tmpP.clone().sub(tmpT), back);
    camera.lookAt(tmpT);
    if (state.chapter !== S.i) { state.chapter = S.i; listeners.forEach((f) => f(state)); }

    // the title wall: only in the hero; on a narrow screen it shrinks to stay inside the frame
    const wallOn = 1 - seg(T, CHAPTERS[0][1] - 0.01, CHAPTERS[0][1] + 0.05);
    typeWall.visible = wallOn > 0.001; typeMat.opacity = wallOn;
    { const dW = camera.position.distanceTo(typeWall.position), vis = 2 * dW * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect; typeWall.scale.setScalar(Math.min(1, (vis * 0.94) / TW)); }
    // the main tin: turning slowly; the visitor turns it in the lab
    const idle = REDUCED ? 0 : t * 0.16;
    mainSpin.rotation.y = -0.55 + idle * (S.i === 1 ? 0.3 : 1) + dragYaw;
    // the layer rig
    const pl = local(2);
    {
      const TH = 0.04, land = (m, i, y) => { const s = seg(pl, 0.02 + i * 0.12, 0.11 + i * 0.12); m.visible = s > 0.001; m.position.y = y + (1 - s) * 2.2; m.material.opacity = Math.min(1, s * 2.5); return s; };
      land(layers.steel, 0, 0.02); layers.edge.visible = layers.steel.visible; layers.edge.position.y = layers.steel.position.y - 0.015;
      land(layers.coat, 1, 0.02 + TH);
      layers.inks.forEach((m, i) => { land(m, 2 + i, 0.02 + TH * (2 + i)); const off = (1 - seg(pl, 0.075 + (2 + i) * 0.12, 0.11 + (2 + i) * 0.12)) * 0.16; m.position.x = Math.cos(i * 1.7) * off; m.position.z = Math.sin(i * 1.7) * off; });
      land(layers.varnish, 6, 0.02 + TH * 6 + 0.003); layers.varnish.material.opacity *= 0.2;
      const fin = seg(pl, 0.8, 0.92);
      layers.final.visible = fin > 0.001; layers.final.position.y = 0.02 + TH * 7 + 0.004; layers.fm.opacity = fin; layers.fm.transparent = fin < 0.999;
      layers.fm.bumpScale = 4 * seg(pl, 0.86, 1);
      layers.inks.forEach((m) => { m.material.opacity *= 1 - fin; });
      layers.g.rotation.y = (REDUCED ? 0 : t * 0.08) - 0.3 + pl * 0.5;
      layers.g.visible = T > CHAPTERS[1][1] - 0.02 && T < CHAPTERS[3][0] + 0.02; // only around its own chapter (the top view would see it)
      let L = 0; for (let i = 0; i < 7; i++) if (pl > 0.02 + i * 0.12 + 0.01) L = i;
      L = pl > 0.86 ? 7 : L; if (L !== state.layer) { state.layer = L; listeners.forEach((f) => f(state)); }
    }
    // the ring: the tins come up out of the floor, and go once the lab begins
    const rise = seg(T, CHAPTERS[2][1] + 0.01, CHAPTERS[3][0]);
    const gone = seg(T, CHAPTERS[3][1], CHAPTERS[3][1] + 0.03);
    const pr = local(3), turn = pr * (RING_KEYS.length - 1);
    const front = Math.round(turn);
    if (front !== state.ring) { state.ring = front; listeners.forEach((f) => f(state)); }
    ring.forEach((r, i) => {
      const a = ((i - turn) / RING_KEYS.length) * Math.PI * 2;
      r.holder.position.set(Math.sin(a) * RING_R, 0, Math.cos(a) * RING_R);
      const s = sm(clamp(rise * 1.6 - i * 0.05)) * (1 - gone);
      r.holder.visible = s > 0.002; r.holder.scale.setScalar(Math.max(0.001, s));
      r.m.group.rotation.y = a + (REDUCED ? 0 : t * 0.2) - 0.4;
    });
    // from sheet to shelf
    const pj = local(5), step = journey.pose(pj, t);
    if (step !== state.step) { state.step = step; listeners.forEach((f) => f(state)); }

    // lights: the shadow follows the subject; the visitor's light comes from where the pointer is, seen from the camera
    const subj = S.i === 2 ? layers.g.position : S.i === 5 ? JV : S.i === 3 ? V(0, 0, 2) : mainSpin.position;
    const span = S.i === 5 ? 4.6 : S.i === 3 ? 6.5 : 2.4;
    key.position.set(subj.x - 3, 9, subj.z + 6); key.target.position.copy(subj);
    Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 30 }); key.shadow.camera.updateProjectionMatrix();
    const right = V(1, 0, 0).applyQuaternion(camera.quaternion), up = V(0, 1, 0).applyQuaternion(camera.quaternion), fwd = V(0, 0, -1).applyQuaternion(camera.quaternion);
    const dist = camera.position.distanceTo(tmpT);
    hand.position.copy(camera.position).addScaledVector(fwd, dist * 0.45).addScaledVector(right, ptr.sx * dist * 0.35).addScaledVector(up, -ptr.sy * dist * 0.25 + dist * 0.12);
    hand.intensity = (S.i === 5 ? 4 : 10) * Math.min(1, dist / 4) * (theme === 'dark' ? 1.3 : 1);
    hand.distance = dist * 2.4;
    // macro: a raking light sweeps across the relief with the scroll; depth of field on
    const pm = local(1);
    const inMacro = S.ia === 1 && S.ib === 1 ? 1 : S.ib === 1 ? S.k : S.ia === 1 ? 1 - S.k : 0;
    rake.intensity = 12 * inMacro;
    rake.position.set(lerp(-1.6, 1.6, pm), 0.95, lerp(0.6, -0.4, pm)); rake.target.position.set(0, 0.6, 0);
    if (S.i === 5) { // the fresh print catches a light running across the sheet
      const g = seg(pj, 0.27, 0.37), on = Math.sin(Math.PI * clamp((pj - 0.26) / 0.12));
      rake.intensity = 9 * Math.max(0, on); rake.distance = 9; rake.angle = 0.3;
      rake.position.set(JX + lerp(-4.2, 4.2, g), 3.4, 1.4); rake.target.position.set(JX + lerp(-2.6, 2.6, g), 1.3, 0);
    } else { rake.distance = 8; rake.angle = 0.5; }
    if (bokeh) {
      const f = inMacro;
      bokeh.enabled = f > 0.02;
      bokeh.uniforms.focus.value = camera.position.distanceTo(V(0.05, 0.62, -0.1));
      bokeh.uniforms.aperture.value = 0.0035 * f; bokeh.uniforms.maxblur.value = 0.008;
    }
    fillL.position.copy(camera.position).add(V(0, 2, 0));
    if (composer) composer.render(); else renderer.render(scene, camera);
  }
  (function loop(now) { frame(now); requestAnimationFrame(loop); })(performance.now());

  return {
    ready: Promise.all(ready),
    set time(v) { T = clamp(v); }, get time() { return T; },
    onChange(f) { listeners.push(f); },
    state,
    ringKeys: RING_KEYS,
    setTitle(lines, lang, mode) { drawType(lines, lang, mode); journey.label(lang); },
    setFinish(name) { lab = name; main.print.forEach((m) => TIN.setFinish(m, name, window.gsap)); },
    setTheme(mode) {
      theme = mode; backdrop(mode);
      floor.material.opacity = mode === 'dark' ? 0.32 : 0.18;
      renderer.toneMappingExposure = mode === 'dark' ? 1.1 : 1.0;
    }
  };
}
