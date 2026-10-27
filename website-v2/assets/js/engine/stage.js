// One fixed WebGL canvas behind the page. Each 3D "act" follows a slot element in the layout (.slot[data-act]): the slot's
// box on screen says where the act stands and how big it is, so the tins scroll with the page and sit exactly where the
// design puts them, at any screen size, in both reading directions.
//   hero    the main tin (Al Qaisi) under a light the visitor moves with the pointer
//   anatomy a printed lid built up layer by layer (tinplate, base coat, the four colour plates, varnish, relief), scrubbed by scroll
//   lab     the main tin again, for the finishes; drag to move the light
//   shelf   the factory's real tins on one long shelf, panned by scroll
import * as THREE from 'three';
import * as TIN from './tins.js';
import * as HAL from './halawah.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t) => t * t * (3 - 2 * t);
const seg = (p, a, b) => ease(clamp((p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;

export function createStage(canvas) {
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, COARSE ? 1.6 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100); camera.position.set(0, 0, 12);
  const HALF = 12 * Math.tan(THREE.MathUtils.degToRad(14));

  // ---------------------------------------------------------------- the studio: what the metal reflects
  // A photographer's white cyclorama with big soft-boxes: the long highlights on the cylinders, the bright sky on the lids,
  // a warm bounce from below. Built once into an environment map.
  {
    const st = new THREE.Scene();
    st.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 p; void main(){ p = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'varying vec3 p; void main(){ float y = normalize(p).y; vec3 c = y > 0.0 ? mix(vec3(0.42,0.45,0.52), vec3(1.0,0.98,0.95), pow(y, 0.6)) : mix(vec3(0.42,0.45,0.52), vec3(0.62,0.5,0.38), pow(-y, 0.7)); gl_FragColor = vec4(c, 1.0); }'
    })));
    const box = (w, h, x, y, z, k, tint = [1, 1, 1]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * k, tint[1] * k, tint[2] * k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); st.add(m);
    };
    box(30, 16, 0, 24, 4, 2.2, [1, 0.98, 0.94]);   // overhead
    box(12, 22, -16, 5, 14, 7, [1, 0.97, 0.92]);   // key, front left
    box(4, 26, 17, 3, 11, 9, [0.95, 0.97, 1]);     // strip, front right: the long line on a cylinder
    box(3, 24, -4, 2, 20, 4);                       // thin strip near the camera
    box(5, 26, -21, 4, -9, 6, [1, 0.82, 0.55]);    // warm rim, back left
    box(5, 26, 21, 4, -11, 5, [0.7, 0.84, 1]);     // cool rim, back right
    box(34, 12, 0, -16, 6, 1.0, [1, 0.88, 0.7]);   // warm floor bounce
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(st, 0.02).texture;
  }
  const key = new THREE.DirectionalLight(0xfff6ea, 1.6); key.position.set(-3, 9, 6); key.castShadow = true;
  key.shadow.mapSize.set(COARSE ? 1024 : 2048, COARSE ? 1024 : 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 30 });
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xf0dcc0, 0.35));
  // the visitor's light: a small hard source the pointer moves; on gold and on the relief it makes the glint
  const hand = new THREE.PointLight(0xfff1d6, 0, 30, 1.6); scene.add(hand);

  const soft = (() => { // contact shadow texture
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, 'rgba(0,10,30,.5)'); g.addColorStop(0.5, 'rgba(0,10,30,.18)'); g.addColorStop(1, 'rgba(0,10,30,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  function floorFor(w, d) {
    const g = new THREE.Group();
    const fs = Math.max(w, d) * 3.2, f = new THREE.Mesh(new THREE.PlaneGeometry(fs, fs), new THREE.ShadowMaterial({ opacity: 0.2, transparent: true, depthWrite: false }));
    f.rotation.x = -Math.PI / 2; f.receiveShadow = true;
    const c = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.5, d * 1.5), new THREE.MeshBasicMaterial({ map: soft, transparent: true, depthWrite: false }));
    c.rotation.x = -Math.PI / 2; c.position.y = 0.002;
    g.add(f, c); g.userData.floor = f.material; g.userData.contact = c.material;
    return g;
  }

  // ---------------------------------------------------------------- acts
  const acts = {};
  const ready = [];
  // a tin on a turntable: root (placed by its slot) > tilt > spin > the tin, standing on its floor
  function tinAct(name, key, finish = 'gloss') {
    const m = TIN.make(key); ready.push(m.ready);
    m.print.forEach((p) => TIN.setFinish(p, finish));
    const root = new THREE.Group(), tilt = new THREE.Group(), spin = new THREE.Group();
    root.add(tilt); tilt.add(spin);
    const s = m.size, H = s.h, F = floorFor(s.w, s.d);
    m.group.position.y = -H / 2; F.position.y = -H / 2;
    spin.add(m.group); tilt.add(F);
    root.visible = false; scene.add(root);
    const a = { name, m, root, tilt, spin, floor: F, size: s, fitW: 1.08 * Math.max(s.w, s.d), fitH: 1.3 * (H * 0.9 + s.d * 0.45), yaw: -0.5, finish };
    acts[name] = a; return a;
  }
  tinAct('hero', 'qaisi');
  tinAct('lab', 'qaisi');

  // the printed lid, built up in layers (Halawah: a full-colour print, so the four plates show)
  {
    const root = new THREE.Group(), tilt = new THREE.Group(), spin = new THREE.Group(); root.add(tilt); tilt.add(spin);
    const R = 1, disc = new THREE.CircleGeometry(R, 128); disc.rotateX(-Math.PI / 2);
    const L = HAL.surface('lid', 1, 1, 'halawah'); ready.push(L.ready);
    const N = 512, inks = [['c', '#00a3e0'], ['m', '#e6007e'], ['y', '#ffe600'], ['k', '#1a1a1a']];
    const plates = inks.map(([k, hex]) => {
      const c = document.createElement('canvas'); c.width = c.height = N;
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      return { k, hex, c, t };
    });
    const separate = () => { // RGB -> CMYK, one canvas per ink: the ink's colour, its coverage as alpha
      const src = document.createElement('canvas'); src.width = src.height = N;
      const sx = src.getContext('2d'); sx.drawImage(L.canvas, 0, 0, N, N);
      const px = sx.getImageData(0, 0, N, N).data;
      plates.forEach((p, i) => {
        const x = p.c.getContext('2d'), o = x.createImageData(N, N), d = o.data, col = new THREE.Color(p.hex);
        const rr = Math.round(col.r * 255), gg = Math.round(col.g * 255), bb = Math.round(col.b * 255);
        for (let j = 0; j < px.length; j += 4) {
          const r = px[j] / 255, g = px[j + 1] / 255, b = px[j + 2] / 255, K = 1 - Math.max(r, g, b);
          const v = i === 3 ? K : K >= 0.999 ? 0 : (1 - [r, g, b][i] - K) / (1 - K);
          const xx = (j / 4) % N - N / 2, yy = Math.floor(j / 4 / N) - N / 2, inside = Math.hypot(xx, yy) < N / 2 - 1;
          d[j] = rr; d[j + 1] = gg; d[j + 2] = bb; d[j + 3] = inside ? Math.round(clamp(v) * 235) : 0;
        }
        x.putImageData(o, 0, 0); p.t.needsUpdate = true;
      });
    };
    L.ready.then(separate);
    const layer = (mat, y = 0) => { const m = new THREE.Mesh(disc, mat); m.position.y = y; m.castShadow = true; return m; };
    const steel = layer(new THREE.MeshPhysicalMaterial({ color: '#e9edf2', metalness: 1, roughness: 0.18, transparent: true }));
    const coat = layer(new THREE.MeshPhysicalMaterial({ color: '#f7f6f2', metalness: 0, roughness: 0.4, clearcoat: 0.5, transparent: true }));
    // each plate prints its ink: on the light page the plates multiply like real ink (they mix to the full colour picture);
    // on the dark page they are drawn as coloured film
    const inkMat = (t) => new THREE.ShaderMaterial({
      uniforms: { map: { value: t }, opacity: { value: 1 }, mult: { value: 1 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false,
      blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.ZeroFactor,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform sampler2D map; uniform float opacity; uniform float mult; varying vec2 vUv; void main(){ vec4 t = texture2D(map, vUv); float a = t.a * opacity; gl_FragColor = mult > 0.5 ? vec4(mix(vec3(1.0), t.rgb, a), 1.0) : vec4(t.rgb, a); }'
    });
    const ink = plates.map((p) => layer(inkMat(p.t)));
    // draw order: the metal and the coat first, then each plate multiplies onto what is already printed
    ink.forEach((m, i) => { m.renderOrder = 2 + i; });
    coat.renderOrder = 1;
    const finalM = TIN.printMat(L, 1); TIN.setFinish(finalM, 'emboss');
    finalM.transparent = true; finalM.envMapIntensity = 0.45; finalM.userData.keepCoat = true;
    const final = layer(finalM);
    const varnish = layer(new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 0, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.18, depthWrite: false }));
    varnish.renderOrder = 8; final.renderOrder = 7;
    // edges: each layer reads as a sheet with a thickness
    const edge = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.03, 128, 1, true), new THREE.MeshPhysicalMaterial({ color: '#c9ced6', metalness: 1, roughness: 0.25 }));
    edge.position.y = -0.015;
    spin.add(steel, edge, coat, ...ink, final, varnish);
    const F = floorFor(2, 2); tilt.add(F); F.position.y = -0.04; F.children[1].visible = false;
    root.visible = false; scene.add(root);
    acts.anatomy = { name: 'anatomy', root, tilt, spin, floor: F, size: { h: 1.1, w: 2, d: 2 }, fitW: 2.5, fitH: 2.6, steel, edge, coat, ink, final, finalM, varnish, plates };
  }

  // the shelf: every tin we rebuilt, at true relative size, in a row
  {
    const root = new THREE.Group(); root.visible = false; scene.add(root);
    const row = new THREE.Group(); root.add(row);
    const keys = ['qaisi', 'bab', 'najmah', 'frieds', 'jgz', 'laqmi', 'sufyan', 'suliman', 'abed', 'levelmax', 'maeen', 'halawah'];
    let x = 0; const items = [];
    keys.forEach((k, i) => {
      const m = TIN.make(k); ready.push(m.ready); m.print.forEach((p) => TIN.setFinish(p, 'gloss'));
      const holder = new THREE.Group(); holder.add(m.group);
      const w = Math.max(m.size.w, m.size.d);
      if (i) x += w / 2 + 0.55;
      holder.position.x = x; x += w / 2;
      row.add(holder); items.push({ key: k, holder, x: holder.position.x, m });
    });
    const F = floorFor(x + 4, 3); F.position.x = x / 2; F.children[1].visible = false; row.add(F);
    F.children[0].geometry = new THREE.PlaneGeometry(x + 20, 10);
    acts.shelf = { name: 'shelf', root, row, items, length: x, fitW: 0, fitH: 2.3, floor: F };
  }

  // ---------------------------------------------------------------- layout: slots on the page -> world
  const slots = () => [...document.querySelectorAll('.slot[data-act]')];
  const ptr = { x: 0, y: 0, sx: 0, sy: 0, inside: false };
  addEventListener('pointermove', (e) => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  const drag = { act: null, x: 0, y: 0, lx: -0.4, ly: -0.5 };
  document.addEventListener('pointerdown', (e) => { const s = e.target.closest('.slot[data-act="lab"]'); if (s) { drag.act = 'lab'; s.setPointerCapture?.(e.pointerId); } });
  addEventListener('pointerup', () => { drag.act = null; });
  addEventListener('pointermove', (e) => {
    if (drag.act !== 'lab') return;
    const r = document.querySelector('.slot[data-act="lab"]').getBoundingClientRect();
    drag.lx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1.2, 1.2); drag.ly = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1.2, 1.2);
  });

  let W = 1, Hh = 1;
  function resize() { W = innerWidth; Hh = innerHeight; renderer.setSize(W, Hh, false); camera.aspect = W / Hh; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();
  const toWorld = (px, py) => { const k = (2 * HALF) / Hh; return [(px - W / 2) * k, -(py - Hh / 2) * k, k]; };
  const rtl = () => document.documentElement.dir === 'rtl';

  let theme = 'light', progress = {}, onShelf = null;
  const t0 = performance.now();
  function frame(now) {
    const t = (now - t0) / 1000;
    ptr.sx += (ptr.x - ptr.sx) * 0.08; ptr.sy += (ptr.y - ptr.sy) * 0.08;
    Object.values(acts).forEach((a) => { a.root.visible = false; });
    let best = null, bestA = 0;
    slots().forEach((el) => {
      const a = acts[el.dataset.act]; if (!a) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > Hh + 80 || r.width < 2) return;
      const [x, y, k] = toWorld(r.left + r.width / 2, r.top + r.height / 2);
      const sc = a.fitW ? Math.min((r.width * k) / a.fitW, (r.height * k) / a.fitH) : Math.min((r.height * k) / a.fitH, (r.width * k) / 2.8);
      a.root.visible = true; a.root.position.set(x, y, 0); a.root.scale.setScalar(sc);
      const area = Math.max(0, Math.min(r.bottom, Hh) - Math.max(r.top, 0)) * r.width;
      if (area > bestA) { bestA = area; best = a; }
      const host = el.closest('[data-scrub]');
      let p = 0;
      if (host) { const hr = host.getBoundingClientRect(); p = clamp(-hr.top / Math.max(1, hr.height - Hh)); }
      else p = clamp(1 - (r.top + r.height) / (Hh + r.height)); // 0 entering at the bottom … 1 leaving at the top
      progress[a.name] = p;
      pose(a, t, p);
    });
    // the light that casts the shadow follows the act that fills most of the screen
    if (best) {
      const c = best.root.position, s = best.root.scale.x;
      key.target.position.copy(c); key.position.set(c.x - 3 * s, c.y + 9 * s, c.z + 6 * s);
      const span = (best.name === 'shelf' ? 3.2 : 1.6) * s;
      Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 0.5, far: 30 * s }); key.shadow.camera.updateProjectionMatrix();
      // the hand light: in front of the tin, where the pointer is (or where the visitor dragged it in the lab)
      const lx = best.name === 'lab' ? drag.lx : ptr.sx, ly = best.name === 'lab' ? drag.ly : ptr.sy;
      hand.position.set(c.x + lx * 2.6 * s, c.y - ly * 2 * s + 0.9 * s, c.z + 2.8 * s);
      hand.intensity = (best.name === 'hero' || best.name === 'lab' ? 9 : 4) * s * s * (theme === 'dark' ? 1.2 : 1);
    }
    renderer.render(scene, camera);
  }
  function pose(a, t, p) {
    const dir = rtl() ? -1 : 1;
    if (a.name === 'hero' || a.name === 'lab') {
      const lean = a.name === 'hero' ? 0.42 + p * 0.5 : 0.36;
      a.tilt.rotation.x = lean + ptr.sy * 0.08;
      a.tilt.rotation.z = -ptr.sx * 0.05;
      a.spin.rotation.y = (REDUCED ? 0 : t * 0.22) + a.yaw * dir + ptr.sx * 0.35 + (a.name === 'hero' ? p * 1.6 : 0);
      a.root.position.y += Math.sin(t * 0.8) * 0.03 * a.root.scale.x;
    } else if (a.name === 'anatomy') anatomy(a, t, p);
    else if (a.name === 'shelf') shelf(a, t, p);
  }
  // the lid, built up: tinplate, base coat, cyan, magenta, yellow, black, varnish, relief
  const STAGES = 8;
  // Each layer comes down and lands on the stack, so the picture builds up the way the press builds it: cyan alone, then cyan and
  // magenta, then yellow, then black, and the full colour picture is there. Then the varnish, then the relief.
  const LAND = (i) => [0.04 + i * 0.105, 0.12 + i * 0.105];
  function anatomy(a, t, p) {
    const TH = 0.035;                                  // thickness of a landed layer (exaggerated so the stack reads)
    a.tilt.rotation.x = lerp(0.78, 1.0, seg(p, 0, 0.5)) - seg(p, 0.86, 1) * 0.2;
    a.spin.rotation.y = (REDUCED ? 0 : t * 0.1) - 0.35 + p * 0.6;
    const step = (i) => seg(p, ...LAND(i));
    const land = (m, i, y) => { const s = step(i); m.visible = s > 0.001; m.position.y = y + (1 - s) * 1.9; m.material.opacity = Math.min(1, s * 3); return s; };
    land(a.steel, 0, 0); a.edge.visible = a.steel.visible; a.edge.position.y = a.steel.position.y - 0.015;
    land(a.coat, 1, TH);
    let stage = -1;
    for (let i = 0; i < 7; i++) if (p > LAND(i)[0] + 0.01) stage = i;
    a.ink.forEach((m, i) => {
      land(m, 2 + i, TH * (2 + i));
      // a plate comes down slightly out of register and snaps into place as it lands
      const [s0, s1] = LAND(2 + i), off = (1 - seg(p, s0 + (s1 - s0) * 0.5, s1)) * 0.14;
      m.position.x = Math.cos(i * 1.7) * off; m.position.z = Math.sin(i * 1.7) * off;
      const u = m.material.uniforms; u.opacity.value = m.material.opacity; u.mult.value = theme === 'dark' ? 0 : 1;
      m.material.blending = theme === 'dark' ? THREE.NormalBlending : THREE.CustomBlending;
    });
    land(a.varnish, 6, TH * 6 + 0.002); a.varnish.material.opacity = 0.22 * step(6);
    // the finished, printed lid replaces the separations; its relief rises with it
    const fin = seg(p, 0.8, 0.9);
    a.final.visible = fin > 0.001; a.final.position.y = TH * 7 + 0.004; a.finalM.opacity = fin; a.finalM.bumpScale = 4.5 * seg(p, 0.86, 0.97);
    a.finalM.transparent = fin < 0.999;
    a.ink.forEach((m) => { m.material.uniforms.opacity.value *= 1 - fin; m.visible = m.visible && fin < 0.999; });
    progress.anatomyStage = p > 0.86 ? 7 : Math.max(0, stage);
  }
  function shelf(a, t, p) {
    const dir = rtl() ? -1 : 1;
    const span = a.length;
    // the row slides past the centre of the slot; RTL reads from the right
    const x = lerp(0, span, p);
    a.row.position.x = dir === 1 ? -x : x - span;
    a.row.position.y = -0.8;
    a.root.rotation.x = 0.3;
    let nearest = 0, nd = 1e9;
    a.items.forEach((it, i) => {
      it.holder.rotation.y = (REDUCED ? 0 : t * 0.25) + i * 0.7;
      const d = Math.abs(it.x + a.row.position.x); if (d < nd) { nd = d; nearest = i; }
    });
    if (onShelf) onShelf(nearest);
  }

  function loop(now) { frame(now); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);

  return {
    ready: Promise.all(ready),
    setFinish(name) { acts.lab.m.print.forEach((m) => TIN.setFinish(m, name, window.gsap)); acts.lab.finish = name; },
    setTheme(mode) {
      theme = mode;
      Object.values(acts).forEach((a) => { if (a.floor) { a.floor.userData.floor.opacity = (mode === 'dark' ? 0.32 : 0.2) * (a.name === 'anatomy' ? 0.45 : 1); } });
      renderer.toneMappingExposure = mode === 'dark' ? 1.12 : 1.05;
    },
    progress: () => progress,
    onShelf(fn) { onShelf = fn; },
    shelfKeys: () => acts.shelf.items.map((i) => i.key)
  };
}
