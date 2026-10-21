# Homepage prototype review (website-prototype v0.1)

Reviewed 2026-10-20 in real Chromium (Playwright 1.56, software WebGL / SwiftShader), served with `python3 -m http.server 5173` from `website-prototype/`. No repo files were edited. Line numbers refer to the files as they were at review time.

Screenshots: `/tmp/claude-0/-home-user-jordan-tinplate-digital/7394e321-0133-581c-bca0-dbbf15c05386/scratchpad/screens/` (about 240 PNGs, not committed). Naming: `{desktop|mobile}-{en|ar}-{light|dark}-NN-section[-k].png` for the full matrix (1440x900 and 390x844, `?skip`); `C-*` for interactions (finish/shape/season clicks, theme and language switch, menu, form, review mode, tablet 768/1024, wide 1920, loader frames); `D-*` for degraded scenarios (no Lenis, no three.js, no WebGL, reduced motion, no JS); `A-asis-*` for the page exactly as shipped in this sandbox.

## 1. CDN check (the headline finding)

| Resource | Result in this sandbox |
|---|---|
| `cdnjs.cloudflare.com` gsap 3.12.5 + ScrollTrigger (index.html:395-396) | BLOCKED (proxy answers 403 to CONNECT) |
| `cdn.jsdelivr.net` Lenis 1.1.13 (index.html:397) | BLOCKED |
| `cdn.jsdelivr.net` three@0.160.1 + addons (importmap, index.html:25-26) | BLOCKED |
| Google Fonts CSS and font files (index.html:21) | Loads fine (Bricolage Grotesque, DM Sans, Readex Pro all reported `loaded`) |
| unpkg, esm.sh, code.jquery.com | also blocked; only npm registry and Google Fonts are reachable |

So here the page cannot run as shipped. To review the real visuals I served identical library versions from npm tarballs through Playwright request interception (nothing in the repo changed). Everything below marked "verified" was observed in that shimmed run; the blocked-CDN behaviour was observed in an unshimmed run (`A-asis-cdn-*.png`).

## 2. Console and network

With CDNs shimmed, in all 8 matrix runs plus interactions: 0 page errors, 0 failed requests, 0 HTTP errors, no horizontal overflow at 390, 768, 1024, 1440 or 1920 px. The only console message is `THREE.WebGLRenderer: KHR_parallel_shader_compile extension not supported`, which is a SwiftShader limitation, not an app bug.

Unshimmed (CDNs blocked): `ERR_TUNNEL_CONNECTION_FAILED` x3, then `Uncaught TypeError: Cannot read properties of undefined (reading 'registerPlugin')`, and a 404 for `/favicon.ico` (no icon is declared).

## 3. Issues

Severity: High = breaks the page or core goal, Med = real user-facing defect, Low = polish.

