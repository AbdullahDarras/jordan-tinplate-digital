# Hidden items: what still waits for management

Management asked for everything that was "to be confirmed" to be **removed from the visible site** (round 5, `docs/decisions.md` item 39). Nothing was deleted: every item below is still in `tools/content.mjs`, flagged as a `tbc` block, a row with `tbc: true`, or the `PROOF_TBC` list, and the build skips it while one flag is off.

## The switch

`tools/content.mjs`:

```js
export const SHOW_PENDING = false;   // true = the placeholders come back
```

- `false` (now): `build.mjs` drops every `tbc` block, every `tbc: true` row, the proof boxes on the home story and the draft notice in the footer. A section whose blocks were all `tbc` disappears with them. `assets/css/pending.css` is not linked. `python3 -I tools/validate.py` fails if "to be confirmed" or «بانتظار التأكيد» reaches any generated page.
- `true`: the dashed placeholder boxes, badges, proof boxes and the footer draft line render again (styles in `assets/css/pending.css`), and the validator's pending check is switched off. Use it to preview the layout, not to publish.
- The old **Review mode** button (outlined every placeholder) was removed for good, with its CSS and JS. It lives in git history before the "hide pending" commit if it is ever wanted again.

To turn an item into real content: add the confirmed copy as `cards` / `specs` / `prose` blocks in the same section (see "Where" below), delete the `tbc` block or row, run `node tools/build.mjs` and `python3 -I tools/validate.py`. Keep to facts that are in `docs/decisions.md`; certifications stay limited to the FSSC 22000 and JFDA certificate images (name only, see `README.md`, "Certifications section").

## Items

`PAGES[id].sections[n]` counts from 0 in `content.mjs`. The pages exist in `/en/…` and `/ar/…` with the same path.

