# Jordan Tinplate Canning: website, phase 1

Static, bilingual (English / Arabic) multi-page site. Plain HTML, one CSS file and one small JS file. No framework and no build step is needed to *run* it. A tiny Node script renders the pages from one data file, and the generated output is committed.

Palette, fonts and light/dark tokens are reused from `website-prototype/` (the prototype itself is untouched; the 3D scenes are not part of phase 1).

## Run it

```bash
cd website
python3 -m http.server 8000
# open http://localhost:8000/   (language chooser) or http://localhost:8000/en/ and /ar/
```

Serve `website/` as the **root of a domain** (links are root-relative, e.g. `/en/products/`). Google Fonts load from the web; the site still works without them.

## Structure

```
website/
  index.html            language chooser (noindex), redirects to /en/ or /ar/ from saved choice / browser language
  404.html              bilingual not-found page
  robots.txt  sitemap.xml   (sitemap has xhtml:link alternates + x-default)
  en/…  ar/…            12 pages per language, same paths in both
  assets/css/site.css   the one stylesheet (logical properties, so RTL needs no second file)
  assets/js/site.js     nav, theme, language preference, reveal, quote form (mailto)
  assets/img/           favicon.svg, og-default.png (1200x630)
  tools/content.mjs     ALL copy, English + Arabic side by side: t('English', 'العربية')
  tools/build.mjs       renders every page, sitemap, robots, chooser, 404
  tools/validate.py     checks the generated output (see below)
  tools/screenshots.mjs headless-Chromium screenshots at 1440 and 390, and the OG image
  tools/og-card.html    source of og-default.png
```

Pages (each in `/en/` and `/ar/`): home · products · 6 industries (`products/olive-oil`, `milk-powder-dairy`, `sweets-kaak-chocolate`, `white-cheese`, `coffee-tea`, `industrial`) · capabilities · about · news · contact (request a quote).

SEO per page: unique `<title>` and description, canonical, `hreflang` en / ar / x-default (x-default = the English page), Open Graph and Twitter tags, JSON-LD (`Organization` + `WebSite` + `WebPage`, plus `BreadcrumbList` on inner pages). The language switch in the header is a normal link to the equivalent page in the other language.

## Edit and rebuild

1. Edit `tools/content.mjs` (copy, pages, placeholders) or `assets/css|js`.
2. `node tools/build.mjs` (needs Node 18+; no packages). Set `SITE_URL=https://example.com` to change the origin used in canonical / hreflang / sitemap / JSON-LD.
3. `python3 tools/validate.py` checks: HTML is well formed, internal links and anchors resolve, hreflang is reciprocal and matches canonical and the sitemap, titles/descriptions are unique, OG tags exist, JSON-LD parses and has the right graph, language switch targets are correct.
4. Commit the regenerated files.

A "to be confirmed" item is a `tbc` block or a row with `tbc: true`; it renders as a dashed box with a badge. The footer **Review mode** button outlines every placeholder on the page.

## Verified so far

- `validate.py` passes on 26 HTML files (24 sitemap pages + chooser + 404).
- All 24 pages opened in headless Chromium at 1440 and 390 px, light and dark: no console errors, no horizontal overflow, RTL flips correctly. Mobile menu, theme toggle, language switch and chooser redirect exercised.

## Decisions applied (see `docs/decisions.md`)

Official name **Jordan Tinplate Canning** (always full, never "Canning" alone) · address Al-Zmailat – Al-Muwaqqar, Amman · no Saudi branch (Saudi Food Manufacturing 2025 appears only as a news item) · olive-oil tins in 1, 4, 8, 16 L/kg and food-grade interior lacquer "meeting the highest food-safety standards" (no standard named) · about 250 employees · certifications exist but none is named.

## Open items (shown as "to be confirmed" on the site)

- **Arabic official name.** Pages use the Latin name; «جوردن تينبليت كانينغ» appears only as a marked temporary name on the About page.
- **Final logo and Pantone code.** The header mark and wordmark are temporary.
- **Full street address** and map location (area only is shown).
- **Certifications:** exist but not received, so none is named. A placeholder remains.
- **Production capacity, clients, case studies, team.**
- **Sector specs:** white cheese, milk powder/dairy, coffee and tea, industrial (coatings, ends, sizes by weight, MOQ, lead times). Olive oil still lacks: light protection, spout/handle/closure options, MOQ and lead times.
- **Saudi Food Manufacturing 2025 news item:** the partner's approval is pending, and the linked Sharikat Mubasher article's own headline talks about expansion into Saudi Arabia. Management should decide whether to keep that link.
- **Production domain** is assumed to be `https://www.jordantinplate.com` (set `SITE_URL` otherwise). Redirects from the old site's URLs are not planned yet.
- **Quote form** opens the visitor's email app (mailto). Replace with a hosted form / backend before launch.
- Product drawings are illustrative inline SVG, not client designs. Real photography and the 4–5 videos are not in phase 1.
- Remove or adjust the footer "draft content" line and the Review-mode button before launch.
- Arabic copy should get one pass from a native-speaking editor, and a real-device accessibility check (screen reader, keyboard) is still worth doing.
- Not yet built from the proposed structure: Seasons campaign pages, Insights (blog), by-type product pages, catalogue landing page.
