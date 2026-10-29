// From sheet to shelf: the main tin's own story at its real size. A printed tinplate sheet carrying five body blanks of the Al Qaisi
// tin; the press runs across it; the middle blank is cut out, rolled into the body and closed with its lid; the tin goes into a bag,
// the bag into a carton, the carton onto a pallet that is shrink-wrapped and loaded on a truck, then a globe with routes out of Amman. pose(p, t) poses everything from the
// chapter's own time p (0 … 1); shotAt(p) gives the camera. Used by the home film (chapter 6) and the Capabilities page.
import * as THREE from 'three';
import * as TIN from './tins.js';
import * as HAL from './halawah.js';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sm = (t) => t * t * (3 - 2 * t);
const seg = (p, a, b) => sm(clamp((p - a) / (b - a)));
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function makeJourney({ scene, ready, contact, ptr, COARSE = false, REDUCED = false, JX = 0, active = () => false }) {
  // ---------------------------------------------------------------- from sheet to shelf: the main tin's own story, at its real size
  // A printed tinplate sheet carrying five body blanks of the Al Qaisi tin: the prepress marks are drawn, the press runs across it,
  // the middle blank is cut out, rolled into the body and closed with its lid; the tin then joins a wrapped pallet of its twins,
  // the tin is bagged, boxed, palletised, shrink-wrapped and trucked, then the globe with routes out of Amman. Everything poses itself from the chapter's own time (0 … 1).
  const J0 = V(JX, 0, 0), JV = V(JX, 0.6, 0);
  // three.js copies userData through JSON when cloning, and our userData holds the artwork's textures: clone without it
  const lean = (o, f) => { const kept = []; const strip = (x) => { kept.push([x, x.userData]); x.userData = {}; }; if (o.isMaterial) strip(o); else o.traverse(strip); const c = f(o); kept.forEach(([x, u]) => { x.userData = u; }); return c; };
  return (() => {
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
    tin.body.visible = false;                             // the rolled blank is the body
    const lidY = tin.lid.position.y;
    hero.add(heroBack, heroInk, tin.group);
    const startPose = new THREE.Object3D(); startPose.position.set(0, -JH / 2, 0.006); plate.add(startPose);

    // packing, as the factory does it: each tin goes into a bag, the bagged tins into a carton (a stack of three here), the
    // cartons onto a wooden pallet, and the pallet is shrink-wrapped and loaded on a truck
    const DIR = () => (document.documentElement.dir === 'rtl' ? -1 : 1);   // the truck stands on the far side of the reading card
    const BR = R * 1.07, BAG_H = H + 0.1;
    const bagBump = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#808080'; x.fillRect(0, 0, 256, 64); for (let i = 0; i < 90; i++) { x.globalAlpha = 0.25 + Math.random() * 0.4; x.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#000000'; x.fillRect(Math.random() * 256, 0, 1 + Math.random() * 4, 64); } const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1); return t; })();
    const bagMat = new THREE.MeshPhysicalMaterial({ color: '#f2f6fb', transparent: true, opacity: 0, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08, bumpMap: bagBump, bumpScale: 3, side: THREE.DoubleSide, depthWrite: false });
    const bag = new THREE.Group(); hero.add(bag);
    { const side = new THREE.Mesh(new THREE.CylinderGeometry(BR, BR, BAG_H, 64, 1, true), bagMat); side.position.y = BAG_H / 2;
      const top = new THREE.Mesh(new THREE.SphereGeometry(BR, 48, 12, 0, Math.PI * 2, 0, Math.PI / 2), bagMat); top.scale.y = 0.16; top.position.y = BAG_H;
      const tie = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.26, 16), bagMat); tie.position.y = BAG_H + BR * 0.16 + 0.1;
      bag.add(side, top, tie); bag.children.forEach((m) => { m.renderOrder = 4; }); }

    const kraftTex = (top) => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#c69f6e'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 900; i++) { x.globalAlpha = 0.05 + Math.random() * 0.08; x.fillStyle = Math.random() < 0.5 ? '#8f6a3f' : '#e2c597'; x.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 10, 1); }
      x.globalAlpha = 0.18; x.fillStyle = '#7a5a33'; x.fillRect(0, 0, 256, 3); x.fillRect(0, 253, 256, 3); x.fillRect(0, 0, 3, 256); x.fillRect(253, 0, 3, 256);
      if (top) { x.globalAlpha = 0.55; x.fillStyle = '#e8d3a6'; x.fillRect(0, 108, 256, 40); x.globalAlpha = 0.25; x.fillStyle = '#ffffff'; x.fillRect(0, 112, 256, 4); } // the tape over the flaps
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const kraft = new THREE.MeshStandardMaterial({ map: kraftTex(false), roughness: 0.9, side: THREE.DoubleSide });
    const kraftTop = new THREE.MeshStandardMaterial({ map: kraftTex(true), roughness: 0.85 });
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    const CW = 2 * R + 0.24, SLOT = BAG_H + 0.06, CH = 3 * SLOT + 0.1;    // a carton for a stack of three bagged tins

    // the hero's carton: open, then closed and taped
    const carton = new THREE.Group(); scene.add(carton);
    const cBody = new THREE.Mesh(new THREE.BoxGeometry(CW, CH, CW), [kraft, kraft, hidden, kraft, kraft, kraft]); cBody.position.y = CH / 2; cBody.castShadow = true; carton.add(cBody);
    // four flaps hinged at the top edges: open they lean outwards, closed they lie flat (the side pair under the long pair)
    const flaps = [[0, 1, 'x', 1], [0, -1, 'x', -1], [1, 0, 'z', -1], [-1, 0, 'z', 1]].map(([px, pz, ax, sg], i) => {
      const piv = new THREE.Group(); piv.position.set(px * CW / 2, CH, pz * CW / 2);
      const f = new THREE.Mesh(ax === 'x' ? new THREE.PlaneGeometry(CW, CW / 2) : new THREE.PlaneGeometry(CW / 2, CW), kraft);
      f.rotation.x = -Math.PI / 2; f.position.set(-px * CW / 4, i < 2 ? 0.012 : 0.004, -pz * CW / 4); f.castShadow = true;
      piv.add(f); carton.add(piv); return { piv, ax, sg };
    });
    const tape = new THREE.Mesh(new THREE.BoxGeometry(CW + 0.04, 0.012, 0.32), new THREE.MeshPhysicalMaterial({ color: '#e3cfa2', roughness: 0.25, clearcoat: 0.8, transparent: true, opacity: 0.9 }));
    tape.position.y = CH + 0.02; carton.add(tape);
    carton.add(contact(CW));

    // the pallet: 3 x 3 cartons a layer, four layers, on a wooden pallet; shrink film over it all
    const PS = 0.36, PITCH = CW + 0.04, LAY = 4;
    const pallet = new THREE.Group(); pallet.position.copy(J0); pallet.scale.setScalar(PS); scene.add(pallet);
    const woodTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#c29a66'; x.fillRect(0, 0, 256, 64); for (let i = 0; i < 70; i++) { x.globalAlpha = 0.08 + Math.random() * 0.12; x.fillStyle = Math.random() < 0.5 ? '#8a6238' : '#e2c49a'; x.fillRect(0, Math.random() * 64, 256, 1 + Math.random() * 2); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
    const wood = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.85 });
    const base = new THREE.Group(); pallet.add(base);
    const PW = 3 * PITCH + 0.1, BOARD = 0.12, BLOCK = 0.5;
    const bx = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; base.add(m); };
    for (let i = 0; i < 3; i++) bx(PW, BOARD, 0.8, 0, BOARD / 2, (i - 1) * (PW / 2 - 0.4));            // bottom boards
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) bx(0.9, BLOCK, 0.9, (i - 1) * (PW / 2 - 0.45), BOARD + BLOCK / 2, (j - 1) * (PW / 2 - 0.45)); // blocks
    for (let i = 0; i < 7; i++) bx(PW, BOARD, 1, 0, BOARD * 1.5 + BLOCK, (i - 3) * ((PW - 1) / 6)); // top deck
    const BASE = 2 * BOARD + BLOCK;
    const boxGeo = new THREE.BoxGeometry(CW, CH, CW), boxMats = [kraft, kraft, kraftTop, kraft, kraft, kraft];
    const boxes = [], slotOf = (ix, iz, l) => V((ix - 1) * PITCH, BASE + l * (CH + 0.02), (iz - 1) * PITCH);
    const HERO_SLOT = slotOf(1, 2, LAY - 1);
    for (let l = 0; l < LAY; l++) for (let iz = 0; iz < 3; iz++) for (let ix = 0; ix < 3; ix++) {
      if (l === LAY - 1 && ix === 1 && iz === 2) continue;      // the hero carton's place
      const m = new THREE.Mesh(boxGeo, boxMats); m.castShadow = true; m.receiveShadow = true; m.position.y = CH / 2;
      const g = new THREE.Group(); g.add(m); g.position.copy(slotOf(ix, iz, l)); g.userData.k = boxes.length; g.userData.p = g.position.clone();
      pallet.add(g); boxes.push(g);
    }
    // shrink film: it climbs the stack as the pallet is wrapped
    const filmMat = new THREE.MeshPhysicalMaterial({ color: '#eef3fa', roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, bumpMap: bagBump, bumpScale: 2, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const wrapH = LAY * (CH + 0.02) + 0.1, wrap = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.1, 1, PW + 0.1), filmMat); wrap.renderOrder = 3; pallet.add(wrap);
    const pc = contact(PW * 0.95); pallet.add(pc);

    // the truck: it backs up to the pallet, the pallet goes in, and it drives off (plain white: no branding is implied)
    const truck = new THREE.Group(); scene.add(truck);
    { const white = new THREE.MeshPhysicalMaterial({ color: '#f1f4f8', roughness: 0.35, clearcoat: 0.6, side: THREE.DoubleSide });
      const grey = new THREE.MeshStandardMaterial({ color: '#3a4250', roughness: 0.6, side: THREE.DoubleSide });
      const glass = new THREE.MeshPhysicalMaterial({ color: '#0d1a2e', roughness: 0.05, metalness: 0.3, clearcoat: 1, side: THREE.DoubleSide });
      const tyre = new THREE.MeshStandardMaterial({ color: '#15181d', roughness: 0.8, side: THREE.DoubleSide });
      const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; truck.add(m); return m; };
      const LT = 8.4, WT = 3.7, HT = 4.6, FL = 1.15, X0 = 2.3;           // the trailer is open at the end facing the pallet
      add(new THREE.BoxGeometry(LT, HT, WT), [white, hidden, white, grey, white, white], X0 + LT / 2, FL + HT / 2, 0);
      add(new THREE.BoxGeometry(LT, 0.3, WT * 0.9), grey, X0 + LT / 2, FL - 0.2, 0);
      add(new THREE.BoxGeometry(2.6, 3.3, WT), white, X0 + LT + 1.5, FL + 1.3, 0);                 // cab
      add(new THREE.BoxGeometry(0.06, 1.3, WT * 0.84), glass, X0 + LT + 2.82, FL + 2.1, 0);          // windscreen
      [X0 + 1.2, X0 + 2.5, X0 + LT + 1.9].forEach((x) => [-1, 1].forEach((sz) => { const w = add(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 32), tyre, x, 0.62, sz * (WT / 2 - 0.2)); w.rotation.x = Math.PI / 2; }));
      truck.userData.floor = FL; truck.userData.x0 = X0; }

    // the globe: a navy planet with the land in dots of champagne gold, and routes from Amman in amber
    const globe = new THREE.Group(); globe.position.set(JX, 1.75, 0); scene.add(globe);
    const tilt = new THREE.Group(); globe.add(tilt);
    const GR = 1.25;
    const ll = (lat, lon, r = GR) => { const a = THREE.MathUtils.degToRad(lat), o = THREE.MathUtils.degToRad(lon); return V(r * Math.cos(a) * Math.sin(o), r * Math.sin(a), r * Math.cos(a) * Math.cos(o)); };
    // pow() of a value a hair below zero is NaN on some GPUs, and the bloom pass spreads a NaN into black blocks: every base is clamped
    const lit = (body) => `varying vec3 vN; void main(){ ${body}
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
    const vN = 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
    tilt.add(new THREE.Mesh(new THREE.SphereGeometry(GR * 0.985, 72, 48), new THREE.ShaderMaterial({ vertexShader: vN,
      fragmentShader: lit('float f = pow(clamp(1.0 - abs(vN.z), 0.0, 1.0), 2.4); vec3 c = mix(vec3(0.0, 0.028, 0.155), vec3(0.06, 0.2, 0.42), f) + vec3(0.0, 0.01, 0.03) * (vN.y * 0.5 + 0.5); gl_FragColor = vec4(c, 1.0);') })));
    const halo = new THREE.Mesh(new THREE.SphereGeometry(GR * 1.1, 64, 48), new THREE.ShaderMaterial({ vertexShader: vN, transparent: true, depthWrite: false, side: THREE.BackSide,
      fragmentShader: lit('float f = pow(clamp(1.0 - abs(vN.z), 0.0, 1.0), 3.0); gl_FragColor = vec4(vec3(0.0, 0.1, 0.3), f * 0.4);') }));
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
    // 0 design & plates · 0.14 print · 0.34 cut & form · 0.56 bag, carton, pallet, shrink film · 0.82 truck, then the world
    const STEPS = [0, 0.14, 0.34, 0.56, 0.82];
    const focus = { pos: V(JX, 0.6, 0), span: 4.6 };
    const sp = V(0, 0, 0), sq = new THREE.Quaternion(), ss = V(0, 0, 0), q1 = new THREE.Quaternion(), spinQ = new THREE.Quaternion(), Y = V(0, 1, 0);
    const lin = (p, a, b) => clamp((p - a) / (b - a));
    function pose(p, t) {
      const vis = p > 0 || active();   // shown only once the camera heads this way
      const gd = seg(p, 0.0, 0.13), pr = lin(p, 0.15, 0.31);
      const cutA = seg(p, 0.35, 0.41), up = seg(p, 0.37, 0.45), bn = seg(p, 0.43, 0.52), lid = seg(p, 0.51, 0.555);
      const bagIn = seg(p, 0.57, 0.6), cIn = seg(p, 0.59, 0.63), lift1 = seg(p, 0.6, 0.635), drop = seg(p, 0.64, 0.675);
      const fSide = seg(p, 0.68, 0.695), fLong = seg(p, 0.693, 0.71), tapeOn = seg(p, 0.705, 0.72);
      const cRise = seg(p, 0.72, 0.75), cLand = seg(p, 0.775, 0.805), wrapF = lin(p, 0.8, 0.83);
      const truckIn = seg(p, 0.82, 0.86), liftP = seg(p, 0.86, 0.875), slide = seg(p, 0.872, 0.9), drive = seg(p, 0.9, 0.95);
      const gl = seg(p, 0.925, 0.98), dir = DIR();
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
      hero.visible = vis && fLong < 0.999;
      tin.group.visible = bn > 0.97;
      tin.lid.visible = lid > 0.001; tin.lid.position.y = lidY + (1 - lid) * (1 - lid) * 2.4;
      const spin = seg(p, 0.42, 0.58) * Math.PI * 2 + (REDUCED ? 0 : t * 0.12 * seg(p, 0.55, 0.62));
      spinQ.setFromAxisAngle(Y, spin);
      const flat = V(J0.x, J0.y, J0.z), up1 = V(JX, CH + 0.35, 0), inBox = V(JX, CH - SLOT + 0.04, 0);
      const P = sp.clone().lerp(flat, up).lerp(up1, lift1).lerp(inBox, drop);
      hero.position.copy(P);
      q1.identity(); hero.quaternion.copy(sq).slerp(q1, up).multiply(spinQ);
      hero.scale.setScalar(lerp(ss.x, 1, bn));
      // into the bag
      bag.visible = bagIn > 0.001; bag.position.y = (1 - bagIn) * 2.6; bagMat.opacity = 0.42 * Math.min(1, bagIn * 2);
      // into the carton; the flaps close, the tape goes on
      carton.visible = vis && cIn > 0.001 && gl < 0.999;
      cBody.scale.y = Math.max(0.001, cIn); cBody.position.y = (CH * cIn) / 2;
      flaps.forEach((f, i) => { const close = i < 2 ? fLong : fSide, open = 0.62 * Math.PI * (1 - close) * f.sg; f.piv.visible = cIn > 0.98; f.piv.rotation.set(f.ax === 'x' ? open : 0, 0, f.ax === 'z' ? open : 0); });
      tape.visible = tapeOn > 0.001; tape.scale.x = Math.max(0.001, tapeOn);
      // the pallet builds under the hovering carton, the hero carton lands last, the film climbs the stack
      const build = lin(p, 0.72, 0.785);
      pallet.visible = vis && p > 0.71 && gl < 0.999;
      boxes.forEach((g) => { const a = clamp(build * (boxes.length + 6) - g.userData.k, 0, 6) / 6, e = 1 - (1 - a) * (1 - a); g.visible = a > 0; g.position.y = g.userData.p.y + (1 - e) * 3; g.scale.setScalar(Math.max(0.001, e)); });
      const wh = Math.max(0.001, wrapF * wrapH); wrap.scale.y = wh; wrap.position.y = BASE + wh / 2; wrap.visible = wrapF > 0; filmMat.opacity = 0.2 * Math.min(1, wrapF * 4);
      // the truck backs up, the pallet goes in, the truck leaves
      truck.visible = vis && truckIn > 0.001 && drive < 0.999;
      truck.scale.x = dir; truck.position.set(JX + dir * ((1 - truckIn) * 16 + drive * 34), 0, 0);
      const FL = truck.userData.floor, inX = truck.userData.x0 + 2.4;
      pallet.position.set(JX + dir * (slide * inX + drive * 34), liftP * FL, 0);
      // the hero carton: up while the pallet builds, then onto its place (it rides with the pallet from there)
      const hoverC = V(JX, 4.9, 0.3), slotC = HERO_SLOT.clone().multiplyScalar(PS).add(pallet.position);
      carton.position.copy(J0).lerp(hoverC, cRise).lerp(slotC, cLand); carton.scale.setScalar(lerp(1, PS, cRise));
      carton.rotation.y = cRise * (1 - cLand) * 0.6;
      // the globe
      globe.visible = vis && gl > 0.001; globe.scale.setScalar(Math.max(0.001, sm(gl)));
      tilt.rotation.y = GY + (REDUCED ? 0 : Math.sin(t * 0.3) * 0.06) + ptr.sx * 0.15 + (1 - gl) * 0.8;
      arcs.forEach((a, i) => { const e = clamp((p - 0.945 - i * 0.006) / 0.05); a.tg.setDrawRange(0, Math.floor((a.n * e) / 6) * 6); a.end.visible = e > 0.98; });
      pulse.scale.setScalar(1 + ((t * 0.8) % 1) * 2.2); pulse.material.opacity = 1 - ((t * 0.8) % 1);
      lbl.material.opacity = seg(p, 0.95, 0.98);
      // where the key light's shadow should look
      focus.span = p > 0.81 ? 11 : p > 0.7 ? 6.5 : 4.6; focus.pos.set(JX + (p > 0.81 && p < 0.93 ? dir * 4.5 : 0), 0.6, 0);
      let s = 0; STEPS.forEach((v, i) => { if (p >= v) s = i; });
      return s;
    }
    // the camera inside the chapter: wide on the sheet, close on the tin, high on the pallet, level on the globe
    const KEYS = [
      [0, { pos: V(-1.25, 3.4, 12.8), tgt: V(-1.2, 1.1, 0) }],
      [0.36, { pos: V(-1.25, 3.4, 12.8), tgt: V(-1.2, 1.1, 0) }],
      [0.44, { pos: V(-1.25, 2.6, 8.4), tgt: V(-1.1, 0.5, 0) }],
      [0.53, { pos: V(-1.3, 2.35, 6.7), tgt: V(-1.2, 0.36, 0) }],
      [0.59, { pos: V(-1.3, 2.5, 7.0), tgt: V(-1.2, 0.5, 0) }],                 // the tin goes into its bag
      [0.635, { pos: V(-1.5, 4.6, 11.0), tgt: V(-1.35, 1.6, 0) }],              // the carton
      [0.715, { pos: V(-1.5, 4.6, 11.0), tgt: V(-1.35, 1.6, 0) }],
      [0.77, { pos: V(-1.8, 6.0, 15.5), tgt: V(-1.5, 2.6, 0) }],                // the pallet, then its film
      [0.82, { pos: V(-1.8, 6.0, 15.5), tgt: V(-1.5, 2.6, 0) }],
      [0.86, { pos: V(3.6, 9.5, 37), tgt: V(3.6, 2.8, 0) }],                     // the truck: the pallet clear of the card, the cab in frame
      [0.915, { pos: V(3.6, 9.5, 37), tgt: V(3.6, 2.8, 0) }],
      [0.96, { pos: V(-1.3, 2.2, 9.4), tgt: V(-1.2, 1.75, 0) }],                // the world
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
    return { pose, shotAt, label, plate, JX, JV, focus };
  })();
}
