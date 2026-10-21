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
  assets/js/site.js     nav, theme, language preference, reveal, review mode (no form: the quote CTA is a plain link)
  assets/img/           favicon.svg, og-default.png (1200x630)
  tools/content.mjs     ALL copy, English + Arabic side by side: t('English', 'العربية')
  tools/build.mjs       renders every page, sitemap, robots, chooser, 404
  tools/validate.py     checks the generated output (see below)
  tools/screenshots.mjs headless-Chromium screenshots at 1440 and 390, and the OG image
  tools/og-card.html    source of og-default.png
```

Pages (each in `/en/` and `/ar/`): home · products · 6 industries (`products/olive-oil`, `milk-powder-dairy`, `sweets-kaak-chocolate`, `white-cheese`, `coffee-tea`, `industrial`) · capabilities · about · news · contact (phone, email and the online order tool).

SEO per page: unique `<title>` and description, canonical, `hreflang` en / ar / x-default (x-default = the English page), Open Graph and Twitter tags, JSON-LD (`Organization` + `WebSite` + `WebPage`, plus `BreadcrumbList` on inner pages). Arabic pages use the official Arabic name as `name` (English as `alternateName`), English pages the reverse. The language switch in the header is a normal link to the equivalent page in the other language.

## Edit and rebuild

1. Edit `tools/content.mjs` (copy, pages, placeholders) or `assets/css|js`.
2. `node tools/build.mjs` (needs Node 18+; no packages). Set `SITE_URL=https://example.com` (staging only) to change the origin used in canonical / hreflang / sitemap / JSON-LD.
3. `python3 tools/validate.py` checks: HTML is well formed, internal links and anchors resolve, hreflang is reciprocal and matches canonical and the sitemap, titles/descriptions are unique, OG tags exist, JSON-LD parses and has the right graph, language switch targets are correct.
4. Commit the regenerated files.

A "to be confirmed" item is a `tbc` block or a row with `tbc: true`; it renders as a dashed box with a badge. The footer **Review mode** button outlines every placeholder on the page.

## Verified so far

- `validate.py` passes on 26 HTML files (24 sitemap pages + chooser + 404).
- All 24 pages opened in headless Chromium at 1440 and 390 px, light and dark: no console errors, no horizontal overflow, RTL flips correctly. Mobile menu, theme toggle, language switch and chooser redirect exercised.

## Decisions applied (see `docs/decisions.md`)

Official English name **Jordan Tinplate Canning** (always full, never "Canning" alone); official Arabic name **«الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»** (used on all Arabic pages, titles and JSON-LD) · production domain `https://www.jordantinplate.com` confirmed · every "Request a quote / اطلب عرض سعر" button opens the existing order tool <https://jc-order.netlify.app/> in a new tab (`rel="noopener"`), with `mailto:sales@jordantinplate.com` as the secondary option on the contact page and CTA band · white-cheese and olive-oil fine technical specs are not needed (pages are written without them) · address Al-Zmailat – Al-Muwaqqar, Amman · no Saudi branch (Saudi Food Manufacturing 2025 appears only as a news item) · olive-oil tins in 1, 4, 8, 16 L/kg and food-grade interior lacquer "meeting the highest food-safety standards" (no standard named) · about 250 employees · certifications exist but none is named.

## Open items (shown as "to be confirmed" on the site)

- **Final logo and Pantone code.** The header mark and wordmark are temporary.
- **Full street address** and map location (area only is shown).
- **Certifications:** exist but not received, so none is named. A placeholder remains.
- **Production capacity, clients, case studies, team.**
- **Sector specs:** milk powder/dairy, coffee and tea, industrial (coatings, ends, sizes by weight, MOQ, lead times). White cheese and the olive-oil fine specs (light protection, spout/handle/closure) are deliberately not needed; olive oil still lists certifications and MOQ/lead times.
- **Saudi Food Manufacturing 2025 news item:** kept (decision, round 2) as interview/participation news only; the site claims no Saudi branch, office or expansion.
- **Redirects** from the old site's URLs are not planned yet. (The production domain `https://www.jordantinplate.com` is confirmed; `SITE_URL` only overrides it for staging builds.)
- Product drawings are illustrative inline SVG, not client designs. Real photography and the 4–5 videos are not in phase 1.
- Remove or adjust the footer "draft content" line and the Review-mode button before launch.
- Arabic copy should get one pass from a native-speaking editor, and a real-device accessibility check (screen reader, keyboard) is still worth doing.
- Not yet built from the proposed structure: Seasons campaign pages, Insights (blog), by-type product pages, catalogue landing page.
