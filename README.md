# Jordan Tinplate Canning — Digital Plans
# الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية — الخطط الرقمية

Digital marketing work for **Jordan Tinplate Canning** (official Arabic name: «الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»; https://www.jordantinplate.com), a tinplate can manufacturer in Al-Zmailat – Al-Muwaqqar, Jordan (about 250 employees) serving food & beverage brands, with the Gulf and Iraq as priority markets. The official brand name is always written in full (never "Canning" alone). Plans are working drafts updated with management's approved decisions in [docs/decisions.md](docs/decisions.md).

عمل التسويق الرقمي لمصنع Jordan Tinplate Canning (الاسم العربي الرسمي «الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»، علب التنك للأغذية والمشروبات) في الزميلات – الموقّر. الأولوية للخليج والعراق، والهدف في الأشهر الأولى: الوعي بالعلامة والظهور الرقمي وتحسين محركات البحث، وليس المبيعات. المحتوى مسودات محدَّثة بقرارات الإدارة المعتمدة، وما لم يُعتمد بعد مذكور في «بانتظار الإدارة» أدناه.

## What is in this repository / المحتويات

| Path | What it is |
|---|---|
| [Jordan-Tinplate-Offsite-Action-Plan.md](Jordan-Tinplate-Offsite-Action-Plan.md) | Audit of the current brand/web presence, prioritised off-site SEO actions, ready-to-paste profile copy (AR/EN), directories and keyword seeds |
| [Jordan-Tinplate-Month1-Content-Plan.md](Jordan-Tinplate-Month1-Content-Plan.md) | Month-1 social content plan (25 Oct – 19 Nov 2026): six content pillars, seasonal calendar (olive oil, Ramadan & Eid, white cheese), 16 posts across LinkedIn / Instagram / X (pillar weights match the real post distribution) |
| [docs/decisions.md](docs/decisions.md) | The approved decision log from management (single source of truth; any text that conflicts with it is changed to match) |
| [docs/management-meeting-brief.md](docs/management-meeting-brief.md) | Management meeting brief: resolved items (✅ معتمد) and what is still pending |
| [docs/video-sources.md](docs/video-sources.md) | Source videos received from management (two YouTube links and long videos on the company Facebook page), which planned posts can use them, and what to confirm before clips are cut |
| [brand/](brand/README.md) | Brand assets and rules: colour PANTONE 294 C (about `#002F6C` on screen), the preliminary raster of the old logo (not for publication), usage rules and what is pending |
| [docs/google-business-profile-recovery.md](docs/google-business-profile-recovery.md) | Arabic step-by-step to find or recover the owner account of the existing Google Maps listing (the owner email is lost; it cannot be read from the public link), documents to prepare and a checklist |
| [website/](website/) | Phase-1 bilingual (EN/AR) static website, built from `website/tools/content.mjs` with `node website/tools/build.mjs` and checked with `python3 website/tools/validate.py`. Production domain https://www.jordantinplate.com; every "Request a quote" button opens the order tool https://jc-order.netlify.app/. See its [README](website/README.md) |
| [content/week1/](content/week1/) | Week-1 content pack: ready-to-design copy for posts #1 to #4 (25–29 Oct 2026) |
| [website-prototype/](website-prototype/) | Homepage prototype v0.1: three.js + GSAP, Arabic/English (RTL), light/dark mode, 3D tin scenes, scroll-driven production journey. See its [README](website-prototype/README.md) |
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
- Olive-oil tins are produced in 1, 4, 8 and 16 L/kg. The interior lacquer meets the highest food-grade hygiene standards (no standard is named).
- Certifications exist, but none has been received yet, so none may be named.
- 4–5 professional videos of the lines and samples exist and replace the "quick shoot" (reel #4 and Instagram posts). Received so far: two YouTube links and long videos on the company Facebook page; clips are still to be selected ([docs/video-sources.md](docs/video-sources.md)).
- Production domain **https://www.jordantinplate.com** is confirmed. Quotes and orders go through the existing tool **https://jc-order.netlify.app/** (primary "Request a quote" link on the website; `sales@jordantinplate.com` stays as the secondary option).
- White-cheese specifications and fine olive-oil technical specs are **not needed**: content is written in general terms without them, and no technical reviewer's name is needed (a technical body exists and reviews the light, toughness and stacking sentences).
- Account access is with the marketing lead (two-factor authentication on). Extra X posts (3 a week) are planned with Claude after the plan is approved.

**Pending from management (بانتظار الإدارة)**

- Final logo (vector / high-resolution) and whether the new logo drops "Canning".
- Certificates (not received yet; none may be named until copies arrive).
- Video clip selection: confirm titles and lengths of the received videos ([docs/video-sources.md](docs/video-sources.md)).
- **Google Business Profile owner email** (lost; management will try to recover it): follow [docs/google-business-profile-recovery.md](docs/google-business-profile-recovery.md).
- Production capacity, client names and case studies (after launch).

Other notes:

- 3D tin artwork is sample artwork drawn in code, not a client design; the wordmark in the prototype is temporary until the final vector logo arrives.
- Month-1 plan will gain 3 extra X posts per week once the plan is approved.

## Credits

World land outlines in `website-prototype/assets/land-110m.geojson` come from [Natural Earth](https://www.naturalearthdata.com/) (public domain).
