// One persistent WebGL canvas. A single "product" tin follows the .stage elements in the layout,
// morphs between shapes / artwork / finishes, and a separate "journey" rig is scrubbed by scroll.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as ART from './art.js';
import * as HAL from './halawah.js';
import * as STU from './studio.js';

const TAU = Math.PI * 2;
// Which real tin (assets/img/tins, see halawah.js) dresses which shape. Shapes not listed wear the Halawah design.
const DESIGN_FOR = { round: 'qaisi', square: 'bab', box70: 'bab', rect: 'jgz', octagon: 'najmah', bucket: 'frieds', can: 'abed', milk: 'maeen', tuna: 'sufyan', tall: 'suliman', coffee: 'levelmax', cheese: 'laqmi', hexagon: 'halawah', oval: 'oval', paint: 'paint' };
let DESIGN = 'halawah'; // the design of the tin being built (set by mountModel)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// Finishes. The printed surfaces carry an ORM map (G = roughness, B = metalness): the gold foil is fully metallic and satin, the lacquer is half as
// metallic and about 0.45 as rough. So metalness here is the FOIL's value (the lacquer gets half) and roughness the FOIL's (the lacquer gets 0.45 of it;
// values above 1 are fine: the shader clamps the product).
// bump: which relief variant of the artwork the finish uses ('plain' = the foil stands proud of the lacquer).
const FIN = {
  gloss: { metalness: 0.85, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0, bumpScale: 1.1, bump: 'plain' },
  matte: { metalness: 0.8, roughness: 1.2, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0, bumpScale: 1.1, bump: 'plain' },
  soft: { metalness: 0.12, roughness: 2.1, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.7, bumpScale: 0.5, bump: 'plain' },
  rough: { metalness: 0.55, roughness: 1.8, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0, bumpScale: 1.4, bump: 'rough' },
  emboss: { metalness: 0.85, roughness: 0.5, clearcoat: 0.7, clearcoatRoughness: 0.1, sheen: 0, bumpScale: 2.2, bump: 'emboss' },
  // spot UV: a matte tin with a glossy varnish only on the printed motifs (the clear coat is masked by the artwork)
  spot: { metalness: 0.8, roughness: 1.25, clearcoat: 1, clearcoatRoughness: 0.04, sheen: 0, bumpScale: 0.8, bump: 'plain', spot: true }
};
// The same finishes on a tin printed from a photographed artwork (no foil / lacquer map): plain lacquer values.
// bump = how far the motifs stand proud (the relief mask), spot = the clear coat only on the motifs.
const PFIN = {
  gloss: { metalness: 0.08, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.12, sheen: 0, bumpScale: 0.3 },
  matte: { metalness: 0.06, roughness: 0.82, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.15, bumpScale: 0.3 },
  soft: { metalness: 0.04, roughness: 0.95, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0.6, bumpScale: 0.4 },
  rough: { metalness: 0.08, roughness: 0.9, clearcoat: 0, clearcoatRoughness: 0.5, sheen: 0, bumpScale: 1.2 },
  emboss: { metalness: 0.08, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.12, sheen: 0, bumpScale: 10 },
  spot: { metalness: 0.06, roughness: 0.85, clearcoat: 1, clearcoatRoughness: 0.03, sheen: 0, bumpScale: 1.4, spot: true }
};
const ACCENT = { olive: '#e8bf4f', eid: '#f4cf72', cheese: '#2a68c4', milk: '#2a68c4', coffee: '#e0a64a', industrial: '#ff7a33' };

