# Website v2: "printed on metal" (concept, home page)

A complete redesign proposed to the owner on 2026-10-27. It lives next to the current site (`website/`, which Netlify still
publishes) until the owner approves the direction; then the inner pages are rebuilt in it and it replaces `website/`.

## Round 2 (2026-10-27, after the owner's review)
The owner rejected round 1: it broke the identity (CMYK colours, gold foil type, condensed type) and it still had the old site's
shape (text on one side, a tin in a box on the other, section after section). Round 2:
- **Identity, strictly** (`brand/README.md`): only PANTONE 294 C `#002F6C` and its tints and shades, amber only on buttons and
  highlights, champagne gold only on the tins. Bricolage Grotesque 700-800 for Latin headings, DM Sans for Latin text, Readex Pro
  for Arabic. The four separations in the print chapter are drawn in brand navy, not in CMYK colours.
- **The site is a 3D film**, not a page with 3D boxes: one full-screen canvas, the scroll is the film's time, the camera travels a
  fixed shot list and the text comes and goes over it. Chapters (rail on the side): 01 the tin (hero), 02 the relief (macro on the
  stamped lid, depth of field, a raking light), 03 the print (a lid built up layer by layer), 04 our tins (the factory's tins rise
  round the main tin and turn), 05 finishes (drag to turn the tin), 06 the sheet (top view of every tin). Then a plain page:
  sectors, story and certifications, contact (brand navy band), footer.
- **Better 3D**: the studio backdrop is drawn in the WebGL scene (brand navy scale), physical materials, bloom on the glints and
  depth of field (three.js post-processing, vendored from 0.160.1), and the main tin's lid re-cut at 2048 px from the original
  6720 px photo so the macro shot stays sharp.

## Round 3 (2026-10-27): colour
The owner liked the film and the close-ups but the tins still looked pale. Measured on a render: the gold lid's saturation fell
from 0.60 in its texture to 0.17 on screen. Three causes, three changes:
- **The print's colour comes from the photograph** (`tins.js`, `printMat`): the photo is the material's emissive base (82 %), so a
  tin looks like the real tin whatever the studio does; 30 % of the colour takes the light (body shading, the relief), metal
  areas take the reflections, and the varnish only adds highlights (specular capped, no clear coat except spot UV).
- **A dark photo studio** (`film.js`): the environment the metal reflects is near-black with defined soft-boxes, as product
  photographers light metal, instead of a bright grey dome that laid a grey veil over everything.
- **Colour-keeping tone mapping**: the filmic curve shapes the brightest channel and scales the colour with it (hue and saturation
  kept), with 30 % of the stock curve so highlights on gold still turn pale yellow as on camera.
Plus a light grade on the colour layers (`halawah.js`, `GRADE`; the main tin has its own) to give back the depth the
straightening took out of the photos.

## Engine
- `assets/js/engine/tins.js`: the tins. Geometry follows the order platform's studio rules (`studio.js`: lid gap and lift, skirt,
  curled lip, 3.5 mm corners) at each tin's real millimetres; artwork from `halawah.js` (the straightened photos). Materials are
  three.js physical materials: a metalness map is taken from each photo (gold lacquer and bare tin are metal, ink and base coat
  are not), clear varnish on top, the relief map for embossing, the spot map for spot UV.
- `assets/js/engine/film.js`: the film. `SHOTS` (camera positions) and `CHAPTERS` (where each holds on the time line); every object
  poses itself from the same time value. `assets/js/app.js`: language, theme, smooth scroll, the overlays and the finish lab.
- `studio.js` and `halawah.js` are copies of the files in `website/assets/js/engine/` (keep them in step until v2 replaces v1).

## Preview
Serve the folder (`python3 -m http.server` in `website-v2/`) and open `index.html`; `?lang=ar` and `?mode=dark` force a language or theme.

## Notes
- Client brands appear on the tins (Al Qaisi, and the others on the shelf): management or the clients must approve before launch.
- Not done yet: the inner pages, SEO tags and sitemap, the gallery and videos, news.
