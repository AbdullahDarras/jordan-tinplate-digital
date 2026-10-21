// Single source of truth for the Jordan Tinplate Canning site (phase 1).
// Every string is written once as t(en, ar). build.mjs renders /en/... and /ar/... from this file.
//
// RULES
//  - Only facts that exist in the repo (README, website-prototype, offsite plan) are stated as facts.
//  - Anything unconfirmed is a `tbc` block/row, which renders as an explicit "To be confirmed" placeholder.
//  - Arabic is written as natural Arabic copy, not word-for-word translation.

export const t = (en, ar) => ({ en, ar });

export const SITE = {
  // Production origin used for canonical / hreflang / sitemap. Confirmed by management (round 2, 2026-10-20).
  // SITE_URL=... can still override it for a staging build.
  origin: process.env.SITE_URL || 'https://www.jordantinplate.com',
  name: 'Jordan Tinplate Canning',           // official English name (always written in full)
  nameAr: 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية',   // official Arabic name (confirmed, round 2)
  orderUrl: 'https://jc-order.netlify.app/',  // existing online order / quote tool: primary "Request a quote" link
  phone: '+962 6 4051125',
  tel: '+96264051125',
  email: 'sales@jordantinplate.com',
  founded: '1998',
  catalogue: 'https://www.jordantinplate.com/pdf/catalog.pdf',
  social: {
    LinkedIn: 'https://www.linkedin.com/company/jordan-tin-plate-canning-printing-industrial-co',
    Instagram: 'https://www.instagram.com/jordantinplate',
    Facebook: 'https://www.facebook.com/JordanTinplate'
  },
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
  addressTbc: t('Full street address to be confirmed', 'العنوان التفصيلي الكامل بانتظار التأكيد'),
  footIndustries: t('Industries', 'القطاعات'),
  footCompany: t('Company', 'الشركة'),
  footContact: t('Contact', 'التواصل'),
  footBlurb: t('Custom tinplate packaging for food and beverage brands. Made in Jordan since 1998.',
               'علب معدنية مخصّصة لعلامات الأغذية والمشروبات. صناعة أردنية منذ عام 1998.'),
  footDraft: t('Draft content: items marked “to be confirmed” are waiting for management approval.',
               'محتوى أولي: العناصر المعلَّمة «بانتظار التأكيد» تنتظر موافقة الإدارة.'),
  rights: t('All rights reserved.', 'جميع الحقوق محفوظة.'),
  review: t('Review mode', 'وضع المراجعة'),
  catalogue: t('Download the catalogue (PDF)', 'حمّل الكتالوج (PDF)'),
  opensNew: t('opens in a new tab', 'يُفتح في تبويب جديد'),
  brandAria: t('Jordan Tinplate Canning, home page', 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية، الصفحة الرئيسية'),
  ctaTitle: t('Let’s put your brand on metal.', 'لنطبع علامتك على المعدن.'),
  ctaLead: t('Tell us what you are packing, the pack size and your artwork idea. We will come back with a quotation.',
             'أخبرنا بما تريد تعبئته ومقاس العبوة وفكرة التصميم، وسنردّ عليك بعرض سعر.'),
  orderTitle: t('Request your quote online', 'اطلب عرض سعرك إلكترونياً'),
  orderLead: t('Use our online order tool to describe your pack. It opens in a new tab.',
               'استخدم أداة الطلب الإلكترونية لوصف عبوتك. وتُفتح في تبويب جديد.'),
  orderEmail: t('Or email us', 'أو راسلنا بالبريد')
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
  { h: t('Embossing', 'نقش بارز'), p: t('Raised and recessed effects on lid and body that add movement and make the design stand out.', 'تأثيرات بارزة وغائرة على الغطاء والجسم تضيف حركة وتُبرز التصميم.') }
];

const STEPS = [
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

const PROOF_TBC = {
  k: 'tbc',
  title: t('Proof points', 'نقاط الإثبات'),
  items: [
    t('Certifications (copies will be published once received)', 'الشهادات (تُنشر بعد وصول نسخها)'),
    t('Production capacity', 'الطاقة الإنتاجية'),
    t('Clients and case studies', 'العملاء ودراسات الحالة')
  ],
  cards: true
};

export const PAGES = [
  // ============================================================ HOME
  {
    id: 'home', path: '', navKey: 'home',
    title: t('Jordan Tinplate Canning | Custom Metal Packaging for Food & Beverage', 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية | تغليف معدني مخصّص للأغذية والمشروبات'),
    description: t('Jordan Tinplate Canning designs, prints, forms and packs custom tinplate cans and gift tins for food and beverage brands. Made in Jordan since 1998.',
                   'يصمّم الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية علب الصفيح المعدنية وعلب الهدايا ويطبعها ويشكّلها ويجهّزها للشحن لعلامات الأغذية والمشروبات. صناعة أردنية منذ عام 1998.'),
    crumb: t('Home', 'الرئيسية'),
    hero: {
      eyebrow: t('Metal packaging · Made in Jordan · Since 1998', 'تغليف معدني · صناعة أردنية · منذ عام 1998'),
      h1: t('Custom tinplate packaging for food & beverage brands', 'علب معدنية مخصّصة لعلامات الأغذية والمشروبات'),
      lead: t('From artwork and plates to printed, formed, export-ready tins: one family-led manufacturer in Jordan, doing the whole journey under one roof.',
              'من التصميم والألواح إلى علب مطبوعة ومشكَّلة وجاهزة للتصدير: مصنع أردني تقوده عائلة واحدة، ويقدّم الرحلة كاملة تحت سقف واحد.'),
      art: 'hero',
      ctas: [quoteCta(), { label: t('See products by industry', 'تصفّح المنتجات حسب القطاع'), to: 'products', kind: 'ghost' }],
      stats: [
        { big: '1998', small: t('Founded in Jordan', 'تأسس في الأردن') },
        { big: t('3rd', 'الثالث'), small: t('generation of the family leads the company', 'الجيل الذي يقود الشركة اليوم من العائلة') },
        { big: t('~250', 'نحو 250'), small: t('people work with us', 'موظفاً يعملون معنا') },
        { big: t('In-house', 'داخلياً'), small: t('design and plate-making (CTP)', 'التصميم وتصنيع الألواح (CTP)') }
      ]
    },
    sections: [
      { id: 'industries', eyebrow: t('By industry', 'حسب القطاع'), title: t('Cans for what you put inside.', 'علب تناسب ما بداخلها.'),
        intro: t('Choose your product to see the formats, finishes and seasons that matter for it.', 'اختر منتجك لتتعرّف على الأحجام والتشطيبات والمواسم الأنسب له.'),
        blocks: [{ k: 'tiles', ids: ['ind-olive', 'ind-dairy', 'ind-sweets', 'ind-cheese', 'ind-coffee', 'ind-industrial'] }] },
      { id: 'journey', eyebrow: t('One roof, one partner', 'سقف واحد، وشريك واحد'), title: t('From sheet to shelf.', 'من الصفيحة إلى الرف.'),
        blocks: [{ k: 'steps', items: STEPS }, { k: 'link', to: 'capabilities', label: t('See our capabilities', 'تعرّف على قدراتنا') }] },
      { id: 'story', eyebrow: t('Our story', 'قصتنا'), title: t('Metal, made by one family, since 1998.', 'معدن تصنعه عائلة واحدة منذ عام 1998.'),
        blocks: [
          { k: 'prose', ps: [t('Founded in 1998 and led today by the third generation of the family, Jordan Tinplate Canning has grown into a manufacturer with fully automatic production lines, in-house design and skilled people.',
                                 'تأسس المصنع عام 1998 ويقوده اليوم الجيل الثالث من العائلة، وهو يعمل اليوم بخطوط إنتاج أوتوماتيكية بالكامل وفريق تصميم داخلي وكوادر ماهرة.')] },
          { k: 'quote', text: t('Our vision: to lead metal packaging in the region and be the first choice for customers around the globe.',
                               'رؤيتنا: أن نكون روّاد التغليف المعدني في المنطقة والخيار الأول للعملاء حول العالم.') },
          { k: 'link', to: 'about', label: t('About us', 'من نحن') },
          PROOF_TBC
        ] },
      { id: 'news', eyebrow: t('News & events', 'الأخبار والفعاليات'), title: t('Out in the world.', 'حاضرون في الأسواق.'),
        blocks: [{ k: 'news', limit: 1 }, { k: 'link', to: 'news', label: t('All news and events', 'كل الأخبار والفعاليات') }] }
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
      art: 'round', ctas: [quoteCta(), { label: UI.catalogue, to: 'catalogue', kind: 'ghost' }]
    },
    sections: [
      { id: 'by-industry', eyebrow: t('By industry', 'حسب القطاع'), title: t('Find your industry', 'ابحث عن قطاعك'),
        blocks: [{ k: 'tiles', ids: ['ind-olive', 'ind-dairy', 'ind-sweets', 'ind-cheese', 'ind-coffee', 'ind-industrial'] }] },
      { id: 'by-type', eyebrow: t('By type', 'حسب النوع'), title: t('The full range', 'المجموعة كاملة'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Fancy tins', 'علب فاخرة'), art: 'round',
            p: t('Round, square, rectangular and oval gift tins for sweets, ka’ak, chocolate, coffee and more.', 'علب هدايا دائرية ومربعة ومستطيلة وبيضاوية للحلويات والكعك والشوكولاتة والقهوة وغيرها.'),
            meta: t('Round Ø 73–265 mm · Square 120–240 mm', 'دائرية بقطر 73–265 مم · مربعة 120–240 مم') },
          { h: t('Food cans', 'علب أغذية'), art: 'can',
            p: t('Nine diameters from 52 to 215 mm.', 'تسعة أقطار من 52 إلى 215 مم.'),
            meta: t('60 ml – 8 L', 'من 60 مل إلى 8 لترات') },
          { h: t('Milk powder cans', 'علب حليب البودرة'), art: 'can',
            p: t('Large-format cans for powder and dairy.', 'علب كبيرة الحجم للبودرة والألبان.'),
            meta: t('Ø 99–189 mm · up to 5.5 kg', 'قطر 99–189 مم · حتى 5.5 كغ') },
          { h: t('Food containers & trays', 'حاويات وصواني أغذية'), art: 'oval',
            p: t('Including smooth round trays for knafeh and mansaf.', 'ومنها صواني دائرية ناعمة للكنافة والمنسف.') },
          { h: t('Special molds', 'قوالب خاصة'), art: 'rect',
            p: t('Coffee tins that protect aroma, seamless two-piece cans, windowed boxes, tobacco tins and fully custom shapes.',
                 'علب قهوة تحفظ العبير، وعلب من قطعتين بلا لحام، وعلب بنافذة شفافة، وعلب تبغ، وأي شكل حسب الطلب.') },
          { h: t('Ends & components', 'الأغطية والقطع'), art: 'round',
            p: t('Easy open, peel off, penny lever, aluminium and normal ends.', 'أغطية Easy Open وPeel Off وPenny Lever وألمنيوم وأغطية عادية.') },
          { h: t('Industrial cans', 'علب صناعية'), art: 'can',
            p: t('Paints, chemicals and drums.', 'للدهانات والكيماويات والبراميل.') }
        ] }] },
      { id: 'shapes', eyebrow: t('Shapes', 'الأشكال'), title: t('Every shape your brand needs.', 'كل شكل تحتاجه علامتك.'),
        blocks: [
          { k: 'specs', rows: [
            { k: t('Round tin', 'علبة دائرية'), v: t('Ø 73–265 mm · H 34–210 mm', 'قطر 73–265 مم · ارتفاع 34–210 مم'), note: t('Six standard diameters, in many heights.', 'ستة أقطار قياسية، بارتفاعات متعددة.'), art: 'round' },
            { k: t('Square tin', 'علبة مربعة'), v: t('120–240 mm sides · H 40–100 mm', 'ضلع 120–240 مم · ارتفاع 40–100 مم'), note: t('Five standard sizes, from about 100 g to 1 kg.', 'خمسة مقاسات قياسية، من نحو 100 غ إلى 1 كغ.'), art: 'square' },
            { k: t('Rectangular tin', 'علبة مستطيلة'), v: t('Sizes on request', 'المقاسات عند الطلب'), note: t('Made to your specification.', 'تُصنَّع وفق مواصفاتك.'), art: 'rect' },
            { k: t('Oval tin', 'علبة بيضاوية'), v: t('Ø 300 mm · H 40–100 mm', 'قطر 300 مم · ارتفاع 40–100 مم'), note: t('A special-mold shape for presentation packs.', 'شكل بقالب خاص لعلب التقديم.'), art: 'oval' },
            { k: t('Olive-oil tin', 'تنكة زيت الزيتون'), v: t('1, 4, 8 and 16 L/kg', '1 و4 و8 و16 لتر/كغ'), note: t('Produced in all four sizes.', 'تُنتَج بالأحجام الأربعة كلها.'), art: 'oil' }
          ] },
          { k: 'fine', text: t('Drawings are illustrative. Custom sizes are available on request.', 'الرسومات توضيحية. والمقاسات الخاصة متاحة عند الطلب.') }
        ] },
      { id: 'finishes', eyebrow: t('Finishes', 'التشطيبات'), title: t('Touch it before you print it.', 'جرّب الملمس قبل الطباعة.'),
        intro: t('Every finish below is available on our lines.', 'كل التشطيبات التالية متوفرة على خطوطنا.'),
        blocks: [{ k: 'cards', cols: 3, items: FINISH_CARDS }] }
    ]
  },

  // ============================================================ INDUSTRY: OLIVE OIL
  {
    id: 'ind-olive', path: 'products/olive-oil/', navKey: 'products', parent: 'products',
    title: t('Olive Oil Tins 1–16 L/kg | Jordan Tinplate Canning', 'علب زيت الزيتون 1–16 لتر/كغ | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية'),
    description: t('Printed tinplate olive oil tins in 1, 4, 8 and 16 L/kg with food-grade interior lacquer, in-house artwork and export-ready packing. Made in Jordan.',
                   'تنكات زيت الزيتون من الصفيح المطبوع بأحجام 1 و4 و8 و16 لتر/كغ، بطلاء داخلي صالح للأغذية وتصميم داخل المصنع وتغليف جاهز للتصدير. صناعة أردنية.'),
    crumb: t('Olive oil', 'زيت الزيتون'),
    tile: { h: t('Olive oil', 'زيت الزيتون'), p: t('Tins in 1, 4, 8 and 16 L/kg for the autumn pressing season.', 'تنكات بأحجام 1 و4 و8 و16 لتر/كغ لموسم العصر في الخريف.') },
    hero: {
      eyebrow: t('Industry · Olive oil', 'القطاع · زيت الزيتون'),
      h1: t('Tinplate tins for olive oil brands', 'علب صفيح لعلامات زيت الزيتون'),
      lead: t('Olive oil has its season, and your tins should be ready before it starts. We design, print, form and pack tinplate for oil brands in one place.',
              'لزيت الزيتون موسمه، وعلبك يجب أن تكون جاهزة قبل أن يبدأ. نصمّم علب الصفيح ونطبعها ونشكّلها ونجهّزها لعلامات الزيت في مكان واحد.'),
      art: 'oil', ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('What we offer', 'ما نقدّمه'), title: t('Printed, finished and ready to ship', 'مطبوعة ومشطَّبة وجاهزة للشحن'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Your artwork, in-house', 'تصميمك داخل المصنع'), p: t('Our designers prepare the artwork and CTP makes each plate precise, so the print matches your brand.', 'يجهّز مصمّمونا العمل الفني، وتقنية CTP تضمن دقة كل لوح، فتأتي الطباعة مطابقة لهويتك.') },
          { h: t('Finishes that stand out', 'تشطيبات تُبرز علبتك'), p: t('Gloss, matte, soft touch, rough touch and embossing, chosen to suit the brand.', 'لامع ومطفي وملمس ناعم وملمس خشن ونقش بارز، تُختار بما يناسب علامتك.') },
          { h: t('Food-grade interior lacquer', 'طلاء داخلي صالح للأغذية'), p: t('Interior lacquer that meets the highest food-safety standards.', 'طلاء داخلي مطابق لأعلى معايير الصحة الخاصة بالأغذية.') },
          { h: t('Ready for export', 'جاهزة للتصدير'), p: t('Cartons are palletised for overseas shipping, and we can hold finished stock until you need it.', 'تُرتَّب الكراتين على باليتات للشحن الخارجي، ويمكننا تخزين المنتج الجاهز إلى حين حاجتك إليه.') }
        ] }] },
      { eyebrow: t('Sizes', 'الأحجام'), title: t('Olive-oil tins in four sizes', 'تنكات زيت الزيتون بأربعة أحجام'),
        blocks: [{ k: 'specs', rows: [
          { k: t('Olive-oil tins', 'تنكات زيت الزيتون'), v: t('1, 4, 8 and 16 L/kg', '1 و4 و8 و16 لتر/كغ'), note: t('We produce olive-oil tins in all four sizes. The drawing above is illustrative.', 'ننتج تنكات زيت الزيتون بالأحجام الأربعة كلها. والرسم أعلاه توضيحي.'), art: 'oil' },
          { k: t('Food cans', 'علب الأغذية'), v: t('9 diameters, 52–215 mm · 60 ml – 8 L', 'تسعة أقطار، 52–215 مم · من 60 مل إلى 8 لترات'), note: t('The general food-can range.', 'المجموعة العامة لعلب الأغذية.') },
          { k: t('Round gift tins', 'علب هدايا دائرية'), v: t('Ø 73–265 mm · H 34–210 mm', 'قطر 73–265 مم · ارتفاع 34–210 مم'), note: t('For premium and gift packs.', 'للعبوات الفاخرة وعبوات الهدايا.') }
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Still to be confirmed for olive oil', 'ما زال بانتظار التأكيد لزيت الزيتون'), items: [
        t('Certifications (copies will be published once received)', 'الشهادات (تُنشر بعد وصول نسخها)'),
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
      art: 'can', ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('The range', 'المجموعة'), title: t('Cans and ends for powder and dairy', 'علب وأغطية للبودرة والألبان'),
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
        t('Relevant certifications', 'الشهادات ذات الصلة'),
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
      art: 'square', ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
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
      art: 'rect', ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
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
      art: 'round', ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
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
      art: 'can', ctas: [quoteCta(), { label: t('All products', 'كل المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { eyebrow: t('What we make', 'ما نصنعه'), title: t('Industrial packaging', 'عبوات صناعية'),
        blocks: [{ k: 'cards', cols: 3, items: [
          { h: t('Paint cans', 'علب دهانات'), art: 'can', p: t('Cans for paints.', 'علب للدهانات.') },
          { h: t('Chemical cans', 'علب كيماويات'), art: 'can', p: t('Cans for chemical products.', 'علب للمنتجات الكيماوية.') },
          { h: t('Drums', 'براميل'), art: 'can', p: t('Drums for industrial use.', 'براميل للاستخدام الصناعي.') }
        ] }, { k: 'link', to: 'capabilities', label: t('Printing, forming and packing capabilities', 'قدراتنا في الطباعة والتشكيل والتغليف') }] },
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
      art: 'hero', ctas: [quoteCta(), { label: t('See products', 'تصفّح المنتجات'), to: 'products', kind: 'ghost' }]
    },
    sections: [
      { id: 'journey', eyebrow: t('Step by step', 'خطوة بخطوة'), title: t('From sheet to shelf.', 'من الصفيحة إلى الرف.'), blocks: [{ k: 'steps', items: STEPS }] },
      { id: 'design', eyebrow: t('Design & CTP', 'التصميم وCTP'), title: t('Artwork and plates, done in-house', 'العمل الفني والألواح داخل المصنع'),
        blocks: [{ k: 'prose', ps: [
          t('Our designers prepare your artwork, and CTP (Computer-to-Plate) makes every printing plate precise.', 'يجهّز مصمّمونا عملك الفني، وتقنية CTP (من الحاسوب إلى اللوح) تضمن دقة كل لوح طباعة.'),
          t('Variable printing puts several versions of the same pack on a single printing plate: one plate, many designs.', 'تضع الطباعة المتغيّرة عدة نسخ من العبوة نفسها على لوح طباعة واحد: لوح واحد وتصاميم متعددة.')
        ] }] },
      { id: 'finishes', eyebrow: t('Printing & finishes', 'الطباعة والتشطيبات'), title: t('Touch it before you print it.', 'جرّب الملمس قبل الطباعة.'),
        intro: t('High-end inks and coatings, plus effects. Every finish below is available on our lines.', 'أحبار وطلاءات عالية الجودة مع مؤثرات متنوعة. وكل التشطيبات التالية متوفرة على خطوطنا.'),
        blocks: [{ k: 'cards', cols: 3, items: FINISH_CARDS }] },
      { id: 'forming', eyebrow: t('Forming', 'التشكيل'), title: t('Cut on exact lines, formed to your shape', 'قصّ دقيق وتشكيل بالهيئة التي تريدها'),
        blocks: [{ k: 'specs', rows: [
          { k: t('Round tin', 'علبة دائرية'), v: t('Ø 73–265 mm · H 34–210 mm', 'قطر 73–265 مم · ارتفاع 34–210 مم'), art: 'round' },
          { k: t('Square tin', 'علبة مربعة'), v: t('120–240 mm sides · H 40–100 mm', 'ضلع 120–240 مم · ارتفاع 40–100 مم'), art: 'square' },
          { k: t('Rectangular tin', 'علبة مستطيلة'), v: t('Sizes on request', 'المقاسات عند الطلب'), art: 'rect' },
          { k: t('Oval tin', 'علبة بيضاوية'), v: t('Ø 300 mm · H 40–100 mm', 'قطر 300 مم · ارتفاع 40–100 مم'), art: 'oval' },
          { k: t('Special molds', 'قوالب خاصة'), v: t('Coffee tins, seamless two-piece cans, windowed boxes, tobacco tins, custom shapes', 'علب قهوة، وعلب من قطعتين بلا لحام، وعلب بنافذة شفافة، وعلب تبغ، وأشكال حسب الطلب'), art: 'rect' }
        ] }] },
      { id: 'export', eyebrow: t('Packing, storage & export', 'التغليف والتخزين والتصدير'), title: t('Ready for your markets', 'جاهزة لأسواقك'),
        blocks: [{ k: 'prose', ps: [
          t('Cartons are palletised with methods tailored to each client and suited to overseas shipping.', 'تُرتَّب الكراتين على باليتات بطرق تناسب كل عميل وتصلح للشحن إلى الخارج.'),
          t('We can hold finished stock for you, freeing your own storage, then ship it to your markets.', 'يمكننا تخزين منتجك الجاهز لدينا لتوفير مساحة التخزين لديك، ثم شحنه إلى أسواقك.')
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Factory details', 'تفاصيل المصنع'), cards: true, items: [
        t('Production capacity', 'الطاقة الإنتاجية'),
        t('Equipment and line list', 'قائمة المعدات والخطوط'),
        t('Quality control process and certifications', 'نظام ضبط الجودة والشهادات'),
        t('Minimum order quantities and lead times', 'الحد الأدنى للطلب ومدد التسليم')
      ] }] }
    ]
  },

  // ============================================================ ABOUT
  {
    id: 'about', path: 'about/', navKey: 'about', parent: 'home',
    title: t('About Us | Family Tinplate Maker Since 1998 | Jordan Tinplate Canning', 'من نحن | الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية، صناعة الصفيح العائلية منذ 1998'),
    description: t('Founded in 1998 and led today by the third generation of the family, Jordan Tinplate Canning makes metal packaging for food and beverage brands in Jordan.',
                   'تأسس الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية عام 1998 ويقوده اليوم الجيل الثالث من العائلة، ويصنع التغليف المعدني لعلامات الأغذية والمشروبات في الأردن.'),
    crumb: t('About', 'من نحن'),
    hero: {
      eyebrow: t('About us', 'من نحن'),
      h1: t('Metal, made by one family, since 1998.', 'معدن تصنعه عائلة واحدة منذ عام 1998.'),
      lead: t('Founded in 1998 and led today by the third generation of the family.', 'تأسس المصنع عام 1998 ويقوده اليوم الجيل الثالث من العائلة.'),
      art: 'hero', ctas: [quoteCta(), { label: t('Our capabilities', 'قدراتنا'), to: 'capabilities', kind: 'ghost' }],
      stats: [
        { big: '1998', small: t('Founded in Jordan', 'تأسس في الأردن') },
        { big: t('3rd', 'الثالث'), small: t('generation of the family leads the company', 'الجيل الذي يقود الشركة اليوم من العائلة') },
        { big: t('~250', 'نحو 250'), small: t('people work with us', 'موظفاً يعملون معنا') },
      ]
    },
    sections: [
      { eyebrow: t('Our story', 'قصتنا'), title: t('A manufacturer that grew with its customers', 'مصنع نما مع عملائه'),
        blocks: [{ k: 'prose', ps: [
          t('Jordan Tinplate Canning has grown into a manufacturer with fully automatic production lines, in-house design and skilled people. We make tinplate cans and tins for food and beverage brands, and handle the journey from artwork to export-ready packs.',
            'نما المصنع حتى أصبح يعمل بخطوط إنتاج أوتوماتيكية بالكامل وفريق تصميم داخلي وكوادر ماهرة. نصنع علب الصفيح للأغذية والمشروبات، ونتولى الرحلة كاملة من التصميم حتى العبوة الجاهزة للتصدير.')
        ] }] },
      { eyebrow: t('Vision & mission', 'الرؤية والرسالة'), title: t('Where we are going', 'إلى أين نتجه'),
        blocks: [
          { k: 'quote', text: t('Our vision: to lead metal packaging in the region and be the first choice for customers around the globe.', 'رؤيتنا: أن نكون روّاد التغليف المعدني في المنطقة والخيار الأول للعملاء حول العالم.') },
          { k: 'prose', ps: [t('Our mission is to deliver high-end quality products and services using cutting-edge technology and a skilled workforce.', 'ورسالتنا تقديم منتجات وخدمات بجودة عالية باستخدام أحدث التقنيات وكوادر ماهرة.')] }
        ] },
      { eyebrow: t('Company details', 'بيانات الشركة'), title: t('Who we are', 'من نحن'),
        blocks: [{ k: 'specs', rows: [
          { k: t('Official name (English)', 'الاسم الرسمي بالإنجليزية'), v: t('Jordan Tinplate Canning', 'Jordan Tinplate Canning') },
          { k: t('Official name (Arabic)', 'الاسم الرسمي بالعربية'), v: t('الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية', 'الشركة الأردنية لصناعة وطباعة الصفيح والعبوات المعدنية') },
          { k: t('Location', 'الموقع'), v: t('Al-Zmailat – Al-Muwaqqar, Amman, Jordan', 'الزميلات – الموقّر، عمّان، الأردن') },
          { k: t('People', 'الفريق'), v: t('About 250 employees', 'نحو 250 موظفاً') }
        ] }] },
      { blocks: [{ k: 'tbc', title: t('Still to be confirmed', 'ما زال بانتظار التأكيد'), cards: true, items: [
        t('Full street address and map location', 'العنوان التفصيلي وموقع الخريطة'),
        t('Certifications (copies will be published once received)', 'الشهادات (تُنشر بعد وصول نسخها)'),
        t('Production capacity', 'الطاقة الإنتاجية'),
        t('Clients and case studies', 'العملاء ودراسات الحالة'),
        t('Team and leadership', 'الفريق والإدارة'),
        t('Final logo and brand colour', 'الشعار النهائي ولون العلامة')
      ] }] }
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
      art: 'round', ctas: [quoteCta()]
    },
    sections: [
      { blocks: [{ k: 'news' }] },
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
      lead: UI.ctaLead, art: 'hero', ctas: []
    },
    sections: [{ id: 'quote', blocks: [{ k: 'contact' }] }]
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
  { key: 'news', page: 'news', label: t('News', 'الأخبار') },
  { key: 'contact', page: 'contact', label: t('Contact', 'تواصل معنا') }
];
