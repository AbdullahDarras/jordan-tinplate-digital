// Single source of truth for the Jordan Tinplate Canning site (phase 1).
// Every string is written once as t(en, ar). build.mjs renders /en/... and /ar/... from this file.
//
// RULES
//  - Only facts that exist in the repo (README, website-prototype, offsite plan) are stated as facts.
//  - Anything unconfirmed is kept here as a `tbc` block or a row with `tbc: true`, but it is HIDDEN on the site while SHOW_PENDING is false
//    (build.mjs drops it, and validate.py fails if a "to be confirmed" string reaches a page). website/PENDING.md lists every hidden item.
//  - Arabic is written as natural Arabic copy, not word-for-word translation.

export const t = (en, ar) => ({ en, ar });

// One switch for everything that waits for management (placeholder blocks, rows, proof boxes, draft notice).
// false = hidden (the site as presented). true = the placeholders render again (with assets/css/pending.css). See website/PENDING.md.
export const SHOW_PENDING = false;

export const SITE = {
  // Production origin used for canonical / hreflang / sitemap. Confirmed by management (round 2, 2026-10-20).
  // SITE_URL=... can still override it for a staging build.
  origin: process.env.SITE_URL || 'https://www.jordantinplate.com',
  name: 'Jordan Tinplate Canning',           // official English name (always written in full)
  nameAr: 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية',   // official Arabic name (confirmed, round 3, 2026-10-21)
  orderUrl: 'https://jc-order.netlify.app/',  // existing online order / quote tool: primary "Request a quote" link
  phone: '+962 6 4051125',
  tel: '+96264051125',
  email: 'sales@jordantinplate.com',
  founded: '1998',
  catalogue: 'https://www.jordantinplate.com/pdf/catalog.pdf',
  social: {
    LinkedIn: 'https://www.linkedin.com/company/jordan-tin-plate-canning-printing-industrial-co',
    Instagram: 'https://www.instagram.com/jordantinplate',
    X: 'https://x.com/jordantinplate',
    Facebook: 'https://www.facebook.com/jordantinplate'
  },
  handle: '@jordantinplate',                   // same username on every platform (decision 14)
  mainVideoId: 'xozO8TLl6T8',                  // the featured video on the About page (a YouTube ID from VIDEOS below): change it here only
  year: 2026
};

export const LANGS = {
  en: { code: 'en', dir: 'ltr', locale: 'en_US', name: 'English', switchLabel: 'عربي', switchAria: 'التبديل إلى العربية' },
  ar: { code: 'ar', dir: 'rtl', locale: 'ar_AR', name: 'العربية', switchLabel: 'English', switchAria: 'Switch to English' }
};