| # | Sev | Where | Issue | Suggested fix |
|---|---|---|---|---|
| 1 | High | js/main.js:6-7, index.html:395-398, css/style.css:34 | Hard dependency on the GSAP CDN. If gsap does not load, `gsap.registerPlugin` throws at module top level, `boot()` never runs, and the loader overlay stays up forever at "0%" with the page scroll-locked (`body.is-loading`). Happens even with `?skip`. Verified (`A-asis-cdn-skip-1440x900.png`). Any corporate firewall, ad-blocker or CDN outage in the Gulf/Iraq target markets would show a blank blue screen. three.js failure is handled well (see "works well"); gsap is not. | Self-host gsap, ScrollTrigger, Lenis and three under `js/vendor/` (also removes the importmap CDN hop and gives control over caching). Cheap guard in the meantime: at the top of main.js, `if (!window.gsap) { document.getElementById('loader')?.remove(); document.body.classList.remove('is-loading'); throw ... }`. Add a loader watchdog (remove after about 12 s). |
| 2 | High (for the SEO goal) | js/main.js:318, 351-360, index.html:37 | Entrance is mandatory and unskippable: about 3 s creep, shader warm-up (up to 8 s timeout, main.js:343), 3.2 s of fake progress, 0.7 s hold, about 1 s iris, so roughly 6-9 s on a fast machine before the H1 is visible, on every page load. `?skip` is hidden. This delays LCP, hurts returning visitors and crawlers that run JS. Timings under software GL were far worse (not representative of real GPUs). | Show the entrance once per session (`sessionStorage`), add a visible "Skip" control, and render the hero text underneath instead of hiding it. Drive progress from real load events, not a fixed 3.2 s tween. |
| 3 | Med | index.html:399 | `<noscript>` style has a typo: `.body.is-loading{overflow:auto}` (selector `.body`, should be `body`). With JS off the body keeps `overflow:hidden` and the page cannot scroll. Verified (`D-no-js-hero.png`, scrollY stays 0). | `body.is-loading{overflow:auto}`. |
| 4 | Med | css/style.css:162-164, 335, js/main.js:234-238 | Mobile menu is `display:flex` at all times at <=1040 px and only hidden with `clip-path` + `aria-hidden="true"`. Its 7 links stay in the tab order (verified: all `tabIndex 0`, inside an `aria-hidden` ancestor), so keyboard users tab into invisible links, and axe will flag focusable-in-aria-hidden. Escape does not close it. | Use `inert` (or `visibility:hidden` toggled after the transition) while closed; add an Escape handler; move focus into the menu on open and back to the burger on close. |
| 5 | Med | css/style.css:275, 268 | Range section: the decorative SVG of the "Fancy tins" XL card sits on top of the card text (circle outline crosses the heading/description). Visible in EN and AR (`*-06-range-1.png`); worse in RTL where it lands on the left over the paragraph. | Give `.card > *:not(.card__art)` `position:relative; z-index:1`, and shrink or move the art (e.g. `top:4%; width:44%`) or reserve space with padding. |
| 6 | Med | css/style.css:260-268 | Bento grid has 7 cards in a 4-column grid, leaving a permanent hole at bottom right of the last row on desktop (`desktop-en-light-06-range-2.png`) and bottom left in RTL. | Make card 05 or 07 wider, add an 8th card (e.g. catalogue CTA card), or move the "Download the catalogue" button into the empty cell. |
| 7 | Med | js/main.js:209-217, index.html:367-384 | Form is mailto-only. The "Thanks, your email app will open" note shows even when no mail client exists (typical on desktop), so the lead is silently lost. No `aria-invalid`, focus does not move to the offending field, error text is one generic string. Fine for a prototype, must change before launch. | Post to a real endpoint (form service/CRM), keep mailto as fallback, set `aria-invalid` + focus the first bad field. |
| 8 | Med | css/style.css (accent text), `.card__idx` 269, `.ncard__tag` 296, `.spec__v` 241 | Accent amber `#d98b14` used as small text on the light background has contrast 2.34:1 (computed from rendered colours; AA needs 4.5:1). Affects card numbers, news tags, spec dimensions in light mode. Dark mode is fine. | Use a darker accent for text in light theme (e.g. `#9a5a00`, about 5:1) and keep the bright amber for fills only. |
| 9 | Med | index.html:273-283, 167-171, 195-199; js/main.js:179-202 | Season tabs have `role="tab"` but no `aria-selected`, `aria-controls` or tabpanel; finish/shape chips and colourway swatches carry state only through a CSS class. Verified in the accessibility tree: no `[selected]`/`[pressed]`. Screen-reader users cannot tell which option is active. | Set `aria-selected` on tabs (or drop the tab roles and use `aria-pressed` buttons); add `aria-pressed` to chips and swatches in the click handlers. |
| 10 | Med | js/i18n.js:23, 16 | Arabic for "matte" is `مطّ` (means "stretching"), used for the finish chip and the print step. The standard print term is `مطفي` or `مات`. Also `st.p1` (i18n.js:46) says `تصميم داخلي`, which reads as "interior design"; the meaning is in-house design (`فريق تصميم داخل المصنع`). Needs a native reviewer pass. | Fix those two strings and have the whole AR file reviewed. |
| 11 | Med | js/main.js:257 | Journey pin length is computed once: `end: '+=' + Math.round(innerHeight*4.2)`. After a window resize / rotation it is stale. Verified: viewport 900 -> 600 px high leaves pin length at 3780 px (should be 2520), so the pinned scene scrolls much longer than designed. | `end: () => '+=' + Math.round(innerHeight * 4.2)` plus `invalidateOnRefresh: true`. |
| 12 | Low | index.html:332-343 | Three of the four news cards (Dubai, New York, Baghdad tags and the "Gulfood Manufacturing" / "Fancy Food Show" titles) have no `data-i18n`, so they stay English in Arabic mode while card 4 is translated (`desktop-ar-light-09-news-1.png`). The three 2017 cards also get tilt/hover styling but are not links. | Add keys (city names and 2017 tags) to AR; keep event names Latin if desired, but consistently; drop hover/tilt on non-links or link them. |
| 13 | Low | index.html:387 | In RTL the footer renders `Jordan Tinplate 2026 ©` (bidi reorder of `© <span id=yr>2026</span> Jordan Tinplate`). | Wrap the line in `<bdi>`/`dir="ltr"` or use `&lrm;`. |
| 14 | Low | css/style.css:282 | The giant outlined "28" uses `-webkit-text-stroke` on the variable font, which exposes overlapping contours inside the 8 and between the digits (stray diamond/box shapes). Visible in `desktop-en-light-08-story-1.png` and AR dark. The file already notes the same problem for Arabic marquee text (css:200). | Use a static (non-overlapping) cut of the font, render the number as SVG text with `paint-order`, or use a solid fill with a gradient/low-opacity instead of a stroke. |
| 15 | Low | css/style.css:101, js/main.js:137-146 | Custom cursor dot is parked at 0,0 and visible top-left in every screenshot until the first `pointermove`; `html{cursor:none}` (css:109) means keyboard-only or tablet-with-mouse users briefly see a stray dot. | Start `.cursor` with class `is-hidden` and remove it on the first pointer event. |
| 16 | Low | css/style.css:356 | At <=560 px the wordmark is hidden (`.brand__word{display:none}`), leaving only an unlabeled circle mark as the only brand cue in the header of a brand-awareness site. At 390 px there is room if the letter-spacing is reduced. | Show a shorter/smaller wordmark on mobile. |
| 17 | Low | css/style.css:65-77 | Duplicate/conflicting Arabic rules (`.display` line-height set at 65, 68 and 76; `.h2/.mega` at 65 and 77). In the Arabic hero the shadda on "ونعلّب" collides with the line above (`desktop-ar-light-01-hero.png`). | Collapse to one rule per selector and test tashkeel at hero size. |
| 18 | Low | js/scene.js:18, js/main.js:33 | Embossed finish (`bumpScale: 5`) is so strong it destroys the artwork: the logo reads "RDAN PLATE", and the Eid season tin (default `finish:'emboss'`) makes the Arabic greeting hard to read (`C-finish-emboss.png`, `C-season-eid.png`). | Lower `bumpScale` (about 1.5-2), or emboss only the ornament layer. |
| 19 | Low | index.html:37 | `#loader` is `role="status" aria-live="polite"` and its percentage text changes about 60 times a second, which is announced by screen readers. | Remove `aria-live`, use `aria-busy` and announce once on completion. |
| 20 | Low | index.html:3-8 | No favicon (404 on `/favicon.ico`), no canonical/OG/Twitter tags, no `meta description` update in Arabic (`document.title` is updated, the description is not), no hreflang. README already plans per-language URLs; add the head basics in the next phase. | Add icon, OG image, canonical, and per-language descriptions. |
| 21 | Low | css/style.css (no rule exists; only inputs at 317-319) | No custom `:focus-visible` style anywhere; the browser default 1 px ring is used, which is nearly invisible on the dark contact section and on pills. | Add a 2-3 px accent outline for `a, button, .chip, .tab, .sw` on `:focus-visible`. |
| 22 | Low | js/scene.js:446-454, main.js:362 | The loader's stage is registered in `stages` and never removed after `#loader.remove()` (scene.debug shows a 0x0 "journey" entry). Harmless because tiny rects are skipped, but it is a small leak. | Call `scene.refreshStages()` after removing the loader, or filter on `el.isConnected`. |
| 23 | Low (untested) | js/scene.js:481-492 | All visible stages are re-rendered and copied into 2D canvases every frame, even when nothing moves, and each canvas is 124% of its stage. I could not measure FPS or battery cost on a real GPU or phone (software GL only). | Test on a mid-range Android; consider pausing the render loop when the tab is idle and the stage is static, and capping DPR to 1.5 on mobile. |

