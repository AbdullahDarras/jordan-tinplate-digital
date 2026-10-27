// Website v2 (round 2): the page around the 3D film. Language, theme, smooth scroll, the chapter overlays, the finish lab.
import { createFilm, CHAPTERS } from './engine/film.js';
import { TINS } from './engine/tins.js';

const d = document.documentElement, $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } } };

// Arabic: approved copy from website/tools/content.mjs where it exists
const AR = {
  skip: 'انتقل إلى المحتوى الرئيسي', brandAria: 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية، الصفحة الرئيسية', filmAria: 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية: علبنا بثلاثية الأبعاد', railAria: 'الفصول',
  langSwitch: 'English', modeAria: 'التبديل بين الوضع الفاتح والداكن', quote: 'اطلب عرض سعر', soon: 'قريباً',
  c0: 'العلبة', c1: 'النقش', c2: 'الطباعة', c3: 'علبنا', c4: 'التشطيبات', c5: 'الصفيحة',
  'h.kick': 'علب معدنية مخصّصة · صناعة أردنية · منذ عام 1998', 'h.l1': 'نطبع.', 'h.l2': 'ونعلّب.',
  'h.lead': 'علب معدنية مخصّصة لعلامات الأغذية والمشروبات، من التصميم والألواح إلى علب مطبوعة ومشكَّلة وجاهزة للتصدير. مصنع أردني تقوده عائلة واحدة، ويقدّم الرحلة كاملة تحت سقف واحد.',
  'h.cue': 'مرّر الصفحة لتتابع · وحرّك المؤشر لتحرّك الضوء',
  'm.kick': 'دائري 235 · قطر 237.6 × 60 مم', 'm.title': 'نطبعها، ثم نرفعها من المعدن.', 'm.lead': 'تأثيرات بارزة وغائرة على الغطاء والجسم تضيف حركة وتُبرز التصميم.',
  'p.kick': 'كيف تُطبع العلبة', 'p.title': 'طبقة فوق طبقة، على الفولاذ.',
  'p.0': 'الصفيح', 'p.0s': 'فولاذ رقيق مطليّ بالقصدير: الصفيحة التي تبدأ منها كل عبوة.',
  'p.1': 'الطبقة الأساسية', 'p.1s': 'طلاء يمنح الأحبار أرضية متجانسة على المعدن.',
  'p.2': 'لوح السماوي', 'p.2s': 'لكل لون لوحه الخاص، المصنوع بتقنية CTP (من الحاسوب إلى اللوح).',
  'p.3': 'لوح الأرجواني', 'p.3s': 'كل لوح يقع على سابقه بتطابق دقيق.',
  'p.4': 'لوح الأصفر', 'p.4s': 'تكتمل الصورة لوناً بعد لون.',
  'p.5': 'لوح الأسود', 'p.5s': 'اللوح الأخير يعطي العمق والخطوط الدقيقة.',
  'p.6': 'الورنيش', 'p.6s': 'طلاءات عالية الجودة تحمي الطباعة وتحدد التشطيب.',
  'p.7': 'الغطاء المطبوع', 'p.7s': 'تتحول الألواح المنفصلة إلى الطباعة الملونة الكاملة.',
  'r.kick': 'صُنعت على خطوطنا', 'r.title': 'علب صنعناها.', 'r.fine': 'علب حقيقية من خطوطنا، أعدنا بناءها بثلاثية الأبعاد بحجمها الحقيقي. التصاميم ملك لعلاماتها التجارية.',
  'l.kick': 'مختبر التشطيبات', 'l.title': 'جرّب الملمس قبل الطباعة.', 'l.aria': 'التشطيبات', 'l.drag': 'اسحب العلبة لتدويرها.',
  'f.gloss': 'لامع', 'f.matte': 'مطفي', 'f.emboss': 'نقش بارز', 'f.spot': 'سبوت', 'f.trending': 'Trending',
  's.kick': 'سقف واحد، شريك واحد', 's.title': 'من الصفيحة إلى الرف.', 's.1': 'التصميم والألواح', 's.2': 'الطباعة والطلاء والتشطيب', 's.3': 'القص والتشكيل', 's.4': 'التغليف على الباليتات', 's.5': 'التخزين والشحن',
  'sec.kick': 'القطاعات التي نخدمها',
  m1: 'زيت الزيتون', m1s: 'تنكات 1 و4 و8 و16 لتر/كغ', m2: 'حليب البودرة', m2s: 'قطر 99–189 مم، حتى 5.5 كغ', m3: 'كعك وحلويات', m3s: 'علب هدايا لرمضان والعيد',
  m4: 'شوكولاتة', m4s: 'دائرية ومربعة ومستطيلة وبيضاوية', m5: 'جبنة بيضاء', m5s: 'علب لموسم الربيع', m6: 'قهوة وشاي', m6s: 'علب تحفظ العبير', m7: 'دهانات وكيماويات', m7s: 'علب صناعية وبراميل',
  'st.kick': 'قصتنا', 'st.title': 'معدن تصنعه عائلة واحدة منذ عام 1998.',
  'st.p1': 'تأسس المصنع عام 1998 ويقوده اليوم الجيل الثالث من العائلة، وهو يعمل اليوم بخطوط إنتاج أوتوماتيكية بالكامل وفريق تصميم داخلي وكوادر ماهرة.',
  fact1: 'تأسس في الأردن', fact2n: 'الثالث', fact2: 'الجيل الذي يقود الشركة اليوم من العائلة', fact3n: 'نحو 250', fact3: 'موظفاً يعملون معنا',
  certs: 'الاعتمادات', cert2: 'اعتماد مواد ملامسة للأغذية', cert1alt: 'شهادة FSSC 22000 من Bureau Veritas', cert2alt: 'شهادة اعتماد مواد ملامسة للأغذية من المؤسسة العامة للغذاء والدواء (JFDA)',
  'cta.title': 'لنطبع علامتك على المعدن.', 'cta.lead': 'أخبرنا بما تريد تعبئته ومقاس العبوة وفكرة التصميم، وسنردّ عليك بعرض سعر.',
  mail: 'البريد الإلكتروني', phone: 'الهاتف', address: 'العنوان', addressV: 'الزميلات – الموقّر، عمّان، الأردن', rights: 'جميع الحقوق محفوظة.'
};
const FIN = {
  en: { gloss: 'Special gloss, alone or combined with matte, for bright, lively visuals on the metal.', matte: 'A low-glare surface that gives colours a calmer, deeper look.', emboss: 'Raised and recessed effects on lid and body that add movement and make the design stand out.', spot: 'A glossy varnish on chosen parts of the artwork over a matte base, so the design itself catches the light.' },
  ar: { gloss: 'لمعة خاصة، منفردة أو مع التشطيب المطفي، لمظهر مشرق وحيّ على المعدن.', matte: 'سطح قليل الانعكاس يمنح الألوان مظهراً أهدأ وأعمق.', emboss: 'تأثيرات بارزة وغائرة على الغطاء والجسم تضيف حركة وتُبرز التصميم.', spot: 'ورنيش لامع على أجزاء محددة من التصميم فوق خلفية مطفية، فتلمع الرسمة وحدها.' }
};
const EN = {};
$$('[data-i18n]').forEach((el) => { EN[el.dataset.i18n] = el.innerHTML; });
$$('[data-i18n-aria]').forEach((el) => { EN['aria:' + el.dataset.i18nAria] = el.getAttribute('aria-label'); });
$$('[data-i18n-alt]').forEach((el) => { EN['alt:' + el.dataset.i18nAlt] = el.alt; });
const lang = () => (d.lang === 'ar' ? 'ar' : 'en');
let finish = 'gloss', ringIdx = 0;
function applyLang(l) {
  d.lang = l; d.dir = l === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach((el) => { const k = el.dataset.i18n; el.innerHTML = l === 'ar' ? AR[k] ?? EN[k] : EN[k]; });
  $$('[data-i18n-aria]').forEach((el) => { const k = el.dataset.i18nAria; el.setAttribute('aria-label', l === 'ar' ? AR[k] ?? EN['aria:' + k] : EN['aria:' + k]); });
  $$('[data-i18n-alt]').forEach((el) => { const k = el.dataset.i18nAlt; el.alt = l === 'ar' ? AR[k] ?? EN['alt:' + k] : EN['alt:' + k]; });
  const lb = $('#langBtn'); lb.lang = l === 'ar' ? 'en' : 'ar'; lb.setAttribute('aria-label', l === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  document.title = l === 'ar' ? 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية | نطبع. ونعلّب.' : 'Jordan Tinplate Canning | We print. We can.';
  $('#finDesc').textContent = FIN[l][finish];
  caption(ringIdx);
  title();
}
$('#langBtn').addEventListener('click', () => { const l = lang() === 'ar' ? 'en' : 'ar'; store.set('jt2-lang', l); applyLang(l); });
$('#modeBtn').addEventListener('click', () => { const m = d.dataset.mode === 'dark' ? 'light' : 'dark'; d.dataset.mode = m; store.set('jt2-mode', m); film && film.setTheme(m); title(); });

// ---------------------------------------------------------------- the film
let film = null;
try { film = createFilm($('#gl')); film.setTheme(d.dataset.mode); }
catch (e) { console.warn('3D unavailable', e); d.classList.add('no-gl'); }
const filmEl = $('#film');
// the hero's headline, drawn into the 3D studio once its font has loaded (and again on a language or theme change)
function title() {
  if (!film) return;
  const l = lang(), lines = l === 'ar' ? [AR['h.l1'], AR['h.l2']] : [EN['h.l1'], EN['h.l2']];
  const font = l === 'ar' ? '700 100px "Readex Pro"' : '800 100px "Bricolage Grotesque"';
  (document.fonts ? document.fonts.load(font, lines.join(' ')) : Promise.resolve()).catch(() => {}).then(() => film.setTitle(lines, l, d.dataset.mode));
}
const progress = () => { const r = filmEl.getBoundingClientRect(); return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))); };

