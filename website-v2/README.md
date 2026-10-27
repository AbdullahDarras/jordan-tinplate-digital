# Website v2: "printed on metal" (concept, home page)

A complete redesign proposed to the owner on 2026-10-27. It lives next to the current site (`website/`, which Netlify still
publishes) until the owner approves the direction; then the inner pages are rebuilt in it and it replaces `website/`.

## Idea
The tins are the show. One fixed WebGL studio sits behind the page and the page is laid over it like a run of print sheets
(registration marks, crop marks, the colour control strip printers run along a sheet). Default: English, light mode.

| Section | What happens |
|---|---|
| Hero | The main tin (Al Qaisi, catalogue round 235 at 6 cm) under a light the visitor moves with the pointer; "We print." sits behind the tin, "We can." in foil in front. |
| How a tin is printed (`#anatomy`, scroll-scrubbed) | A printed lid builds itself up: tinplate, base coat, then the cyan, magenta, yellow and black plates, separated from the real lid photo in the browser, land one by one and multiply into the full picture (like ink), then varnish, then the relief rises. |
| Finish Lab (`#lab`) | The main tin again; drag to move the light; gloss, matte, embossing, spot UV (Trending: coming soon). |
| Our tins (`#collection`, scroll-scrubbed) | Twelve real tins from the factory photos on one shelf, at true relative size; the caption gives the format and, where the tin matches the catalogue, its size. |
| Process, sectors, story, certifications, contact | Approved copy from `website/tools/content.mjs`. |

## Engine
- `assets/js/engine/tins.js`: the tins. Geometry follows the order platform's studio rules (`studio.js`: lid gap and lift, skirt,
  curled lip, 3.5 mm corners) at each tin's real millimetres; artwork from `halawah.js` (the straightened photos). Materials are
  three.js physical materials: a metalness map is taken from each photo (gold lacquer and bare tin are metal, ink and base coat
  are not), clear varnish on top, the relief map for embossing, the spot map for spot UV.
- `assets/js/engine/stage.js`: one renderer, one canvas. Every act follows a `.slot[data-act]` element in the layout, so CSS
  decides where and how big the tins are. A studio environment (soft-boxes) gives the reflections; a key light casts the shadow;
  the pointer moves a small light for the glint on gold and relief.
- `studio.js` and `halawah.js` are copies of the files in `website/assets/js/engine/` (keep them in step until v2 replaces v1).

## Preview
Serve the folder (`python3 -m http.server` in `website-v2/`) and open `index.html`; `?lang=ar` and `?mode=dark` force a language or theme.

## Notes
- Client brands appear on the tins (Al Qaisi, and the others on the shelf): management or the clients must approve before launch.
- Not done yet: the inner pages, SEO tags and sitemap, the gallery and videos, news.
