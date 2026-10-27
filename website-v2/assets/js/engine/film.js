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
import { makeRoom } from './room.js';
import { makeJourney } from './journey.js';
import { arabicBlock } from './type.js';

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

  const { backdrop, key, rim, fillL, hand, rake, floor, contact } = makeRoom(renderer, scene, { COARSE });

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
    if (lang === 'ar') { arabicBlock(x, lines, mode === 'dark' ? ['#e9eef6', '#879ebc'] : ['#00132d', '#002F6C'], { maxH: 1180, maxSize: 600 }); typeTex.needsUpdate = true; return; }
    const face = lang === 'ar' ? '700 {s}px "Readex Pro", sans-serif' : '800 {s}px "Bricolage Grotesque", sans-serif';
    let size = 760; x.font = face.replace('{s}', size);
    const widest = Math.max(...lines.map((l) => x.measureText(l).width));
    size = Math.floor(size * Math.min(1, 3980 / widest)); x.font = face.replace('{s}', size);
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.direction = lang === 'ar' ? 'rtl' : 'ltr';
    if ('letterSpacing' in x) x.letterSpacing = lang === 'ar' ? '0px' : Math.round(-size * 0.035) + 'px';
    const cols = mode === 'dark' ? ['#e9eef6', '#879ebc'] : ['#00132d', '#002F6C'];
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
  // ---------------------------------------------------------------- from sheet to shelf (journey.js)
  const ptr = { x: 0.2, y: -0.2, sx: 0.2, sy: -0.2 };
  const journey = makeJourney({ scene, ready, contact, ptr, COARSE, REDUCED, JX: -13, active: () => T > CHAPTERS[4][1] });
  const JX = journey.JX, JV = journey.JV;

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
