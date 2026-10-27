// The site as one continuous 3D film. A full-screen canvas inside a tall sticky stage; the scroll position is the film's
// time (0 … 1). The camera travels a fixed path of shots, and every object poses itself from the same time value:
//   0  hero      the main tin (Al Qaisi), large, under a light the visitor moves with the pointer
//   1  macro     the camera drops onto the stamped gold lid; depth of field; a raking light runs across the relief
//   2  layers    a printed lid builds up layer by layer: tinplate, base coat, the four separations (drawn in brand navy), varnish
//   3  ring      the factory's other tins rise around the main tin; scrolling turns the ring
//   4  lab       back on the main tin: finishes, drag to turn it
//   5  sheet     the camera rises to a top view: every tin, lids up, laid out like a printed sheet
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
export const CHAPTERS = [[0, 0.1], [0.17, 0.26], [0.33, 0.5], [0.56, 0.72], [0.78, 0.86], [0.93, 1]];
const AX = 9; // where the layer rig stands (to the side of the main tin)
const SHOTS = [
  { pos: V(0, 1.6, 4.7), tgt: V(0, -0.14, 0), fov: 30 },          // hero
  { pos: V(0.42, 1.12, 1.18), tgt: V(0.08, 0.6, -0.08), fov: 30 }, // macro on the lid
  { pos: V(AX - 1.15, 3.3, 5.0), tgt: V(AX - 1.0, 0.25, 0), fov: 30 }, // layers: the rig to the right of the text
  { pos: V(0, 3.4, 10.6), tgt: V(0, 1.4, 2.2), fov: 30 },          // ring
  { pos: V(-2.7, 1.5, 4.2), tgt: V(0, 0.28, 0), fov: 30 },         // lab
  { pos: V(0, 19, 2.2), tgt: V(0, 0, 1.1), fov: 32 }               // top view (the sheet sits above the step bar)
];
const RING_KEYS = ['bab', 'najmah', 'frieds', 'jgz', 'laqmi', 'sufyan', 'suliman', 'abed', 'levelmax', 'maeen', 'halawah'];

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
  // ---------------------------------------------------------------- the main tin
  const main = TIN.make('qaisi'); ready.push(main.ready);
  main.print.forEach((m) => TIN.setFinish(m, 'gloss'));
  const mainSpin = new THREE.Group(); mainSpin.add(main.group); scene.add(mainSpin);
  scene.add(contact(main.size.w));

  // ---------------------------------------------------------------- the layer rig (a full-colour lid, so the separations show)
  const LR = 1.15;
  const layers = (() => {
    const g = new THREE.Group(); g.position.set(AX, 0, 0); scene.add(g);
    const disc = new THREE.CircleGeometry(LR, 160); disc.rotateX(-Math.PI / 2);
    const L = HAL.surface('lid', 1, 1, 'halawah'); ready.push(L.ready);
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

  // ---------------------------------------------------------------- the other tins: a ring round the main tin, then a sheet seen from above
  const RING_R = 4.8;
  const ring = RING_KEYS.map((k, i) => {
    const m = TIN.make(k); ready.push(m.ready); m.print.forEach((p) => TIN.setFinish(p, 'gloss'));
    const holder = new THREE.Group(); holder.add(m.group); holder.add(contact(Math.max(m.size.w, m.size.d))); holder.scale.setScalar(0.001); scene.add(holder);
    return { key: k, m, holder, i };
  });
  // the top view: 3 rows of 4, the main tin among them
  const GRID = (() => {
    const all = ['qaisi', ...RING_KEYS], cols = 4, gx = 3.0, gz = 2.7;
    return Object.fromEntries(all.map((k, n) => [k, V((n % cols - (cols - 1) / 2) * gx, 0, (Math.floor(n / cols) - 1) * gz)]));
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
  const state = { chapter: 0, layer: 0, ring: 0 };
  const shotAt = (t) => { // the camera between shots: hold inside a chapter, travel between chapters
    let i = 0; while (i < CHAPTERS.length - 1 && t > CHAPTERS[i][1]) i++;
    const [a] = CHAPTERS[i];
    if (i === 0 || t >= a) return { i, k: 0, A: SHOTS[i], B: SHOTS[i] };
    const pe = CHAPTERS[i - 1][1], k = sm(clamp((t - pe) / (a - pe)));
    return { i: k < 0.5 ? i - 1 : i, k, A: SHOTS[i - 1], B: SHOTS[i] };
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
    const drift = S.i === 1 ? 0.04 : 0.18;
    tmpP.x += ptr.sx * drift; tmpP.y -= ptr.sy * drift * 0.5;
    // tall screens: step back so the subject keeps its width
    const back = Math.max(1, 0.95 / camera.aspect);
    camera.position.copy(tmpT).addScaledVector(tmpP.clone().sub(tmpT), back);
    camera.lookAt(tmpT);
    if (state.chapter !== S.i) { state.chapter = S.i; listeners.forEach((f) => f(state)); }

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
      let L = 0; for (let i = 0; i < 7; i++) if (pl > 0.02 + i * 0.12 + 0.01) L = i;
      L = pl > 0.86 ? 7 : L; if (L !== state.layer) { state.layer = L; listeners.forEach((f) => f(state)); }
    }
    // the ring and the sheet
    const rise = seg(T, CHAPTERS[2][1] + 0.01, CHAPTERS[3][0]);          // the tins come up out of the floor
    const toGrid = seg(T, CHAPTERS[4][1] + 0.01, CHAPTERS[5][0]);        // and lay themselves out for the top view
    const hideForLab = seg(T, CHAPTERS[3][1], CHAPTERS[3][1] + 0.03) * (1 - seg(T, CHAPTERS[4][1], CHAPTERS[4][1] + 0.03));
    const pr = local(3), turn = pr * (RING_KEYS.length - 1);
    const front = Math.round(turn);
    if (front !== state.ring) { state.ring = front; listeners.forEach((f) => f(state)); }
    ring.forEach((r, i) => {
      const a = ((i - turn) / RING_KEYS.length) * Math.PI * 2;
      const ringPos = V(Math.sin(a) * RING_R, 0, Math.cos(a) * RING_R);
      r.holder.position.lerpVectors(ringPos, GRID[r.key], toGrid);
      const s = Math.max(0.001, sm(clamp(rise * 1.6 - i * 0.05)) * (1 - hideForLab * 0.999));
      r.holder.scale.setScalar(s);
      r.m.group.rotation.y = lerp(a + (REDUCED ? 0 : t * 0.2) - 0.4, 0, toGrid);
    });
    mainSpin.position.lerpVectors(V(0, 0, 0), GRID.qaisi, toGrid);
    if (toGrid > 0) mainSpin.rotation.y = lerp(mainSpin.rotation.y, 0, toGrid);

    // lights: the shadow follows the subject; the visitor's light comes from where the pointer is, seen from the camera
    const subj = S.i === 2 ? layers.g.position : S.i === 5 ? V(0, 0, 0) : S.i === 3 ? V(0, 0, 2) : mainSpin.position;
    const span = S.i === 5 ? 7.5 : S.i === 3 ? 6.5 : 2.4;
    key.position.set(subj.x - 3, 9, subj.z + 6); key.target.position.copy(subj);
    Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 30 }); key.shadow.camera.updateProjectionMatrix();
    const right = V(1, 0, 0).applyQuaternion(camera.quaternion), up = V(0, 1, 0).applyQuaternion(camera.quaternion), fwd = V(0, 0, -1).applyQuaternion(camera.quaternion);
    const dist = camera.position.distanceTo(tmpT);
    hand.position.copy(camera.position).addScaledVector(fwd, dist * 0.45).addScaledVector(right, ptr.sx * dist * 0.35).addScaledVector(up, -ptr.sy * dist * 0.25 + dist * 0.12);
    hand.intensity = (S.i === 5 ? 4 : 10) * Math.min(1, dist / 4) * (theme === 'dark' ? 1.3 : 1);
    hand.distance = dist * 2.4;
    // macro: a raking light sweeps across the relief with the scroll; depth of field on
    const pm = local(1);
    rake.intensity = 12 * (S.A === SHOTS[1] && S.B === SHOTS[1] ? 1 : S.B === SHOTS[1] ? S.k : S.A === SHOTS[1] ? 1 - S.k : 0);
    rake.position.set(lerp(-1.6, 1.6, pm), 0.95, lerp(0.6, -0.4, pm)); rake.target.position.set(0, 0.6, 0);
    if (bokeh) {
      const f = S.A === SHOTS[1] && S.B === SHOTS[1] ? 1 : S.B === SHOTS[1] ? S.k : S.A === SHOTS[1] ? 1 - S.k : 0;
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
    setFinish(name) { lab = name; main.print.forEach((m) => TIN.setFinish(m, name, window.gsap)); },
    setTheme(mode) {
      theme = mode; backdrop(mode);
      floor.material.opacity = mode === 'dark' ? 0.32 : 0.18;
      renderer.toneMappingExposure = mode === 'dark' ? 1.1 : 1.0;
    }
  };
}
