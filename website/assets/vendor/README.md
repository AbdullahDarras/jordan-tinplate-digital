# Vendored libraries

The site loads **no external JavaScript**. Everything below is copied unmodified from the npm tarballs
(`npm pack <package>@<version>`) and served from this folder (same files as `website-prototype/vendor/`). Google Fonts (CSS and font files) are still loaded from Google.

| Library | Version | Files here | Source in the npm package | Licence |
|---|---|---|---|---|
| three.js | 0.160.1 | `three/three.module.min.js` | `build/three.module.min.js` | MIT (`three/LICENSE`) |
| three.js addon: RoomEnvironment | 0.160.1 | `three/addons/environments/RoomEnvironment.js` | `examples/jsm/environments/RoomEnvironment.js` | MIT |
| three.js addon: RoundedBoxGeometry | 0.160.1 | `three/addons/geometries/RoundedBoxGeometry.js` | `examples/jsm/geometries/RoundedBoxGeometry.js` | MIT |
| GSAP | 3.12.5 | `gsap/gsap.min.js` | `dist/gsap.min.js` | GreenSock "Standard no charge" licence, https://gsap.com/standard-license (read it before any use beyond a normal website) |
| GSAP ScrollTrigger | 3.12.5 | `gsap/ScrollTrigger.min.js` | `dist/ScrollTrigger.min.js` | same GreenSock licence (the 3.12.5 file header points to the standard licence) |
| Lenis | 1.1.13 | `lenis/lenis.min.js` | `dist/lenis.min.js` | MIT (`lenis/LICENSE`) |

Every page maps the bare `three` and `three/addons/` imports to this folder with an import map (written by `tools/build.mjs`), so `assets/js/engine/scene.js` imports are unchanged.

To upgrade, run `npm pack` for the new version in a scratch folder, copy the same files over, and update the table.
The three.js addons import `from 'three'`, so keep the import map and always upgrade three and its addons together.

SHA-256 of the shipped files (to detect accidental edits):

```
28033e449a31ebcc396e5be8b13b63152bf03094288fb5867034321927bce087  gsap/gsap.min.js
ad33c2df9ada8a663c2147357828f980d0b7ca731ef33eb3c6e4f327c3b2cda5  gsap/ScrollTrigger.min.js
b2958f142f832f0d5e547cdef77e6fadfce16bea60982fc8bbf50395a2439df8  lenis/lenis.min.js
3e690ac7d180b0aadf0891bea39eec643e29e2d3e75c99b18689518665f69ba6  three/three.module.min.js
```
