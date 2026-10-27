// The inner pages' 3D: the same studio, lights, tone curve and tins as the home film, sized to a section.
//   createHero(canvas, …)     the page title as a wall in the studio, the page's own tins standing in front of it
//   createLab(canvas, …)      one tin you can turn; the finish or the tin itself can be switched (finish lab, shapes)
//   createJourney(canvas)     from sheet to shelf (journey.js), driven by the scroll of a pinned section
// Each stage renders only while it is on screen.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import * as TIN from './tins.js';
import { makeRoom } from './room.js';
import { makeJourney } from './journey.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const COARSE = matchMedia('(pointer: coarse)').matches || innerWidth < 760;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

// one pointer for every stage on the page (the light follows it)
const ptr = { x: 0.2, y: -0.2, sx: 0.2, sy: -0.2 };
addEventListener('pointermove', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

function base(canvas, { transparent = false, bloom = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: transparent, preserveDrawingBuffer: transparent, powerPreference: 'high-performance' });
  renderer.localClippingEnabled = true;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, COARSE ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.05, 200);
  const room = makeRoom(renderer, scene, { COARSE });
  if (transparent) { scene.background = null; renderer.setClearColor(0x000000, 0); }
  let composer = null, bloomPass = null;
  if (!COARSE && !transparent && bloom) {
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 }));
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.12, 0.4, 0.97); composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }
  const st = { renderer, scene, camera, room, visible: true, theme: 'light', ready: [], drag: 0, dragV: 0 };
  const size = () => {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (composer) { composer.setSize(w, h); bloomPass.resolution.set(w / 2, h / 2); }
  };
  new ResizeObserver(size).observe(canvas); size();
  new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; }, { rootMargin: '200px' }).observe(canvas);
  // drag to turn
  let dragging = false, lastX = 0;
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; });
  addEventListener('pointerup', () => { dragging = false; });
  addEventListener('pointermove', (e) => { if (!dragging) return; st.dragV = (e.clientX - lastX) * 0.006; lastX = e.clientX; st.drag += st.dragV; });
  st.loop = (fn) => {
    const t0 = performance.now();
    (function tick(now) {
      requestAnimationFrame(tick);
      if (!st.visible) return;
      const t = (now - t0) / 1000;
      ptr.sx += (ptr.x - ptr.sx) * 0.07; ptr.sy += (ptr.y - ptr.sy) * 0.07;
      st.dragV *= 0.94; if (!dragging) st.drag += st.dragV;
      fn(t);
      // the visitor's light comes from where the pointer is, seen from the camera; the fill from the camera
      const fwd = V(0, 0, -1).applyQuaternion(camera.quaternion), right = V(1, 0, 0).applyQuaternion(camera.quaternion), up = V(0, 1, 0).applyQuaternion(camera.quaternion);
      const dist = st.dist || 5;
      room.hand.position.copy(camera.position).addScaledVector(fwd, dist * 0.45).addScaledVector(right, ptr.sx * dist * 0.35).addScaledVector(up, -ptr.sy * dist * 0.25 + dist * 0.12);
      room.hand.intensity = (st.handK ?? 10) * Math.min(1, dist / 4) * (st.theme === 'dark' ? 1.3 : 1); room.hand.distance = dist * 2.4;
      room.fillL.position.copy(camera.position).add(V(0, 2, 0));
      if (composer) composer.render(); else renderer.render(scene, camera);
    })(t0);
  };
  st.shadowOn = (subj, span) => {
    const k = room.key; k.position.set(subj.x - 3, 9, subj.z + 6); k.target.position.copy(subj);
    Object.assign(k.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 30 }); k.shadow.camera.updateProjectionMatrix();
  };
  st.setTheme = (mode) => {
    st.theme = mode; if (!transparent) room.backdrop(mode);
    room.floor.material.opacity = mode === 'dark' ? 0.32 : 0.18;
    renderer.toneMappingExposure = mode === 'dark' ? 1.1 : 1.0;
  };
  return st;
}

// a row of tins, brought to a common size (fit inside w x h world units), standing on the floor
function lineup(st, keys, fitW, fitH) {
  const g = new THREE.Group(); st.scene.add(g);
  const ms = keys.map((k) => { const m = TIN.make(k); st.ready.push(m.ready); m.print.forEach((p) => TIN.setFinish(p, 'gloss')); return m; });
  const GAP = 0.3; let x = 0;
  const holders = ms.map((m, i) => {
    const h = new THREE.Group(), spin = new THREE.Group(); spin.add(m.group); h.add(spin);
    h.add(st.room.contact(Math.max(m.size.w, m.size.d)));
    const w = Math.max(m.size.w, m.size.d);
    h.position.x = x + w / 2; x += w + GAP; g.add(h);
    return { m, h, spin, w };
  });
  const total = x - GAP, tall = Math.max(...ms.map((m) => m.size.h));
  holders.forEach((o, i) => { o.h.position.x -= total / 2; if (holders.length === 3 && i === 1) o.h.position.z = 0.35; else if (holders.length > 1) o.h.position.z = -0.15; });
  const s = Math.min(fitW / total, fitH / tall);
  g.scale.setScalar(s);
  return { g, holders, s, size: { w: total * s, h: tall * s } };
}

