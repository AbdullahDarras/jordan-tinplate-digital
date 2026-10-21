# Jordan Tinplate Canning: the website (final integrated build)

Static, bilingual (English / Arabic) multi-page site. **Every page, home and inner, shares the creative experience** that was prototyped in `website-prototype/` (v0.2): one header and footer, the PANTONE 294 C (`#002F6C`) tokens, Bricolage Grotesque / DM Sans / Readex Pro typography, custom cursor, page transitions, light / dark mode, a 3D tin "stage" in the hero, and the full RTL flip for Arabic.

The pages are generated from one data file by a tiny Node script, and the generated output is committed. No framework, no build step on Netlify (`netlify.toml`: `publish = "website"`).

## What is on each page

| Page (`/en/…` and `/ar/…`) | Creative content |
|---|---|
| **Home** (`/en/`, `/ar/`) | Entrance (a tinplate sheet is printed, rolled into a tin and sealed; once per session, with Skip) · hero "We print. We can." with a 3D tin · sector marquee · pinned, scroll-scrubbed Journey (sheet to shelf to globe) · Finish Lab · Shapes · Range (bento) · industries list · Seasons · Story · News · Contact + footer |
| **Products** | Hero tin · industries list · range · Shapes lab · Finish Lab |
| **6 industry pages** | Hero tin themed per industry: olive oil (oil tin with a **1 / 4 / 8 / 16 L/kg** size picker), milk powder & dairy (tall can), sweets / ka'ak / chocolate (gift tin with round / square / rectangular / oval picker, Eid artwork), white cheese (low wide tin), coffee & tea (coffee tin), industrial (paint can) |
| **Capabilities** | Hero tin (embossed) · the pinned Journey · Finish Lab · Shapes lab · factory details (to be confirmed) |
| **About** | Hero tin · story, vision, mission · company details (about 250 employees) |
| **News** | Hero tin · news cards (Saudi Food Manufacturing 2025 interview, three 2017 exhibitions) |
| **Contact** | Phone, email, address, social links and the online order tool |

## Run it

```bash
cd website
python3 -m http.server 8000
# open http://localhost:8000/   (language chooser) or http://localhost:8000/en/ and /ar/
```

Serve `website/` as the **root of a domain** (links are root-relative, e.g. `/en/products/`). Google Fonts load from the web; nothing else is external (see "No external JavaScript"). Useful URLs while testing: `/en/?skip` (no entrance); to replay the entrance run `sessionStorage.removeItem('jt-intro')` in the console, or open a new tab.

## Structure

```
website/
  index.html            language chooser (noindex), redirects to /en/ or /ar/ from the saved choice / browser language
  404.html              bilingual not-found page
  robots.txt  sitemap.xml   (sitemap has xhtml:link alternates + x-default)
  en/…  ar/…            12 pages per language, same paths in both
  assets/css/site.css   the one stylesheet (tokens, creative components; logical properties, so RTL needs no second file)
  assets/js/site.js     classic script: menu, theme, language preference, header behaviour, page transitions, review mode
  assets/js/engine/     the creative engine (ES modules): main.js (entrance, scroll, labs, cursor), scene.js (three.js), art.js (procedural tin artwork)
  assets/vendor/        three 0.160.1 (+ RoomEnvironment, RoundedBoxGeometry), GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.13 (versions, licences, SHA-256: vendor/README.md)
  assets/data/          land-110m.geojson (Natural Earth, public domain; the globe)
  assets/img/           favicon.svg, og-default.png (1200x630)
  tools/content.mjs     ALL copy, English + Arabic side by side: t('English', 'العربية'); section copy for the labs, marquee, seasons, story
  tools/build.mjs       renders every page, sitemap, robots, chooser, 404
  tools/validate.py     checks the generated output (see below)
  tools/screenshots.mjs headless-Chromium screenshots at 1440 and 390, and the OG image
  tools/og-card.html    source of og-default.png
```

## How the pieces fit

- **Text is static HTML in the page's own language** (SEO). There is no in-page language flip: the header language button is a normal link to the equivalent page (`/en/products/` to `/ar/products/`) and remembers the choice. `hreflang`, canonical, Open Graph, JSON-LD and the sitemap are unchanged and validated.
- **Progressive enhancement.** Without JavaScript: all text, links, the full navigation, every lab description (all panes are shown), all five journey steps and an SVG drawing of each tin are visible. With JavaScript but without WebGL, or if a library fails: `html.no-fx` / the SVG fallback keep a complete page, the entrance is removed, nothing stays hidden or scroll-locked (inline 8 s guard + a 14 s entrance watchdog + `releasePage()` on any error).
- **3D stages.** Any element `<div class="stage" data-rig="product" data-pose="hero" data-shape=".." data-theme=".." data-cw="0" data-finish="gloss">` gets its own canvas and its own tin (shapes: `round square rect oval oil oil1 oil4 oil8 oil16 cheese milk coffee paint`; themes: `brand olive eid cheese milk coffee industrial`). Chips with `data-pick="shape|finish|cw" data-target="<pose>"` restyle a stage and show their text pane.
- **Entrance**: home pages only, once per browser session (`sessionStorage` key `jt-intro`; landing on an inner page first also counts as seen), visible Skip button (Enter / Escape also skip), `?skip` and `prefers-reduced-motion` skip it. **Reduced motion** also turns off smooth scrolling, split-text and reveal animations, the marquee and the page-transition curtain.
- **Page transitions**: a five-bar curtain on internal links; the arrival side is pure CSS (it clears itself after 1.5 s even if scripts fail).
- **Request a quote** buttons everywhere open the existing order tool <https://jc-order.netlify.app/> in a new tab (`rel="noopener"`); `mailto:sales@jordantinplate.com` is the secondary option.
- **No external JavaScript**: three.js, GSAP + ScrollTrigger and Lenis are self-hosted under `assets/vendor/`. Only Google Fonts (CSS + font files) come from Google.
- `/prototype/` (the old stand-alone creative preview) is gone from `website/` because the home pages supersede it; `netlify.toml` redirects `/prototype*` to `/en/`. The original lives on in `website-prototype/` (untouched).

