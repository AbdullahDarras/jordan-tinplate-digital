# Jordan Tinplate Canning — Homepage prototype (v0.2)

Prototype of the new homepage, for approving the **style and the method** before the rest of the site is built. v0.2 fixes the 23 findings of [docs/prototype-review.md](../docs/prototype-review.md), self-hosts every library and applies the approved decisions in [docs/decisions.md](../docs/decisions.md).

## Run it
- From this folder, any static server over http (it must not be opened as a file):
  `python3 -m http.server 5180` then open http://localhost:5180
- Or the existing PowerShell server from the project root: `powershell -ExecutionPolicy Bypass -File dev-server\serve.ps1` (http://localhost:5173), or the `jordan-tinplate-prototype` launch config in the Claude desktop app.
- **No external JavaScript.** three.js, GSAP + ScrollTrigger and Lenis are served from `vendor/` (versions and licences in [vendor/README.md](vendor/README.md)). Only Google Fonts (CSS and font files) still come from Google.
- The entrance plays **once per browser session** (`sessionStorage` key `jt-intro`) and has a visible **Skip intro** button (Enter on the focused button, or Escape, also skip). `?skip` in the URL skips it too. To see it again: open a new tab, or run `sessionStorage.removeItem('jt-intro')` in the console.
- **Review mode** (footer) outlines the placeholders that still need management's confirmation (see below).

## What changed in v0.2

**Resilience and speed**
- Libraries self-hosted; the importmap points at `vendor/three/`. `main.js` checks for GSAP/ScrollTrigger before using them: if a library is missing the loader is removed, scroll is unlocked, and a plain page (language, theme, menu, chips) still works. Failures inside the entrance also release the page. A 14 s watchdog finishes a stuck entrance, and an inline 8 s guard in `index.html` covers the case where `main.js` never starts.
- Entrance: once per session, Skip button, progress driven by real milestones (fonts, 3D module, scene, shader warm-up), shorter fixed part (about 2.2 s print + 0.5 s hold + iris), the headline writes itself under the opening iris, loader not announced to screen readers (`aria-busy`, one "Page ready" status at the end), background content `inert` while it is up.
- Phones and tablets: pixel ratio capped at 1.5 and product tins rendered at 30 fps; the loader's stage is dropped from the render list after the entrance; tins rebuilt after a colour/shape change no longer get an oversized grey shadow.

**Accessibility**
- Mobile menu is `inert` and `visibility:hidden` when closed (no invisible tab stops), opens with focus on the first link, closes with Escape or a link and returns focus to the burger; page content is inert while it is open.
- `aria-pressed` on finish/shape chips and colourway swatches; season tabs are a real tab pattern (`aria-selected`, `aria-controls`, tabpanel, roving tabindex, arrow/Home/End keys); description areas are `aria-live`.
- Visible 3 px focus ring everywhere (light on the navy contact section); text accent colour on light backgrounds is now `#865000` (5.1 to 6.3:1, was 2.34:1); aria-labels are translated in Arabic; in-page jumps move focus to the target section.
- `<noscript>` fixed (page scrolls without JS; the loader, burger and marquee are hidden).

**Layout and visuals**
- Fancy-tins card: art moved and sized so it never sits under the text. Bento grid has no empty cell (card 04 is now two columns wide; works at 4, 2 and 1 columns).
- The giant "28" is a gradient fill instead of an outline (no stray diamonds). Emboss and rough finishes are much subtler, so the artwork stays readable. Footer line is bidi-safe. Arabic hero line-heights collapsed to one rule per selector (the shadda of «ونعلّب» clears the line above). The custom cursor only appears (and the native one only hides) after the first real mouse movement.
- Header wordmark is a two-line lock-up that also fits at 390 px.

**Content (decisions applied)**
- Brand name **Jordan Tinplate Canning** in wordmark, `<title>`, meta, OG, loader, footer and the sample tin artwork. Arabic UI uses **«مصنع الأردنية للصفيح والعبوات المعدنية»** (wordmark, title, loader, footer, aria-label).
- Social handle **@jordantinplate** on Instagram, X and Facebook links. Address **Al-Zmailat – Al-Muwaqqar / الزميلات – الموقّر** (full street address still pending).
- No Saudi branch or expansion claim: the Saudi Food Manufacturing 2025 card now says only that our partner was interviewed at the show. (The linked third-party article's own headline says "expanding into Saudi Arabia"; the link is kept as a source, see "Remaining placeholders".)
- Olive-oil tins shown as 1 · 4 · 8 · 16 L/kg (confirmed). The "to be confirmed" technical text for oil and white-cheese tins is gone; copy is general. No certification is named. No employee count is shown (about 250 if wanted).
- **Quote form replaced by a link to the order tool** https://jc-order.netlify.app/ (new tab, `rel="noopener"`), with `mailto:sales@jordantinplate.com` as a secondary link. The fields and the mailto submit handler were removed, which also removes the "silent lost lead" problem.
- Arabic: «مطّ» became «مطفي»; «تصميم داخلي» became «فريق تصميم داخل المصنع»; the three 2017 news cards are translated. Head: favicon, `assets/og.png`, Open Graph/Twitter tags, per-language title/description/og updates, `noindex` while it is a prototype.

## What is on the page
| # | Section | The idea |
|---|---|---|
| 0 | Entrance (once per session, skippable) | The real metal 3D pipeline: a sheet of tinplate is printed by a glowing head, rolls into a tin and gets its lid (the % drives it, in dark lighting); the tin pushes through the screen and an iris opens on the page |
| 1 | Hero | "We print. We can." — a 3D tin assembles itself, follows the pointer, can be dragged |
| – | Marquee | Sectors (olive oil, milk powder, ka'ak, chocolate, white cheese…) that skews with scroll speed |
| 2 | Journey | Pinned, scroll-scrubbed 3D: blank sheet → print sweep → bends into a tin → lid drops → pallet → globe with arcs from Amman to the Gulf and Iraq (export story; no branch is implied) |
| 3 | Finish Lab | Gloss / matte / soft touch / rough / embossed change the real 3D material; four colourways = "one plate, many designs" |
| 4 | Shapes | Round, square, rectangular, oval, oil tin; sizes taken from the existing site's tables |
| 5 | Range | Bento cards with tilt and spotlight; links to the existing PDF catalogue |
| 6 | Seasons | Olive oil → Ramadan & Eid sweets → white cheese; the 3D tin changes shape and artwork per season |
| 7 | Story | 1998, third generation, vision and mission; dashed boxes for proof still to come |
| 8 | News | Saudi Food Manufacturing 2025 interview + three 2017 exhibitions |
| 9 | Contact | Order-tool link (email as fallback), phone, email, address, social links |

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
Each language gets its own URL (`/en/…`, `/ar/…`) with `hreflang`, a real `<title>` / description per page, structured data and a sitemap (that is what `website/` builds). The prototype switches language in-page only, so canonical and hreflang are not added here.

## Remaining placeholders (review mode outlines these)
- **Final logo** (the circle mark and two-line wordmark are temporary) and **Pantone** of the brand colour (`#213469` is an approximation).
- **Certifications** (none named until copies arrive), **production capacity**, **client names and case studies**.
- **Full street address** (only Al-Zmailat – Al-Muwaqqar is confirmed).
- Not outlined but still open: a native Arabic reviewer must read the whole Arabic copy once; the Saudi Food Manufacturing card still needs the partner's approval and the third-party article it links to carries an "expanding into Saudi Arabia" headline; the real order tool has not been tested from here; the sample artwork on the 3D tins is drawn in code and is not a client design; fonts still load from Google Fonts (self-host for fully offline use); performance on a real mid-range phone has not been measured. Cosmetic: the outlined English marquee words still show faint inner overlaps in a few letters (variable-font contours).

## Files
`index.html` · `css/style.css` · `js/main.js` (UI, i18n, scroll, entrance) · `js/scene.js` (three.js) · `js/art.js` (procedural print artwork) · `js/i18n.js` (Arabic copy) · `vendor/` (three.js, GSAP, ScrollTrigger, Lenis) · `assets/` (land map, favicon, OG image)

## How v0.2 was verified
Headless Chromium (software WebGL), served by `python3 -m http.server`. Desktop 1440x900 and mobile 390x844 in EN/AR x light/dark (8 runs, every section, journey at five positions): 0 page errors, 0 failed requests, no horizontal overflow, no external script requests (only Google Fonts). Also checked: entrance once per session and Skip (click, Enter), GSAP / ScrollTrigger / three / Lenis / `main.js` blocked one at a time (page usable every time), JavaScript disabled (scrolls), mobile menu (tab order, inert, Escape, focus return), tabs and chips (aria state, arrow keys), journey pin length after resizing 900 → 600 → 1100 px high (3780 → 2520 → 4620, equal to 4.2 x viewport), focus rings, and a text-contrast audit of every visible text element in all four language/theme combinations (all at least 4.5:1, or 3:1 for large text).

## Resolution of the review findings
| # | Sev | Status | Resolution |
|---|---|---|---|
| 1 | High | Fixed | three.js 0.160.1 (+ RoomEnvironment, RoundedBoxGeometry), GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 are in `vendor/`; importmap and script tags updated. `main.js` guards a missing library (plain working page), failures in `boot()` call `releasePage()`, 14 s watchdog, inline 8 s guard. Tested with each library blocked. |
| 2 | High | Fixed | Entrance once per session (`sessionStorage`), visible Skip button (also Enter/Escape), `?skip` kept, progress from real milestones, shorter fixed part, headline plays under the iris. Deliberately not done: the H1 is still animated in rather than painted statically behind the loader (the loader is opaque, so this only matters for crawlers that run JS; returning visitors and `?skip` have no loader at all). |
| 3 | Med | Fixed | `<noscript>` selector is `body.is-loading`; page scrolls without JS (tested). Burger and empty marquee are hidden without JS. |
| 4 | Med | Fixed | Closed menu is `inert` + `visibility:hidden`; Escape closes; focus moves in and back; page `inert` while open. |
| 5 | Med | Fixed | Text above art (`z-index`), art smaller and moved; checked LTR and RTL. |
| 6 | Med | Fixed | Card 04 spans two columns: no empty cell at 4, 2 or 1 columns. |
| 7 | Med | Fixed (replaced) | Form replaced by a link to https://jc-order.netlify.app/ (new tab, `noopener`) plus a `mailto:` fallback link. No fields, so validation and focus-on-error no longer apply. |
| 8 | Med | Fixed | `--accent-text` (`#865000` light, unchanged amber in dark) for card numbers, news tags, spec values, accent hero line, proof icons, step numbers. Contrast audit passes. |
| 9 | Med | Fixed | `aria-pressed` on chips/swatches; tabs have `aria-selected`, `aria-controls`, tabpanel, roving tabindex and arrow keys. |
| 10 | Med | Fixed, review pending | «مطّ» became «مطفي» (chip, print step, gloss text); «تصميم داخلي» became «فريق تصميم داخل المصنع». A native reviewer still has to read the whole Arabic file. |
| 11 | Med | Fixed | `end` is a function and `invalidateOnRefresh: true`; measured 3780 / 2520 / 4620 px for 900 / 600 / 1100 px viewports. |
| 12 | Low | Fixed | City tags and event names have Arabic keys; the 2017 cards are no longer tilt/hover cards (they are not links). |
| 13 | Low | Fixed | Footer uses `<bdi>`; reads "© 2026 مصنع الأردنية…" in Arabic and "© 2026 Jordan Tinplate Canning" in English. |
| 14 | Low | Fixed | "28" is a gradient fill clipped to the glyphs. Step numbers were checked: their outline is clean at their size. |
| 15 | Low | Fixed | Cursor starts hidden, shows on the first real mouse move; `cursor:none` is only applied then. |
| 16 | Low | Fixed | Two-line wordmark (Jordan Tinplate / Canning, or the Arabic name) visible at 390 px. |
| 17 | Low | Fixed | One Arabic rule per selector; display line-height 1.34, h2/mega 1.3. |
| 18 | Low | Fixed | `bumpScale` emboss 5 → 1.6, rough 2.4 → 1.3; the logo and Eid greeting stay readable. |
| 19 | Low | Fixed | No `aria-live` on the loader; `aria-busy` plus one polite "Page ready" announcement. |
| 20 | Low | Partly fixed | Added: favicon, OG image, OG/Twitter tags, per-language title/description/og:locale, `noindex`. Deferred: canonical and hreflang, because the prototype has one URL for both languages (they belong in `website/`, which has per-language pages). |
| 21 | Low | Fixed | 3 px `:focus-visible` outline (amber on the navy contact section and the loader). |
| 22 | Low | Fixed | `scene.pruneStages()` after the loader is removed (verified: no zero-size loader stage left). |
| 23 | Low | Mitigated, deferred | DPR cap 1.5 on touch devices and narrow screens, product stages at 30 fps on touch devices, off-screen stages already skipped. A real-device frame-rate and battery test is still needed; it cannot be done with software WebGL. |
