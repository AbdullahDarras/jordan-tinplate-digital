# Jordan Tinplate — Homepage prototype (v0.1)

First draft of the new homepage, for approving the **style and the method** before the rest of the site is built.

## Run it
- In the Claude desktop app: the `jordan-tinplate-prototype` launch config (`.claude/launch.json`) serves it on http://localhost:5173
- Or from a terminal at the project root:
  `powershell -ExecutionPolicy Bypass -File dev-server\serve.ps1`
- Needs internet (three.js, GSAP and Google Fonts load from CDNs). It must be served over http, not opened as a file.
- `?skip` in the URL skips the loader (handy for reviews). **Review mode** (footer) outlines every placeholder that still needs management's confirmation.

## What is on the page
| # | Section | The idea |
|---|---|---|
| 0 | Entrance | The real metal 3D pipeline: while the page loads, a sheet of tinplate is printed by a glowing head, rolls into a tin and gets its lid (the % drives it, in dark lighting); then the tin pushes through the screen and an iris opens on the page |
| 1 | Hero | "We print. We can." — a 3D tin assembles itself, follows the pointer, can be dragged |
| – | Marquee | Sectors (olive oil, milk powder, ka'ak, chocolate, white cheese…) that skews with scroll speed |
| 2 | Journey | Pinned, scroll-scrubbed 3D: blank sheet → print sweep → bends into a tin → lid drops → pallet → globe with arcs from Amman to the Gulf and Iraq |
| 3 | Finish Lab | Gloss / matte / soft touch / rough / embossed change the real 3D material; four colourways = "one plate, many designs" |
| 4 | Shapes | Round, square, rectangular, oval, oil tin; sizes taken from the existing site's tables |
| 5 | Range | Bento cards with tilt and spotlight; links to the existing PDF catalogue |
| 6 | Seasons | Olive oil → Ramadan & Eid sweets → white cheese; the 3D tin changes shape and artwork per season |
| 7 | Story | 1998, third generation, vision and mission (from the current site); dashed boxes for proof still to come |
| 8 | News | Saudi Food Manufacturing 2025 interview + three 2017 exhibitions |
| 9 | Contact | Quote form (opens the email app for now), phone, email, social links |

Also: Arabic / English (full RTL flip with a curtain transition), light / dark (circular reveal), custom cursor, magnetic buttons, split-text entrances.

## How the 3D is attached to the page
Each `.stage` element in the layout gets its **own `<canvas>`** (`js/scene.js`, `refreshStages`). One shared WebGL renderer draws that stage's tin into the canvas, so the picture lives inside the stage and scrolls with the page natively; it cannot drift or "fly" between sections. Each stage also has its **own tin** (own shape, artwork and finish): hero, finish lab, shapes, seasons, plus the scroll-scrubbed journey rig. To add a 3D block anywhere: add `<div class="stage" data-rig="product" data-pose="hero|finish|shapes|seasons">`.

## Proposed site structure (next phase)
```
Home
├─ Products
│   ├─ By industry (new, SEO-led): Olive oil · Milk powder & dairy · Sweets, ka'ak & chocolate · White cheese · Coffee & tea · Industrial
│   └─ By type: Fancy tins (round/square/rect/oval) · Food cans · Food containers & trays · Ends · Special molds
├─ Capabilities: Design & CTP · Printing & finishes · Forming · Packing, storage & export
├─ Seasons (campaign pages, refreshed each season)
├─ Insights (blog / guides — Arabic + English, the main SEO engine)
├─ About: story, vision & mission, team, certifications [TBC]
├─ News & events
└─ Contact / Request a quote  (+ catalogue download)
```
Each language gets its own URL (`/en/…`, `/ar/…`) with `hreflang`, a real `<title>` / description per page, structured data and a sitemap. The prototype switches language in-page only.

## Placeholders that need management
- Official brand name and Arabic name (site says Jordan Tinplate, the old logo says Jordan Canning). The wordmark here is temporary.
- Address (site says Al-Zmailat · Al-Mwagar, LinkedIn says Sahab).
- Certifications, production capacity, client names, case studies.
- Technical claims for olive-oil and white-cheese tins (interior coating, sizes) — shown as "to be confirmed".
- The "Saudi Food Manufacturing 2025" card needs the partner's approval.
- Artwork on the 3D tins is sample artwork, drawn in code.

## Files
`index.html` · `css/style.css` · `js/main.js` (UI, i18n, scroll) · `js/scene.js` (three.js) · `js/art.js` (procedural print artwork) · `js/i18n.js` (Arabic copy)
