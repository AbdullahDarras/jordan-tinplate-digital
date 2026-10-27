// Website v2: page behaviour (language, theme, smooth scroll, loader, the finish lab, the captions that follow the 3D acts).
import { createStage } from './engine/stage.js';
import { TINS } from './engine/tins.js';

const d = document.documentElement;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };

// ---------------------------------------------------------------- Arabic (approved copy from website/tools/content.mjs where it exists)
const AR = {
  skip: 'انتقل إلى المحتوى الرئيسي', loader: 'نضبط الألواح على التسجيل', brandAria: 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية، الصفحة الرئيسية', navAria: 'الأقسام',
  'nav.print': 'كيف نطبع', 'nav.finish': 'التشطيبات', 'nav.collection': 'علبنا', 'nav.process': 'المراحل', 'nav.contact': 'التواصل',
  langSwitch: 'English', modeAria: 'التبديل بين الوضع الفاتح والداكن', quote: 'اطلب عرض سعر', soon: 'قريباً',
  'hero.eyebrow': 'علب معدنية مخصّصة · صناعة أردنية · منذ عام 1998', 'hero.l1': 'نطبع.', 'hero.l2': 'ونعلّب.',
  'hero.lead': 'علب معدنية مخصّصة لعلامات الأغذية والمشروبات، من التصميم والألواح إلى علب مطبوعة ومشكَّلة وجاهزة للتصدير. مصنع أردني تقوده عائلة واحدة، ويقدّم الرحلة كاملة تحت سقف واحد.',
  'hero.cta2': 'شاهد كيف تُطبع العلبة', 'hero.hint': 'حرّك المؤشر: الضوء في يدك.', 'hero.aria': 'علبة دائرية بغطاء ذهبي بارز، تدور تحت ضوء الاستوديو',
  fact1: 'تأسس في الأردن', fact2n: 'الثالث', fact2: 'الجيل الذي يقود الشركة اليوم من العائلة', fact3n: 'نحو 250', fact3: 'موظفاً يعملون معنا',
  'ana.eyebrow': 'كيف تُطبع العلبة', 'ana.title': 'العلبة تُطبع طبقةً فوق طبقة.', 'ana.lead': 'مرّر الصفحة، وشاهد غطاءً مطبوعاً يُبنى طبقةً فوق طبقة، كما يُصنع على خطوطنا.',
  'ana.1h': 'الصفيح', 'ana.1p': 'فولاذ رقيق مطليّ بالقصدير: الصفيحة التي تبدأ منها كل عبوة.',
  'ana.2h': 'الطبقة الأساسية', 'ana.2p': 'طلاء يوضع أولاً ويمنح الأحبار أرضية متجانسة على المعدن.',
  'ana.3h': 'ألواح الألوان الأربعة', 'ana.3p': 'السماوي والأرجواني والأصفر والأسود، لكل لون لوحه المصنوع بتقنية CTP (من الحاسوب إلى اللوح)، تتطابق على السطح بدقة.',
  'ana.4h': 'الورنيش والتشطيب', 'ana.4p': 'طلاءات عالية الجودة تحمي الطباعة وتحدد التشطيب: لامع أو مطفي أو ملمس ناعم أو ملمس خشن.',
  'ana.5h': 'النقش البارز', 'ana.5p': 'تأثيرات بارزة وغائرة على الغطاء والجسم تضيف حركة وتُبرز التصميم.', 'ana.aria': 'غطاء علبة معروض بطبقات طباعته',
  'lab.eyebrow': 'مختبر التشطيبات', 'lab.title': 'جرّب الملمس قبل الطباعة.', 'lab.lead': 'اختر تشطيباً وشاهد المعدن يستجيب. كل هذه التشطيبات متوفرة على خطوطنا.',
  'lab.aria': 'التشطيبات', 'lab.drag': 'اسحب لتحريك الضوء', 'lab.slotAria': 'العلبة الذهبية بالتشطيب الذي اخترته. اسحب لتحريك الضوء.',
  'fin.gloss': 'لامع', 'fin.matte': 'مطفي', 'fin.emboss': 'نقش بارز', 'fin.spot': 'سبوت', 'fin.trending': 'Trending',
  'finp.gloss': 'لمعة خاصة، منفردة أو مع التشطيب المطفي، لمظهر مشرق وحيّ على المعدن.', 'finp.matte': 'سطح قليل الانعكاس يمنح الألوان مظهراً أهدأ وأعمق.',
  'finp.emboss': 'تأثيرات بارزة وغائرة على الغطاء والجسم تضيف حركة وتُبرز التصميم.', 'finp.spot': 'ورنيش لامع على أجزاء محددة من التصميم فوق خلفية مطفية، فتلمع الرسمة وحدها.',
  'col.eyebrow': 'صُنعت على خطوطنا', 'col.title': 'علب صنعناها.', 'col.lead': 'علب حقيقية من خطوطنا، أعدنا بناءها بثلاثية الأبعاد بحجمها الحقيقي، جنباً إلى جنب.',
  'col.aria': 'رف من العلب التي صنعها المصنع', 'col.fine': 'التصاميم ملك لعلاماتها التجارية، وتُعرض أمثلةً على عملنا.',
  'pro.eyebrow': 'سقف واحد، شريك واحد', 'pro.title': 'من الصفيحة إلى الرف.',
  s1h: 'التصميم والألواح', s1p: 'يجهّز مصمّمونا عملك الفني داخل المصنع، وتقنية CTP (من الحاسوب إلى اللوح) تضمن دقة كل لوح طباعة.',
  s2h: 'الطباعة والطلاء والتشطيب', s2p: 'أحبار وطلاءات عالية الجودة مع مؤثرات متنوعة: لامع، مطفي، ملمس ناعم، ملمس خشن، ونقش بارز.',
  s3h: 'القص والتشكيل', s3p: 'تُقصّ الصفائح بدقة وتُشكَّل بالهيئة التي تريدها: دائرية أو مربعة أو مستطيلة أو بشكل خاص.',
  s4h: 'التغليف على الباليتات', s4p: 'تُرتَّب الكراتين على باليتات بطرق تناسب كل عميل وتصلح للشحن إلى الخارج.',
  s5h: 'التخزين والشحن', s5p: 'يمكننا تخزين منتجك الجاهز لدينا لتوفير مساحة التخزين لديك، ثم شحنه إلى أسواقك.',
  'sec.eyebrow': 'القطاعات التي نخدمها',
  m1: 'زيت الزيتون', m1s: 'تنكات 1 و4 و8 و16 لتر/كغ', m2: 'حليب البودرة', m2s: 'قطر 99–189 مم، حتى 5.5 كغ', m3: 'كعك وحلويات', m3s: 'علب هدايا لرمضان والعيد',
  m4: 'شوكولاتة', m4s: 'دائرية ومربعة ومستطيلة وبيضاوية', m5: 'جبنة بيضاء', m5s: 'علب لموسم الربيع', m6: 'قهوة وشاي', m6s: 'علب تحفظ العبير', m7: 'دهانات وكيماويات', m7s: 'علب صناعية وبراميل',
  'st.eyebrow': 'قصتنا', 'st.title': 'معدن تصنعه عائلة واحدة منذ عام 1998.',
  'st.p1': 'تأسس المصنع عام 1998 ويقوده اليوم الجيل الثالث من العائلة، وهو يعمل اليوم بخطوط إنتاج أوتوماتيكية بالكامل وفريق تصميم داخلي وكوادر ماهرة.',
  'st.vision': 'رؤيتنا: أن نكون روّاد التغليف المعدني في المنطقة والخيار الأول للعملاء حول العالم.',
  certs: 'الاعتمادات', cert2: 'اعتماد مواد ملامسة للأغذية', cert1alt: 'شهادة FSSC 22000 من Bureau Veritas', cert2alt: 'شهادة اعتماد مواد ملامسة للأغذية من المؤسسة العامة للغذاء والدواء (JFDA)',
  'cta.title': 'لنطبع علامتك على المعدن.', 'cta.lead': 'أخبرنا بما تريد تعبئته ومقاس العبوة وفكرة التصميم، وسنردّ عليك بعرض سعر.',
  mail: 'البريد الإلكتروني', phone: 'الهاتف', address: 'العنوان', addressV: 'الزميلات – الموقّر، عمّان، الأردن', rights: 'جميع الحقوق محفوظة.'
};
const FIN_EN = {
  gloss: 'Special gloss, alone or combined with matte, for bright, lively visuals on the metal.',
  matte: 'A low-glare surface that gives colours a calmer, deeper look.',
  emboss: 'Raised and recessed effects on lid and body that add movement and make the design stand out.',
  spot: 'A glossy varnish on chosen parts of the artwork over a matte base, so the design itself catches the light.'
};
const EN = {}; // the page's own English, read once
$$('[data-i18n]').forEach((el) => { EN[el.dataset.i18n] = el.innerHTML; });
$$('[data-i18n-aria]').forEach((el) => { EN['aria:' + el.dataset.i18nAria] = el.getAttribute('aria-label'); });
$$('[data-i18n-alt]').forEach((el) => { EN['alt:' + el.dataset.i18nAlt] = el.alt; });
const lang = () => (d.lang === 'ar' ? 'ar' : 'en');
function applyLang(l) {
  d.lang = l; d.dir = l === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach((el) => { const k = el.dataset.i18n; el.innerHTML = l === 'ar' ? AR[k] ?? EN[k] : EN[k]; });
  $$('[data-i18n-aria]').forEach((el) => { const k = el.dataset.i18nAria; el.setAttribute('aria-label', l === 'ar' ? AR[k] ?? EN['aria:' + k] : EN['aria:' + k]); });
  $$('[data-i18n-alt]').forEach((el) => { const k = el.dataset.i18nAlt; el.alt = l === 'ar' ? AR[k] ?? EN['alt:' + k] : EN['alt:' + k]; });
  const lb = $('#langBtn'); lb.lang = l === 'ar' ? 'en' : 'ar'; lb.setAttribute('aria-label', l === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  if (l === 'en') lb.textContent = 'عربي';
  document.title = l === 'ar' ? 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية | مطبوعة على المعدن' : 'Jordan Tinplate Canning | Printed on metal';
  setFinishText(current);
  shelfCaption(lastShelf, true);
  requestAnimationFrame(syncBacktype);
}
$('#langBtn').addEventListener('click', () => { const l = lang() === 'ar' ? 'en' : 'ar'; store.set('jt2-lang', l); applyLang(l); });

// ---------------------------------------------------------------- theme
const modeBtn = $('#modeBtn');
modeBtn.addEventListener('click', () => {
  const m = d.dataset.mode === 'dark' ? 'light' : 'dark'; d.dataset.mode = m; store.set('jt2-mode', m); stage && stage.setTheme(m);
});

// ---------------------------------------------------------------- the hero's first line, drawn behind the tin
const back = $('#backtype'), l1 = $('#heroL1');
function syncBacktype() {
  const r = l1.getBoundingClientRect();
  back.style.top = r.top + scrollY + 'px';
  back.style.left = d.dir === 'rtl' ? 'auto' : r.left + 'px';
  back.style.right = d.dir === 'rtl' ? innerWidth - r.right + 'px' : 'auto';
  back.style.insetInlineStart = 'auto';
}
addEventListener('resize', syncBacktype); document.fonts && document.fonts.ready.then(syncBacktype);

// ---------------------------------------------------------------- foil sheen follows the pointer, like the light on the tin
addEventListener('pointermove', (e) => { d.style.setProperty('--px', (e.clientX / innerWidth).toFixed(3)); }, { passive: true });

// ---------------------------------------------------------------- nav state
const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ---------------------------------------------------------------- smooth scroll
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
if (window.Lenis && !REDUCED) {
  lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); const el = id === '#top' ? 0 : $(id); if (el !== null) { e.preventDefault(); lenis.scrollTo(el, { offset: 0 }); } }));
}

