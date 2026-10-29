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

## Round 4 (2026-10-27)
- **Hero**: the headline is a wall of type inside the 3D studio, behind the tin (`film.js`, `drawType`), so the tin stands in front
  of "We print. We can." (Arabic: «نطبع. ونعلّب.»); the page keeps it as the real `h1`. One clean bar at the bottom: intro, scroll
  hint, quote button.
- **The print chapter** uses the round Bab Sharqi tin (painted coffee scene, photo `2I9A8959`, `sharqi-*` in `assets/img/tins/`)
  instead of the red Halawah lid, which the owner asked to drop; it also replaces Halawah on the shelf. Its lid is cut from the
  photo by fitting the painted disc's ellipse; body and skirt are the tin's plain cream lacquer with a gold lip.

## Round 5 (2026-10-27)
- **The closing shot** (06, "From sheet to shelf") was a loose scatter of tins. Now every tin, lid up and brought to the same width,
  sits in a tidy grid on a sheet of bare tinplate with the printer's marks in brand navy (crop marks at each repeat, registration
  marks at the edges): 4 x 3 on wide screens, 3 x 4 on tall ones. The camera works out its height from the screen so the whole
  sheet fits above the title and the step bar (`topShot`, `layout`).
- **Arabic**: the side shots (relief, print, finishes) are mirrored in right-to-left reading, so the tin or the lid stays on the
  side away from the text card (before, the card covered the lid in the print chapter).

## Round 6 (2026-10-27): from sheet to shelf
The owner found the closing print-sheet layout weak and asked for something more luxurious, built on the previous site's design.
- Chapter 6 is now the previous site's entrance journey, rebuilt in the new rendering: a tinplate sheet carrying five body blanks
  of the Al Qaisi tin, its prepress marks drawn in brand navy (trim lines, crop and registration marks, a colour bar); the press
  runs across it (an amber light bar; the print is revealed with a clipping plane) and a light runs over the fresh print; the
  middle blank is cut out, rolled into the body and closed with its lid; the tin rises, a pallet of its twins builds below
  (3 x 3 a layer, four layers, a wooden pallet), the tin lands in the last place and the stretch film goes on;
  the pallet then leaves for a navy globe (land in champagne-gold dots) with amber routes out of Amman (only Amman is named).
- The card uses the previous site's step design: an outlined amber numeral, one step at a time with its approved line, a rail of
  five dots. The film is longer (1700svh, 1500svh on a phone) so the chapter has room: `CHAPTERS[5]` is 0.75 to 1.
- The journey moves its own camera (`journey.shotAt`), mirrored in Arabic so the tin stays clear of the card.

## Round 7 (2026-10-27): the inner pages
All twelve inner pages, in English and Arabic, in the same style as the home film. Built by `node tools/build.mjs`, which reads
the approved copy from `website/tools/content.mjs` (the one source for both sites; hidden "to be confirmed" items stay hidden) and
writes `en/<path>/index.html` and `ar/<path>/index.html` with relative links.
- **3D hero** on every page: the page title is drawn as a wall in the studio and the page's own tins stand in front of it
  (Products: Al Abed can, Al Qaisi, Level Max; Olive oil: a plain tinplate 16 kg oil tin at the old site's exact size,
  illustrative; Milk powder: Maeen and Al Abed; Sweets: the desert rectangle, Bab Sharqi, the square tin; White cheese: Laqmi;
  Coffee & tea: Level Max and the tall square tin; Industrial: an illustrative paint can; Capabilities, Contact: Al Qaisi;
  About: the navy round tin; Gallery, News: the square and rectangular gift tins). Drag to turn, the light follows the pointer.
  Pages with an illustrative tin say so under the intro.
- **Finish lab** and **shapes lab** (Products, Capabilities): one 3D tin; the finish chips change its material, the shape chips
  switch to a real tin of that shape (8 shapes; the shapes we have no real tin for are left out).
- **Capabilities** carries the sheet-to-shelf journey, pinned and scrubbed by the scroll, exactly as chapter 6 of the home film.
- Cards, industry tiles and spec rows use renders of the same 3D tins (`assets/img/renders`, made by `tools/renders.mjs`
  and `tools/crop_renders.py`); cards without a real tin get a tinplate panel with the gear mark.
- The same header on every page, home included: navigation (a full-screen menu on smaller screens), language, theme, quote.
  The language choice is remembered between the home page and the inner pages. Footer with the site map.
- Code: `assets/js/engine/room.js` (the shared studio: backdrop, soft-boxes, lights, floor, tone curve) and
  `assets/js/engine/journey.js` were split out of `film.js` so the home film and the pages share them;
  `assets/js/engine/stage.js` (hero, lab, journey stages, each rendering only while on screen); `assets/js/page.js`;
  `assets/css/pages.css`.

## Round 8 (2026-10-29): packing as the factory does it
The owner: tins are not stacked bare on the pallet. Each tin goes into a bag, then into a carton; the cartons go on the pallet,
the pallet is shrink-wrapped and goes to transport. Step 04's text changed in `website/tools/content.mjs` (both sites rebuilt) and
the 3D journey now shows: the bag over the tin, the carton (a stack of three bagged tins, illustrative) whose flaps close and get
taped, a pallet of cartons, the shrink film climbing the stack, a plain white truck backing up, loading and driving off, then the
globe. Decision 40 in `docs/decisions.md`.

