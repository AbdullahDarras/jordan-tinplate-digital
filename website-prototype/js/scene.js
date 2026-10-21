// One persistent WebGL canvas. A single "product" tin follows the .stage elements in the layout,
// morphs between shapes / artwork / finishes, and a separate "journey" rig is scrubbed by scroll.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as ART from './art.js';

const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

const FIN = {
  gloss: { metalness: 0.55, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0, bumpScale: 0, bump: null },
  matte: { metalness: 0.3, roughness: 0.62, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0, bumpScale: 0, bump: null },
  soft: { metalness: 0.02, roughness: 0.96, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 1, bumpScale: 0, bump: null },
  rough: { metalness: 0.25, roughness: 0.8, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0, bumpScale: 1.3, bump: 'rough' },
  emboss: { metalness: 0.6, roughness: 0.24, clearcoat: 0.7, clearcoatRoughness: 0.1, sheen: 0, bumpScale: 1.6, bump: 'emboss' }
};
const ACCENT = { brand: ['#f2a93b', '#ffe0a8', '#f6d27a', '#002F6C'], olive: '#d9a93c', eid: '#e9bd5a', cheese: '#2a6fb8' };

export function createScene(canvas) {
  const gsap = window.gsap;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  // Phones and tablets: cap the pixel ratio at 1.5 (each stage is re-rendered and copied to a 2D canvas every frame) and run the
  // product tins at 30 fps. The scroll-scrubbed journey keeps full rate.
  const COARSE = window.matchMedia('(pointer: coarse)').matches;
  const maxDpr = () => (COARSE || window.innerWidth < 860 ? 1.5 : 2);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr()));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const DIST = 12, HALF_H = DIST * Math.tan(THREE.MathUtils.degToRad(15));

  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 5, 6); scene.add(key);
  const rimL = new THREE.PointLight(0x5b7cff, 0, 40); rimL.position.set(-6, 2, 3); scene.add(rimL);
  const rimR = new THREE.PointLight(0xffa24a, 0, 40); rimR.position.set(6, -1, 3); scene.add(rimR);

  const envMats = new Set();
  const env = { i: 1.0 };
  const syncEnv = () => envMats.forEach((m) => { m.envMapIntensity = env.i * (m.userData.envBase || 1); });

  /* ------------------------------------------------------------ materials */
  function metalMat(color = '#d5dbe6', rough = 0.22) {
    const m = new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: rough });
    m.userData.envBase = 1; envMats.add(m); return m;
  }
  function printMat(map, side = THREE.FrontSide) {
    const m = new THREE.MeshPhysicalMaterial({ map, metalness: 0.55, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08, side });
    m.userData.envBase = 1.1; envMats.add(m); return m;
  }
  function applyFinish(m, name, instant) {
    const f = FIN[name] || FIN.gloss;
    m.sheenColor = new THREE.Color('#ffffff'); m.sheenRoughness = 0.35;
    const had = !!m.bumpMap;
    m.bumpMap = f.bump ? ART.bumpTexture(f.bump) : null;
    if (had !== !!m.bumpMap) m.needsUpdate = true;
    const to = { metalness: f.metalness, roughness: f.roughness, clearcoat: f.clearcoat, clearcoatRoughness: f.clearcoatRoughness, sheen: f.sheen, bumpScale: f.bumpScale };
    if (instant) Object.assign(m, to); else gsap.to(m, { ...to, duration: 0.7, ease: 'power2.out' });
  }
  const accentOf = (theme, cw) => theme === 'brand' ? ART.COLORWAYS[cw].accent : ACCENT[theme];

  /* ------------------------------------------------------------ model builders */
  function lidParts(R, H, theme, cw, metal) {
    const LR = R + 0.06;
    const lidSide = metalMat(accentOf(theme, cw), 0.28);
    const lidTop = printMat(ART.lidTexture(theme, cw));
    const g = new THREE.Group(); g.position.y = H / 2;
    const skirt = new THREE.Mesh(new THREE.CylinderGeometry(LR, LR, 0.24, 96, 1, true), lidSide); skirt.position.y = 0.04;
    const top = new THREE.Mesh(new THREE.CircleGeometry(LR, 64), lidTop); top.rotation.x = -Math.PI / 2; top.position.y = 0.16;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(LR, 0.04, 12, 96), metal); lip.rotation.x = Math.PI / 2; lip.position.y = 0.16;
    g.add(skirt, top, lip);
    return g;
  }
  function buildRound({ R = 1, H = 1.5, theme, cw }) {
    const group = new THREE.Group(), print = [];
    const metal = metalMat();
    const bodyMat = printMat(ART.wrapTexture(theme, cw, H / (TAU * R))); print.push(bodyMat);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 96, 1, true), bodyMat); body.rotation.y = -Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.035, 12, 96), metal); rim.rotation.x = Math.PI / 2; rim.position.y = -H / 2;
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(R, 64), metal); bottom.rotation.x = Math.PI / 2; bottom.position.y = -H / 2;
    const lid = lidParts(R, H, theme, cw, metal);
    group.add(body, rim, bottom, lid);
    return { group, print, parts: { body, bottom, lid } };
  }
  function buildBox({ w, h, d, theme, cw, r = 0.09 }) {
    const group = new THREE.Group();
    const metal = metalMat();
    const front = printMat(ART.faceTexture(theme, cw, h / w));
    const side = printMat(ART.faceTexture(theme, cw, h / d));
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, r), [side, side, metal, metal, front, front]);
    const lidSide = metalMat(accentOf(theme, cw), 0.28);
    const topPrint = printMat(ART.faceTexture(theme, cw, d / w));
    const lid = new THREE.Mesh(new RoundedBoxGeometry(w + 0.1, 0.26, d + 0.1, 5, 0.07), [lidSide, lidSide, topPrint, metal, lidSide, lidSide]);
    lid.position.y = h / 2 + 0.06;
    group.add(body, lid);
    return { group, print: [front, side, topPrint], parts: { body, lid, bottom: body } };
  }
  function buildOil({ theme, cw }) {
    const w = 1.7, h = 2.1, d = 1.05;
    const group = new THREE.Group();
    const metal = metalMat();
    const front = printMat(ART.faceTexture(theme, cw, h / w));
    const side = printMat(ART.faceTexture(theme, cw, h / d));
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 6, 0.08), [side, side, metal, metal, front, front]);
    const plate = new THREE.Mesh(new RoundedBoxGeometry(w + 0.02, 0.08, d + 0.02, 3, 0.03), metal); plate.position.y = h / 2 + 0.02;
    const cap = new THREE.Group(); cap.position.set(0.5, h / 2 + 0.06, 0);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.3, 40), metal); spout.position.y = 0.15;
    const cover = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 40), metalMat('#f2a93b', 0.3)); cover.position.y = 0.34;
    cap.add(spout, cover);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.035, 10, 48, Math.PI), metal);
    handle.position.set(-0.3, h / 2 + 0.06, 0); handle.rotation.set(0, 0, 0);
    group.add(body, plate, cap, handle);
    return { group, print: [front, side], parts: { body, lid: cap, bottom: body } };
  }
  const SHAPES = {
    round: (t, c) => buildRound({ R: 1, H: 1.5, theme: t, cw: c }),
    square: (t, c) => buildBox({ w: 1.7, h: 1.2, d: 1.7, theme: t, cw: c }),
    rect: (t, c) => buildBox({ w: 2.4, h: 1.15, d: 1.4, theme: t, cw: c }),
    oval: (t, c) => { const m = buildRound({ R: 1, H: 1.2, theme: t, cw: c }); m.group.scale.set(1.4, 1, 0.8); return m; },
    oil: (t, c) => buildOil({ theme: t, cw: c }),
    cheese: (t, c) => buildRound({ R: 1.25, H: 0.85, theme: t, cw: c })
  };

  /* ------------------------------------------------------------ product instances (one per stage) */
  // Every stage that shows a tin gets its own independent tin (own shape / artwork / finish), so nothing ever has to
  // travel from one section to another.
  const instances = [], byName = {};
  const shadowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
  })();
  const INITIAL = {
    hero: { shape: 'round', theme: 'brand', cw: 0, finish: 'gloss' },
    finish: { shape: 'round', theme: 'brand', cw: 0, finish: 'gloss' },
    shapes: { shape: 'round', theme: 'brand', cw: 0, finish: 'gloss' },
    seasons: { shape: 'oil', theme: 'olive', cw: 0, finish: 'gloss' }
  };
  const POSES = { hero: { ry: -0.55, rx: 0.2, s: 1.0 }, finish: { ry: 0.35, rx: 0.16, s: 1.05 }, shapes: { ry: -0.45, rx: 0.22, s: 1.0 }, seasons: { ry: 0.5, rx: 0.18, s: 1.05 } };
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };

  function makeProduct(name) {
    const root = new THREE.Group(); root.visible = false; scene.add(root);
    const tilt = new THREE.Group(); root.add(tilt);
    const holder = new THREE.Group(); tilt.add(holder);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 }));
    shadow.rotation.x = -Math.PI / 2; root.add(shadow);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 96), new THREE.MeshBasicMaterial({ color: 0xf2a93b, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; root.add(ring);

    const S = { ...(INITIAL[name] || INITIAL.hero) }, pose = POSES[name] || POSES.hero;
    let model = null, transitioning = false, pending = null, idle = Math.random() * 6, spinYaw = 0, spinV = 0;
    const bob = Math.random() * 6;
    const modelSize = new THREE.Vector3(2, 2, 2);

    function mountModel() {
      if (model) holder.remove(model.group);
      model = SHAPES[S.shape](S.theme, S.cw);
      model.print.forEach((m) => applyFinish(m, S.finish, true));
      syncEnv();
      holder.add(model.group);
      // Measure the model in its own units. Box3.setFromObject works in world space, so when a tin is rebuilt after its stage has
      // been laid out (colourway / shape change) the root scale, spin and bob would inflate the size and the shadow came out
      // several times too big (a hard-edged grey block clipped by the canvas). Measure with a neutral transform instead.
      const keep = [root.scale.clone(), root.position.clone(), tilt.rotation.clone(), holder.scale.clone(), holder.rotation.clone()];
      root.scale.set(1, 1, 1); root.position.set(0, 0, 0); tilt.rotation.set(0, 0, 0); holder.scale.set(1, 1, 1); holder.rotation.set(0, 0, 0);
      root.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model.group);
      root.scale.copy(keep[0]); root.position.copy(keep[1]); tilt.rotation.copy(keep[2]); holder.scale.copy(keep[3]); holder.rotation.copy(keep[4]);
      box.getSize(modelSize);
      model.group.position.y -= box.getCenter(new THREE.Vector3()).y;
      shadow.position.y = -modelSize.y / 2 - 0.12;
      shadow.scale.set(modelSize.x * 1.5, modelSize.x * 1.5, 1);
    }
    mountModel();

    const done = () => { transitioning = false; if (pending) { const p = pending; pending = null; apply(p); } };
    function apply(next) {
      if (transitioning) { pending = next; return; }
      const shapeChanged = next.shape && next.shape !== S.shape;
      const artChanged = (next.theme && next.theme !== S.theme) || (next.cw !== undefined && next.cw !== S.cw);
      const finishChanged = next.finish && next.finish !== S.finish;
      if (shapeChanged) {
        transitioning = true; Object.assign(S, next);
        gsap.to(holder.scale, {
          x: 0.001, y: 0.001, z: 0.001, duration: 0.28, ease: 'power2.in',
          onComplete: () => { mountModel(); holder.rotation.y += Math.PI * 0.6; gsap.to(holder.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: 'back.out(1.7)', onComplete: done }); }
        });
      } else if (artChanged) {
        Object.assign(S, next); transitioning = true;
        gsap.to(holder.rotation, { y: '+=' + Math.PI * 2, duration: 0.9, ease: 'power3.inOut' });
        gsap.to(holder.scale, {
          x: 0.9, y: 0.9, z: 0.9, duration: 0.35, ease: 'power2.in',
          onComplete: () => { mountModel(); gsap.to(holder.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(2)', onComplete: done }); }
        });
      } else if (finishChanged) {
        S.finish = next.finish;
        model.print.forEach((m) => applyFinish(m, S.finish, false));
        gsap.fromTo(holder.scale, { x: 1, y: 1, z: 1 }, { x: 1.05, y: 1.05, z: 1.05, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' });
      }
    }

    function burst() {
      ring.position.y = shadow.position.y + 0.03; ring.scale.set(0.5, 0.5, 1); ring.material.opacity = 0.9;
      gsap.to(ring.scale, { x: 4.2, y: 4.2, duration: 1.1, ease: 'power3.out' });
      gsap.to(ring.material, { opacity: 0, duration: 1.1, ease: 'power2.out' });
    }
    // entrance: the tin assembles itself
    function intro() {
      const p = model.parts, tl = gsap.timeline();
      holder.scale.set(1, 1, 1);
      tl.from(p.body.position, { y: -7, duration: 1.1, ease: 'power4.out' }, 0)
        .from(p.body.rotation, { y: -Math.PI * 5, duration: 1.4, ease: 'power3.out' }, 0)
        .from(p.body.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.0, ease: 'back.out(1.4)' }, 0)
        .from(p.bottom.position, { y: -9, duration: 1.0, ease: 'power4.out' }, 0.1)
        .from(p.lid.position, { y: 7, duration: 0.9, ease: 'bounce.out' }, 0.75)
        .from(p.lid.rotation, { y: Math.PI * 3, duration: 1.0, ease: 'power3.out' }, 0.75)
        .add(burst, 1.45);
      return tl;
    }
    const inst = {
      name, root, S, shadow, apply, intro, kind: 'product',
      // p: where the stage is in the viewport (-1 just left through the top … 0 centred … +1 just entering from below)
      // vel: smoothed scroll speed (-1…1). The tin stays put but turns, floats and leans with the scroll.
      update(dt, now, p = 0, vel = 0) {
        idle += dt * 0.28; spinYaw += spinV; spinV *= 0.94;
        tilt.rotation.x = pose.rx + ptr.sy * 0.18 + p * 0.12 + vel * 0.16;
        tilt.rotation.y = pose.ry + idle + spinYaw + ptr.sx * 0.35 - p * 1.25;
        tilt.rotation.z = vel * 0.06;
        root.position.y = Math.sin(now / 1300 + bob) * 0.045 - p * 0.16 + vel * 0.08;
      },
      layout(w, h, px2w) { root.scale.setScalar(Math.max(0.001, (0.9 * Math.min(w, h) * px2w / 2.9) * pose.s)); },
      spin(dx) { spinV += dx * 0.004; }
    };
    instances.push(inst); byName[name] = inst;
    return inst;
  }


  /* ------------------------------------------------------------ journey rig */
  const journey = new THREE.Group(); journey.visible = false; scene.add(journey);
  const JR = 0.85, JH = 1.3, JW = TAU * JR, N = 160;
  const aspect = JH / JW;
  const blank = ART.blankSheetCanvas(2048, Math.round(2048 * aspect));
  const printed = ART.artCanvas('brand', 0, aspect);
  const sheetCanvas = document.createElement('canvas'); sheetCanvas.width = blank.width; sheetCanvas.height = blank.height;
  const sheetTex = new THREE.CanvasTexture(sheetCanvas); sheetTex.colorSpace = THREE.SRGBColorSpace; sheetTex.anisotropy = 8;
  let lastPrint = -1;
  function drawSheet(pr) {
    const x = sheetCanvas.getContext('2d');
    x.drawImage(blank, 0, 0);
    if (pr < 1) {
      x.save(); x.globalAlpha = (1 - pr) * 0.7; x.strokeStyle = '#2a6fb8'; x.lineWidth = 3; x.setLineDash([22, 14]);
      x.strokeRect(24, 24, sheetCanvas.width - 48, sheetCanvas.height - 48);
      x.beginPath(); x.moveTo(sheetCanvas.width / 2, 0); x.lineTo(sheetCanvas.width / 2, sheetCanvas.height); x.stroke(); x.restore();
    }
    if (pr > 0) { x.save(); x.beginPath(); x.rect(0, 0, sheetCanvas.width * pr, sheetCanvas.height); x.clip(); x.drawImage(printed, 0, 0); x.restore(); }
    sheetTex.needsUpdate = true;
  }
  drawSheet(0);

  const sheetGeo = new THREE.BufferGeometry();
  const pos = new Float32Array((N + 1) * 2 * 3), nor = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2);
  const idx = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j < 2; j++) { const k = i * 2 + j; uv[k * 2] = i / N; uv[k * 2 + 1] = j; }
  for (let i = 0; i < N; i++) { const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1; idx.push(a, c, b, b, c, d); }
  sheetGeo.setIndex(idx);
  sheetGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  sheetGeo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  sheetGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  function bendSheet(b) {
    for (let i = 0; i <= N; i++) {
      const s = (i / N - 0.5) * JW;
      let x, z, nx, nz;
      if (b < 1e-4) { x = s; z = 0; nx = 0; nz = 1; }
      else { const r = JR / b, ph = s / r; x = r * Math.sin(ph); z = -r * (1 - Math.cos(ph)); nx = Math.sin(ph); nz = Math.cos(ph); }
      for (let j = 0; j < 2; j++) {
        const k = (i * 2 + j) * 3;
        pos[k] = x; pos[k + 1] = (j ? JH / 2 : -JH / 2); pos[k + 2] = z;
        nor[k] = nx; nor[k + 1] = 0; nor[k + 2] = nz;
      }
    }
    sheetGeo.attributes.position.needsUpdate = true; sheetGeo.attributes.normal.needsUpdate = true;
    sheetGeo.computeBoundingSphere();
  }
  const sheetMat = new THREE.MeshPhysicalMaterial({ map: sheetTex, metalness: 0.65, roughness: 0.26, clearcoat: 1, clearcoatRoughness: 0.1, side: THREE.DoubleSide });
  sheetMat.userData.envBase = 1.1; envMats.add(sheetMat);
  const sheet = new THREE.Mesh(sheetGeo, sheetMat);
  const sheetRig = new THREE.Group(); sheetRig.add(sheet); journey.add(sheetRig);
  bendSheet(0);

  const jMetal = metalMat();
  const capBottom = new THREE.Mesh(new THREE.CircleGeometry(JR, 64), jMetal); capBottom.rotation.x = Math.PI / 2; capBottom.position.y = -JH / 2;
  const capTop = lidParts(JR, JH, 'brand', 0, jMetal); capTop.position.y = JH / 2 + 3;
  sheetRig.add(capBottom, capTop);

  const head = new THREE.Mesh(new THREE.PlaneGeometry(0.06, JH + 0.5), new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  sheetRig.add(head);

  // pallet of mini tins
  const pallet = new THREE.Group(); journey.add(pallet);
  const miniR = 0.4, miniH = 0.6;
  const miniBodyGeo = new THREE.CylinderGeometry(miniR, miniR, miniH, 40, 1, true);
  const miniTopGeo = new THREE.CircleGeometry(miniR + 0.02, 40);
  const miniBodyMat = printMat(ART.wrapTexture('brand', 0, miniH / (TAU * miniR)));
  const miniTopMat = printMat(ART.lidTexture('brand', 0));
  const minis = [];
  for (let layer = 0; layer < 2; layer++) for (let ix = 0; ix < 3; ix++) for (let iz = 0; iz < 3; iz++) {
    const g = new THREE.Group();
    const b = new THREE.Mesh(miniBodyGeo, miniBodyMat); b.rotation.y = -Math.PI / 2;
    const t = new THREE.Mesh(miniTopGeo, miniTopMat); t.rotation.x = -Math.PI / 2; t.position.y = miniH / 2 + 0.005;
    g.add(b, t);
    g.position.set((ix - 1) * 0.86, 0.18 + miniH / 2 + layer * (miniH + 0.02), (iz - 1) * 0.86);
    g.userData.order = (layer * 9 + ix * 3 + iz);
    g.scale.setScalar(0.001);
    pallet.add(g); minis.push(g);
  }
  const wood = new THREE.MeshStandardMaterial({ color: '#b98a54', roughness: 0.85, metalness: 0 });
  for (let i = -1; i <= 1; i++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.5), wood); pl.position.set(0, 0.03, i * 0.95); pallet.add(pl); }
  for (let i = -1; i <= 1; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 2.8), wood); bl.position.set(i * 1.2, 0.0, 0); pallet.add(bl); }
  const wrapFilm = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.55, 2.9), new THREE.MeshPhysicalMaterial({ color: '#cfe3ff', transparent: true, opacity: 0.12, roughness: 0.1, metalness: 0, clearcoat: 1 }));
  wrapFilm.position.y = 0.18 + 0.78; pallet.add(wrapFilm);
  pallet.position.y = -1.0; pallet.visible = false;

  // globe
  const globe = new THREE.Group(); journey.add(globe); globe.visible = false;
  const globeTilt = new THREE.Group(); globe.add(globeTilt);
  const GR = 1.45;
  const ll = (lat, lon, r = GR) => { const a = THREE.MathUtils.degToRad(lat), o = THREE.MathUtils.degToRad(lon); return new THREE.Vector3(r * Math.cos(a) * Math.sin(o), r * Math.sin(a), r * Math.cos(a) * Math.cos(o)); };
  // The globe is a self-lit "planet": a deep-navy sphere with a rim glow and bright land dots, so it looks
  // identical in light and dark mode. Land comes from Natural Earth (public domain), rasterised once.
  {
    const n = 9000, p = new Float32Array(n * 3), col = new Float32Array(n * 3), lonlat = new Float32Array(n * 2);
    const land = new THREE.Color('#c4d6ff'), sea = new THREE.Color('#1f2d70');
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2, r = Math.sqrt(1 - y * y), th = Math.PI * (3 - Math.sqrt(5)) * i;
      const x = Math.cos(th) * r, z = Math.sin(th) * r;
      p[i * 3] = x * GR; p[i * 3 + 1] = y * GR; p[i * 3 + 2] = z * GR;
      lonlat[i * 2] = Math.atan2(x, z) * 180 / Math.PI; lonlat[i * 2 + 1] = Math.asin(y) * 180 / Math.PI;
      col[i * 3] = sea.r; col[i * 3 + 1] = sea.g; col[i * 3 + 2] = sea.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    globeTilt.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 1, depthWrite: false })));

    const planet = new THREE.ShaderMaterial({
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vN; void main(){ float f = pow(1.0 - abs(vN.z), 2.2); vec3 c = mix(vec3(0.035,0.06,0.17), vec3(0.14,0.25,0.62), f); c += vec3(0.02,0.03,0.07) * (vN.y*0.5+0.5); gl_FragColor = vec4(c,1.0); }'
    });
    globeTilt.add(new THREE.Mesh(new THREE.SphereGeometry(GR * 0.99, 64, 48), planet));
    const halo = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide,
      vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vN; void main(){ float f = pow(1.0 - abs(vN.z), 2.6); gl_FragColor = vec4(0.36,0.52,1.0, f*0.55); }'
    });
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(GR * 1.1, 64, 48), halo));

    fetch('assets/land-110m.geojson').then((r) => r.json()).then((gj) => {
      const W = 1440, H = 720, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const cx = cv.getContext('2d', { willReadFrequently: true }); cx.fillStyle = '#fff';
      const ring = (rg) => { rg.forEach(([lo, la], k) => { const x = (lo + 180) / 360 * W, y = (90 - la) / 180 * H; k ? cx.lineTo(x, y) : cx.moveTo(x, y); }); cx.closePath(); };
      gj.features.forEach((f) => {
        const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
        polys.forEach((poly) => { cx.beginPath(); poly.forEach(ring); cx.fill('evenodd'); });
      });
      const px = cx.getImageData(0, 0, W, H).data;
      for (let i = 0; i < n; i++) {
        const xx = Math.min(W - 1, Math.max(0, Math.floor((lonlat[i * 2] + 180) / 360 * W))), yy = Math.min(H - 1, Math.max(0, Math.floor((90 - lonlat[i * 2 + 1]) / 180 * H)));
        if (px[(yy * W + xx) * 4] > 128) { col[i * 3] = land.r; col[i * 3 + 1] = land.g; col[i * 3 + 2] = land.b; }
      }
      g.attributes.color.needsUpdate = true;
    }).catch((e) => { console.warn('globe land map unavailable', e); });
  }
  // [label, lat, lon, label offset x, y] — unlabeled cities still get an arc
  const CITIES = [
    ['Riyadh', 24.71, 46.68, -0.05, -0.24], ['Dubai', 25.2, 55.27, 0.32, -0.18], ['Baghdad', 33.31, 44.37, 0.2, 0.26],
    ['', 29.38, 47.99, 0, 0], ['', 25.29, 51.53, 0, 0], ['', 40.7, -74.0, 0, 0]
  ];
  const home = ll(31.95, 35.93);
  const arcs = [];
  const homeDot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf2a93b })); homeDot.position.copy(home); globeTilt.add(homeDot);
  const homeLbl = new THREE.Sprite(new THREE.SpriteMaterial({ map: ART.labelSprite('Amman', '#ffd58a'), transparent: true, depthTest: false })); homeLbl.scale.set(0.9, 0.225, 1); homeLbl.position.copy(home).multiplyScalar(1.1).add(new THREE.Vector3(-0.42, -0.04, 0.05)); globeTilt.add(homeLbl);
  CITIES.forEach(([name, lat, lon, ox, oy]) => {
    const p1 = ll(lat, lon);
    const mid = home.clone().add(p1).multiplyScalar(0.5); const d = home.distanceTo(p1);
    mid.setLength(GR + 0.25 + d * 0.28);
    const pts = new THREE.QuadraticBezierCurve3(home, mid, p1).getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.95 }));
    geo.setDrawRange(0, 0); globeTilt.add(line); arcs.push(geo);
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); dot.position.copy(p1); globeTilt.add(dot);
    if (name) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ART.labelSprite(name), transparent: true, depthTest: false })); sp.scale.set(0.72, 0.18, 1);
      sp.position.copy(p1).multiplyScalar(1.1).add(new THREE.Vector3(ox, oy, 0.05)); globeTilt.add(sp);
    }
  });
  const GLOBE_Y = -THREE.MathUtils.degToRad(34);
  globeTilt.rotation.y = GLOBE_Y; globeTilt.rotation.x = 0.35;

  const jState = { p: 0 };
  function setJourney(p) {
    jState.p = p;
    const appear = 1;
    const print = sstep(0.17, 0.36, p);
    const bend = sstep(0.4, 0.58, p);
    const lid = sstep(0.58, 0.66, p);
    const pal = sstep(0.68, 0.86, p);
    const gl = sstep(0.88, 1.0, p);

    if (Math.abs(print - lastPrint) > 0.004) { lastPrint = print; drawSheet(print); }
    bendSheet(bend);
    sheetRig.visible = pal < 0.98;
    sheetRig.rotation.y = bend * (Math.PI / 2) + sstep(0.4, 0.66, p) * TAU;
    sheetRig.rotation.x = lerp(-0.18, 0.2, bend);
    sheet.position.z = JR * bend;
    // caps sit on the can axis (the sheet is shifted by JR*bend, so the axis is the rig origin at bend=1)
    capBottom.visible = bend > 0.98; capTop.visible = bend > 0.98;
    capTop.position.y = lerp(JH / 2 + 3, JH / 2, 1 - Math.pow(1 - lid, 3));
    capTop.position.z = 0; capBottom.position.z = 0;
    const flatScale = lerp(1, 2.3, bend);
    sheetRig.scale.setScalar(appear * flatScale * (1 - pal));
    // printing head
    head.visible = print > 0.001 && print < 0.999 && bend < 0.01;
    head.position.set((print - 0.5) * JW, 0, 0.02);

    pallet.visible = pal > 0.001 && gl < 0.999;
    minis.forEach((m) => { const t = clamp(pal * 20 - m.userData.order * 0.9, 0, 1); m.scale.setScalar(Math.max(0.001, 1 - Math.pow(1 - t, 3))); m.rotation.y = (1 - t) * 3; });
    wrapFilm.material.opacity = 0.12 * sstep(0.84, 0.88, p);
    pallet.scale.setScalar(lerp(1.5, 0.001, gl));
    pallet.position.y = lerp(-1.5, 1.4, gl);
    pallet.rotation.y = pal * 1.2 + p * 3;

    globe.visible = gl > 0.001;
    globe.scale.setScalar(Math.max(0.001, gl * 1.5));
    arcs.forEach((g, i) => g.setDrawRange(0, Math.floor(65 * clamp((gl - 0.2 - i * 0.07) / 0.5))));
  }

  /* ------------------------------------------------------------ per-stage rendering */
  // Each .stage owns its own <canvas>. One shared WebGL renderer draws that stage's rig, and the picture is copied into
  // the stage's canvas. Because the picture lives INSIDE the stage element, it scrolls with the page natively and can never
  // drift away from its place, whatever the scroll method, speed or frame rate.
  const OVER = 0.12; // each canvas bleeds 12% past its stage so tilted tins never clip
  const journeyInst = {
    name: 'journey', root: journey, kind: 'journey',
    update(dt, now) { if (journey.visible) globeTilt.rotation.y = GLOBE_Y + Math.sin(now / 3000) * 0.08 + ptr.sx * 0.2; },
    layout(w, h, px2w) { journey.scale.setScalar(Math.max(0.001, Math.min((w * px2w) / (JW + 0.6), (h * px2w) / 3.7))); }
  };
  let frameNo = 0, stages = [], bufW = 1, bufH = 1, running = true, last = performance.now(), lastScrollY = window.scrollY, scrollVel = 0;

  function refreshStages() {
    stages.forEach((s) => s.cv.remove()); stages = [];
    document.querySelectorAll('.stage').forEach((el) => {
      const cv = document.createElement('canvas'); cv.className = 'stage__cv'; cv.setAttribute('aria-hidden', 'true'); el.prepend(cv);
      const name = el.dataset.rig === 'journey' ? 'journey' : (el.dataset.pose || 'hero');
      const inst = name === 'journey' ? journeyInst : (byName[name] || makeProduct(name));
      stages.push({ el, cv, ctx: cv.getContext('2d'), inst, shown: false });
    });
  }
  function resize() {
    const pr = Math.min(window.devicePixelRatio || 1, maxDpr()); renderer.setPixelRatio(pr);
    bufW = Math.ceil(window.innerWidth * (1 + 2 * OVER)); bufH = Math.ceil(window.innerHeight * (1 + 2 * OVER));
    renderer.setSize(bufW, bufH, false);
  }
  resize();

  // drop stages whose element has left the document (e.g. the loader's stage once the entrance is over)
  function pruneStages() {
    stages = stages.filter((s) => { if (s.el.isConnected) return true; s.cv.remove(); return false; });
  }
  function renderStage(st, dt, now) {
    const r = st.el.getBoundingClientRect();
    if (r.bottom < -150 || r.top > window.innerHeight + 150 || r.width < 4 || r.height < 4) return; // off screen: skip
    const k = 1 + 2 * OVER, pr = renderer.getPixelRatio();
    const cw = Math.min(bufW, Math.round(r.width * k)), ch = Math.min(bufH, Math.round(r.height * k));
    const pw = Math.round(cw * pr), ph = Math.round(ch * pr);
    if (st.cv.width !== pw || st.cv.height !== ph) { st.cv.width = pw; st.cv.height = ph; }
    instances.forEach((i) => { i.root.visible = false; }); journey.visible = false;
    st.inst.root.visible = true;
    const vh = window.innerHeight, p = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2)));
    st.inst.update(dt, now, p, scrollVel);
    st.inst.layout(r.width, r.height, (2 * HALF_H) / ch);
    camera.aspect = cw / ch; camera.updateProjectionMatrix();
    renderer.setViewport(0, 0, cw, ch);
    renderer.render(scene, camera);
    st.ctx.clearRect(0, 0, pw, ph);
    st.ctx.drawImage(renderer.domElement, 0, renderer.domElement.height - ph, pw, ph, 0, 0, pw, ph);
    if (!st.shown) { st.shown = true; st.cv.classList.add('is-on'); }
  }
  function frame(dt, now) {
    ptr.sx += (ptr.x - ptr.sx) * 0.06; ptr.sy += (ptr.y - ptr.sy) * 0.06;
    const y = window.scrollY, v = (y - lastScrollY) / Math.max(dt, 1 / 120); lastScrollY = y;
    scrollVel += (Math.max(-1, Math.min(1, v / 2200)) - scrollVel) * 0.12; // eases back to 0 when scrolling stops
    frameNo++;
    stages.forEach((st) => {
      let d = dt;
      if (COARSE && st.inst.kind === 'product') { st.acc = (st.acc || 0) + dt; if (frameNo & 1) return; d = st.acc; st.acc = 0; }
      renderStage(st, d, now);
    });
  }
  // Driven from the page's single ticker, after the scroll update.
  function tick() {
    if (!running) return;
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    frame(dt, now);
  }
  // deterministic stepping (used for review screenshots when the page is not being painted live)
  function advance(n = 60) { for (let i = 0; i < n; i++) frame(1 / 60, performance.now()); }
  document.addEventListener('visibilitychange', () => { running = !document.hidden; last = performance.now(); });

  function setTheme(mode, instant) {
    const dark = mode === 'dark';
    const to = { exposure: dark ? 1.25 : 1.0, env: dark ? 0.55 : 1.0, key: dark ? 1.1 : 1.6, rimL: dark ? 38 : 6, rimR: dark ? 26 : 5, shadow: dark ? 0.0 : 0.5 };
    const o = { exposure: renderer.toneMappingExposure, env: env.i, key: key.intensity, rimL: rimL.intensity, rimR: rimR.intensity, shadow: instances.length ? instances[0].shadow.material.opacity : to.shadow };
    const set = () => {
      renderer.toneMappingExposure = o.exposure; env.i = o.env; syncEnv(); key.intensity = o.key; rimL.intensity = o.rimL; rimR.intensity = o.rimR;
      instances.forEach((i) => { i.shadow.material.opacity = o.shadow; });
    };
    theme.shadow = to.shadow;
    if (instant) { Object.assign(o, to); set(); }
    else gsap.to(o, { ...to, duration: 0.9, ease: 'power2.inOut', onUpdate: set });
  }
  const theme = { shadow: 0.5 };

  // Pre-compile every shader variant (one per finish) while the loader is up, so nothing hitches later.
  async function warm() {
    const geo = new THREE.PlaneGeometry(0.1, 0.1), tmp = [];
    Object.keys(FIN).forEach((f) => {
      const m = printMat(ART.lidTexture('brand', 0)); applyFinish(m, f, true);
      const mesh = new THREE.Mesh(geo, m); scene.add(mesh); tmp.push(mesh);
    });
    const vis = instances.map((i) => i.root.visible), jv = [journey.visible, pallet.visible, globe.visible];
    instances.forEach((i) => { i.root.visible = true; }); journey.visible = pallet.visible = globe.visible = true;
    try { await renderer.compileAsync(scene, camera); } catch (e) { /* fine: compiled lazily instead */ }
    instances.forEach((i, n) => { i.root.visible = vis[n]; }); [journey.visible, pallet.visible, globe.visible] = jv;
    tmp.forEach((m) => { scene.remove(m); m.material.dispose(); envMats.delete(m.material); });
  }

  return {
    refreshStages, pruneStages, setJourney, setTheme, resize, warm, advance, tick,
    instance: (name) => byName[name],
    intro: () => (byName.hero ? byName.hero.intro() : null),
    setPointer: (x, y) => { ptr.x = x; ptr.y = y; },
    spin: (el, dx) => { const s = stages.find((t) => t.el === el); if (s && s.inst.spin) s.inst.spin(dx); },
    debug: () => stages.map((s) => { const r = s.el.getBoundingClientRect(); return { pose: s.inst.name, canvas: s.cv.width + 'x' + s.cv.height, stage: Math.round(r.width) + 'x' + Math.round(r.height), top: Math.round(r.top), shown: s.shown }; })
  };
}