## 4. Graceful-degradation matrix (verified)

| Scenario | Result |
|---|---|
| Lenis blocked | OK: native scroll, no errors beyond the failed request |
| three.js blocked / WebGL disabled | OK: `html.no-gl`, "JT" placeholder pill in every stage, all text, nav, chips and form still work (`D-three-blocked-*.png`, `D-no-webgl-*.png`) |
| `prefers-reduced-motion` | OK: page loads and scrolls, no Lenis, shortened loader |
| gsap/ScrollTrigger blocked | FAIL: stuck loader (issue 1) |
| JavaScript disabled | PARTIAL: content visible, but not scrollable (issue 3) |

## 5. What works well

- Visual direction is strong and consistent: navy/amber brand palette, big display type, and the three.js tins read as real printed metal (gloss, matte, soft touch, rough, emboss all change the material visibly).
- Journey section: sheet, print sweep, bend, lid drop, pallet and globe sequence works end to end and is deterministic (`window.__jtJourney(p)`); the rail, step text and pin all stay in sync. The globe with Amman and Gulf/Iraq arcs communicates the export story well.
- Arabic/RTL is genuinely mirrored (nav, grids, rail fill direction, bento order, chevrons, spec border, form) with a dedicated font and tuned line-heights; EN<->AR curtain transition works, a double click is safely ignored, and `lang`/`dir`/`<title>`/localStorage all update. Theme switch (view-transition circle reveal) works and persists; both themes were checked for every section.
- Layout is robust: no horizontal overflow at 390/768/1024/1440/1920, sensible stacking order on mobile (tin first, then copy), `touch-action: pan-y` on stages so vertical scroll is never trapped, mobile menu opens/navigates/closes correctly (also in RTL).
- Resilience: three.js or WebGL failures fall back cleanly; localStorage access is guarded; reduced-motion is respected; interactive state machines (finish, shape, season) survive rapid clicking (final state matched the last click).
- Content discipline: placeholders are honestly marked ("to be confirmed"), and the Review mode (dashed red TBC outlines) is a useful hand-off tool; the form validates name/email and the in-season badge is date-driven.
- Headings keep correct accessible names despite the word-splitting animation (Chromium accessibility tree shows full text for h1/h2).

## 6. Method limits

Software WebGL only, so frame rate, shader-compile time and loader duration are not representative; touch gestures were tapped, not physically swiped; Safari/Firefox not tested; Arabic copy was checked for rendering and obvious wording problems, not by a native reviewer.
