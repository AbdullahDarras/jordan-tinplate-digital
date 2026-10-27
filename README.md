# Jordan Tinplate Canning — Digital Plans
# الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية — الخطط الرقمية

Digital marketing work for **Jordan Tinplate Canning** (official Arabic name: «الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»; https://www.jordantinplate.com), a tinplate can manufacturer in Al-Zmailat – Al-Muwaqqar, Jordan (about 250 employees) serving food & beverage brands, with the Gulf and Iraq as priority markets. The official brand name is always written in full (never "Canning" alone). Plans are working drafts updated with management's approved decisions in [docs/decisions.md](docs/decisions.md).

عمل التسويق الرقمي لمصنع Jordan Tinplate Canning (الاسم العربي الرسمي «الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»، علب التنك للأغذية والمشروبات) في الزميلات – الموقّر. الأولوية للخليج والعراق، والهدف في الأشهر الأولى: الوعي بالعلامة والظهور الرقمي وتحسين محركات البحث، وليس المبيعات. المحتوى مسودات محدَّثة بقرارات الإدارة المعتمدة، وما لم يُعتمد بعد مذكور في «بانتظار الإدارة» أدناه.

## What is in this repository / المحتويات

| Path | What it is |
|---|---|
| [Jordan-Tinplate-Offsite-Action-Plan.md](Jordan-Tinplate-Offsite-Action-Plan.md) | Audit of the current brand/web presence, prioritised off-site SEO actions, ready-to-paste profile copy (AR/EN), directories and keyword seeds |
| [Jordan-Tinplate-Month1-Content-Plan.md](Jordan-Tinplate-Month1-Content-Plan.md) | Month-1 social content plan (25 Oct – 19 Nov 2026): six content pillars, seasonal calendar (olive oil, Ramadan & Eid, white cheese), 16 posts across LinkedIn / Instagram / X (pillar weights match the real post distribution), plus 3 certificate posts in round 4 (see `content/week2-bonus/`) |
| [docs/decisions.md](docs/decisions.md) | The approved decision log from management (single source of truth; any text that conflicts with it is changed to match) |
| [docs/certificates.md](docs/certificates.md) | Certificates received on 2026-10-21 (FSSC 22000 by Bureau Veritas; JFDA food-contact approval; a warranty letter that must not be published): the approved wording and what may and may not be said. Internal copies in `docs/certificates/` (not for the website until management agrees) |
| [docs/management-meeting-brief.md](docs/management-meeting-brief.md) | Management meeting brief: resolved items (✅ معتمد) and what is still pending |
| [docs/video-sources.md](docs/video-sources.md) | Source videos received from management (two YouTube links and long videos on the company Facebook page), which planned posts can use them, and what to confirm before clips are cut |
| [brand/](brand/README.md) | Brand assets and rules: colour PANTONE 294 C (about `#002F6C` on screen), the preliminary raster of the old logo (not for publication), usage rules and what is pending |
| [docs/google-business-profile-recovery.md](docs/google-business-profile-recovery.md) | Arabic step-by-step to find or recover the owner account of the existing Google Maps listing (the owner email is lost; it cannot be read from the public link), documents to prepare and a checklist |
| [website/](website/) | **The final site**: bilingual (EN/AR) static website where the home pages and every inner page share the creative experience (entrance, 3D tin stages, journey, labs, light/dark, RTL). Built from `website/tools/content.mjs` with `node website/tools/build.mjs` and checked with `python3 -I website/tools/validate.py`. Netlify publishes this folder. Production domain https://www.jordantinplate.com; every "Request a quote" button opens the order tool https://jc-order.netlify.app/. See its [README](website/README.md) |
| [content/week1/](content/week1/) | Week-1 content pack: ready-to-design copy for posts #1 to #4 (25–29 Oct 2026) |
| [content/social/strategy.html](content/social/strategy.html) | Social strategy and month-1 calendar as an interactive page (the owner's preferred format, see `CLAUDE.md`) |
| [content/social/week1/](content/social/week1/) | **Week 1 ready to post**: the posting pack page (`index.html`: every design, the reel and paste-ready copy with copy buttons), the platform previews (`posts.html`: each post as it will look on Instagram, LinkedIn and X, with the hashtags refreshed for the week's trends and the reason for each), the exported images and 30 s reel in `media/`, the profile pictures and covers, the paste-ready copy in `READY-TO-POST.md`, and the HTML sources (`src/`) with `render.mjs` / `render-reel.mjs` to export again. Tins are the website's latest 3D tins |
| [content/week2-bonus/](content/week2-bonus/) | Certificate posts (round 4): a LinkedIn announcement for FSSC 22000 (Wed 4/11, with an optional carousel) and two extra X posts (FSSC 22000 on Mon 9/11, JFDA food-contact approval on Mon 16/11), English and Arabic, approved wording only |
| [website-prototype/](website-prototype/) | Homepage prototype (kept for reference; its engine now lives in `website/assets/js/engine/`) v0.2: three.js + GSAP, Arabic/English (RTL), light/dark mode, 3D tin scenes, scroll-driven production journey. See its [README](website-prototype/README.md) |
| [dev-server/serve.ps1](dev-server/serve.ps1) | Tiny PowerShell static server used to preview the prototype (no Node or Python needed) |
| [.claude/launch.json](.claude/launch.json) | Preview configuration for the Claude desktop app |

## Run the website prototype

```powershell
powershell -ExecutionPolicy Bypass -File dev-server\serve.ps1
```

Then open http://localhost:5173 (add `?skip` to skip the entrance animation). It needs an internet connection because three.js, GSAP, Lenis and Google Fonts load from CDNs.

## Status and open items

**Approved by management (see [docs/decisions.md](docs/decisions.md))**

- Official brand name **Jordan Tinplate Canning**, always in full. The old name *Jordan Canning* is legal/historical only. Hashtag `#JordanTinplateCanning`. Official Arabic name **«الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»** (confirmed in round 3, 2026-10-21; it supersedes the round-2 wording). One username on every platform: `@jordantinplate`; the profile display name is the official name (English: Jordan Tinplate Canning; Arabic: the Arabic name).
- Address: **Al-Zmailat – Al-Muwaqqar (not Sahab), final as it is** (round 3: no further street address is requested). About 250 employees.
- Brand colour: **PANTONE 294 C** (about `#002F6C` on screen; print must use the Pantone swatch). Logo: only a preliminary raster of the old logo (gear "JC" with the wordmark "JORDAN CANNING") has arrived, saved in `brand/`; the wordmark conflicts with the official name, so the final vector logo is pending and the temporary mark stays on the site and prototype.
- No Saudi branch exists. The Saudi Food Manufacturing 2025 item is kept as participation/interview news only (decision, round 2).
- Olive-oil tins: 1, 4, 8 and 16 L/kg are the most popular sizes, and any other size is made to order (round 6, decision 40). The interior lacquer meets the highest food-grade hygiene standards (no standard is named).
- **Certificates received (round 4, 2026-10-21):** only two may be named, with the approved wording in [docs/certificates.md](docs/certificates.md): **FSSC 22000** by Bureau Veritas (certificate JO000011/1, valid until 26 April 2029) and the **JFDA food-contact materials approval** (JFDA002-000917-2026; no expiry date on public copy, renewal due before 31/12/2026). Nothing else is named: no ISO 9001, no standalone ISO 22000, no FDA, no BRC. The warranty letter is not for publication and gives no basis for an FDA claim. No FSSC/UKAS/Bureau Veritas logos until the licence terms are checked.
- 4–5 professional videos of the lines and samples exist and replace the "quick shoot" (reel #4 and Instagram posts). Received so far: two YouTube links and long videos on the company Facebook page; clips are still to be selected ([docs/video-sources.md](docs/video-sources.md)).
- Production domain **https://www.jordantinplate.com** is confirmed. Quotes and orders go through the existing tool **https://jc-order.netlify.app/** (primary "Request a quote" link on the website; `sales@jordantinplate.com` stays as the secondary option).
- White-cheese specifications and fine olive-oil technical specs are **not needed**: content is written in general terms without them, and no technical reviewer's name is needed (a technical body exists and reviews the light, toughness and stacking sentences).
- Account access is with the marketing lead (two-factor authentication on). Extra X posts (3 a week) are planned with Claude after the plan is approved.

**Pending from management (بانتظار الإدارة)**

- Final logo (vector / high-resolution) and whether the new logo drops "Canning".
- Certificates: received (resolved). Still open from them: the certificate carries the old name «Jordan Canning Industry»; FSSC/UKAS/Bureau Veritas logo licensing; what jordancanning.com / info@jordancanning.com / +962 6 402 0600 (found on the warranty letter) is; the third Arabic-name variant; JFDA renewal before 31/12/2026 (see round 4 in [docs/decisions.md](docs/decisions.md)).
- Video clip selection: confirm titles and lengths of the received videos ([docs/video-sources.md](docs/video-sources.md)).
- **Google Business Profile owner email** (lost; management will try to recover it): follow [docs/google-business-profile-recovery.md](docs/google-business-profile-recovery.md).
- Production capacity, client names and case studies (after launch).

Other notes:

- 3D tin artwork is sample artwork drawn in code, not a client design; the wordmark in the prototype is temporary until the final vector logo arrives.
- Month-1 plan will gain 3 extra X posts per week once the plan is approved.

## Credits

World land outlines in `website-prototype/assets/land-110m.geojson` come from [Natural Earth](https://www.naturalearthdata.com/) (public domain).