export function createScene(canvas) {
  const gsap = window.gsap;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  // Phones and tablets: cap the pixel ratio at 1.5 (each stage is re-rendered and copied to a 2D canvas every frame) and run the
  // product tins at 30 fps. The scroll-scrubbed journey keeps full rate.
  const COARSE = window.matchMedia('(pointer: coarse)').matches;
  const maxDpr = () => (COARSE || window.innerWidth < 860 ? 1.5 : 2);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr()));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // real cast shadows: the tin throws a soft shadow onto an invisible floor under it (VSM gives a soft, photographic edge)
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMappingExposure = 1.0;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  // A bright, soft photo studio instead of a dim room: a luminous warm-white dome, big soft-boxes (they become the long, soft reflections on the lacquer and
  // the foil), vertical strip lights for the cylinder highlights, warm and cool rim strips and a warm bounce from the floor. Built once, 64 px per face.
  function studio() {
    const st = new THREE.Scene();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec3 vP; void main(){ float y = normalize(vP).y; vec3 top = vec3(0.95,0.93,0.9); vec3 mid = vec3(0.26,0.3,0.4); vec3 low = vec3(0.5,0.38,0.27); vec3 c = y > 0.0 ? mix(mid, top, pow(y,0.7)) : mix(mid, low, pow(-y,0.6)); gl_FragColor = vec4(c, 1.0); }'
    }));
    st.add(dome);
    const box = (w, h, x, y, z, rgb, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(rgb[0] * k, rgb[1] * k, rgb[2] * k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); st.add(m); return m;
    };
    box(26, 18, 0, 26, 2, [1, 0.97, 0.92], 1.8);          // overhead soft-box
    box(14, 20, -17, 6, 15, [1, 0.98, 0.95], 6);        // key soft-box, front left
    box(5, 24, 18, 3, 12, [0.96, 0.98, 1], 7);          // tall strip, front right (the long highlight on a cylinder)
    box(4, 22, -6, 3, 22, [1, 1, 1], 4);                // front strip, slightly left of the camera axis
    box(6, 26, -22, 4, -8, [1, 0.86, 0.6], 5);          // warm rim, back left
    box(6, 26, 22, 4, -10, [0.7, 0.85, 1], 4.5);          // cool rim, back right
    box(30, 14, 0, -18, 8, [1, 0.86, 0.66], 1.2);       // warm floor bounce
    return st;
  }
  scene.environment = pmrem.fromScene(studio(), 0.02).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 12);
  const DIST = 12, HALF_H = DIST * Math.tan(THREE.MathUtils.degToRad(15));

  // Studio lighting for product photography: a high soft key slightly to the left (it casts the shadow), a soft fill from the camera so no
  // printed face falls into darkness, and a lifted ambient. The printed artwork comes from photographs, so the light stays even and neutral.
  const key = new THREE.DirectionalLight(0xfff8ee, 1.0); key.position.set(-2.5, 9, 5); scene.add(key);
  key.castShadow = true;
  key.shadow.mapSize.set(COARSE ? 512 : 1024, COARSE ? 512 : 1024);
  Object.assign(key.shadow.camera, { left: -3.4, right: 3.4, top: 3.4, bottom: -3.4, near: 1, far: 30 });
  key.shadow.radius = 9; key.shadow.blurSamples = 16; key.shadow.bias = -0.0004;
  const front = new THREE.DirectionalLight(0xffffff, 0.4); front.position.set(0.5, 1.5, 10); scene.add(front);
  const fill = new THREE.HemisphereLight(0xffffff, 0xffe8c8, 0.45); scene.add(fill);       // lifted ambient: no crushed blacks
  const rimL = new THREE.PointLight(0xbcd6ff, 0, 40); rimL.position.set(-6, 2, 3); scene.add(rimL);   // cool
  const rimR = new THREE.PointLight(0xffb867, 0, 40); rimR.position.set(6, -1, 3); scene.add(rimR);   // gentle warm rim
  // a slow specular sweep: a warm point light drifts across the front of the tin every few seconds and glides over the gold
  const glint = new THREE.PointLight(0xfff0c8, 0, 60); glint.position.set(-8, 1.5, 4.5); scene.add(glint);
  const GLINT_PEAK = 70;

  const envMats = new Set();
  const env = { i: 1.0 };
  const syncEnv = () => envMats.forEach((m) => { m.envMapIntensity = env.i * (m.userData.envBase || 1); });

  /* ------------------------------------------------------------ materials */
  // Every tin surface uses the JC 3D Studio's light and tin shine (studio.js): the same look as the order platform, on any page.
  // metal: bare or lacquered tinplate of one colour (bottoms, wire, the oil tin's shoulder)
  function metalMat(color = '#e2e8f0') { return STU.surfaceMat(null, color); }
  function lacquerMat(color) { return STU.surfaceMat(null, color); }
  // L = layers of a printed surface: a photographed tin (halawah.js: map + relief + spot) or the printed artwork (art.js: map + ORM + relief variants)
  function printMat(L, side = THREE.FrontSide) {
    const m = STU.surfaceMat(L, L && L.metal ? '#d9dde4' : '#f8fafc', side);
    if (L && L.photo) m.userData.photo = L; else if (L && L.orm) m.userData.art = L;
    return m;
  }
  // the artwork of a surface: the Halawah tin's photographed artwork (every tin except the olive-oil tins), or the printed artwork from art.js
  const layersFor = (kind, theme, cw, aspect = 1, width = 0, reps = 0) => (theme === 'halawah'
    ? HAL.surface(kind, aspect, reps || Math.max(1, Math.round(width / 1.5)), DESIGN)
    : ART.layers(kind, theme, cw, aspect));
  // Finishes, in the studio's terms: its one tin-shine setting (metalShininess, 20 to 100 %; the studio's default is 85 %),
  // plus the relief of the motifs (embossing) and, for spot UV, full shine only on the motifs over a matte tin.
  const SFIN = {
    gloss: { shin: 0.85 }, matte: { shin: 0.2 }, soft: { shin: 0.15 }, rough: { shin: 0.3 }, emboss: { shin: 0.85, bumpK: 2.5 },
    spot: { shin: 0.2, spotShin: 1, spotGain: 1.7 }
  };
  function applyFinish(m, name, instant) {
    if (!m.userData.studio || !m.uniforms) return;
    const P = m.userData.photo, A = m.userData.art, f = SFIN[name] || SFIN.gloss;
    const bumpOf = (P ? (PFIN[name] || PFIN.gloss).bumpScale : A ? (FIN[name] || FIN.gloss).bumpScale : 0) * (f.bumpK || 1); // the studio's soft light needs deeper relief to read
    if (A) STU.setRelief(m, ART.reliefMap(A, (FIN[name] || FIN.gloss).bump));
    STU.setSpot(m, f.spotShin ? (P ? P.spot : A ? ART.reliefMap(A, 'plain') : null) : null);
    const U = m.uniforms, to = [[U.shin, f.shin], [U.spotShin, f.spotShin || f.shin], [U.spotGain, f.spotGain || 1], [U.bump, bumpOf]];
    to.forEach(([u, v]) => { if (instant) u.value = v; else gsap.to(u, { value: v, duration: 0.7, ease: 'power2.out' }); });
  }
  const accentOf = (theme, cw) => theme === 'halawah' ? HAL.DESIGNS[DESIGN].rim : theme === 'brand' ? ART.COLORWAYS[cw].foil[2] : ACCENT[theme];
  const skirtOf = (theme, cw) => theme === 'halawah' ? HAL.DESIGNS[DESIGN].skirt : theme === 'brand' ? ART.COLORWAYS[cw].body[0] : ACCENT[theme];

  /* ------------------------------------------------------------ model builders */
  // TRUE PROPORTIONS, in the factory's millimetres. Each builder takes u = millimetres per model unit; mountModel brings every tin
  // to a similar size on its stage (ext = visual height and footprint).
  // Construction (STU.rules, from the JC 3D Studio): the lid is a little wider than the body and sits flush on top of it; its skirt
  // is min(69 % of the height, 9.9 mm x min(1, width / 70 mm)) deep and shows the outer band of the lid's artwork drawn down over the
  // edge; a silver curled lip rolls round the skirt's lower edge; box corners are rounded at 3.5 mm; nothing at the foot (the
  // studio's base bead is off), except on seamed cans, whose double seams are real.
  const MM = 1 / 36.5, OIL_U = 2.75 / 350;
  const BARE = '#e2e6ec';          // the unprinted bottom
  const printedLid = (theme) => theme === 'brand' || theme === 'halawah';

  // A lid over an outline: the printed top, the skirt (the top's artwork drawn down over the edge), the curled lip.
  // outline: the lid's edge (studio.js outline); inner: the printed top's edge; topUv(x, z): the top's texture coordinate;
  // skirtUv(p, t): the skirt's (t = 0 at its lower edge); k: STU.rules of the tin, in mm; u: mm per unit
  function lidOn({ outline, inner, topUv, skirtUv, k, u, theme, cw, aspect = 1 }) {
    const g = new THREE.Group();
    const L = layersFor('lid', theme, cw, aspect), top = printMat(L);
    const SK = k.skirt / u;
    const skirtMat = printedLid(theme) && !(theme === 'halawah' && HAL.DESIGNS[DESIGN].plainSkirt) ? top : lacquerMat(skirtOf(theme, cw));
    g.add(new THREE.Mesh(STU.cap(inner, 0, true, topUv), top));
    g.add(new THREE.Mesh(STU.wall(outline, -SK, 0, skirtUv), skirtMat));
    const beadOf = theme === 'halawah' ? HAL.DESIGNS[DESIGN].bead : null;
    g.add(STU.ring(STU.grow(outline, k.beadOut / u), k.beadR / u, -SK - k.beadDrop / u, STU.beadMat(k.lipW, beadOf || 'silver')));
    g.userData.print = [top];
    return g;
  }
  // round or polygonal lid of radius R over a body of height H (units); sides > 24 = round; phi = angle of the first corner from +z
  function roundLid({ R, H, u, theme, cw, sides = 96, phi = 0, lidR = 0, skirtMm = 0, w = 0 }) {
    const k = STU.rules({ round: true, w: w || 2 * R * u, h: H * u });
    if (skirtMm) k.skirt = skirtMm;
    const LR = lidR || R + k.gap / u, discR = LR - k.inset / u, SK = k.skirt / u;
    const outline = STU.polygon(LR, sides, phi), inner = STU.polygon(discR, sides, phi);
    const topUv = (x, z) => [0.5 + x / (2 * discR), 0.5 - z / (2 * discR)];
    // round: exactly the studio's band, radius 0.5 (the artwork's edge) at the lip up to 0.5 - skirt / diameter at the top
    const strip = SK / (2 * discR);
    const skirtUv = sides > 24 ? (p, t) => { const r = 0.5 - strip * t; return [0.5 + p.nx * r, 0.5 - p.nz * r]; } : STU.skirtUv(topUv, SK);
    const g = lidOn({ outline, inner, topUv, skirtUv, k, u, theme, cw });
    g.position.y = H / 2 + k.lift / u; g.userData.skirt = SK;
    return g;
  }
  // (kept for the entrance: the Halawah lid over a body of radius R and height H)
  const lidParts = (R, H, theme, cw, metal, kk = 1, u = 36.5) => roundLid({ R, H, u, theme, cw });
  // a printed round body (open tube), its seam at the back
  function roundBody(R, Rb, H, theme, cw, sides = 96, phi = -Math.PI / 2, reps = 0) {
    const L = layersFor('wrap', theme, cw, H / (TAU * R), TAU * R, reps), m = printMat(L);
    let geo = new THREE.CylinderGeometry(R, Rb, H, sides, 1, true); if (sides <= 24) geo = facet(geo);
    const body = new THREE.Mesh(geo, m); body.rotation.y = phi;
    return { body, m };
  }
  const facet = (g) => { const f = g.toNonIndexed(); f.computeVertexNormals(); return f; };
  const disc = (R, y, sides = 96, phi = 0, up = false) => new THREE.Mesh(STU.cap(STU.polygon(R, sides, phi), y, up, () => [0.5, 0.5]), metalMat(BARE));

  function buildRound({ R = 1, H = 1.5, theme, cw, seamed = false, u = 36.5 }) {
    const group = new THREE.Group(), print = [];
    const { body, m } = roundBody(R, R, H, theme, cw); print.push(m);
    const bottom = disc(R, -H / 2);
    let lid;
    if (seamed) { // the real can has its end seamed on (a peel-off end), not a slip lid: a printed end just below a rolled double seam, and one at the foot
      const k = STU.rules({ round: true, w: 2 * R * u, h: H * u });
      lid = new THREE.Group(); lid.position.y = H / 2;
      const endMat = printMat(layersFor('lid', theme, cw));
      const endR = R - k.seamR / u;
      lid.add(new THREE.Mesh(STU.cap(STU.polygon(endR, 96), -k.seamR / u, true, (x, z) => [0.5 + x / (2 * endR), 0.5 - z / (2 * endR)]), endMat));
      const seam = () => STU.ring(STU.polygon(R + k.seamOut / u - k.seamR / u, 96), k.seamR / u, 0, STU.beadMat(k.seamW));
      lid.add(seam()); const foot = seam(); foot.position.y = -H / 2; group.add(foot);
      lid.userData.print = [endMat];
    } else lid = roundLid({ R, H, u, theme, cw });
    group.add(body, bottom, lid);
    print.push(...lid.userData.print);
    return { group, print, parts: { body, bottom, lid }, ext: { h: H + 0.05, w: 2 * (R + 0.06) }, lean: H / (2 * R) > 0.9 ? 0.16 : 0.3 };
  }
  // Square / rectangular box (sizes in mm): four printed sides that wrap round 3.5 mm corners, and a lid with a printed top.
  function buildGiftBox({ w, d, h, theme, cw }) {
    const k = STU.rules({ w, d, h }), u = 1 / MM;
    const W = w * MM, D = d * MM, Hh = h * MM, CR = k.corner * MM;
    const group = new THREE.Group();
    const sides = STU.boxSides(W / 2, D / 2, CR);
    const faceMat = (len) => printMat(layersFor('face', theme, cw, Hh / len, len));
    const front = faceMat(sides[0].total), side = faceMat(sides[1].total);
    const body = new THREE.Group();
    sides.forEach((pts, i) => body.add(new THREE.Mesh(STU.wall(pts, -Hh / 2, Hh / 2, (p, t) => [p.s / pts.total, t]), i % 2 ? side : front)));
    body.add(new THREE.Mesh(STU.cap(STU.roundRect(W / 2, D / 2, CR), -Hh / 2, false, () => [0.5, 0.5]), metalMat(BARE)));
    const G = k.gap * MM, LC = k.lidCorner * MM, IN = k.inset * MM;
    const ox = W / 2 + G - IN, oz = D / 2 + G - IN;
    const topUv = (x, z) => [(x + ox) / (2 * ox), (oz - z) / (2 * oz)];
    const lid = lidOn({
      outline: STU.roundRect(W / 2 + G, D / 2 + G, LC), inner: STU.roundRect(ox, oz, LC - IN), topUv,
      skirtUv: STU.skirtUv(topUv, k.skirt * MM), k, u, theme, cw, aspect: D / W
    });
    lid.position.y = Hh / 2 + k.lift * MM;
    group.add(body, lid);
    return { group, print: [front, side, ...lid.userData.print], parts: { body, lid, bottom: body }, ext: { h: Hh, w: Math.hypot(W, D) * 0.68 }, lean: Hh / Math.max(W, D) < 0.4 ? 0.5 : 0.18 };
  }
  // Olive-oil tin (sizes in mm): printed body, stepped shoulder, flat top, a ribbed screw cap on a spout and a carry handle.
  function buildOil({ theme, cw, w, d, h }) {
    const W = w * OIL_U, D = d * OIL_U, Ht = h * OIL_U;
    const group = new THREE.Group();
    const metal = metalMat('#e9edf3'), accent = metalMat(accentOf(theme, cw));
    const bh = Ht * 0.94, sl = Ht * 0.034, tp = Ht * 0.026, r = Math.min(W, D) * 0.05;
    const front = printMat(ART.layers('face', theme, cw, bh / W));
    const side = printMat(ART.layers('face', theme, cw, bh / D));
    const body = new THREE.Mesh(new RoundedBoxGeometry(W, bh, D, 6, r), [side, side, metal, metal, front, front]);
    body.position.y = -Ht / 2 + bh / 2;
    const shoulder = new THREE.Mesh(new RoundedBoxGeometry(W * 0.965, sl, D * 0.965, 4, sl * 0.4), metal); shoulder.position.y = -Ht / 2 + bh + sl / 2 - 0.004;
    const plate = new THREE.Mesh(new RoundedBoxGeometry(W * 0.9, tp, D * 0.9, 4, tp * 0.45), metal); plate.position.y = -Ht / 2 + bh + sl + tp / 2 - 0.008;
    const topY = -Ht / 2 + bh + sl + tp - 0.008;
    // spout and ribbed cap (the cap is a toothed disc, extruded)
    const rr = Math.min(W, D) * 0.12, cap = new THREE.Group(); cap.position.set(W * 0.27, topY, 0);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.8, rr * 0.92, rr * 0.7, 36), metal); neck.position.y = rr * 0.35;
    const teeth = 26, sh = new THREE.Shape();
    for (let i = 0; i < teeth * 2; i++) { const a = (i / (teeth * 2)) * TAU, q = i % 2 ? rr * 0.9 : rr * 1.04; i ? sh.lineTo(Math.cos(a) * q, Math.sin(a) * q) : sh.moveTo(q, 0); }
    const capGeo = new THREE.ExtrudeGeometry(sh, { depth: rr * 0.75, bevelEnabled: true, bevelSize: rr * 0.05, bevelThickness: rr * 0.05, bevelSegments: 2, curveSegments: 1 });
    const capMesh = new THREE.Mesh(capGeo, accent); capMesh.rotation.x = -Math.PI / 2; capMesh.position.y = rr * 0.55;
    const ringM = new THREE.Mesh(new THREE.TorusGeometry(rr * 0.96, rr * 0.07, 8, 36), metal); ringM.rotation.x = Math.PI / 2; ringM.position.y = rr * 0.5;
    cap.add(neck, capMesh, ringM);
    // carry handle: a rounded loop standing on two small lugs
    const hx0 = -W * 0.3, hx1 = W * 0.02, hh = Math.max(0.24, Ht * 0.09), tr = Math.max(0.034, Math.min(W, D) * 0.04);
    const hp = new THREE.CatmullRomCurve3([
      new THREE.Vector3(hx0, 0, 0), new THREE.Vector3(hx0, hh * 0.72, 0), new THREE.Vector3(hx0 + hh * 0.5, hh, 0),
      new THREE.Vector3(hx1 - hh * 0.5, hh, 0), new THREE.Vector3(hx1, hh * 0.72, 0), new THREE.Vector3(hx1, 0, 0)
    ], false, 'catmullrom', 0.25);
    const handle = new THREE.Mesh(new THREE.TubeGeometry(hp, 40, tr, 8, false), metal); handle.position.y = topY;
    const lug = (x) => { const l = new THREE.Mesh(new RoundedBoxGeometry(tr * 3.2, tr * 1.6, tr * 3.2, 2, tr * 0.5), metal); l.position.set(x, topY + tr * 0.4, 0); return l; };
    group.add(body, shoulder, plate, cap, handle, lug(hx0), lug(hx1));
    return { group, print: [front, side], parts: { body, lid: cap, bottom: body }, ext: { h: Ht + rr * 1.4, w: Math.hypot(W, D) * 0.9 } };
  }
  // Round or polygonal tin (sides = 6 hexagon, 8 octagon, 96 round) whose lid skirt covers the top of the body, and an optional
  // bucket form (tapered body + wire handle). R, H in units of u mm.
  function buildTin({ sides = 96, R = 1, H = 0.44, skirtH = 0, taper = 1, bucket = false, vertexFront = false, stretch = 1, lidR = 0, u = 100, theme, cw }) {
    const round = sides > 24, group = new THREE.Group();
    const phi = vertexFront ? 0 : Math.PI / sides;           // polygons: a flat face (not a corner) looks at the visitor, unless vertexFront
    const k = STU.rules({ round: true, w: 2 * R * u, h: H * u });
    const SK = skirtH || k.skirt / u, Rb = R * taper;
    const lid = roundLid({ R, H, u, theme, cw, sides, phi: round ? 0 : phi, lidR: lidR ? R * lidR : 0, skirtMm: skirtH ? skirtH * u : 0 });
    const bodyTop = H / 2 - SK * 0.75, bodyH = bodyTop + H / 2;  // the body runs up under the skirt
    const { body, m } = roundBody(R, Rb, bodyH, theme, cw, sides, round ? -Math.PI / 2 : phi, theme === 'halawah' ? (round ? 8 : sides) : 0);
    body.position.y = -H / 2 + bodyH / 2;
    const bottom = disc(Rb, -H / 2, sides, round ? 0 : phi);
    group.add(body, bottom, lid);
    let h = H + 0.03;
    if (bucket) { // wire bail on two ears, resting folded back
      const wire = metalMat('#b8c0cc');
      const ear = (s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), wire); e.scale.set(1, 1.3, 0.5); e.position.set(s * (R + 0.015), H / 2 - SK - 0.12, 0); return e; };
      const bail = new THREE.Mesh(new THREE.TorusGeometry(R + 0.03, 0.022, 8, 64, Math.PI), wire);
      bail.position.y = H / 2 - SK - 0.12; bail.rotation.x = -1.15; // leaning back over the lid
      group.add(ear(-1), ear(1), bail); h += 0.25;
    }
    if (stretch !== 1) group.scale.x = stretch;   // an elongated tin (the octagonal sweets tin)
    const LR = lidR ? R * lidR : R + k.gap / u;
    // low tins lean towards the visitor a little more, so the printed lid reads
    return { group, print: [m, ...lid.userData.print], parts: { body, bottom, lid }, ext: { h, w: 2 * LR * stretch }, lean: H <= 0.6 ? 0.36 : 0 };
  }
  const gift = (o) => (t, c) => buildGiftBox({ ...o, theme: t, cw: c });
  // Real tins, each at the proportions measured on its photograph (camera focal length from EXIF + the corners of the lid), with its own
  // kind of lid. Nothing is added that the real tin does not have (the bucket has no wire handle; the food and milk cans have seamed ends).
  const OWN_SHAPE = { qaisi: 'round', halawah: 'round', sufyan: 'tuna', najmah: 'octagon', frieds: 'bucket', abed: 'can', maeen: 'milk', laqmi: 'cheese', bab: 'square', jgz: 'rect', suliman: 'tall', levelmax: 'coffee' };
  const REAL = {
    qaisi: (t, c) => buildTin({ u: 118.8, H: 60 / 118.8, skirtH: 15.7 / 118.8, theme: t, cw: c }), // catalogue rd-235 at 6 cm: Ø237.6 x 60 mm, skirt 15.7 mm (measured on the photo)
    halawah: (t, c) => buildTin({ u: 118.8, H: 49 / 118.8, theme: t, cw: c }),                             // catalogue rd-235: Ø237.6 x 49 mm
    sufyan: (t, c) => buildTin({ u: 134.5, H: 50 / 134.5, theme: t, cw: c }),                              // catalogue rd-265: Ø269 x 50 mm
    najmah: (t, c) => buildTin({ sides: 8, H: 0.6, u: 80, vertexFront: true, stretch: 1.87, theme: t, cw: c }), // octagon, length 1.87 x depth
    frieds: (t, c) => buildTin({ R: 1, H: 1.62, taper: 0.77, skirtH: 0.22, lidR: 1.2, u: 90, theme: t, cw: c }),      // bucket, H/D 0.81, bottom 0.77 of top, lid wider than the body
    abed: (t, c) => buildRound({ R: 1, H: 2.5, seamed: true, theme: t, cw: c }),                               // food can, H/D 1.25, peel-off end
    maeen: (t, c) => buildRound({ R: 1, H: 2.28, seamed: true, theme: t, cw: c }),                             // milk powder can, H/D 1.14
    laqmi: (t, c) => buildRound({ R: 1, H: 2.36, u: 50, theme: t, cw: c }),                                          // round can with a slip lid, H/D 1.18
    bab: gift({ w: 194.5, d: 194.5, h: 40 }),                                                                  // catalogue sq-20: 194.5 x 194.5 x 40 mm
    jgz: gift({ w: 236.1, d: 137.7, h: 50 }),                                                                  // catalogue rc-14x24: 236.1 x 137.7 x 50 mm
    suliman: gift({ w: 70, d: 60, h: 88 }),                                                  // tall tea tin, D/W 0.85, H/W 1.26
    levelmax: gift({ w: 110, d: 67, h: 98 })                                               // tea caddy, D/W 0.61, H/W 0.89
  };
  const can = (dia, h) => (t, c) => buildRound({ R: (dia / 2) * MM, H: h * MM, theme: t, cw: c });
  const oil = (w, d, h, pow = 0.5) => (t, c) => { const m = buildOil({ theme: t, cw: c, w, d, h }); m.pow = pow; return m; };
  const SHAPES = {
    // the signature tin: the Halawah round tin (low and wide, red lid, white band), or the tall printed round tin for the brand colourways
    round: (t, c) => (t === 'halawah' ? buildTin({ theme: t, cw: c }) : buildRound({ R: 1, H: 1.5, theme: t, cw: c })),
    // the real octagonal tin is elongated with a corner towards the visitor; the generic one is regular, a face forward
    octagon: (t, c) => (t === 'halawah' && DESIGN === 'najmah'
      ? buildTin({ sides: 8, H: 0.5, vertexFront: true, stretch: HAL.DESIGNS.najmah.stretch, theme: t, cw: c })
      : buildTin({ sides: 8, theme: t, cw: c })),
    hexagon: (t, c) => buildTin({ sides: 6, theme: t, cw: c }),
    bucket: (t, c) => buildTin({ R: 1, H: 1.25, taper: 0.84, skirtH: 0.2, bucket: true, theme: t, cw: c }),
    square: gift({ w: 160, d: 160, h: 42 }),                  // template: square box, short body (lid 160, body 152)
    rect: gift({ w: 175, d: 105, h: 62 }),                    // rectangular gift tin (no template: illustrative)
    oval: (t, c) => { const m = buildRound({ R: 1, H: 1.2, theme: t, cw: c }); m.group.scale.set(1.4, 1, 0.8); m.ext = { h: 1.4, w: 2.3 }; return m; },
    // olive oil: 4 L (rectangular, 175 x 115 x 245) and 16 kg (square, 235 x 235 x 350) are exact; the 1 L and 8 L tins are the 4 L family scaled (no template)
    oil: oil(175, 115, 245),
    oil1: oil(110, 72, 154),
    oil4: oil(175, 115, 245),
    oil8: oil(220, 145, 309),
    oil16: oil(235, 235, 350),
    can: can(73, 110),                                                          // 400 g food can
    cheese: can(99, 119),                                                       // 1 kg cheese / halawa can
    tuna: can(83, 38),                                                          // tuna can
    milk: can(120, 165),                                                        // milk powder: the larger can family (no template: scaled up from the 1 kg can)
    box70: gift({ w: 70, d: 70, h: 32 }),                   // small square box
    tall: gift({ w: 70, d: 70, h: 130 }),                   // tall square box
    coffee: gift({ w: 70, d: 70, h: 130 }),
    paint: (t, c) => {
      const m = buildRound({ R: 1.15, H: 1.45, theme: t, cw: c });
      const bail = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.03, 8, 64, Math.PI), metalMat('#9aa3b1', 0.3));
      bail.position.y = 1.45 / 2 + 0.16; m.group.add(bail);
      return m;
    }
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
    hero: { shape: 'round', theme: 'halawah', cw: 0, finish: 'gloss' },
    finish: { shape: 'round', theme: 'halawah', cw: 0, finish: 'gloss' },
    shapes: { shape: 'round', theme: 'halawah', cw: 0, finish: 'gloss' },
    seasons: { shape: 'oil', theme: 'olive', cw: 0, finish: 'gloss' }
  };
  const POSES = { hero: { ry: -0.55, rx: 0.2, s: 1.0 }, finish: { ry: 0.35, rx: 0.16, s: 1.05 }, shapes: { ry: -0.45, rx: 0.22, s: 1.0 }, seasons: { ry: 0.5, rx: 0.18, s: 1.05 } };
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };

  // a soft four-pointed star, drawn once (64 px): the sparkle that twinkles around every tin
  const starTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.18, 'rgba(255,240,190,.9)'); g.addColorStop(1, 'rgba(255,220,130,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(32, 1); x.quadraticCurveTo(34, 30, 63, 32); x.quadraticCurveTo(34, 34, 32, 63); x.quadraticCurveTo(30, 34, 1, 32); x.quadraticCurveTo(30, 30, 32, 1); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const SPK = 14;
  function makeSparkles() {
    const pos = new Float32Array(SPK * 3), col = new Float32Array(SPK * 4), ph = [];
    for (let i = 0; i < SPK; i++) {
      const a = (i / SPK) * TAU * 1.7 + Math.random() * 0.5, r = 1.15 + Math.random() * 0.75;
      pos[i * 3] = Math.cos(a) * r * 1.05; pos[i * 3 + 1] = (Math.random() - 0.5) * 2.5; pos[i * 3 + 2] = Math.sin(a) * r * 0.6 + 0.3;
      col[i * 4] = 1; col[i * 4 + 1] = 0.9; col[i * 4 + 2] = 0.62; col[i * 4 + 3] = 0;
      ph.push([Math.random() * 6.28, 0.5 + Math.random() * 0.7]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 4));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: starTex, size: 0.22, sizeAttenuation: true, vertexColors: true, transparent: true, depthWrite: false }));
    pts.frustumCulled = false; pts.visible = !REDUCED;
    return { pts, tick(now) { for (let i = 0; i < SPK; i++) { const v = Math.sin(now / 1000 * ph[i][1] * 1.6 + ph[i][0]); col[i * 4 + 3] = Math.pow(Math.max(0, v), 7) * 0.95; } geo.attributes.color.needsUpdate = true; } };
  }

  function makeProduct(name, cfg = {}) {
    const root = new THREE.Group(); root.visible = false; scene.add(root);
    const tilt = new THREE.Group(); root.add(tilt);
    const holder = new THREE.Group(); tilt.add(holder);
    // contact shadow (a soft dark patch right under the tin) + the cast shadow on an invisible floor; both sit on the tin's base and lean with it
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 }));
    shadow.rotation.x = -Math.PI / 2; tilt.add(shadow);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.22, transparent: true, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; tilt.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 96), new THREE.MeshBasicMaterial({ color: 0xf2a93b, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; root.add(ring);
    const sparkles = makeSparkles(); root.add(sparkles.pts);

    const S = { ...(INITIAL[name] || INITIAL.hero), ...cfg }, pose = POSES[name] || POSES.hero;
    let model = null, transitioning = false, pending = null, idle = -pose.ry, spinYaw = 0, spinV = 0; // idle starts so that the front of the tin (the logo) faces the visitor
    const bob = Math.random() * 6;
    const modelSize = new THREE.Vector3(2, 2, 2);

    function mountModel() {
      if (model) {
        holder.remove(model.group);
        model.group.traverse((o) => { // free the old tin's geometry and materials (textures stay cached in art.js)
          if (o.geometry) o.geometry.dispose();
          if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { envMats.delete(m); m.dispose(); });
        });
      }
      // every tin wears the Halawah artwork except the olive-oil tins, which keep their own printed design
      const theme = S.theme === 'halawah' && S.shape.startsWith('oil') ? 'olive' : S.theme;
      DESIGN = theme === 'halawah' ? DESIGN_FOR[S.shape] || 'halawah' : 'halawah';
      model = (theme === 'halawah' && REAL[DESIGN] && OWN_SHAPE[DESIGN] === S.shape ? REAL[DESIGN] : SHAPES[S.shape])(theme, S.cw);
      DESIGN = 'halawah';
      // bring very different tins (flat tuna can, tall box, big oil tin) to a similar size on the stage; pow < 1 keeps some of the size difference (olive-oil sizes)
      const ext = model.ext || { h: 2, w: 2 };
      model.group.scale.multiplyScalar(clamp(Math.pow(2.12 / Math.max(ext.h, ext.w), model.pow || 1), 0.25, 1.8));
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
      model.group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      shadow.position.y = -modelSize.y / 2 + 0.004; floor.position.y = -modelSize.y / 2;
      shadow.scale.set(modelSize.x * 1.25, modelSize.z * 1.25, 1);
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
      // box-shaped tins use one mesh for body and bottom: two from() tweens on it would end at the first tween's start value (tin lost off screen)
      if (p.bottom !== p.body) tl.from(p.bottom.position, { y: -9, duration: 1.0, ease: 'power4.out' }, 0.1);
      tl.from(p.body.position, { y: -7, duration: 1.1, ease: 'power4.out' }, 0)
        .from(p.body.rotation, { y: -Math.PI * 5, duration: 1.4, ease: 'power3.out' }, 0)
        .from(p.body.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 1.0, ease: 'back.out(1.4)' }, 0)
        .from(p.lid.position, { y: 7, duration: 0.9, ease: 'bounce.out' }, 0.75)
        .from(p.lid.rotation, { y: Math.PI * 3, duration: 1.0, ease: 'power3.out' }, 0.75)
        .add(burst, 1.45);
      return tl;
    }
    const inst = {
      name, root, S, shadow, apply, intro, kind: 'product',
      hold: null, // review / OG captures: a fixed yaw (radians) instead of the idle turn
      holdX: null, // and a fixed tilt (side-by-side checks against the JC 3D Studio's view)
      // p: where the stage is in the viewport (-1 just left through the top … 0 centred … +1 just entering from below)
      // vel: smoothed scroll speed (-1…1). The tin stays put but turns, floats and leans with the scroll.
      update(dt, now, p = 0, vel = 0) {
        idle += dt * 0.28; spinYaw += spinV; spinV *= 0.94;
        tilt.rotation.x = this.holdX !== null ? this.holdX : pose.rx + (model.lean || 0) + ptr.sy * 0.18 + p * 0.12 + vel * 0.16;
        tilt.rotation.y = this.hold !== null ? this.hold : pose.ry + idle + spinYaw + ptr.sx * 0.35 - p * 1.25;
        if (this.hold !== null && !transitioning) holder.rotation.y = 0; // a fixed yaw is the tin's own, without the spin a shape change adds
        tilt.rotation.z = vel * 0.06;
        root.position.y = Math.sin(now / 1300 + bob) * 0.045 - p * 0.16 + vel * 0.08;
        if (!REDUCED) sparkles.tick(now);
      },
      layout(w, h, px2w) {
        const sc = Math.max(0.001, (0.9 * Math.min(w, h) * px2w / 2.9) * pose.s * (window.innerWidth < 700 ? Math.min(S.scale || 1, 1.12) : S.scale || 1)); root.scale.setScalar(sc); // phones: a smaller boost, the tin keeps its margins
        sparkles.pts.material.size = 0.24 * sc * (2 * HALF_H / px2w) / (0.268 * bufH); // world size -> point size (see the note in makeSparkles)
      },
      spin(dx) { spinV += dx * 0.004; }
    };
    instances.push(inst); byName[name] = inst;
    return inst;
  }


  /* ------------------------------------------------------------ journey rig (built only on pages that have a journey stage) */
  let J = null;
  function makeJourney() {
    DESIGN = 'qaisi'; // the entrance shows the main tin (Al Qaisi)
    const journey = new THREE.Group(); journey.visible = false; scene.add(journey);
    const JR = 1, JH = 60 / 118.8, JW = TAU * JR, N = 160; // the main tin (rd-235, 60 mm): a long low band rolled into a wide ring
    const aspect = JH / JW;
    const blank = ART.blankSheetCanvas(2048, Math.round(2048 * aspect));
    const hal = HAL.surface('wrap', aspect, 2, DESIGN), printed = hal.canvas;
    const sheetCanvas = document.createElement('canvas'); sheetCanvas.width = blank.width; sheetCanvas.height = blank.height;
    const sheetTex = new THREE.CanvasTexture(sheetCanvas); sheetTex.colorSpace = THREE.SRGBColorSpace; sheetTex.anisotropy = 8;
    let lastPrint = -1;
    function drawSheet(pr) {
      const x = sheetCanvas.getContext('2d');
      x.drawImage(blank, 0, 0);
      if (pr < 1) {
        x.save(); x.globalAlpha = (1 - pr) * 0.7; x.strokeStyle = ART.PAL.n400; x.lineWidth = 3; x.setLineDash([22, 14]);
        x.strokeRect(24, 24, sheetCanvas.width - 48, sheetCanvas.height - 48);
        x.beginPath(); x.moveTo(sheetCanvas.width / 2, 0); x.lineTo(sheetCanvas.width / 2, sheetCanvas.height); x.stroke(); x.restore();
      }
      if (pr > 0) { x.save(); x.beginPath(); x.rect(0, 0, sheetCanvas.width * pr, sheetCanvas.height); x.clip(); x.drawImage(printed, 0, 0); x.restore(); }
      sheetTex.needsUpdate = true;
    }
    drawSheet(0);
    hal.ready.then(() => { lastPrint = -1; drawSheet(sstep(0.17, 0.36, jState.p)); }); // redraw once the artwork has arrived

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
    const sheetMat = STU.surfaceMat({ map: sheetTex }, '#f8fafc', THREE.DoubleSide); // the same studio light as the finished tin
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    const sheetRig = new THREE.Group(); sheetRig.add(sheet); journey.add(sheetRig);
    bendSheet(0);

    const jMetal = metalMat(HAL.GOLD, 0.24);
    const capBottom = new THREE.Mesh(new THREE.CircleGeometry(JR, 64), jMetal); capBottom.rotation.x = Math.PI / 2; capBottom.position.y = -JH / 2;
    const capTop = roundLid({ R: JR, H: JH, u: 118.8, theme: 'halawah', cw: 0, skirtMm: 15.7 }); // the main tin's scale (rd-235) capTop.position.y = JH / 2 + 3;
    sheetRig.add(capBottom, capTop);

    const head = new THREE.Mesh(new THREE.PlaneGeometry(0.06, JH + 0.5), new THREE.MeshBasicMaterial({ color: 0xffb454, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    sheetRig.add(head);

    // pallet of mini tins
    const pallet = new THREE.Group(); journey.add(pallet);
    const miniR = 0.4, miniH = 0.18, LAYERS = 3;
    const miniBodyGeo = new THREE.CylinderGeometry(miniR, miniR, miniH, 40, 1, true);
    const miniTopGeo = new THREE.CircleGeometry(miniR + 0.02, 40);
    const miniBodyMat = printMat(layersFor('wrap', 'halawah', 0, miniH / (TAU * miniR), 0, 3));
    const miniTopMat = printMat(layersFor('lid', 'halawah', 0));
    const miniSkirtGeo = new THREE.CylinderGeometry(miniR + 0.02, miniR + 0.02, 0.07, 40, 1, true), miniSkirtMat = lacquerMat(HAL.DESIGNS[DESIGN].skirt);
    const minis = [];
    for (let layer = 0; layer < LAYERS; layer++) for (let ix = 0; ix < 3; ix++) for (let iz = 0; iz < 3; iz++) {
      const g = new THREE.Group();
      const b = new THREE.Mesh(miniBodyGeo, miniBodyMat); b.rotation.y = -Math.PI / 2;
      const t = new THREE.Mesh(miniTopGeo, miniTopMat); t.rotation.x = -Math.PI / 2; t.position.y = miniH / 2 + 0.03;
      const sk = new THREE.Mesh(miniSkirtGeo, miniSkirtMat); sk.position.y = miniH / 2 - 0.005;
      g.add(b, t, sk);
      g.position.set((ix - 1) * 0.86, 0.18 + miniH / 2 + layer * (miniH + 0.06), (iz - 1) * 0.86);
      g.userData.order = (layer * 9 + ix * 3 + iz);
      g.scale.setScalar(0.001);
      pallet.add(g); minis.push(g);
    }
    const wood = new THREE.MeshStandardMaterial({ color: '#b98a54', roughness: 0.85, metalness: 0 });
    for (let i = -1; i <= 1; i++) { const pl = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.06, 0.5), wood); pl.position.set(0, 0.03, i * 0.95); pallet.add(pl); }
    for (let i = -1; i <= 1; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 2.8), wood); bl.position.set(i * 1.2, 0.0, 0); pallet.add(bl); }
    const wrapFilm = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.9, 2.9), new THREE.MeshPhysicalMaterial({ color: ART.PAL.n100, transparent: true, opacity: 0.12, roughness: 0.1, metalness: 0, clearcoat: 1 }));
    wrapFilm.position.y = 0.18 + 0.45; pallet.add(wrapFilm);
    pallet.position.y = -1.0; pallet.visible = false;

    // globe
    const globe = new THREE.Group(); journey.add(globe); globe.visible = false;
    const globeTilt = new THREE.Group(); globe.add(globeTilt);
    const GR = 1.45;
    const ll = (lat, lon, r = GR) => { const a = THREE.MathUtils.degToRad(lat), o = THREE.MathUtils.degToRad(lon); return new THREE.Vector3(r * Math.cos(a) * Math.sin(o), r * Math.sin(a), r * Math.cos(a) * Math.cos(o)); };
    // The globe is a self-lit "planet": a deep-navy sphere (Pantone 294 C family) with a rim glow and bright land dots, so it looks
    // identical in light and dark mode. Land comes from Natural Earth (public domain), rasterised once.
    {
      const n = 9000, p = new Float32Array(n * 3), col = new Float32Array(n * 3), lonlat = new Float32Array(n * 2);
      const land = new THREE.Color('#ffe9a6'), sea = new THREE.Color(ART.PAL.n400);
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
        fragmentShader: 'varying vec3 vN; void main(){ float f = pow(1.0 - abs(vN.z), 2.2); vec3 c = mix(vec3(0.02,0.13,0.32), vec3(0.14,0.34,0.62), f); c += vec3(0.02,0.05,0.1) * (vN.y*0.5+0.5); gl_FragColor = vec4(c,1.0); }'
      });
      globeTilt.add(new THREE.Mesh(new THREE.SphereGeometry(GR * 0.99, 64, 48), planet));
      const halo = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.BackSide,
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vN; void main(){ float f = pow(1.0 - abs(vN.z), 2.6); gl_FragColor = vec4(0.45,0.6,0.85, f*0.6); }'
      });
      globe.add(new THREE.Mesh(new THREE.SphereGeometry(GR * 1.1, 64, 48), halo));

      fetch(new URL('../../data/land-110m.geojson', import.meta.url)).then((r) => r.json()).then((gj) => {
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
      const flatScale = lerp(1, 1.9, bend);
      sheetRig.scale.setScalar(appear * flatScale * (1 - pal));
      // printing head
      head.visible = print > 0.001 && print < 0.999 && bend < 0.01;
      head.position.set((print - 0.5) * JW, 0, 0.02);

      pallet.visible = pal > 0.001 && gl < 0.999;
      minis.forEach((m) => { const t = clamp(pal * 20 - m.userData.order * 0.6, 0, 1); m.scale.setScalar(Math.max(0.001, 1 - Math.pow(1 - t, 3))); m.rotation.y = (1 - t) * 3; });
      wrapFilm.material.opacity = 0.12 * sstep(0.84, 0.88, p);
      pallet.scale.setScalar(lerp(1.5, 0.001, gl));
      pallet.position.y = lerp(-1.5, 1.4, gl);
      pallet.rotation.y = pal * 1.2 + p * 3;

      globe.visible = gl > 0.001;
      globe.scale.setScalar(Math.max(0.001, gl * 1.5));
      arcs.forEach((g, i) => g.setDrawRange(0, Math.floor(65 * clamp((gl - 0.2 - i * 0.07) / 0.5))));
    }

    const journeyInst = {
      name: 'journey', root: journey, kind: 'journey',
      update(dt, now) { if (journey.visible) globeTilt.rotation.y = GLOBE_Y + Math.sin(now / 3000) * 0.08 + ptr.sx * 0.2; },
      layout(w, h, px2w) { journey.scale.setScalar(Math.max(0.001, Math.min((w * px2w) / (JW + 0.6), (h * px2w) / 3.7))); }
    };
    return { journey, pallet, globe, setJourney, inst: journeyInst };
  }
  const ensureJourney = () => (J || (J = makeJourney()));

  /* ------------------------------------------------------------ per-stage rendering */
  // Each .stage owns its own <canvas>. One shared WebGL renderer draws that stage's rig, and the picture is copied into
  // the stage's canvas. Because the picture lives INSIDE the stage element, it scrolls with the page natively and can never
  // drift away from its place, whatever the scroll method, speed or frame rate.
  const OVER = 0.12; // each canvas bleeds 12% past its stage so tilted tins never clip
  let frameNo = 0, stages = [], bufW = 1, bufH = 1, running = true, last = performance.now(), lastScrollY = window.scrollY, scrollVel = 0;

  function refreshStages() {
    stages.forEach((s) => s.cv.remove()); stages = [];
    document.querySelectorAll('.stage').forEach((el) => {
      const cv = document.createElement('canvas'); cv.className = 'stage__cv'; cv.setAttribute('aria-hidden', 'true'); el.prepend(cv);
      const name = el.dataset.rig === 'journey' ? 'journey' : (el.dataset.pose || 'hero');
      const cfg = {};
      ['shape', 'theme', 'finish'].forEach((k) => { if (el.dataset[k]) cfg[k] = el.dataset[k]; });
      if (el.dataset.cw) cfg.cw = +el.dataset.cw;
      if (el.dataset.scale) cfg.scale = +el.dataset.scale; // a stage can show its tin larger (the home hero)
      const inst = name === 'journey' ? ensureJourney().inst : (byName[name] || makeProduct(name, cfg));
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
    instances.forEach((i) => { i.root.visible = false; }); if (J) J.journey.visible = false;
    st.inst.root.visible = true;
    const vh = window.innerHeight, p = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2)));
    st.inst.update(dt, now, p, scrollVel);
    st.inst.layout(r.width, r.height, (2 * HALF_H) / ch);
    camera.aspect = cw / ch; camera.updateProjectionMatrix();
    renderer.setViewport(0, 0, cw, ch);
    renderer.render(scene, camera);
    st.ctx.clearRect(0, 0, pw, ph);
    st.ctx.drawImage(renderer.domElement, 0, renderer.domElement.height - ph, pw, ph, 0, 0, pw, ph);
    if (!st.shown) { st.shown = true; st.cv.classList.add('is-on'); st.el.classList.add('has-cv'); }
  }
  function frame(dt, now) {
    ptr.sx += (ptr.x - ptr.sx) * 0.06; ptr.sy += (ptr.y - ptr.sy) * 0.06;
    const y = window.scrollY, v = (y - lastScrollY) / Math.max(dt, 1 / 120); lastScrollY = y;
    scrollVel += (Math.max(-1, Math.min(1, v / 2200)) - scrollVel) * 0.12; // eases back to 0 when scrolling stops
    frameNo++;
    // the gold's slow specular sweep: a glint crosses the front of the tin, rests, and crosses again
    if (REDUCED) { glint.position.set(-2.5, 1.8, 5); glint.intensity = GLINT_PEAK * 0.3; }
    else {
      const ph = ((now / 1000) % 8) / 8, u = clamp(ph / 0.5);
      glint.position.set(lerp(-7.5, 7.5, u), 1.2 + Math.sin(ph * TAU) * 0.8, 4.5);
      glint.intensity = ph < 0.5 ? GLINT_PEAK * Math.pow(Math.sin(Math.PI * u), 2) : 0;
    }
    STU.SWEEP.x.value = REDUCED ? -0.35 : lerp(-1.3, 1.3, clamp(((now / 1000) % 8) / 4));
    STU.SWEEP.amt.value = REDUCED ? 0.5 : glint.intensity / GLINT_PEAK;
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
    // both themes are bright: the dark page keeps its dark background, but the tin is lit like a product shot (the halo behind it is in site.css)
    const to = { exposure: dark ? 1.05 : 1.0, env: dark ? 1.0 : 0.95, key: dark ? 1.05 : 1.0, rimL: dark ? 22 : 8, rimR: dark ? 26 : 12, shadow: dark ? 0.3 : 0.45 };
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
      [ART.layers('lid', 'olive', 0), HAL.surface('lid')].forEach((L) => {
        const m = printMat(L); applyFinish(m, f, true);
        const mesh = new THREE.Mesh(geo, m); scene.add(mesh); tmp.push(mesh);
      });
    });
    const vis = instances.map((i) => i.root.visible), jv = J ? [J.journey.visible, J.pallet.visible, J.globe.visible] : [];
    instances.forEach((i) => { i.root.visible = true; }); if (J) J.journey.visible = J.pallet.visible = J.globe.visible = true;
    try { await renderer.compileAsync(scene, camera); } catch (e) { /* fine: compiled lazily instead */ }
    instances.forEach((i, n) => { i.root.visible = vis[n]; }); if (J) [J.journey.visible, J.pallet.visible, J.globe.visible] = jv;
    tmp.forEach((m) => { scene.remove(m); m.material.dispose(); envMats.delete(m.material); });
  }

  return {
    refreshStages, pruneStages, setJourney: (p) => { if (J) J.setJourney(p); }, setTheme, resize, warm, advance, tick,
    instance: (name) => byName[name],
    intro: () => (byName.hero ? byName.hero.intro() : null),
    hasJourney: () => !!J,
    setPointer: (x, y) => { ptr.x = x; ptr.y = y; },
    spin: (el, dx) => { const s = stages.find((t) => t.el === el); if (s && s.inst.spin) s.inst.spin(dx); },
    debug: () => stages.map((s) => { const r = s.el.getBoundingClientRect(); return { pose: s.inst.name, canvas: s.cv.width + 'x' + s.cv.height, stage: Math.round(r.width) + 'x' + Math.round(r.height), top: Math.round(r.top), shown: s.shown }; })
  };
}