| # | Item (hidden block / row) | Page (`id`, path) | Text EN | Text AR | What management must supply | Where |
|---|---|---|---|---|---|---|
| 1 | **Still to be confirmed for olive oil** (list) | Olive oil (`ind-olive`, `products/olive-oil/`) | "Minimum order quantity and harvest-season lead times" | «الحد الأدنى للطلب ومدد التسليم في موسم الحصاد» | The minimum order quantity and the lead times in the pressing season | `sections[2]` |
| 2 | **Ends** (spec row, `tbc: true`) | Milk powder & dairy (`ind-dairy`, `products/milk-powder-dairy/`) | Row "Ends: Easy open · peel off · penny lever · aluminium · normal", note "Which ends suit milk powder is to be confirmed." | «الأغطية: Easy Open · Peel Off · Penny Lever · ألمنيوم · عادي»، والملاحظة «الأغطية الأنسب لحليب البودرة بانتظار التأكيد.» | Which of these ends are recommended for milk powder. When it returns, change the section title back to "Cans and ends for powder and dairy" / «علب وأغطية للبودرة والألبان» | `sections[0].blocks[0].rows[1]` |
| 3 | **Dairy technical details** (list) | Milk powder & dairy | "Interior coating and food-contact compliance"; "Sizes by fill weight"; "Recommended ends and sealing"; "Minimum order quantity and lead times" | «الطلاء الداخلي ومطابقة الاستخدام الغذائي»؛ «المقاسات بحسب وزن التعبئة»؛ «الأغطية وطريقة الإغلاق الموصى بها»؛ «الحد الأدنى للطلب ومدد التسليم» | Sizes by fill weight, recommended ends and sealing, MOQ and lead times. For the coating, only the approved generic wording (decision 8) unless a document is supplied | `sections[2]` |
| 4 | **Seasonal planning** (list, inside the "Seasons" section) | Sweets, ka'ak & chocolate (`ind-sweets`, `products/sweets-kaak-chocolate/`) | "Order deadlines ahead of Ramadan and Eid"; "Minimum order quantity"; "Food-safe inner lining options" | «مواعيد الطلب قبل رمضان والعيد»؛ «الحد الأدنى للطلب»؛ «خيارات الطلاء الداخلي المناسب للأغذية» | Order cut-off dates before Ramadan and Eid, MOQ, inner-lining options | `sections[2].blocks[1]` |
| 5 | **Coffee and tea technical details** (list) | Coffee & tea (`ind-coffee`, `products/coffee-tea/`) | "Standard sizes by fill weight"; "Aroma-protection features of the coffee tin"; "Inner lid and closure options"; "Minimum order quantity and lead times" | «المقاسات القياسية بحسب وزن التعبئة»؛ «ميزات حفظ العبير في علبة القهوة»؛ «خيارات الغطاء الداخلي والإغلاق»؛ «الحد الأدنى للطلب ومدد التسليم» | Standard sizes, what exactly protects the aroma, inner-lid and closure options, MOQ and lead times | `sections[2]` |
| 6 | **Industrial technical details** (list) | Industrial (`ind-industrial`, `products/industrial/`) | "Sizes and capacities"; "Closure and end options"; "Linings and coatings"; "Applicable standards and approvals"; "Minimum order quantity and lead times" | «المقاسات والسعات»؛ «خيارات الأغطية والإغلاق»؛ «الطلاءات والبطانات الداخلية»؛ «المعايير والاعتمادات المطبّقة»؛ «الحد الأدنى للطلب ومدد التسليم» | Sizes and capacities, closures, linings, standards (no certificate other than FSSC 22000 and JFDA may be named), MOQ and lead times | `sections[2]` |
| 7 | **Factory details** (cards) | Capabilities (`capabilities`, `capabilities/`) | "Production capacity"; "Equipment and line list"; "Quality control process"; "Minimum order quantities and lead times" | «الطاقة الإنتاجية»؛ «قائمة المعدات والخطوط»؛ «نظام ضبط الجودة»؛ «الحد الأدنى للطلب ومدد التسليم» | Capacity figures, the list of lines and equipment, a description of the quality-control process, MOQs and lead times | `sections[5]` |
| 8 | **Still to be confirmed** (cards) | About (`about`, `about/`) | "Production capacity"; "Clients and case studies"; "Team and leadership" | «الطاقة الإنتاجية»؛ «العملاء ودراسات الحالة»؛ «الفريق والإدارة» | Capacity; client names and case studies (with the clients' permission); the leadership team (names, roles, photos). The fourth item, "Final logo (vector version)", is done and was removed | `sections[5]` (the featured video is `sections[0]`) |
| 9 | **More to come** (list) | News (`news`, `news/`) | "Upcoming exhibitions and event calendar"; "Company news and product guides" | «المعارض القادمة وجدول الفعاليات»؛ «أخبار الشركة وأدلة المنتجات» | Dates and venues of the next exhibitions; new company news and the product guides to publish | `sections[1]` |
| 10 | **Proof points** (three dashed boxes under the story) | Home (`home`, `/en/`, `/ar/`), section `story` | "Production capacity"; "Clients and case studies" (each with "To be confirmed with management") | «الطاقة الإنتاجية»؛ «العملاء ودراسات الحالة» (وتحتها «بانتظار تأكيد الإدارة») | The same as items 7 and 8: capacity, clients and case studies. Rendered from `PROOF_TBC`; the About page never showed it (`noProof`) | `PROOF_TBC`, used by `KINDS.story` in `build.mjs` |
| 11 | **Draft-content notice** (footer, every page) | All pages | "Draft content: items marked “to be confirmed” are waiting for management approval." | «محتوى أولي: العناصر المعلَّمة «بانتظار التأكيد» تنتظر موافقة الإدارة.» | Nothing: shown again only while `SHOW_PENDING` is true. Remove it for good before launch | `UI.footDraft` |

Also gone from the footer: the **Review mode** button and the "Final logo (vector)" review tag (the final logo has arrived).

Still open elsewhere (not site placeholders, tracked in `docs/`): the JFDA approval expires on 31 December 2026 (renew, then replace the image `assets/img/certs/jfda-food-contact.*`); redirects from the old site's URLs; photographs for the gallery (the photo grid stays hidden until `PHOTOS` has entries, see `README.md`) and the real titles of the two videos (they are labelled "Factory video 1/2"); a native Arabic editor's read of the Arabic copy.

Resolved by round 6 and removed from this list: showing the certificates as images (management decided), the FSSC / UKAS / Bureau Veritas logo question (the logos are only inside the certificate images; no separate logo files are used), and "real photography and video" for the videos (the gallery and the About video now exist).