## Edit and rebuild

1. Edit `tools/content.mjs` (copy, pages, placeholders), `tools/build.mjs` (markup) or `assets/css|js`.
2. `node tools/build.mjs` (needs Node 18+; no packages). Set `SITE_URL=https://example.com` (staging only) to change the origin used in canonical / hreflang / sitemap / JSON-LD.
3. `python3 -I tools/validate.py` checks: HTML is well formed, internal links and anchors resolve, hreflang is reciprocal and matches canonical and the sitemap, titles/descriptions are unique, OG tags and JSON-LD exist, language switch targets are correct, plus the creative contract (shared chrome on every page, every stage labelled with an SVG fallback, entrance only on the home pages and with a Skip button, no external script, import map points at `/assets/vendor/`, all engine files exist) and the approved decisions (official names, `@jordantinplate`, order-tool links open in a new tab with `noopener`, no certification named, no Saudi branch, olive-oil sizes 1/4/8/16, address).
4. Commit the regenerated files.

A "to be confirmed" item is a `tbc` block or a row with `tbc: true`; it renders as a dashed box with a badge. The footer **Review mode** button outlines every placeholder on the page.

## Decisions applied (see `docs/decisions.md`)

Official English name **Jordan Tinplate Canning** (always full, never "Canning" alone); official Arabic name **«الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»** (round 3; the prototype's older short Arabic wordmark «مصنع الأردنية» is not used) · production domain `https://www.jordantinplate.com` · every "Request a quote / اطلب عرض سعر" button opens the order tool in a new tab · address Al-Zmailat – Al-Muwaqqar, Amman, **final as it is** (no "to be confirmed" badge) · brand colour **PANTONE 294 C**, screen approximation `#002F6C` (print must use the Pantone swatch; see `brand/README.md`) · username **@jordantinplate** on Instagram, X and Facebook · no Saudi branch (Saudi Food Manufacturing 2025 appears only as a news item) · olive-oil tins in 1, 4, 8, 16 L/kg and food-grade interior lacquer "meeting the highest food-safety standards" (no standard named) · about 250 employees · certifications exist but none is named.

## Verification (headless Chromium, software WebGL)

`python3 -I tools/validate.py` passes (and was checked to fail on: an external script, a missing Skip button, a named certification, the old Arabic name, an order link without `noopener`, an unlabelled stage, a missing engine file, a loader on an inner page).

- Home, olive-oil and capabilities pages in English and Arabic, light and dark, at 1440 and 390 px (24 loads), plus **all 12 pages** in EN 1440 light and AR 390 dark: 0 console errors, 0 failed requests, no external request except Google Fonts, no horizontal overflow, one `h1` per page, the engine never fell back to `no-fx`.
- Entrance: plays, finishes by itself, is skipped by the button (focused on arrival), Enter and Escape, never replays in the same session (also not after landing on an inner page first), is absent with `?skip` and with reduced motion; the page is scrollable and `inert` is released afterwards.
- Keyboard: the first Tab stop is the skip link, then header, language, theme and quote buttons, with a visible 3 px ring everywhere; mobile menu is `inert` when closed, opens with focus on its first link, Escape closes it and returns focus to the burger (EN and AR). Season tabs and chips change their pane and `aria-selected` / `aria-pressed`.
- Language switch goes to the equivalent page (`/en/products/sweets-kaak-chocolate/` to `/ar/…`), keeps the choice and the arrival curtain clears itself.
- Resilience: with JavaScript off, with GSAP blocked, with three.js blocked, with `scene.js` blocked and with `main.js` blocked (8 s guard) the page is readable, scrolls and its links work.
- Not measured here: real-device frame rate and battery, screen readers, the Arabic text by a native editor.

## Open items (shown as "to be confirmed" on the site)

- **Final logo (vector).** The header mark and wordmark are temporary. Only a preliminary raster of the old logo ("JORDAN CANNING", `brand/`) has arrived; its wordmark conflicts with the official name, so the site does not use it. The Pantone colour is decided (294 C).
- **Certifications:** exist but not received, so none is named. A placeholder remains.
- **Production capacity, clients, case studies, team.**
- **Sector specs:** milk powder/dairy, coffee and tea, industrial (coatings, ends, sizes by weight, MOQ, lead times). White cheese and the olive-oil fine specs are deliberately not needed; olive oil still lists certifications and MOQ/lead times.
- **Redirects** from the old site's URLs are not planned yet.
- The 3D tins and the artwork on them are illustrative (drawn in code, no client brand); product drawings in the SVG fallback are illustrative too. Real photography and video are not in this build (videos received as links: `docs/video-sources.md`).
- Remove or adjust the footer "draft content" line and the Review-mode button before launch.
- A native Arabic editor should read all Arabic copy once; real-device checks are still open: frame rate and battery of the 3D on a mid-range phone (software WebGL cannot measure it), screen-reader and keyboard pass.
- Fonts still load from Google Fonts (self-host for fully offline use).
- Not yet built from the proposed structure: Seasons campaign pages, Insights (blog), by-type product pages, catalogue landing page.
