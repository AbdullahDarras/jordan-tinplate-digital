// The studio every 3D view on the site shares: the brand's navy backdrop, the dark soft-box studio the metal reflects, the lights,
// the shadow floor and the soft contact shadows, plus the colour-keeping tone curve. Used by the home film and the inner pages.
import * as THREE from 'three';
import { LuminosityHighPassShader } from 'three/addons/shaders/LuminosityHighPassShader.js';

// The bloom blurs the bright pixels over a chain of smaller images: one invalid pixel (NaN) anywhere would spread into black
// blocks. Its input is cleaned first (NaN and negative values become black). x != x is true only for NaN.
if (!LuminosityHighPassShader.fragmentShader.includes('clean(')) {
  LuminosityHighPassShader.fragmentShader = LuminosityHighPassShader.fragmentShader
    .replace('void main() {', 'vec4 clean( vec4 c ) { return vec4( c.r != c.r ? 0.0 : max( c.r, 0.0 ), c.g != c.g ? 0.0 : max( c.g, 0.0 ), c.b != c.b ? 0.0 : max( c.b, 0.0 ), c.a != c.a ? 1.0 : c.a ); }\n\t\tvoid main() {')
    .replace('vec4 texel = texture2D( tDiffuse, vUv );', 'vec4 texel = clean( texture2D( tDiffuse, vUv ) );');
}

// Tone mapping that keeps colour. The stock filmic curve squeezes each channel on its own, so bright gold drifts to white and
// printed colour goes pale. This curve shapes the brightness of the brightest channel and scales the colour by the same factor,
// so hue and saturation survive; only the very hottest glints roll off towards white, as they do on camera.
const HUE_KEEPING_TONE = `
vec3 ACESFilmicToneMapping( vec3 color ) {
  color = max( color * toneMappingExposure, vec3( 0.0 ) ); // never negative (nor NaN on most GPUs) before the curve
  float m = max( max( color.r, color.g ), color.b );
  float t = ( m * ( 2.51 * m + 0.03 ) ) / ( m * ( 2.43 * m + 0.59 ) + 0.14 );
  vec3 c = color * ( t / max( m, 1e-5 ) );
  c = mix( c, vec3( t ), smoothstep( 3.0, 10.0, m ) * 0.7 );
  return mix( c, ACESFilmicToneMappingStock( color / max( toneMappingExposure, 1e-5 ) ), 0.3 ); // a touch of the stock curve: highlights on gold turn pale yellow, as on camera
}`;
if (!THREE.ShaderChunk.tonemapping_pars_fragment.includes('ACESFilmicToneMappingStock')) {
  THREE.ShaderChunk.tonemapping_pars_fragment = THREE.ShaderChunk.tonemapping_pars_fragment.replace('vec3 ACESFilmicToneMapping( vec3 color )', 'vec3 ACESFilmicToneMappingStock( vec3 color )') + HUE_KEEPING_TONE;
}

export function makeRoom(renderer, scene, { COARSE = false } = {}) {
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
  return { backdrop, key, rim, fillL, hand, rake, floor, contact };
}