// ---------------------------------------------------------------- the hero
export function createHero(canvas, { tins = ['qaisi'] } = {}) {
  const st = base(canvas), { scene, camera } = st;
  const row = lineup(st, tins, tins.length > 1 ? 3.6 : 2.6, 0.95);
  // the page title on a wall behind the tins (the page keeps it as real text too)
  const TW = 5.1, TH = TW * 1600 / 4096;
  const tc = document.createElement('canvas'); tc.width = 4096; tc.height = 1600;
  const tt = new THREE.CanvasTexture(tc); tt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 8;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(TW, TH), new THREE.MeshBasicMaterial({ map: tt, transparent: true, depthWrite: false, toneMapped: false }));
  // tall tins: the wall and the camera go up with them, so the title stays readable above the tins
  const lift = Math.max(0, row.size.h - 0.62);
  const POS = V(0, 1.05 + lift * 0.8, 5.4), TGT = V(0, 0.5 + lift * 0.8, 0);
  wall.position.set(0, 1.22 + lift * 0.9, -2.6); wall.lookAt(POS.x, wall.position.y, POS.z); wall.renderOrder = -1; scene.add(wall);
  function title(text, lang, mode) {
    const x = tc.getContext('2d'); x.clearRect(0, 0, 4096, 1600);
    const face = lang === 'ar' ? '700 {s}px "Readex Pro", sans-serif' : '800 {s}px "Bricolage Grotesque", sans-serif';
    x.font = face.replace('{s}', 400);
    if ('letterSpacing' in x) x.letterSpacing = '0px';
    // break the title into 1-3 balanced lines, keeping the largest type that fits the wall
    const words = text.split(/\s+/).filter(Boolean), wd = (a) => x.measureText(a.join(' ')).width;
    let best = null;
    for (let n = 1; n <= Math.min(3, words.length); n++) {
      // balanced split: greedy on the ideal line width
      const ideal = wd(words) / n; const lines = []; let cur = [];
      words.forEach((w) => { if (cur.length && wd([...cur, w]) > ideal * 1.08 && lines.length < n - 1) { lines.push(cur); cur = []; } cur.push(w); });
      lines.push(cur);
      const widest = Math.max(...lines.map(wd)), lh = lang === 'ar' ? 1.12 : 0.95;
      const size = Math.min(400 * 3900 / widest, 1480 / (lines.length * lh));
      if (!best || size > best.size * 1.05) best = { lines: lines.map((l) => l.join(' ')), size, lh };
    }
    const size = Math.floor(Math.min(best.size, lang === 'ar' ? 500 : 680)); x.font = face.replace('{s}', size);
    if ('letterSpacing' in x) x.letterSpacing = lang === 'ar' ? '0px' : Math.round(-size * 0.035) + 'px';
    x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.direction = lang === 'ar' ? 'rtl' : 'ltr';
    const cols = mode === 'dark' ? ['#e9eef6', '#879ebc'] : ['#00132d', '#002F6C'];
    const n = best.lines.length, lh = size * best.lh, y0 = 800 - ((n - 1) * lh) / 2 + size * (lang === 'ar' ? 0.22 : 0.34);
    best.lines.forEach((l, i) => { x.fillStyle = cols[i === n - 1 && n > 1 ? 1 : 0]; x.fillText(l, 2048, y0 + i * lh); });
    tt.needsUpdate = true;
  }
  st.handK = 10;
  st.loop((t) => {
    // step back until the whole row fits the width (phones), never closer than the home shot
    const fitW = 2 * POS.distanceTo(TGT) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
    const back = Math.max(1, 0.95 / camera.aspect, (row.size.w + 0.9) / fitW);
    const p = POS.clone(); p.x += ptr.sx * 0.18; p.y -= ptr.sy * 0.09;
    camera.position.copy(TGT).addScaledVector(p.sub(TGT), back); camera.lookAt(TGT); st.dist = camera.position.distanceTo(TGT);
    { const dW = camera.position.distanceTo(wall.position), vis = 2 * dW * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect; wall.scale.setScalar(Math.min(1, (vis * 0.94) / TW)); }
    row.holders.forEach((o, i) => { o.spin.rotation.y = -0.55 + (REDUCED ? 0 : t * 0.16) + st.drag + i * 0.9; });
    st.shadowOn(V(0, 0, 0), 2.8);
  });
  return { ready: Promise.all(st.ready), title, setTheme: st.setTheme };
}