// loader
const bar = $('#loadBar'); let shown = 0;
const tick = setInterval(() => { shown = Math.min(0.9, shown + 0.04 + Math.random() * 0.05); bar.parentElement.style.setProperty('--p', shown); }, 120);
Promise.race([film ? film.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 8000))]).then(() => { clearInterval(tick); bar.parentElement.style.setProperty('--p', 1); setTimeout(() => $('#loader').classList.add('done'), 300); });

// smooth scroll
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
if (window.Lenis && !REDUCED) { lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.8 }); const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
const scrollToY = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: REDUCED ? 'auto' : 'smooth' }));
const chapterY = (i) => filmEl.offsetTop + ((CHAPTERS[i][0] + CHAPTERS[i][1]) / 2) * (filmEl.offsetHeight - innerHeight);
$$('.rail button').forEach((b) => b.addEventListener('click', () => scrollToY(chapterY(+b.dataset.go))));
$('.top__brand').addEventListener('click', (e) => { e.preventDefault(); scrollToY(0); });

// overlays, rail, steps and the shelf caption follow the film
const ovs = $$('.ov'), rails = $$('.rail button'), steps = $$('#steps li'), meter = $('#meter'), top = $('#top');
const RING = film ? film.ringKeys : [];
$('#capT').textContent = String(RING.length).padStart(2, '0');
function caption(i) {
  if (!RING.length) return; ringIdx = i;
  const T = TINS[RING[Math.min(RING.length - 1, Math.max(0, i))]];
  $('#capFmt').textContent = T.fmt[lang() === 'ar' ? 1 : 0];
  $('#capDims').textContent = T.dims ? (lang() === 'ar' ? T.dims.replace('mm', 'مم') : T.dims) : '';
  $('#capN').textContent = String(i + 1).padStart(2, '0');
}
let lastCh = -1, lastL = -1, lastR = -1;
(function ui() {
  const p = progress();
  if (film) film.time = p;
  meter.style.setProperty('--p', p.toFixed(4));
  top.classList.toggle('solid', p >= 1);
  const st = film ? film.state : { chapter: 0, layer: 0, ring: 0 };
  // an overlay shows while its chapter holds the screen (not while the camera travels between chapters)
  let ch = -1; CHAPTERS.forEach(([a, b], i) => { if (p >= a - 0.012 && p <= b + 0.012) ch = i; });
  if (ch !== lastCh) { lastCh = ch; ovs.forEach((o) => o.classList.toggle('on', +o.dataset.ch === ch)); }
  rails.forEach((r) => r.classList.toggle('on', +r.dataset.go === st.chapter));
  if (st.layer !== lastL) { lastL = st.layer; steps.forEach((li) => { const l = +li.dataset.l; li.classList.toggle('on', l === st.layer); li.classList.toggle('done', l < st.layer); }); }
  if (st.ring !== lastR) { lastR = st.ring; caption(st.ring); }
  requestAnimationFrame(ui);
})();

// finish lab
$$('.chip[data-fin]').forEach((b) => b.addEventListener('click', () => {
  finish = b.dataset.fin; $$('.chip[data-fin]').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
  $('#finDesc').textContent = FIN[lang()][finish]; film && film.setFinish(finish);
}));

if (lang() === 'ar') applyLang('ar'); else { caption(0); title(); }
