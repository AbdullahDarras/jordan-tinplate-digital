# Jordan Tinplate — Digital Plans
# جوردن تينبليت — الخطط الرقمية

Digital marketing work for **Jordan Tinplate** (jordantinplate.com), a tinplate can manufacturer in Amman serving food & beverage brands, with the Gulf and Iraq as priority markets. Everything here is a working draft pending a management meeting.

عمل التسويق الرقمي لمصنع جوردن تينبليت (علب التنك للأغذية والمشروبات). الأولوية للخليج والعراق، والهدف في الأشهر الأولى: الوعي بالعلامة والظهور الرقمي وتحسين محركات البحث، وليس المبيعات. كل المحتوى مسودات بانتظار اجتماع الإدارة.

## What is in this repository / المحتويات

| Path | What it is |
|---|---|
| [Jordan-Tinplate-Offsite-Action-Plan.md](Jordan-Tinplate-Offsite-Action-Plan.md) | Audit of the current brand/web presence, prioritised off-site SEO actions, ready-to-paste profile copy (AR/EN), directories and keyword seeds |
| [Jordan-Tinplate-Month1-Content-Plan.md](Jordan-Tinplate-Month1-Content-Plan.md) | Month-1 social content plan (25 Oct – 19 Nov 2026): six content pillars, seasonal calendar (olive oil, Ramadan & Eid, white cheese), 16 posts across LinkedIn / Instagram / X |
| [website-prototype/](website-prototype/) | Homepage prototype v0.1: three.js + GSAP, Arabic/English (RTL), light/dark mode, 3D tin scenes, scroll-driven production journey. See its [README](website-prototype/README.md) |
| [dev-server/serve.ps1](dev-server/serve.ps1) | Tiny PowerShell static server used to preview the prototype (no Node or Python needed) |
| [.claude/launch.json](.claude/launch.json) | Preview configuration for the Claude desktop app |

## Run the website prototype

```powershell
powershell -ExecutionPolicy Bypass -File dev-server\serve.ps1
```

Then open http://localhost:5173 (add `?skip` to skip the entrance animation). It needs an internet connection because three.js, GSAP, Lenis and Google Fonts load from CDNs.

## Status and open items

- Brand name is not settled (site says *Jordan Tinplate*, the old logo says *Jordan Canning*); the wordmark in the prototype is temporary.
- Certifications, capacity, client names, case studies, official address and some technical claims (olive-oil and white-cheese tins) are marked "to be confirmed" and must come from management.
- 3D tin artwork is sample artwork drawn in code, not a client design.
- Month-1 plan will gain 3 extra X posts per week after the management meeting.

## Credits

World land outlines in `website-prototype/assets/land-110m.geojson` come from [Natural Earth](https://www.naturalearthdata.com/) (public domain).