// ---------------------------------------------------------------- one tin to turn: the finish lab and the shapes
export function createLab(canvas, { tin = 'qaisi', finish = 'gloss', transparent = false, still = false } = {}) {
  const st = base(canvas, { transparent }), { scene, camera } = st;
  const cache = {};
  const get = (k) => cache[k] || (cache[k] = (() => { const r = lineup(st, [k], 2.3, 1.25); r.g.visible = false; return r; })());
  let cur = get(tin), prev = null, swap = 1, fin = finish;
  cur.g.visible = true;
  const apply = (r, name, g) => r.holders.forEach((o) => o.m.print.forEach((m) => TIN.setFinish(m, name, g)));
  apply(cur, fin);
  const POS = V(0, 1.75, 5.3), TGT = V(0, 0.45, 0);
  st.handK = transparent ? 6 : 10;
  if (transparent) Object.assign(ptr, { x: 0.25, y: -0.3, sx: 0.25, sy: -0.3 });
  st.loop((t) => {
    const back = Math.max(1, 1.05 / camera.aspect) * (transparent ? 0.92 : 1);
    const p = POS.clone(); if (!transparent) { p.x += ptr.sx * 0.15; p.y -= ptr.sy * 0.08; }
    camera.position.copy(TGT).addScaledVector(p.sub(TGT), back); camera.lookAt(TGT); st.dist = camera.position.distanceTo(TGT);
    swap = Math.min(1, swap + 0.045);
    const e = 1 - Math.pow(1 - swap, 3);
    if (prev) { prev.g.scale.setScalar(prev.s * Math.max(0.001, 1 - e)); if (swap >= 1) { prev.g.visible = false; prev.g.scale.setScalar(prev.s); prev = null; } }
    cur.g.scale.setScalar(cur.s * Math.max(0.001, prev ? e : 1));
    const yaw = still ? -0.55 : -0.55 + (REDUCED ? 0 : t * 0.2) + st.drag;
    cur.holders.forEach((o) => { o.spin.rotation.y = yaw; });
    if (prev) prev.holders.forEach((o) => { o.spin.rotation.y = yaw; });
    st.shadowOn(V(0, 0, 0), 2.2);
  });
  return {
    ready: Promise.all(st.ready),
    setTin(k) { const n = get(k); if (n === cur) return; if (prev) { prev.g.visible = false; prev.g.scale.setScalar(prev.s); } prev = cur; cur = n; cur.g.visible = true; apply(cur, fin); swap = 0; },
    setFinish(name) { fin = name; apply(cur, name, window.gsap); },
    setTheme: st.setTheme
  };
}

// ---------------------------------------------------------------- from sheet to shelf, scrubbed by the page
export function createJourney(canvas) {
  const st = base(canvas), { scene, camera } = st;
  let P = 0;
  const j = makeJourney({ scene, ready: st.ready, contact: st.room.contact, ptr, COARSE, REDUCED, JX: 0, active: () => true });
  const listeners = [], state = { step: 0 };
  const rake = st.room.rake;
  st.handK = 4;
  st.loop((t) => {
    const step = j.pose(P, t);
    if (step !== state.step) { state.step = step; listeners.forEach((f) => f(state)); }
    const S = j.shotAt(P, document.documentElement.dir === 'rtl', camera.aspect < 0.9);
    const back = Math.max(1, 1.0 / camera.aspect);
    const pos = S.pos.clone(); pos.x += ptr.sx * 0.1; pos.y -= ptr.sy * 0.05;
    camera.position.copy(S.tgt).addScaledVector(pos.sub(S.tgt), back); camera.lookAt(S.tgt); st.dist = camera.position.distanceTo(S.tgt);
    const g = clamp((P - 0.27) / 0.1), on = Math.sin(Math.PI * clamp((P - 0.26) / 0.12));
    rake.intensity = 9 * Math.max(0, on); rake.distance = 9; rake.angle = 0.3;
    rake.position.set(lerp(-4.2, 4.2, g), 3.4, 1.4); rake.target.position.set(lerp(-2.6, 2.6, g), 1.3, 0);
    st.shadowOn(j.JV, 4.6);
  });
  return {
    ready: Promise.all(st.ready), state,
    set progress(v) { P = clamp(v); }, get progress() { return P; },
    onChange(f) { listeners.push(f); },
    label: j.label, setTheme: st.setTheme
  };
}