// ---------------------------------------------------------------- the 3D stage
let stage = null;
try { stage = createStage($('#gl')); stage.setTheme(d.dataset.mode); }
catch (e) { console.warn('3D unavailable', e); d.classList.add('no-gl'); }

// loader: done when the artwork has arrived (or after 7 s whatever happens)
const loader = $('#loader'), pct = $('#loadPct');
let shown = 0; const tick = setInterval(() => { shown = Math.min(92, shown + 3 + Math.random() * 6); pct.textContent = Math.round(shown); }, 120);
const finish = () => { clearInterval(tick); pct.textContent = '100'; setTimeout(() => loader.classList.add('done'), 250); syncBacktype(); };
Promise.race([stage ? stage.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 7000))]).then(finish);

// finish lab
let current = 'gloss';
function setFinishText(f) { const el = $('#finDesc'); el.dataset.i18n = 'finp.' + f; el.innerHTML = lang() === 'ar' ? AR['finp.' + f] : FIN_EN[f]; }
$$('.chip[data-fin]').forEach((b) => b.addEventListener('click', () => {
  current = b.dataset.fin;
  $$('.chip[data-fin]').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
  setFinishText(current); stage && stage.setFinish(current);
}));

// anatomy: the step list and the meter follow the scroll
const layers = $$('#layers > li'), inks = $$('#layers .inks i'), meter = $('#anaMeter');
let lastStage = -1;
function anatomyUI() {
  if (!stage) return;
  const pr = stage.progress(), s = pr.anatomyStage ?? 0;
  meter.style.setProperty('--p', (pr.anatomy || 0).toFixed(3));
  if (s === lastStage) return; lastStage = s;
  layers.forEach((li) => { const ss = li.dataset.s.split(' ').map(Number); li.classList.toggle('on', ss.includes(s)); li.classList.toggle('done', Math.max(...ss) < s); });
  inks.forEach((i) => i.classList.toggle('on', +i.dataset.s <= s));
}
(function ui() { anatomyUI(); requestAnimationFrame(ui); })();

// shelf captions
let lastShelf = 0;
const keys = stage ? stage.shelfKeys() : [];
$('#capT').textContent = String(keys.length).padStart(2, '0');
function shelfCaption(i, force) {
  if (!keys.length || (i === lastShelf && !force)) return; lastShelf = i;
  const T = TINS[keys[i]];
  $('#capFmt').textContent = T.fmt[lang() === 'ar' ? 1 : 0];
  $('#capDims').textContent = T.dims ? (lang() === 'ar' ? T.dims.replace('mm', 'مم') : T.dims) : '';
  $('#capN').textContent = String(i + 1).padStart(2, '0');
}
if (stage) stage.onShelf((i) => shelfCaption(i));

if (lang() === 'ar') applyLang('ar'); else { shelfCaption(0, true); syncBacktype(); }
