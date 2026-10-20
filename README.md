# Jordan Tinplate Canning — Digital Plans
# جوردن تينبليت كانينغ [مؤقت] — الخطط الرقمية

Digital marketing work for **Jordan Tinplate Canning** (jordantinplate.com), a tinplate can manufacturer in Al-Zmailat – Al-Muwaqqar, Jordan (about 250 employees) serving food & beverage brands, with the Gulf and Iraq as priority markets. The official brand name is always written in full (never "Canning" alone). Plans are working drafts updated with management's approved decisions in [docs/decisions.md](docs/decisions.md).

عمل التسويق الرقمي لمصنع Jordan Tinplate Canning (الاسم العربي المؤقت «جوردن تينبليت كانينغ» [مؤقت]، علب التنك للأغذية والمشروبات) في الزميلات – الموقّر. الأولوية للخليج والعراق، والهدف في الأشهر الأولى: الوعي بالعلامة والظهور الرقمي وتحسين محركات البحث، وليس المبيعات. المحتوى مسودات محدَّثة بقرارات الإدارة المعتمدة، وما لم يُعتمد بعد مذكور في «بانتظار الإدارة» أدناه.

## What is in this repository / المحتويات

| Path | What it is |
|---|---|
| [Jordan-Tinplate-Offsite-Action-Plan.md](Jordan-Tinplate-Offsite-Action-Plan.md) | Audit of the current brand/web presence, prioritised off-site SEO actions, ready-to-paste profile copy (AR/EN), directories and keyword seeds |
| [Jordan-Tinplate-Month1-Content-Plan.md](Jordan-Tinplate-Month1-Content-Plan.md) | Month-1 social content plan (25 Oct – 19 Nov 2026): six content pillars, seasonal calendar (olive oil, Ramadan & Eid, white cheese), 16 posts across LinkedIn / Instagram / X (pillar weights match the real post distribution) |
| [docs/decisions.md](docs/decisions.md) | The approved decision log from management (single source of truth; any text that conflicts with it is changed to match) |
| [docs/management-meeting-brief.md](docs/management-meeting-brief.md) | Management meeting brief: resolved items (✅ معتمد) and what is still pending |
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

- Official brand name **Jordan Tinplate Canning**, always in full. The old name *Jordan Canning* is legal/historical only. Hashtag `#JordanTinplateCanning`; handle suggestion `@jordantinplatecanning` (X is limited to 15 characters, so `@jordantinplate` there). Provisional Arabic name «جوردن تينبليت كانينغ» [مؤقت].
- Address: Al-Zmailat – Al-Muwaqqar (not Sahab). About 250 employees.
- No Saudi branch exists. The Saudi Food Manufacturing 2025 item is participation/interview only.
- Olive-oil tins are produced in 1, 4, 8 and 16 L/kg. The interior lacquer meets the highest food-grade hygiene standards (no standard is named).
- Certifications exist, but none has been received yet, so none may be named.
- 4–5 professional videos of the lines and samples exist and replace the "quick shoot" (reel #4 and Instagram posts).
- Account access is with the marketing lead (two-factor authentication on). Extra X posts (3 a week) are planned with Claude after the plan is approved.

**Pending from management (بانتظار الإدارة)**

- Official Arabic name; final logo with Pantone code.
- Certificates (names and copies); video delivery (where to upload).
- Full address (and map coordinates), phone and opening hours for Google.
- Production capacity, client names and case studies (after launch). White-cheese tin specifications are still "to be confirmed".
- Name of the technical reviewer and how posts are sent to them.

Other notes:

- 3D tin artwork is sample artwork drawn in code, not a client design; the wordmark in the prototype is temporary until the logo arrives.
- Month-1 plan will gain 3 extra X posts per week once the plan is approved.

## Credits

World land outlines in `website-prototype/assets/land-110m.geojson` come from [Natural Earth](https://www.naturalearthdata.com/) (public domain).