// ---------------------------------------------------------------- shared UI strings
export const UI = {
  skip: t('Skip to main content', 'انتقل إلى المحتوى الرئيسي'),
  primaryNav: t('Primary', 'القائمة الرئيسية'),
  breadcrumb: t('Breadcrumb', 'مسار التنقل'),
  menu: t('Menu', 'القائمة'),
  theme: t('Switch between light and dark mode', 'التبديل بين الوضع الفاتح والداكن'),
  tbc: t('To be confirmed', 'بانتظار التأكيد'),
  tbcMgmt: t('To be confirmed with management', 'بانتظار تأكيد الإدارة'),
  quote: t('Request a quote', 'اطلب عرض سعر'),
  readMore: t('Read more', 'اقرأ المزيد'),
  read: t('Read', 'اقرأ'),
  explore: t('Explore', 'استكشف'),
  illus: t('Illustrative drawing, not a client design.', 'رسم توضيحي وليس تصميم عميل.'),
  related: t('Other industries', 'قطاعات أخرى'),
  phone: t('Phone', 'الهاتف'),
  mail: t('Email', 'البريد الإلكتروني'),
  address: t('Address', 'العنوان'),
  addressArea: t('Al-Zmailat – Al-Muwaqqar, Amman, Jordan', 'الزميلات – الموقّر، عمّان، الأردن'),
  footIndustries: t('Industries', 'القطاعات'),
  footCompany: t('Company', 'الشركة'),
  footContact: t('Contact', 'التواصل'),
  footBlurb: t('Custom tinplate packaging for food and beverage brands. Made in Jordan since 1998.',
               'علب معدنية مخصّصة لعلامات الأغذية والمشروبات. صناعة أردنية منذ عام 1998.'),
  footDraft: t('Draft content: items marked “to be confirmed” are waiting for management approval.',
               'محتوى أولي: العناصر المعلَّمة «بانتظار التأكيد» تنتظر موافقة الإدارة.'),
  rights: t('All rights reserved.', 'جميع الحقوق محفوظة.'),
  catalogue: t('Download the catalogue (PDF)', 'حمّل الكتالوج (PDF)'),
  opensNew: t('opens in a new tab', 'يُفتح في تبويب جديد'),
  brandAria: t('Jordan Tinplate Canning, home page', 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية، الصفحة الرئيسية'),
  ctaTitle: t('Let’s put your brand on metal.', 'لنطبع علامتك على المعدن.'),
  ctaLead: t('Tell us what you are packing, the pack size and your artwork idea. We will come back with a quotation.',
             'أخبرنا بما تريد تعبئته ومقاس العبوة وفكرة التصميم، وسنردّ عليك بعرض سعر.'),
  orderTitle: t('Request your quote online', 'اطلب عرض سعرك إلكترونياً'),
  orderLead: t('Use our online order tool to describe your pack. It opens in a new tab.',
               'استخدم أداة الطلب الإلكترونية لوصف عبوتك. وتُفتح في تبويب جديد.'),
  orderEmail: t('Or email us', 'أو راسلنا بالبريد'),
  // creative experience
  dragTin: t('3D tin: drag to rotate', 'علبة ثلاثية الأبعاد: اسحب لتدويرها'),
  cursorDrag: t('Drag', 'اسحب'),
  skipIntro: t('Skip intro', 'تخطَّ المقدمة'),
  loading: t('Loading', 'جارٍ التحميل'),
  ready: t('Page ready', 'الصفحة جاهزة'),
  scroll: t('Scroll', 'مرّر'),
  sectors: t('Sectors we serve', 'القطاعات التي نخدمها'),
  nowLabel: t('In season now', 'الموسم الآن'),
  soon: t('Coming soon', 'قريباً'),
  letsTalk: t('Let’s talk', 'لنتحدث'),
  allIndustries: t('All industries', 'كل القطاعات'),
  yearsOf: t('years of making metal packaging', 'عاماً في صناعة التغليف المعدني'),
  loaderSteps: [t('Design & plates', 'التصميم والألواح'), t('Print & coat', 'الطباعة والطلاء'), t('Cut & form', 'القص والتشكيل'), t('Seal & ship', 'الإحكام والشحن')],
  tbcShort: t('To be confirmed with management', 'بانتظار تأكيد الإدارة'),
  switchMenu: t('Main menu', 'القائمة الرئيسية'),
  // gallery, video facades, lightbox
  playVideo: t('Play video', 'تشغيل الفيديو'),
  watchYoutube: t('Watch on YouTube', 'شاهد على يوتيوب'),
  moreGallery: t('More in the gallery', 'المزيد في المعرض'),
  viewLarger: t('View larger', 'عرض أكبر'),
  lbLabel: t('Image viewer', 'عارض الصور'),
  lbClose: t('Close', 'إغلاق'),
  lbPrev: t('Previous image', 'الصورة السابقة'),
  lbNext: t('Next image', 'الصورة التالية')
};

// ---------------------------------------------------------------- pages
// art keys: round | square | rect | oval | oil | can | hero
const IND_ART = { 'ind-olive': 'oil', 'ind-dairy': 'can', 'ind-sweets': 'square', 'ind-cheese': 'rect', 'ind-coffee': 'round', 'ind-industrial': 'can' };

// "Request a quote" always goes to the existing online order tool (SITE.orderUrl), opened in a new tab.
const quoteCta = () => ({ label: UI.quote, to: 'order' });

// Finishes: used on several pages (from the current site copy).
const FINISH_CARDS = [
  { h: t('Gloss', 'لامع'), p: t('Special gloss, alone or combined with matte, for bright, lively visuals on the metal.', 'لمعة خاصة، منفردة أو مع التشطيب المطفي، لمظهر مشرق وحيّ على المعدن.') },
  { h: t('Matte', 'مطفي'), p: t('A low-glare surface that gives colours a calmer, deeper look.', 'سطح قليل الانعكاس يمنح الألوان مظهراً أهدأ وأعمق.') },
  { h: t('Soft touch', 'ملمس ناعم'), p: t('A silky coating over the whole pack that invites touch.', 'طلاء حريري على العبوة كلها يدعو إلى لمسها.') },
  { h: t('Rough touch', 'ملمس خشن'), p: t('A textured coating that stimulates the senses and gives the pack a distinctive look.', 'طلاء بملمس خشن يحفّز الحواس ويمنح العبوة طابعاً مميزاً.') },
  { h: t('Embossing', 'نقش بارز'), p: t('Raised and recessed effects on lid and body that add movement and make the design stand out.', 'تأثيرات بارزة وغائرة على الغطاء والجسم تضيف حركة وتُبرز التصميم.') },
  { h: t('Spot UV', 'سبوت'), p: t('A glossy varnish on chosen parts of the artwork over a matte base, so the design itself catches the light.', 'ورنيش لامع على أجزاء محددة من التصميم فوق خلفية مطفية، فتلمع الرسمة وحدها.') },
  { h: t('Trending', 'Trending'), p: t('Coming soon.', 'قريباً.'), soon: true }
];
const FIN_BY = { gloss: 0, matte: 1, soft: 2, rough: 3, emboss: 4, spot: 5, trending: 6 };

export const STEPS = [
  { h: t('Design & plates', 'التصميم والألواح'),
    p: t('In-house designers prepare your artwork, and CTP (Computer-to-Plate) makes every printing plate precise.',
         'يجهّز مصمّمونا عملك الفني داخل المصنع، وتقنية CTP (من الحاسوب إلى اللوح) تضمن دقة كل لوح طباعة.') },
  { h: t('Print, coat & finish', 'الطباعة والطلاء والتشطيب'),
    p: t('High-end inks and coatings, plus effects: gloss, matte, soft touch, rough touch and embossing.',
         'أحبار وطلاءات عالية الجودة مع مؤثرات متنوعة: لامع، مطفي، ملمس ناعم، ملمس خشن، ونقش بارز.') },
  { h: t('Cut & form', 'القص والتشكيل'),
    p: t('Sheets are cut on exact lines and formed into your shape: round, square, rectangular or custom.',
         'تُقصّ الصفائح بدقة وتُشكَّل بالهيئة التي تريدها: دائرية أو مربعة أو مستطيلة أو بشكل خاص.') },
  { h: t('Pack & palletise', 'التغليف على الباليتات'),
    p: t('Cartons are palletised with methods tailored to each client and suited to overseas shipping.',
         'تُرتَّب الكراتين على باليتات بطرق تناسب كل عميل وتصلح للشحن إلى الخارج.') },
  { h: t('Store & ship', 'التخزين والشحن'),
    p: t('We can hold finished stock for you, freeing your own storage, then ship it to your markets.',
         'يمكننا تخزين منتجك الجاهز لدينا لتوفير مساحة التخزين لديك، ثم شحنه إلى أسواقك.') }
];

export const PROOF_TBC = {
  k: 'tbc',
  title: t('Proof points', 'نقاط الإثبات'),
  items: [
    t('Production capacity', 'الطاقة الإنتاجية'),
    t('Clients and case studies', 'العملاء ودراسات الحالة')
  ],
  cards: true
};


// ---------------------------------------------------------------- creative sections (shared by several pages)
// Copy for the sections of the creative homepage. Arabic strings come from the approved prototype copy (website-prototype/js/i18n.js).
export const MARQUEE = [
  t('Olive oil', 'زيت الزيتون'), t('Milk powder', 'حليب البودرة'), t('Ka’ak & sweets', 'كعك وحلويات'), t('Chocolate', 'شوكولاتة'), t('White cheese', 'جبنة بيضاء'),
  t('Coffee', 'قهوة'), t('Tea', 'شاي'), t('Edible oils', 'زيوت'), t('Gift tins', 'علب هدايا')
];

export const FINISH_LAB = {
  eyebrow: t('Finish Lab', 'مختبر التشطيبات'),
  title: t('Touch it before you print it.', 'جرّب الملمس قبل الطباعة.'),
  lead: t('Pick a finish and watch the metal respond. Every one is available on our lines.', 'اختر تشطيباً وشاهد المعدن يستجيب. كل هذه التشطيبات متوفرة على خطوطنا.'),
  aria: t('3D tin you can restyle', 'علبة ثلاثية الأبعاد يمكنك تغيير تشطيبها'),
  chipsAria: t('Finishes', 'التشطيبات'),
  items: ['gloss', 'matte', 'emboss', 'spot', 'trending'].map((id) => { const c = FINISH_CARDS[FIN_BY[id]]; return { id, label: c.h, desc: c.p, soon: !!c.soon }; }),
  plate: { h: t('One plate, many designs.', 'لوح واحد، تصاميم متعددة.'), p: t('Variable printing puts several versions of the same pack on a single printing plate.', 'الطباعة المتغيّرة تضع عدة نسخ من العبوة نفسها على لوح طباعة واحد.') },
  cwAria: t('Colourways', 'ألوان التصميم'),
  cws: [
    { id: 'h', label: t('Halawah: red & white', 'حلاوة: أحمر وأبيض'), a: '#9a2a2c', b: '#ece8e3' },
    { label: t('Royal blue & gold', 'أزرق ملكي وذهبي'), a: '#0b55c0', b: '#f0c867' }, { label: t('Pearl, navy & gold', 'لؤلؤي وكحلي وذهبي'), a: '#f6ecd2', b: '#0a4496' },
    { label: t('Turquoise & gold', 'فيروزي وذهبي'), a: '#1fbdb4', b: '#f0c867' }, { label: t('Coral & rose-gold', 'مرجاني وذهبي وردي'), a: '#ff7d6e', b: '#f6c4ae' }
  ]
};

const SHAPE_ITEMS = [
  { id: 'round', label: t('Low round', 'دائرية منخفضة'), name: t('Low round tin', 'علبة دائرية منخفضة'), dim: t('Ø 73–265 mm · H 34–210 mm', 'قطر 73–265 مم · ارتفاع 34–210 مم'), note: t('Six standard diameters, in many heights, with a slip lid.', 'ستة أقطار قياسية بارتفاعات متعددة، بغطاء منزلق.') },
  { id: 'octagon', label: t('Octagonal', 'ثمانية'), name: t('Octagonal tin', 'علبة ثمانية الأضلاع'), dim: t('Sizes on request', 'المقاسات عند الطلب'), note: t('An eight-sided gift tin that stands out on the shelf.', 'علبة هدايا بثمانية أضلاع تلفت النظر على الرف.') },
  { id: 'hexagon', label: t('Hexagonal', 'سداسية'), name: t('Hexagonal tin', 'علبة سداسية الأضلاع'), dim: t('Sizes on request', 'المقاسات عند الطلب'), note: t('A six-sided gift tin for sweets, dates and chocolate.', 'علبة هدايا بستة أضلاع للحلويات والتمور والشوكولاتة.') },
  { id: 'square', label: t('Square', 'مربعة'), name: t('Square tin', 'علبة مربعة'), dim: t('120–240 mm sides · H 40–100 mm', 'ضلع 120–240 مم · ارتفاع 40–100 مم'), note: t('Five standard sizes, from about 100 g to 1 kg.', 'خمسة مقاسات قياسية، من نحو 100 غ إلى 1 كغ.') },
  { id: 'rect', label: t('Rectangular', 'مستطيلة'), name: t('Rectangular tin', 'علبة مستطيلة'), dim: t('Sizes on request', 'المقاسات عند الطلب'), note: t('Made to your specification.', 'تُصنَّع وفق مواصفاتك.') },
  { id: 'oval', label: t('Oval', 'بيضاوية'), name: t('Oval tin', 'علبة بيضاوية'), dim: t('Ø 300 mm · H 40–100 mm', 'قطر 300 مم · ارتفاع 40–100 مم'), note: t('A special-mold shape for presentation packs.', 'شكل بقالب خاص لعلب التقديم.') },
  { id: 'bucket', label: t('Bucket', 'سطل'), name: t('Tin bucket', 'سطل معدني'), dim: t('Sizes on request', 'المقاسات عند الطلب'), note: t('A tapered bucket with a wide press-on lid.', 'سطل مخروطي بغطاء عريض يُضغط على الفوهة.') },
  { id: 'oil', label: t('Spout tin', 'تنكة بفوهة'), name: t('Tin with a spout and screw cap', 'تنكة بفوهة وغطاء ملولب'), dim: t('1, 4, 8 and 16 L/kg', '1 و4 و8 و16 لتر/كغ'), note: t('Our most popular sizes; any other size is made to order. The 3D view is illustrative.', 'أشهر الأحجام، ونصنع أي حجم آخر حسب الطلب. والمجسّم توضيحي.') },
  { id: 'can', label: t('Tall round', 'دائرية طويلة'), name: t('Tall round can with a seamed end', 'علبة دائرية طويلة بطرف مختوم'), dim: t('Easy-open or peel-off end', 'طرف سهل الفتح أو قابل للنزع'), note: t('The end is seamed on, for a fully sealed pack.', 'طرفها مختوم بالدرز، لعبوة محكمة الإغلاق.') },
  { id: 'cheese', label: t('Round with lid', 'دائرية بغطاء'), name: t('Round can with a slip lid', 'علبة دائرية بغطاء منزلق'), dim: t('Tall, with a lift-off lid', 'طويلة، بغطاء يُرفع ويُعاد'), note: t('Opens and closes again, for contents used a little at a time.', 'تُفتح وتُغلق من جديد، لمحتوى يُستخدم على دفعات.') },
  { id: 'tuna', label: t('Flat round', 'دائرية مسطحة'), name: t('Flat round tin', 'علبة دائرية مسطحة'), dim: t('Low and wide', 'منخفضة وعريضة'), note: t('A wide, shallow tin with a slip lid.', 'علبة عريضة قليلة الارتفاع بغطاء منزلق.') },
  { id: 'tall', label: t('Tall square', 'مربعة طويلة'), name: t('Tall square tin', 'علبة مربعة طويلة'), dim: t('Square and tall', 'مربعة وطويلة'), note: t('A tall square tin with a lift-off lid.', 'علبة مربعة طويلة بغطاء يُرفع.') }
];
export const SHAPES_LAB = {
  eyebrow: t('Shapes', 'الأشكال'),
  title: t('Every shape your brand needs.', 'كل شكل تحتاجه علامتك.'),
  aria: t('3D tin shapes', 'أشكال العلب بثلاثية الأبعاد'),
  chipsAria: t('Shapes', 'الأشكال'),
  items: SHAPE_ITEMS,
  fine: t('Most 3D tins here are tins we have made, at their real proportions and with their real lids; the hexagonal, oval and paint-can views carry sample artwork. Custom sizes are available on request.', 'معظم العلب ثلاثية الأبعاد هنا علب صنعناها فعلاً، بنسبها الحقيقية وغطائها الحقيقي؛ أما العلبة السداسية والبيضاوية وعلبة الدهان فعليها تصميم توضيحي. والمقاسات الخاصة متاحة عند الطلب.')
};
export const SHAPES_SWEETS = ['round', 'square', 'rect', 'oval'].map((id) => SHAPE_ITEMS.find((x) => x.id === id));

const OIL_SIZES = [1, 4, 8, 16].map((n) => ({
  id: 'oil' + n, label: t(`${n} L/kg`, `${n} لتر/كغ`), name: t('Olive-oil tin', 'تنكة زيت الزيتون'), dim: t(`${n} L/kg`, `${n} لتر/كغ`),
  note: t('One of our most popular sizes (1, 4, 8 and 16 L/kg); we make any size you need. The 3D view is illustrative.', 'أحد أشهر أحجامنا (1 و4 و8 و16 لتر/كغ)، ونصنع أي حجم تحتاجه. والمجسّم توضيحي.')
}));

const TYPE_CARDS = [
  { h: t('Fancy tins', 'علب فاخرة'), art: 'round',
    p: t('Round, square, rectangular and oval gift tins for sweets, ka’ak, chocolate, coffee and more.', 'علب هدايا دائرية ومربعة ومستطيلة وبيضاوية للحلويات والكعك والشوكولاتة والقهوة وغيرها.'),
    meta: t('Round Ø 73–265 mm · Square 120–240 mm', 'دائرية بقطر 73–265 مم · مربعة 120–240 مم') },
  { h: t('Food cans', 'علب أغذية'), art: 'can',
    p: t('Nine diameters from 52 to 215 mm.', 'تسعة أقطار من 52 إلى 215 مم.'), meta: t('60 ml – 8 L', 'من 60 مل إلى 8 لترات') },
  { h: t('Milk powder cans', 'علب حليب البودرة'), art: 'can',
    p: t('Large-format cans for powder and dairy.', 'علب كبيرة الحجم للبودرة والألبان.'), meta: t('Ø 99–189 mm · up to 5.5 kg', 'قطر 99–189 مم · حتى 5.5 كغ') },
  { h: t('Food containers & trays', 'حاويات وصواني أغذية'), art: 'oval',
    p: t('Including smooth round trays for knafeh and mansaf.', 'ومنها صواني دائرية ناعمة للكنافة والمنسف.') },
  { h: t('Special molds', 'قوالب خاصة'), art: 'rect',
    p: t('Coffee tins that protect aroma, seamless two-piece cans, windowed boxes, tobacco tins and fully custom shapes.',
         'علب قهوة تحفظ العبير، وعلب من قطعتين بلا لحام، وعلب بنافذة شفافة، وعلب تبغ، وأي شكل حسب الطلب.') },
  { h: t('Ends & components', 'الأغطية والقطع'), art: 'round',
    p: t('Easy open, peel off, penny lever, aluminium and normal ends.', 'أغطية Easy Open وPeel Off وPenny Lever وألمنيوم وأغطية عادية.') },
  { h: t('Industrial cans', 'علب صناعية'), art: 'can',
    p: t('Paints, chemicals and drums.', 'للدهانات والكيماويات والبراميل.') }
];
export const RANGE = {
  eyebrow: t('The range', 'المنتجات'), title: t('Cans for what you put inside.', 'علب تناسب ما بداخلها.'),
  cards: TYPE_CARDS
};
export const IND_LIST = {
  eyebrow: t('By industry', 'حسب القطاع'), title: t('Find your industry', 'ابحث عن قطاعك'),
  intro: t('Choose your product to see the formats, finishes and seasons that matter for it.', 'اختر منتجك لتتعرّف على الأحجام والتشطيبات والمواسم الأنسب له.')
};
export const SEASONS = {
  eyebrow: t('Seasons', 'المواسم'), title: t('Packaging that follows the harvest.', 'تغليف يتبع المواسم.'),
  lead: t('Food has seasons. Your tins should be ready before them.', 'للأغذية مواسمها، وعلبك يجب أن تكون جاهزة قبلها.'),
  fine: t('Artwork shown is a sample, not a client design.', 'التصميم المعروض نموذج توضيحي وليس تصميم عميل.'),
  aria: t('3D seasonal tin', 'علبة موسمية ثلاثية الأبعاد'), tabsAria: t('Seasons', 'المواسم'),
  tabs: [
    { id: 'olive', k: t('Autumn', 'الخريف'), h: t('Olive oil', 'زيت الزيتون'), now: true, shape: 'oil', theme: 'olive', finish: 'gloss', to: 'ind-olive',
      desc: t('Olive-oil tins in any size, most popular 1, 4, 8 and 16 L/kg, ready before the pressing season.', 'تنكات زيت الزيتون بأي حجم، وأشهرها 1 و4 و8 و16 لتر/كغ، جاهزة قبل موسم العصر.'), more: t('Olive-oil tins', 'تنكات زيت الزيتون') },
    { id: 'eid', k: t('Ramadan & Eid', 'رمضان والعيد'), h: t('Sweets, ka’ak & chocolate', 'حلويات وكعك وشوكولاتة'), shape: 'square', theme: 'halawah', finish: 'emboss', to: 'ind-sweets',
      desc: t('Gift tins for sweets, ka’ak and chocolate: embossed, soft-touch and unmistakably festive.', 'علب هدايا للحلويات والكعك والشوكولاتة: بنقش بارز وملمس ناعم وطابع احتفالي لا يُخطئ.'), more: t('Gift tins', 'علب الهدايا') },
    { id: 'cheese', k: t('Spring', 'الربيع'), h: t('White cheese', 'الجبنة البيضاء'), shape: 'cheese', theme: 'halawah', finish: 'matte', to: 'ind-cheese',
      desc: t('Tins for the spring white-cheese season.', 'علب لموسم الجبنة البيضاء في الربيع.'), more: t('White-cheese tins', 'علب الجبنة البيضاء') }
  ]
};
export const STORY = {
  eyebrow: t('Our story', 'قصتنا'), title: t('Metal, made by one family, since 1998.', 'معدن تصنعه عائلة واحدة منذ عام 1998.'),
  p1: t('Founded in 1998 and led today by the third generation of the family, Jordan Tinplate Canning has grown into a manufacturer with fully automatic production lines, in-house design and skilled people.',
        'تأسس المصنع عام 1998 ويقوده اليوم الجيل الثالث من العائلة، وهو يعمل اليوم بخطوط إنتاج أوتوماتيكية بالكامل وفريق تصميم داخلي وكوادر ماهرة.'),
  vision: t('Our vision: to lead metal packaging in the region and be the first choice for customers around the globe.', 'رؤيتنا: أن نكون روّاد التغليف المعدني في المنطقة والخيار الأول للعملاء حول العالم.'),
  p2: t('Our mission is to deliver high-end quality products and services using cutting-edge technology and a skilled workforce.', 'ورسالتنا تقديم منتجات وخدمات بجودة عالية باستخدام أحدث التقنيات وكوادر ماهرة.')
};

// Certifications (round 6): a heading and two cards, each the certificate IMAGE and ONLY its name. No scope text, numbers, validity dates or tables on the page
// (the images themselves are the proof). Do not use the FSSC / UKAS / JFDA logo files separately and do not publish the warranty letter.
// w / h are the real pixel sizes of the files (validate.py checks them), so the browser can reserve the space before the image loads.
export const CERTS = {
  title: t('Certifications', 'الاعتمادات'),
  items: [
    { id: 'fssc', file: '/assets/img/certs/fssc-22000', w: 1075, h: 1521,
      name: t('FSSC 22000', 'FSSC 22000'), sub: t('Bureau Veritas', 'Bureau Veritas'),
      alt: t('FSSC 22000 certificate, Bureau Veritas', 'شهادة FSSC 22000 من Bureau Veritas') },
    { id: 'jfda', file: '/assets/img/certs/jfda-food-contact', w: 1105, h: 1430,
      name: t('Food-contact materials approval — JFDA', 'اعتماد مواد ملامسة للأغذية — المؤسسة العامة للغذاء والدواء (JFDA)'),
      alt: t('Food-contact materials approval certificate, JFDA', 'شهادة اعتماد مواد ملامسة للأغذية من المؤسسة العامة للغذاء والدواء (JFDA)') }
  ]
};

// ---------------------------------------------------------------- gallery
// VIDEOS: YouTube IDs (from the youtu.be links management sent). One list, easy to edit: add, remove or re-order entries, then run `node tools/build.mjs`.
// Labels are neutral on purpose (nobody on the build side has watched the videos, so no titles are invented). Replace them with real titles when management gives them.
export const VIDEOS = [
  { id: 'xozO8TLl6T8', label: t('Factory video 1', 'فيديو المصنع 1') },
  { id: 'CQW1UaWpC2k', label: t('Factory video 2', 'فيديو المصنع 2') },
  { id: 'k4PUPiPHXVw', label: t('Factory video 3', 'فيديو المصنع 3') }
];

// PHOTOS: empty until management sends photographs. While the list is empty NOTHING is rendered for photos (no section, no placeholder).
// To add one: copy the file into website/assets/img/gallery/ and add an entry, e.g.
//   { src: '/assets/img/gallery/printing-line.jpg', alt_en: 'The printing line at Jordan Tinplate Canning', alt_ar: 'خط الطباعة في المصنع' },
// Optional w / h = the file's pixel size. See website/README.md ("Gallery: how to add photos").
export const PHOTOS = [];

export const GALLERY = {
  videosTitle: t('Videos', 'الفيديوهات'),
  photosTitle: t('Photos', 'الصور'),
  fb: {
    tag: t('Facebook', 'فيس بوك'),
    h: t('More videos on Facebook', 'المزيد من الفيديوهات على فيس بوك'),
    p: t('Our longer videos are on the company Facebook page.', 'فيديوهاتنا الأطول على صفحة الشركة في فيس بوك.'),
    cta: t('Open the Facebook page', 'افتح صفحة فيس بوك')
  },
  featured: {
    eyebrow: t('Video', 'فيديو'),
    title: t('Factory video', 'فيديو المصنع'),
    fallback: t('Factory video', 'فيديو المصنع')
  }
};

export const PAGES = [
  // ============================================================ HOME
  {
    id: 'home', path: '', navKey: 'home',
    title: t('Jordan Tinplate Canning | Custom Metal Packaging for Food & Beverage', 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية | تغليف معدني مخصّص للأغذية والمشروبات'),
    description: t('Jordan Tinplate Canning designs, prints, forms and packs custom tinplate cans and gift tins for food and beverage brands. Made in Jordan since 1998.',
                   'تصمّم الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية علب الصفيح المعدنية وعلب الهدايا وتطبعها وتشكّلها وتجهّزها للشحن لعلامات الأغذية والمشروبات. صناعة أردنية منذ عام 1998.'),
    crumb: t('Home', 'الرئيسية'),
    hero: {
      eyebrow: t('Custom tinplate packaging · Made in Jordan · Since 1998', 'علب معدنية مخصّصة · صناعة أردنية · منذ عام 1998'),
      lines: [t('We print.', 'نطبع.'), t('We can.', 'ونعلّب.')],
      h1: t('We print. We can.', 'نطبع. ونعلّب.'),
      lead: t('Custom tinplate packaging for food & beverage brands, from artwork and plates to printed, formed, export-ready tins. One family-led manufacturer in Jordan, doing the whole journey under one roof.',
              'علب معدنية مخصّصة لعلامات الأغذية والمشروبات، من التصميم والألواح إلى علب مطبوعة ومشكَّلة وجاهزة للتصدير. مصنع أردني تقوده عائلة واحدة، ويقدّم الرحلة كاملة تحت سقف واحد.'),
      art: 'hero',
      stage: { shape: 'round', theme: 'halawah', cw: 0, finish: 'gloss', scale: 1.45 },
      ctas: [quoteCta(), { label: t('See products by industry', 'تصفّح المنتجات حسب القطاع'), to: 'products', kind: 'ghost' }],
      stats: [
        { big: '1998', small: t('Founded in Jordan', 'تأسس في الأردن') },
        { big: t('3rd', 'الثالث'), small: t('generation of the family leads the company', 'الجيل الذي يقود الشركة اليوم من العائلة') },
        { big: t('~250', 'نحو 250'), small: t('people work with us', 'موظفاً يعملون معنا') }
      ]
    },
    sections: [
      { kind: 'marquee' },
      { kind: 'journey', id: 'journey', link: { to: 'capabilities', label: t('See our capabilities', 'تعرّف على قدراتنا') } },
      { kind: 'finish', id: 'finish' },
      { kind: 'shapes', id: 'shapes' },
      { kind: 'range', id: 'range' },
      { kind: 'industries', id: 'industries' },
      { kind: 'seasons', id: 'seasons' },
      { kind: 'story', id: 'story', link: [{ to: 'about', label: t('About us', 'من نحن') }, { to: 'gallery', label: t('Photos & videos gallery', 'معرض الصور والفيديوهات') }] },
      { kind: 'certs', id: 'certifications' },
      { kind: 'news', id: 'news', limit: 4, link: { to: 'news', label: t('All news and events', 'كل الأخبار والفعاليات') } }
    ]
  },

  // ============================================================ PRODUCTS INDEX
  {
    id: 'products', path: 'products/', navKey: 'products', parent: 'home',
    title: t('Tinplate Cans & Gift Tins | Jordan Tinplate Canning', 'علب الصفيح وعلب الهدايا المعدنية للأغذية | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Fancy tins, food cans, milk powder cans, food containers, special molds, ends and industrial cans. Browse Jordan Tinplate Canning products by industry or by type.',
                   'علب فاخرة وعلب أغذية وعلب حليب بودرة وحاويات أغذية وقوالب خاصة وأغطية وعلب صناعية. تصفّح منتجات الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية حسب القطاع أو حسب النوع.'),
    crumb: t('Products', 'المنتجات'),
    hero: {
      eyebrow: t('Products', 'المنتجات'),
      h1: t('Tinplate cans and tins, made to fit what goes inside', 'علب صفيح معدنية تُصنع لتناسب ما بداخلها'),
      lead: t('Start from your industry, or browse the full range by type. Sizes below come from our product tables; custom sizes are available on request.',
              'ابدأ من قطاعك، أو تصفّح المجموعة كاملة حسب النوع. المقاسات أدناه من جداول منتجاتنا، والمقاسات الخاصة متاحة عند الطلب.'),
      art: 'round', stage: { shape: 'round', theme: 'halawah', cw: 0, finish: 'gloss' },
      ctas: [quoteCta(), { label: UI.catalogue, to: 'catalogue', kind: 'ghost' }]
    },
    sections: [
      { kind: 'industries', id: 'by-industry', eyebrow: t('By industry', 'حسب القطاع'), title: t('Find your industry', 'ابحث عن قطاعك') },
      { kind: 'range', id: 'by-type', eyebrow: t('By type', 'حسب النوع'), title: t('The full range', 'المجموعة كاملة') },
      { kind: 'shapes', id: 'shapes' },
      { kind: 'finish', id: 'finishes' }
    ]
  },

  // ============================================================ INDUSTRY: OLIVE OIL
  {
    id: 'ind-olive', path: 'products/olive-oil/', navKey: 'products', parent: 'products',
    title: t('Olive Oil Tins 1–16 L/kg | Jordan Tinplate Canning', 'علب زيت الزيتون 1–16 لتر/كغ | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Printed tinplate olive oil tins in any size (most popular 1, 4, 8 and 16 L/kg) with food-grade interior lacquer, in-house artwork and export-ready packing. Made in Jordan.',
                   'تنكات زيت الزيتون من الصفيح المطبوع بأي حجم (أشهرها 1 و4 و8 و16 لتر/كغ)، بطلاء داخلي صالح للأغذية وتصميم داخل المصنع وتغليف جاهز للتصدير. صناعة أردنية.'),
    crumb: t('Olive oil', 'زيت الزيتون'),
    tile: { h: t('Olive oil', 'زيت الزيتون'), p: t('Tins in any size, most popular 1, 4, 8 and 16 L/kg, for the autumn pressing season.', 'تنكات بأي حجم، وأشهرها 1 و4 و8 و16 لتر/كغ، لموسم العصر في الخريف.') },
    hero: {
      eyebrow: t('Industry · Olive oil', 'القطاع · زيت الزيتون'),
      h1: t('Tinplate tins for olive oil brands', 'علب صفيح لعلامات زيت الزيتون'),
      lead: t('Olive oil has its season, and your tins should be ready before it starts. We design, print, form and pack tinplate for oil brands in one place.',
              'لزيت الزيتون موسمه، وعلبك يجب أن تكون جاهزة قبل أن يبدأ. نصمّم علب الصفيح ونطبعها ونشكّلها ونجهّزها لعلامات الزيت في مكان واحد.'),
      art: 'oil', stage: { shape: 'oil8', theme: 'olive', finish: 'gloss', label: t('3D olive-oil tin: drag to rotate', 'تنكة زيت زيتون ثلاثية الأبعاد: اسحب لتدويرها') },
      picker: { kind: 'shape', target: 'hero', initial: 'oil8', aria: t('Olive-oil tin sizes', 'أحجام تنكات زيت الزيتون'), items: OIL_SIZES },
      ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('What we offer', 'ما نقدّمه'), title: t('Printed, finished and ready to ship', 'مطبوعة ومشطَّبة وجاهزة للشحن'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Your artwork, in-house', 'تصميمك داخل المصنع'), p: t('Our designers prepare the artwork and CTP makes each plate precise, so the print matches your brand.', 'يجهّز مصمّمونا العمل الفني، وتقنية CTP تضمن دقة كل لوح، فتأتي الطباعة مطابقة لهويتك.') },
          { h: t('Finishes that stand out', 'تشطيبات تُبرز علبتك'), p: t('Gloss, matte, soft touch, rough touch and embossing, chosen to suit the brand.', 'لامع ومطفي وملمس ناعم وملمس خشن ونقش بارز، تُختار بما يناسب علامتك.') },
          { h: t('Food-grade interior lacquer', 'طلاء داخلي صالح للأغذية'), p: t('Interior lacquer that meets the highest food-safety standards.', 'طلاء داخلي مطابق لأعلى معايير الصحة الخاصة بالأغذية.') },
          { h: t('Ready for export', 'جاهزة للتصدير'), p: t('Cartons are palletised for overseas shipping, and we can hold finished stock until you need it.', 'تُرتَّب الكراتين على باليتات للشحن الخارجي، ويمكننا تخزين المنتج الجاهز إلى حين حاجتك إليه.') }
        ] }] },
      { eyebrow: t('Sizes', 'الأحجام'), title: t('Olive-oil tins in any size', 'تنكات زيت الزيتون بأي حجم'),
        blocks: [{ k: 'specs', rows: [
          { k: t('Olive-oil tins', 'تنكات زيت الزيتون'), v: t('Most popular: 1, 4, 8 and 16 L/kg', 'الأشهر: 1 و4 و8 و16 لتر/كغ'), note: t('Any other size is made to order. The drawing above is illustrative.', 'ونصنع أي حجم آخر حسب الطلب. والرسم أعلاه توضيحي.'), art: 'oil' },
          { k: t('Food cans', 'علب الأغذية'), v: t('9 diameters, 52–215 mm · 60 ml – 8 L', 'تسعة أقطار، 52–215 مم · من 60 مل إلى 8 لترات'), note: t('The general food-can range.', 'المجموعة العامة لعلب الأغذية.') },
          { k: t('Round gift tins', 'علب هدايا دائرية'), v: t('Ø 73–265 mm · H 34–210 mm', 'قطر 73–265 مم · ارتفاع 34–210 مم'), note: t('For premium and gift packs.', 'للعبوات الفاخرة وعبوات الهدايا.') }
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Still to be confirmed for olive oil', 'ما زال بانتظار التأكيد لزيت الزيتون'), items: [
        t('Minimum order quantity and harvest-season lead times', 'الحد الأدنى للطلب ومدد التسليم في موسم الحصاد')
      ] }] }
    ]
  },

  // ============================================================ INDUSTRY: MILK POWDER & DAIRY
  {
    id: 'ind-dairy', path: 'products/milk-powder-dairy/', navKey: 'products', parent: 'products',
    title: t('Milk Powder Cans for Dairy | Jordan Tinplate Canning', 'علب حليب البودرة | علب صفيح لعلامات الألبان | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Printed tinplate milk powder cans, from Ø 99 to 189 mm and up to 5.5 kg, plus ends and export-ready packing. Made in Jordan by Jordan Tinplate Canning.',
                   'علب صفيح مطبوعة لحليب البودرة بأقطار من 99 إلى 189 مم وسعة حتى 5.5 كغ، مع الأغطية والتغليف الجاهز للتصدير. صناعة أردنية من الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية.'),
    crumb: t('Milk powder & dairy', 'حليب البودرة والألبان'),
    tile: { h: t('Milk powder & dairy', 'حليب البودرة والألبان'), p: t('Large-format cans for powder and dairy.', 'علب كبيرة الحجم للبودرة والألبان.') },
    hero: {
      eyebrow: t('Industry · Milk powder & dairy', 'القطاع · حليب البودرة والألبان'),
      h1: t('Milk powder cans for dairy brands', 'علب حليب البودرة لعلامات الألبان'),
      lead: t('Large-format cans for powder and dairy, printed to your artwork and packed for export.', 'علب كبيرة الحجم للبودرة والألبان، مطبوعة وفق تصميمك ومجهّزة للتصدير.'),
      art: 'can', stage: { shape: 'milk', theme: 'halawah', finish: 'gloss', label: t('3D milk powder can: drag to rotate', 'علبة حليب بودرة ثلاثية الأبعاد: اسحب لتدويرها') },
      ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('The range', 'المجموعة'), title: t('Cans for powder and dairy', 'علب للبودرة والألبان'),
        blocks: [{ k: 'specs', rows: [
          { k: t('Milk powder cans', 'علب حليب البودرة'), v: t('Ø 99–189 mm · up to 5.5 kg', 'قطر 99–189 مم · حتى 5.5 كغ'), note: t('Large-format cans for powder and dairy.', 'علب كبيرة الحجم للبودرة والألبان.'), art: 'can' },
          { k: t('Ends', 'الأغطية'), v: t('Easy open · peel off · penny lever · aluminium · normal', 'Easy Open · Peel Off · Penny Lever · ألمنيوم · عادي'), note: t('Which ends suit milk powder is to be confirmed.', 'الأغطية الأنسب لحليب البودرة بانتظار التأكيد.'), tbc: true }
        ] }] },
      { eyebrow: t('What we offer', 'ما نقدّمه'), title: t('From artwork to pallet', 'من التصميم إلى الباليت'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Printing and coating', 'الطباعة والطلاء'), p: t('High-end inks and coatings on tinplate, with finishes from gloss and matte to soft touch and embossing.', 'أحبار وطلاءات عالية الجودة على الصفيح، مع تشطيبات من اللامع والمطفي إلى الملمس الناعم والنقش البارز.') },
          { h: t('One plate, many designs', 'لوح واحد، تصاميم متعددة'), p: t('Variable printing puts several versions of the same pack on a single printing plate.', 'تضع الطباعة المتغيّرة عدة نسخ من العبوة نفسها على لوح طباعة واحد.') },
          { h: t('Packing and storage', 'التغليف والتخزين'), p: t('Palletising suited to overseas shipping, and storage of finished stock if you need it.', 'تغليف على باليتات يناسب الشحن الخارجي، وتخزين للمنتج الجاهز إن احتجت إليه.') }
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Dairy technical details', 'التفاصيل الفنية لقطاع الألبان'), items: [
        t('Interior coating and food-contact compliance', 'الطلاء الداخلي ومطابقة الاستخدام الغذائي'),
        t('Sizes by fill weight', 'المقاسات بحسب وزن التعبئة'),
        t('Recommended ends and sealing', 'الأغطية وطريقة الإغلاق الموصى بها'),
        t('Minimum order quantity and lead times', 'الحد الأدنى للطلب ومدد التسليم')
      ] }] }
    ]
  },

  // ============================================================ INDUSTRY: SWEETS / KA'AK / CHOCOLATE
  {
    id: 'ind-sweets', path: 'products/sweets-kaak-chocolate/', navKey: 'products', parent: 'products',
    title: t('Gift Tins for Sweets, Ka’ak & Chocolate | Jordan Tinplate Canning', 'علب هدايا للحلويات والكعك والشوكولاتة | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Round, square, rectangular and oval gift tins for sweets, ka’ak and chocolate, with embossing and soft-touch finishes. Made in Jordan by Jordan Tinplate Canning.',
                   'علب هدايا دائرية ومربعة ومستطيلة وبيضاوية للحلويات والكعك والشوكولاتة، بنقش بارز وملمس ناعم. صناعة أردنية من الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية.'),
    crumb: t('Sweets, ka’ak & chocolate', 'الحلويات والكعك والشوكولاتة'),
    tile: { h: t('Sweets, ka’ak & chocolate', 'الحلويات والكعك والشوكولاتة'), p: t('Gift tins for Ramadan, Eid and every season.', 'علب هدايا لرمضان والعيد وكل المواسم.') },
    hero: {
      eyebrow: t('Industry · Sweets, ka’ak & chocolate', 'القطاع · الحلويات والكعك والشوكولاتة'),
      h1: t('Gift tins for sweets, ka’ak and chocolate', 'علب هدايا للحلويات والكعك والشوكولاتة'),
      lead: t('Embossed, soft-touch and unmistakably festive: tins that make Ramadan and Eid gifts worth keeping.', 'بنقش بارز وملمس ناعم وطابع احتفالي لا يُخطئ: علب تجعل هدايا رمضان والعيد تستحق الاحتفاظ بها.'),
      art: 'square', stage: { shape: 'square', theme: 'halawah', finish: 'emboss', label: t('3D gift tin: drag to rotate', 'علبة هدايا ثلاثية الأبعاد: اسحب لتدويرها') },
      picker: { kind: 'shape', target: 'hero', initial: 'square', aria: t('Gift-tin shapes', 'أشكال علب الهدايا'), items: SHAPES_SWEETS },
      ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('Shapes and sizes', 'الأشكال والمقاسات'), title: t('Four shapes, many sizes', 'أربعة أشكال ومقاسات متعددة'),
        blocks: [{ k: 'specs', rows: [
          { k: t('Round tin', 'علبة دائرية'), v: t('Ø 73–265 mm · H 34–210 mm', 'قطر 73–265 مم · ارتفاع 34–210 مم'), note: t('Six standard diameters, in many heights.', 'ستة أقطار قياسية، بارتفاعات متعددة.'), art: 'round' },
          { k: t('Square tin', 'علبة مربعة'), v: t('120–240 mm sides · H 40–100 mm', 'ضلع 120–240 مم · ارتفاع 40–100 مم'), note: t('Five standard sizes, from about 100 g to 1 kg.', 'خمسة مقاسات قياسية، من نحو 100 غ إلى 1 كغ.'), art: 'square' },
          { k: t('Rectangular tin', 'علبة مستطيلة'), v: t('Sizes on request', 'المقاسات عند الطلب'), note: t('Made to your specification.', 'تُصنَّع وفق مواصفاتك.'), art: 'rect' },
          { k: t('Oval tin', 'علبة بيضاوية'), v: t('Ø 300 mm · H 40–100 mm', 'قطر 300 مم · ارتفاع 40–100 مم'), note: t('A special-mold shape for presentation packs.', 'شكل بقالب خاص لعلب التقديم.'), art: 'oval' }
        ] }] },
      { eyebrow: t('Finishes', 'التشطيبات'), title: t('Make the gift feel like one', 'اجعل الهدية تبدو هدية'),
        blocks: [{ k: 'cards', cols: 3, items: [FINISH_CARDS[4], FINISH_CARDS[2], FINISH_CARDS[0]] },
                 { k: 'link', to: 'capabilities', label: t('All printing and finishing options', 'كل خيارات الطباعة والتشطيب') }] },
      { eyebrow: t('Seasons', 'المواسم'), title: t('Ready before Ramadan and Eid', 'جاهزة قبل رمضان والعيد'),
        blocks: [{ k: 'prose', ps: [t('Food has seasons, and your tins should be ready before them. Variable printing puts several versions of the same pack on one printing plate, so a seasonal range does not need a separate plate for every design.',
                                       'للأغذية مواسمها، وعلبك يجب أن تكون جاهزة قبلها. والطباعة المتغيّرة تضع عدة نسخ من العبوة نفسها على لوح واحد، فلا يحتاج الإصدار الموسمي إلى لوح مستقل لكل تصميم.')] },
                 { k: 'tbc', title: t('Seasonal planning', 'التخطيط للمواسم'), items: [
                   t('Order deadlines ahead of Ramadan and Eid', 'مواعيد الطلب قبل رمضان والعيد'),
                   t('Minimum order quantity', 'الحد الأدنى للطلب'),
                   t('Food-safe inner lining options', 'خيارات الطلاء الداخلي المناسب للأغذية')
                 ] }] }
    ]
  },

  // ============================================================ INDUSTRY: WHITE CHEESE
  {
    id: 'ind-cheese', path: 'products/white-cheese/', navKey: 'products', parent: 'products',
    title: t('White Cheese Tins | Jordan Tinplate Canning', 'علب الجبنة البيضاء | تغليف معدني | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Printed tinplate tins for white cheese brands from Jordan Tinplate Canning: in-house artwork and plates, finishes and export-ready packing for the spring season.',
                   'علب صفيح مطبوعة لعلامات الجبنة البيضاء من الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية: تصميم وألواح داخل المصنع، وتشطيبات، وتغليف جاهز للتصدير لموسم الربيع.'),
    crumb: t('White cheese', 'الجبنة البيضاء'),
    tile: { h: t('White cheese', 'الجبنة البيضاء'), p: t('Tins for the spring cheese season.', 'علب لموسم الجبنة في الربيع.') },
    hero: {
      eyebrow: t('Industry · White cheese', 'القطاع · الجبنة البيضاء'),
      h1: t('Tinplate tins for white cheese brands', 'علب صفيح لعلامات الجبنة البيضاء'),
      lead: t('Spring is white-cheese season. We print and form tinplate for dairy brands, from artwork and plates to export-ready packs.',
              'الربيع هو موسم الجبنة البيضاء. نطبع الصفيح ونشكّله لعلامات الألبان، من التصميم والألواح حتى العبوة الجاهزة للتصدير.'),
      art: 'rect', stage: { shape: 'cheese', theme: 'halawah', finish: 'matte', label: t('3D white-cheese tin: drag to rotate', 'علبة جبنة بيضاء ثلاثية الأبعاد: اسحب لتدويرها') },
      ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('What we offer', 'ما نقدّمه'), title: t('Printing, finishing and packing', 'الطباعة والتشطيب والتغليف'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Your artwork, in-house', 'تصميمك داخل المصنع'), p: t('Design and CTP plate-making in-house, then high-end inks and coatings.', 'تصميم وتصنيع ألواح CTP داخل المصنع، ثم أحبار وطلاءات عالية الجودة.') },
          { h: t('Finishes', 'التشطيبات'), p: t('Gloss, matte, soft touch, rough touch and embossing.', 'لامع ومطفي وملمس ناعم وملمس خشن ونقش بارز.') },
          { h: t('Export-ready packing', 'تغليف جاهز للتصدير'), p: t('Palletising for overseas shipping and storage of finished stock on request.', 'تغليف على باليتات للشحن الخارجي، وتخزين المنتج الجاهز عند الطلب.') }
        ] }] },
      { blocks: [{ k: 'prose', ps: [
        t('Tell us the product, the pack size and your artwork idea, and we will come back with a quotation made to your brand.',
          'أخبرنا بالمنتج ومقاس العبوة وفكرة التصميم، وسنردّ عليك بعرض سعر يناسب علامتك.')
      ] }] }
    ]
  },

  // ============================================================ INDUSTRY: COFFEE & TEA
  {
    id: 'ind-coffee', path: 'products/coffee-tea/', navKey: 'products', parent: 'products',
    title: t('Coffee & Tea Tins | Jordan Tinplate Canning', 'علب القهوة والشاي | تغليف معدني مطبوع | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Coffee and tea tins from Jordan Tinplate Canning: round and square tins, special molds that protect aroma, and printed finishes. Made in Jordan.',
                   'علب قهوة وشاي من الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية: علب دائرية ومربعة وقوالب خاصة تحفظ العبير، بطباعة وتشطيبات فاخرة. صناعة أردنية.'),
    crumb: t('Coffee & tea', 'القهوة والشاي'),
    tile: { h: t('Coffee & tea', 'القهوة والشاي'), p: t('Special molds that protect aroma.', 'قوالب خاصة تحفظ العبير.') },
    hero: {
      eyebrow: t('Industry · Coffee & tea', 'القطاع · القهوة والشاي'),
      h1: t('Tins for coffee and tea brands', 'علب لعلامات القهوة والشاي'),
      lead: t('Printed tins in round, square and special-mold shapes, including coffee tins that protect aroma.', 'علب مطبوعة بأشكال دائرية ومربعة وبقوالب خاصة، ومنها علب قهوة تحفظ العبير.'),
      art: 'round', stage: { shape: 'coffee', theme: 'halawah', finish: 'matte', label: t('3D coffee and tea tin: drag to rotate', 'علبة قهوة وشاي ثلاثية الأبعاد: اسحب لتدويرها') },
      ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('The range', 'المجموعة'), title: t('Shapes for coffee and tea', 'أشكال للقهوة والشاي'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Coffee tins', 'علب القهوة'), art: 'round', p: t('Special-mold coffee tins that protect aroma.', 'علب قهوة بقوالب خاصة تحفظ العبير.') },
          { h: t('Round and square tins', 'علب دائرية ومربعة'), art: 'square', p: t('Round tins from Ø 73 to 265 mm and square tins from 120 to 240 mm.', 'علب دائرية بقطر 73 إلى 265 مم، ومربعة بضلع 120 إلى 240 مم.') },
          { h: t('Other special molds', 'قوالب خاصة أخرى'), art: 'rect', p: t('Seamless two-piece cans, windowed boxes and fully custom shapes.', 'علب من قطعتين بلا لحام، وعلب بنافذة شفافة، وأي شكل حسب الطلب.') }
        ] }] },
      { eyebrow: t('Finishes', 'التشطيبات'), title: t('A tin people keep', 'علبة يحتفظ بها الناس'),
        blocks: [{ k: 'cards', cols: 3, items: [FINISH_CARDS[1], FINISH_CARDS[2], FINISH_CARDS[4]] }] },
      { blocks: [{ k: 'tbc', title: t('Coffee and tea technical details', 'التفاصيل الفنية للقهوة والشاي'), items: [
        t('Standard sizes by fill weight', 'المقاسات القياسية بحسب وزن التعبئة'),
        t('Aroma-protection features of the coffee tin', 'ميزات حفظ العبير في علبة القهوة'),
        t('Inner lid and closure options', 'خيارات الغطاء الداخلي والإغلاق'),
        t('Minimum order quantity and lead times', 'الحد الأدنى للطلب ومدد التسليم')
      ] }] }
    ]
  },

  // ============================================================ INDUSTRY: INDUSTRIAL
  {
    id: 'ind-industrial', path: 'products/industrial/', navKey: 'products', parent: 'products',
    title: t('Industrial Cans for Paints & Chemicals | Jordan Tinplate Canning', 'علب صناعية | للدهانات والكيماويات والبراميل | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Industrial tinplate cans for paints, chemicals and drums, with ends and components, from Jordan Tinplate Canning in Jordan.',
                   'علب صفيح صناعية للدهانات والكيماويات والبراميل، مع الأغطية والقطع، من الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية في الأردن.'),
    crumb: t('Industrial', 'الصناعي'),
    tile: { h: t('Industrial', 'الصناعي'), p: t('Cans for paints, chemicals and drums.', 'علب للدهانات والكيماويات والبراميل.') },
    hero: {
      eyebrow: t('Industry · Industrial', 'القطاع · الصناعي'),
      h1: t('Industrial cans for paints, chemicals and drums', 'علب صناعية للدهانات والكيماويات والبراميل'),
      lead: t('Beyond food and beverage, we also make cans for industrial products.', 'إلى جانب الأغذية والمشروبات، نصنع أيضاً علباً للمنتجات الصناعية.'),
      art: 'can', stage: { shape: 'paint', theme: 'halawah', finish: 'matte', label: t('3D industrial paint can: drag to rotate', 'علبة دهان صناعية ثلاثية الأبعاد: اسحب لتدويرها') },
      ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('What we make', 'ما نصنعه'), title: t('Industrial packaging', 'عبوات صناعية'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Paint cans', 'علب دهانات'), art: 'can', p: t('Cans for paints.', 'علب للدهانات.') },
          { h: t('Chemical cans', 'علب كيماويات'), art: 'can', p: t('Cans for chemical products.', 'علب للمنتجات الكيماوية.') },
          { h: t('Drums', 'براميل'), art: 'can', p: t('Drums for industrial use.', 'براميل للاستخدام الصناعي.') }
        ] }, { k: 'link', to: 'capabilities', label: t('Printing, forming and packing capabilities', 'قدراتنا في الطباعة والتشكيل والتغليف') }] },
      { eyebrow: t('How we work', 'كيف نعمل'), title: t('From the sheet to your pallet', 'من الصفيحة إلى الباليت'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: STEPS[2].h, p: STEPS[2].p },
          { h: t('Palletised for shipping', 'مرتَّبة على باليتات للشحن'), p: STEPS[3].p },
          { h: STEPS[4].h, p: STEPS[4].p }
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Industrial technical details', 'التفاصيل الفنية للقطاع الصناعي'), items: [
        t('Sizes and capacities', 'المقاسات والسعات'),
        t('Closure and end options', 'خيارات الأغطية والإغلاق'),
        t('Linings and coatings', 'الطلاءات والبطانات الداخلية'),
        t('Applicable standards and approvals', 'المعايير والاعتمادات المطبّقة'),
        t('Minimum order quantity and lead times', 'الحد الأدنى للطلب ومدد التسليم')
      ] }] }
    ]
  },

  // ============================================================ CAPABILITIES
  {
    id: 'capabilities', path: 'capabilities/', navKey: 'capabilities', parent: 'home',
    title: t('Capabilities: Print, Form & Export | Jordan Tinplate Canning', 'قدراتنا: التصميم والطباعة والتشكيل والتصدير | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('In-house design and CTP plate-making, printing and finishes, forming, palletising, storage and export packing: the whole tinplate journey at Jordan Tinplate Canning.',
                   'تصميم وتصنيع ألواح CTP داخل المصنع، وطباعة وتشطيبات، وتشكيل، وتغليف على باليتات، وتخزين، وتجهيز للتصدير: رحلة الصفيح كاملة لدى الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية.'),
    crumb: t('Capabilities', 'قدراتنا'),
    hero: {
      eyebrow: t('Capabilities', 'قدراتنا'),
      h1: t('The whole tinplate journey, under one roof', 'رحلة الصفيح كاملة تحت سقف واحد'),
      lead: t('Fully automatic production lines, in-house design and skilled people: from artwork and plates to formed, palletised, export-ready tins.',
              'خطوط إنتاج أوتوماتيكية بالكامل، وتصميم داخلي، وكوادر ماهرة: من التصميم والألواح إلى علب مشكَّلة ومرتَّبة على باليتات وجاهزة للتصدير.'),
      art: 'hero', stage: { shape: 'round', theme: 'halawah', cw: 0, finish: 'emboss' },
      ctas: [quoteCta(), { label: t('See products', 'تصفّح المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { kind: 'journey', id: 'journey', eyebrow: t('Step by step', 'خطوة بخطوة') },
      { id: 'design', eyebrow: t('Design & CTP', 'التصميم وCTP'), title: t('Artwork and plates, done in-house', 'العمل الفني والألواح داخل المصنع'),
        blocks: [{ k: 'prose', ps: [
          t('Our designers prepare your artwork, and CTP (Computer-to-Plate) makes every printing plate precise.', 'يجهّز مصمّمونا عملك الفني، وتقنية CTP (من الحاسوب إلى اللوح) تضمن دقة كل لوح طباعة.'),
          t('Variable printing puts several versions of the same pack on a single printing plate: one plate, many designs.', 'تضع الطباعة المتغيّرة عدة نسخ من العبوة نفسها على لوح طباعة واحد: لوح واحد وتصاميم متعددة.')
        ] }] },
      { kind: 'finish', id: 'finishes', eyebrow: t('Printing & finishes', 'الطباعة والتشطيبات') },
      { kind: 'shapes', id: 'forming', eyebrow: t('Forming', 'التشكيل'), title: t('Cut on exact lines, formed to your shape', 'قصّ دقيق وتشكيل بالهيئة التي تريدها'),
        after: [{ k: 'prose', ps: [t('Special molds: coffee tins, seamless two-piece cans, windowed boxes, tobacco tins and fully custom shapes.', 'قوالب خاصة: علب قهوة، وعلب من قطعتين بلا لحام، وعلب بنافذة شفافة، وعلب تبغ، وأشكال حسب الطلب.')] }] },
      { id: 'export', eyebrow: t('Packing, storage & export', 'التغليف والتخزين والتصدير'), title: t('Ready for your markets', 'جاهزة لأسواقك'),
        blocks: [{ k: 'prose', ps: [
          t('Cartons are palletised with methods tailored to each client and suited to overseas shipping.', 'تُرتَّب الكراتين على باليتات بطرق تناسب كل عميل وتصلح للشحن إلى الخارج.'),
          t('We can hold finished stock for you, freeing your own storage, then ship it to your markets.', 'يمكننا تخزين منتجك الجاهز لدينا لتوفير مساحة التخزين لديك، ثم شحنه إلى أسواقك.')
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Factory details', 'تفاصيل المصنع'), cards: true, items: [
        t('Production capacity', 'الطاقة الإنتاجية'),
        t('Equipment and line list', 'قائمة المعدات والخطوط'),
        t('Quality control process', 'نظام ضبط الجودة'),
        t('Minimum order quantities and lead times', 'الحد الأدنى للطلب ومدد التسليم')
      ] }] }
    ]
  },

  // ============================================================ ABOUT
  {
    id: 'about', path: 'about/', navKey: 'about', parent: 'home',
    title: t('About Us | Family Tinplate Maker Since 1998 | Jordan Tinplate Canning', 'من نحن | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية، صناعة الصفيح العائلية منذ 1998'),
    description: t('Founded in 1998 and led today by the third generation of the family, Jordan Tinplate Canning makes metal packaging for food and beverage brands in Jordan.',
                   'تأسست الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية عام 1998 ويقودها اليوم الجيل الثالث من العائلة، وتصنع التغليف المعدني لعلامات الأغذية والمشروبات في الأردن.'),
    crumb: t('About', 'من نحن'),
    hero: {
      eyebrow: t('About us', 'من نحن'),
      h1: t('Metal, made by one family, since 1998.', 'معدن تصنعه عائلة واحدة منذ عام 1998.'),
      lead: t('Founded in 1998 and led today by the third generation of the family.', 'تأسس المصنع عام 1998 ويقوده اليوم الجيل الثالث من العائلة.'),
      art: 'hero', stage: { shape: 'round', theme: 'halawah', cw: 0, finish: 'gloss' },
      ctas: [quoteCta(), { label: t('Our capabilities', 'قدراتنا'), to: 'capabilities', kind: 'ghost' }],
      stats: [
        { big: '1998', small: t('Founded in Jordan', 'تأسس في الأردن') },
        { big: t('3rd', 'الثالث'), small: t('generation of the family leads the company', 'الجيل الذي يقود الشركة اليوم من العائلة') },
        { big: t('~250', 'نحو 250'), small: t('people work with us', 'موظفاً يعملون معنا') },
      ]
    },
    sections: [
      { kind: 'featuredVideo', id: 'video' },
      { kind: 'story', id: 'story', noProof: true, title: t('A manufacturer that grew with its customers', 'مصنع نما مع عملائه') },
      { kind: 'certs', id: 'certifications' },
      { eyebrow: t('What we do', 'ما نقدّمه'), title: t('From artwork to export-ready packs', 'من التصميم إلى عبوات جاهزة للتصدير'),
        blocks: [{ k: 'prose', ps: [
          t('We make tinplate cans and tins for food and beverage brands, and handle the journey from artwork to export-ready packs.',
            'نصنع علب الصفيح للأغذية والمشروبات، ونتولى الرحلة كاملة من التصميم حتى العبوة الجاهزة للتصدير.')
        ] }, { k: 'link', to: 'capabilities', label: t('Our capabilities', 'قدراتنا') }] },
      { eyebrow: t('Company details', 'بيانات الشركة'), title: t('Who we are', 'من نحن'),
        blocks: [{ k: 'specs', rows: [
          { k: t('Official name (English)', 'الاسم الرسمي بالإنجليزية'), v: t('Jordan Tinplate Canning', 'Jordan Tinplate Canning') },
          { k: t('Official name (Arabic)', 'الاسم الرسمي بالعربية'), v: t('الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية', 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية') },
          { k: t('Location', 'الموقع'), v: t('Al-Zmailat – Al-Muwaqqar, Amman, Jordan', 'الزميلات – الموقّر، عمّان، الأردن') },
          { k: t('People', 'الفريق'), v: t('About 250 employees', 'نحو 250 موظفاً') }
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Still to be confirmed', 'ما زال بانتظار التأكيد'), cards: true, items: [
        t('Production capacity', 'الطاقة الإنتاجية'),
        t('Clients and case studies', 'العملاء ودراسات الحالة'),
        t('Team and leadership', 'الفريق والإدارة')
      ] }] }
    ]
  },

  // ============================================================ GALLERY
  {
    id: 'gallery', path: 'gallery/', navKey: 'gallery', parent: 'home',
    title: t('Photos & Videos Gallery | Jordan Tinplate Canning', 'معرض الصور والفيديوهات | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Videos from the Jordan Tinplate Canning factory in Jordan, with links to our longer videos on Facebook.',
                   'فيديوهات من مصنع الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية في الأردن، مع رابط لفيديوهاتنا الأطول على فيس بوك.'),
    crumb: t('Gallery', 'المعرض'),
    hero: {
      eyebrow: t('Gallery', 'المعرض'),
      h1: t('Photos & videos gallery', 'معرض الصور والفيديوهات'),
      lead: PHOTOS.length
        ? t('Videos and photos from the Jordan Tinplate Canning factory.', 'فيديوهات وصور من مصنع الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية.')
        : t('Videos from the Jordan Tinplate Canning factory.', 'فيديوهات من مصنع الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية.'),
      art: 'round', stage: { shape: 'round', theme: 'halawah', cw: 0, finish: 'soft' },
      ctas: [quoteCta(), { label: t('About us', 'من نحن'), to: 'about', kind: 'ghost' }]
    },
    sections: [
      { kind: 'videos', id: 'videos' },
      { kind: 'photos', id: 'photos' }
    ]
  },

  // ============================================================ NEWS
  {
    id: 'news', path: 'news/', navKey: 'news', parent: 'home',
    title: t('News & Events | Jordan Tinplate Canning', 'الأخبار والفعاليات | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Jordan Tinplate Canning in the news: the Saudi Food Manufacturing 2025 interview and our exhibitions in Dubai, New York and Baghdad.',
                   'أخبار الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية: مقابلة معرض Saudi Food Manufacturing 2025، ومشاركاتنا في المعارض في دبي ونيويورك وبغداد.'),
    crumb: t('News', 'الأخبار'),
    hero: {
      eyebrow: t('News & events', 'الأخبار والفعاليات'),
      h1: t('Out in the world.', 'حاضرون في الأسواق.'),
      lead: t('Interviews and the exhibitions where you can meet us.', 'مقابلات ومعارض يمكنك أن تلتقي بنا فيها.'),
      art: 'round', stage: { shape: 'round', theme: 'halawah', cw: 0, finish: 'gloss' }, ctas: [quoteCta()]
    },
    sections: [
      { kind: 'news', id: 'news-list' },
      { blocks: [{ k: 'tbc', title: t('More to come', 'المزيد قريباً'), items: [
        t('Upcoming exhibitions and event calendar', 'المعارض القادمة وجدول الفعاليات'),
        t('Company news and product guides', 'أخبار الشركة وأدلة المنتجات')
      ] }] }
    ]
  },

  // ============================================================ CONTACT
  {
    id: 'contact', path: 'contact/', navKey: 'contact', parent: 'home', noCta: true,
    title: t('Request a Quote | Contact Jordan Tinplate Canning', 'اطلب عرض سعر | تواصل مع الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Request a quotation for tinplate cans and tins. Call +962 6 4051125 or email sales@jordantinplate.com, or use our online order tool.',
                   'اطلب عرض سعر لعلب الصفيح المعدنية. اتصل على ‎+962 6 4051125 أو راسلنا على sales@jordantinplate.com، أو استخدم أداة الطلب الإلكترونية.'),
    crumb: t('Contact', 'تواصل معنا'),
    hero: {
      eyebrow: t('Contact', 'تواصل معنا'),
      h1: t('Request a quote', 'اطلب عرض سعر'),
      lead: UI.ctaLead, ctas: []
    },
    sections: []
  }
];

// ---------------------------------------------------------------- news items
export const NEWS = [
  { tag: t('Interview · April 2025', 'مقابلة · نيسان 2025'),
    h: t('Saudi Food Manufacturing 2025', 'معرض Saudi Food Manufacturing 2025'),
    p: t('Our partner Omar Abu Salha was interviewed by Sharikat Mubasher at Saudi Food Manufacturing 2025.', 'أجرى موقع «شركات مباشر» مقابلة مع شريكنا Omar Abu Salha خلال معرض Saudi Food Manufacturing 2025.'),
    href: 'https://en.sharikatmubasher.com/media-hub/news/21479228/jordan-canning-eyes-expanding-into-saudi-arabia' },
  { tag: t('Dubai · 2017', 'دبي · 2017'), h: t('Gulfood Manufacturing', 'معرض Gulfood Manufacturing'), p: t('Meeting food manufacturers from across the region.', 'لقاء مصنّعي الأغذية من أنحاء المنطقة.') },
  { tag: t('New York · 2017', 'نيويورك · 2017'), h: t('Fancy Food Show', 'معرض Fancy Food Show'), p: t('Our tins on the stand in North America.', 'علبنا في جناحنا في أمريكا الشمالية.') },
  { tag: t('Baghdad · 2017', 'بغداد · 2017'), h: t('Baghdad International Fair', 'معرض بغداد الدولي'), p: t('Meeting the Iraqi market in person.', 'لقاء السوق العراقي وجهاً لوجه.') }
];

export const NAV = [
  { key: 'products', page: 'products', label: t('Products', 'المنتجات') },
  { key: 'capabilities', page: 'capabilities', label: t('Capabilities', 'قدراتنا') },
  { key: 'about', page: 'about', label: t('About', 'من نحن') },
  { key: 'gallery', page: 'gallery', label: t('Gallery', 'المعرض') },
  { key: 'news', page: 'news', label: t('News', 'الأخبار') },
  { key: 'contact', page: 'contact', label: t('Contact', 'تواصل معنا') }
];
