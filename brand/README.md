# Brand assets and rules / الهوية البصرية وقواعد الاستخدام

Status: round 3 (2026-10-21). Source of truth: [docs/decisions.md](../docs/decisions.md) (items 20 to 22).
الحالة: الجولة الثالثة (2026-10-21). المرجع: [docs/decisions.md](../docs/decisions.md) (البنود 20 إلى 22).

## 1) Files in this folder / الملفات

| File | What it is | Use |
|---|---|---|
| `pantone-294c.png` | Management's colour reference: a swatch labelled "PANTONE 294 C" (1280 x 520 px). It is a screenshot, so its pixels are only close to the real colour (sampled about `#102F67`, JPEG-style noise) | Reference only. Do not sample colours from it; use the values below |
| `logo-draft-jordan-canning.png` | **Preliminary raster** (600 x 135 px) of the **old** logo: a gear mark with the letters "JC" and the wordmark **"JORDAN CANNING"**. Its blue is the old navy, not Pantone 294 C | **Not for publication.** Working reference for the shape of the mark only. The final vector / high-resolution logo will come from management later |

| الملف | ما هو | الاستخدام |
|---|---|---|
| `pantone-294c.png` | مرجع اللون من الإدارة: عيّنة مكتوب عليها «PANTONE 294 C»، وهي لقطة شاشة فلونها قريب من الأصلي فقط | للرجوع فقط، ولا تؤخذ منها قيم الألوان |
| `logo-draft-jordan-canning.png` | **نسخة أولية (Raster)** من الشعار **القديم**: ترس بحرفي «JC» مع النص **JORDAN CANNING**، ولونه الأزرق القديم لا يطابق Pantone 294 C | **لا تُستخدم في أي مادة منشورة.** الشعار النهائي (Vector/عالي الدقة) سيصل لاحقاً |

## 2) Colour / اللون

| | Value |
|---|---|
| Brand navy | **PANTONE 294 C** |
| Screen approximation (sRGB) | **`#002F6C`** (RGB 0, 47, 108) |
| Used in | `website/assets/css/site.css`, `website-prototype/css/style.css`, favicons, OG card, `theme-color` |

- **The Pantone-to-screen conversion is approximate.** `#002F6C` is the usual sRGB value for 294 C, but different screens, browsers and colour profiles show it slightly differently.
- **Anything printed (packaging samples, brochures, signage, stationery) must use the physical Pantone 294 C swatch, never the hex value.** Ask the printer for a Pantone proof.
- Contrast check (WCAG 2.1, computed): **white text on `#002F6C` = 12.9:1** (passes AA for body text at 4.5:1 and AAA at 7:1). `#002F6C` text on white is the same ratio. The site's amber accent `#f2a93b` on `#002F6C` is 6.5:1 (passes AA). The light tint `#dfe6fb` on `#002F6C` is 10.4:1.
- Avoid putting `#002F6C` text on dark backgrounds; use white or the light tint there.

| | القيمة |
|---|---|
| أزرق العلامة | **PANTONE 294 C** |
| ما يقابله على الشاشة (sRGB) تقريباً | **`#002F6C`** |

- **تحويل Pantone إلى قيمة الشاشة تقريبي:** قد يظهر اللون بدرجة مختلفة قليلاً بين الشاشات والمتصفحات.
- **كل ما يُطبع (علب، كتالوجات، لافتات، قرطاسية) يجب أن يعتمد عيّنة Pantone 294 C الفعلية لا القيمة الرقمية.** اطلبوا من المطبعة بروفة Pantone.
- التباين (محسوب): النص الأبيض على `#002F6C` بنسبة **12.9:1**، ويحقق مستوى AA وAAA معاً.

## 3) Usage rules / قواعد الاستخدام

1. **Always write the full official name: Jordan Tinplate Canning.** Never "Canning" alone, in text, hashtags (`#JordanTinplateCanning`), usernames (`@jordantinplate`) or logo lock-ups. Another Jordanian company trades as "Canning Industries Co.", and "Canning" alone sends searchers to it.
2. The official Arabic name is **«الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»** (54 characters). Write it in full in Arabic text. It does not fit the Instagram name field (30) or the Facebook intro (101): keep the English name there and put the Arabic name in the bio or About.
3. The old name **Jordan Canning** and the wordmark **"JORDAN CANNING"** are legal/historical only and are not used on anything new.
4. Until the final logo arrives, the website and the prototype keep their **temporary mark** (a circle mark with a text wordmark "Jordan Tinplate Canning"), marked "final logo (vector) pending". Social templates use the same temporary wordmark.
5. Do not redraw, recolour, stretch or trace the preliminary raster logo. Do not upscale it.
6. Sample artwork on tins (in the prototype, renders, post visuals) must carry no real client brand.

1. **يُكتب الاسم الرسمي كاملاً دائماً: Jordan Tinplate Canning.** ولا تُستعمل «Canning» وحدها في أي نص أو وسم أو اسم مستخدم أو شعار، تفادياً للالتباس بشركة أخرى باسم Canning Industries Co.
2. الاسم العربي الرسمي **«الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية»** (54 حرفاً) يُكتب كاملاً في النصوص العربية. لا يتسع في خانة اسم انستغرام (30) ولا في Intro فيس بوك (101)، فيبقى الاسم الإنجليزي هناك ويُكتب العربي في البايو أو About.
3. الاسم القديم Jordan Canning والنص «JORDAN CANNING» للتاريخ والجانب القانوني فقط، ولا يُستخدمان في أي مادة جديدة.
4. حتى يصل الشعار النهائي تبقى العلامة المؤقتة على الموقع ونموذجه، ومكتوب عليها «الشعار النهائي (Vector) بانتظار».
5. لا تُعاد رسم النسخة الأولية للشعار ولا تُلوَّن ولا تُمدَّد ولا تُكبَّر.
6. الرسومات على العلب نماذج توضيحية بلا علامة عميل حقيقية.

## 4) Pending / ما زال بانتظار

| Item | Status |
|---|---|
| **Final logo, vector (SVG/AI/EPS/PDF) and high-resolution** | Pending from management. Needed for the website header, favicon, social profile pictures, covers and print |
| **Does the new logo drop "Canning"?** | Open question for management. The preliminary logo's wordmark says "JORDAN CANNING", which conflicts with the official name Jordan Tinplate Canning and with rule 1 above. The final logo should carry the full official name (or no word at all) |
| Logo colours | The preliminary raster uses the old navy. The final logo should use PANTONE 294 C |
| Clear space, minimum size, light/dark versions | To be defined once the vector logo arrives |

| البند | الحالة |
|---|---|
| **الشعار النهائي بصيغة Vector وبدقة عالية** | بانتظار الإدارة. مطلوب لرأس الموقع والأيقونة وصور الحسابات والأغلفة والمطبوعات |
| **هل يُسقط الشعار الجديد كلمة Canning؟** | سؤال مفتوح للإدارة. نص الشعار الأولي «JORDAN CANNING» يخالف الاسم الرسمي، ويجب أن يحمل الشعار النهائي الاسم الرسمي كاملاً (أو بلا نص) |
| ألوان الشعار | النسخة الأولية بالأزرق القديم، والنهائي يعتمد PANTONE 294 C |
| المساحة الآمنة والحد الأدنى للحجم والنسخ الفاتحة والداكنة | تُحدَّد بعد وصول الشعار Vector |