## Round 9 (2026-10-29)
- Every page opens at its top (also on a reload or a back step); links to a section (#…) still jump to it.
- A Home tab at the start of the navigation (and of the phone menu) on every page.
- The lid's curled lip no longer reads as a thick white line: it is thinner and takes the lid's own colour (or a dull
  silver), as on the factory's tins; can seams are a dull silver. Bab Sharqi's skirt is cream lacquer with the thin gold line,
  as in its photo. Card renders re-made.

## Round 10 (2026-10-29): the real olive-oil tin
The owner sent the latest photo set (272 cut-out PNGs). The illustrative oil tin is replaced by Malka Olive Press's 4 L tin
(175 x 115 x 245 mm): its front and narrow side were straightened out of photos 2I9A5615 and 2I9A5610 (perspective warp on the
face corners) into `assets/img/tins/malka-side.jpg` and `malkas-side.jpg`; gold seams and top, the open spout and the red handle
folded flat are modelled. The paint can is now the only illustrative tin. Many more tins in the set can be added the same way.

## Round 11 (2026-10-29): the new tins, videos inside the page
- Every tin except Al Qaisi now comes from the owner's latest photo set, one of each kind: Al Nejmah, Maamoul Dates and
  Marouf Bakery (round gift tins), Habybee (elongated octagon), jojo (embossed square), Melties (rectangle), Givinova (square),
  Shawrat Al Sanah (square tin with a slip lid), Al Rayhan (tall square spice tin), Al Kbous (tea tin), Al Abed Turkish coffee
  and Havana Cocoa (cans with slip lids), Malka (olive oil). Textures: `tools/` in the scratch pipeline (ext2.py): lids
  straightened from top views by an ellipse fitted to the cut-out, bands unrolled from 3/4 views (body ellipse fitted from the
  alpha edge), box faces by perspective warp. Sizes are read from the photos and marked approximate in `tins.js`.
  The print-layers chapter uses the Maamoul lid; the home ring shows 13 tins, tall ones brought down to a common height.
  The old tins' images were removed from website-v2 (website/ keeps its own).
- Videos play inside the page. A video whose file is in `assets/video/<youtube id>.mp4` (poster `<id>.jpg`) plays in the
  browser's own player everywhere, the claude.ai preview included. Otherwise the YouTube player loads in place (no new tab);
  a viewer that forbids YouTube in frames (the preview) gets a short note instead of an empty box.

## Engine
- `assets/js/engine/tins.js`: the tins. Geometry follows the order platform's studio rules (`studio.js`: lid gap and lift, skirt,
  curled lip, 3.5 mm corners) at each tin's real millimetres; artwork from `halawah.js` (the straightened photos). Materials are
  three.js physical materials: a metalness map is taken from each photo (gold lacquer and bare tin are metal, ink and base coat
  are not), clear varnish on top, the relief map for embossing, the spot map for spot UV.
- `assets/js/engine/film.js`: the film. `SHOTS` (camera positions) and `CHAPTERS` (where each holds on the time line); every object
  poses itself from the same time value. `assets/js/app.js`: language, theme, smooth scroll, the overlays and the finish lab.
- `studio.js` and `halawah.js` are copies of the files in `website/assets/js/engine/` (keep them in step until v2 replaces v1).

## Round 12: the tins as their photographs
- The 3D rebuilds of the newer tins lost detail (lids, colours, corners). Only Al Qaisi (and the illustrative paint can) stay as 3D
  models; every other tin is shown as its real photograph inside the same 3D studio (`photoTin` in `engine/tins.js`): a card
  that faces the camera, stands on the floor with a soft shadow and a faint reflection, sways as it "turns" and carries a moving
  sheen. Its shader undoes the studio's tone curve so the photo keeps its colours.
- Photos: `assets/img/photos/<key>.webp` (scenes) and `assets/img/renders/<key>.webp` (cards), made from the owner's cut-outs
  by the scratchpad script `tools/photos.py` (crop, premultiplied resize, WebP with alpha). `photo:` in `TINS` is each photo's
  width / height.
- Sizes are real and shared: each photo is as wide as the tin it shows (`pw:` in mm), every tin in the home ring is at the same
  scale as Al Qaisi in the middle (no per-tin resizing), and the ring and hero cameras look down at about the angle the photos
  were taken from (25-30 degrees), so flat tins and the 3D Al Qaisi read alike.
- CSS and JS links carry `?v=<hash>` (build.mjs), so browsers fetch new files after each change.

## Publishing
- **GitHub Pages (from the branch):** Settings > Pages > Source "Deploy from a branch" > `claude/confident-knuth-ibmf9c`,
  `/ (root)`. Every push republishes within a minute or two. The repository's root `index.html` forwards to `website-v2/`,
  and `.nojekyll` serves the files as they are. Address: `https://abdullahdarras.github.io/jordan-tinplate-digital/`.
  (Alternative: `.github/workflows/pages-v2.yml`, run by hand, publishes `website-v2/` alone with Source "GitHub Actions".)
- **Netlify Drop / Cloudflare Pages:** upload the site files (index.html, en/, ar/, assets/, _headers); `_redirects` is
  Netlify's only.

## Preview
Serve the folder (`python3 -m http.server` in `website-v2/`) and open `index.html`; `?lang=ar` and `?mode=dark` force a language or theme.

## Notes
- Client brands appear on the tins (Al Qaisi, and the others on the shelf): management or the clients must approve before launch.
- Not done yet: the inner pages, SEO tags and sitemap, the gallery and videos, news.
