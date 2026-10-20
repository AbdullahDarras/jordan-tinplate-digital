// English copy lives in index.html (read back at runtime). This file holds the Arabic copy and the dynamic strings.
// Arabic copy still needs a pass by a native reviewer before launch (see README, "Remaining placeholders").
const E = (s) => '<span class="dot"></span>' + s;
export const NAME_AR = 'مصنع الأردنية للصفيح والعبوات المعدنية';

export const AR = {
  'brand.word': '<span>مصنع <b>الأردنية</b></span><span class="brand__sub">للصفيح والعبوات المعدنية</span>',
  'ld.skip': 'تخطَّ المقدمة', 'ld.name': NAME_AR,
  'nav.journey': 'رحلة الإنتاج', 'nav.finish': 'التشطيبات', 'nav.range': 'المنتجات', 'nav.seasons': 'المواسم',
  'nav.story': 'قصتنا', 'nav.news': 'الأخبار', 'nav.cta': 'اطلب عرض سعر',

  'hero.eyebrow': E('تغليف معدني · صُنع في الأردن · منذ 1998'),
  'hero.l1': 'نطبع.', 'hero.l2': 'ونعلّب.',
  'hero.lead': 'علب معدنية مخصّصة لعلامات الأغذية والمشروبات — من التصميم والألواح إلى العلبة المطبوعة والمشكَّلة والجاهزة للتصدير.',
  'hero.cta1': 'تابع الرحلة', 'hero.cta2': 'اطلب عرض سعر',
  'hero.f1': 'تأسس في الأردن', 'hero.f2': 'الجيل الثالث في الإدارة', 'hero.f3': 'مناطق شاركنا فيها في معارض', 'hero.scroll': 'مرّر',

  'j.eyebrow': E('سقف واحد، وشريك واحد'), 'j.title': 'من الصفيحة إلى الرف.',
  'j.s1t': 'التصميم والألواح', 'j.s1d': 'مصممونا يجهّزون عملك الفني، وتقنية CTP (من الحاسوب إلى اللوح) تضمن دقة كل لوح طباعة.',
  'j.s2t': 'الطباعة والطلاء والتشطيب', 'j.s2d': 'أحبار وطلاءات عالية الجودة مع تأثيرات: لمعة، مطفي، ملمس ناعم، ونقش بارز.',
  'j.s3t': 'القص والتشكيل', 'j.s3d': 'تُقصّ الصفائح بدقة وتُشكَّل بالهيئة التي تريدها: دائرية أو مربعة أو مستطيلة أو بشكل خاص.',
  'j.s4t': 'التغليف على البالتات', 'j.s4d': 'تُرتَّب الكراتين على بالتات بطرق تناسب كل عميل وتناسب الشحن الخارجي.',
  'j.s5t': 'التخزين والشحن', 'j.s5d': 'نستطيع تخزين منتجك الجاهز لدينا لتوفير مساحة التخزين عندك، ثم شحنه إلى أسواقك.',

  'f.eyebrow': E('مختبر التشطيبات'), 'f.title': 'جرّب الملمس قبل الطباعة.',
  'f.lead': 'اختر تشطيباً وشاهد المعدن يستجيب. كل هذه التشطيبات متوفرة على خطوطنا.',
  'f.gloss': 'لمعة', 'f.matte': 'مطفي', 'f.soft': 'ملمس ناعم', 'f.rough': 'ملمس خشن', 'f.emboss': 'نقش بارز',
  'f.plate': 'لوح واحد، تصاميم متعددة.', 'f.plated': 'الطباعة المتغيّرة تضع عدة نسخ من العبوة نفسها على لوح طباعة واحد.',

  's.eyebrow': E('الأشكال'), 's.title': 'كل شكل تحتاجه علامتك.',
  's.round': 'دائرية', 's.square': 'مربعة', 's.rect': 'مستطيلة', 's.oval': 'بيضاوية', 's.oil': 'تنكة زيت',
  's.fine': 'المجسّمات ثلاثية الأبعاد توضيحية. المقاسات من جداول منتجاتنا، والمقاسات الخاصة متاحة عند الطلب.',

  'r.eyebrow': E('المنتجات'), 'r.title': 'علب تناسب ما بداخلها.',
  'r.c1t': 'علب فاخرة', 'r.c1d': 'علب هدايا دائرية ومربعة ومستطيلة وبيضاوية للحلويات والكعك والشوكولاتة والقهوة وغيرها.', 'r.c1m': 'دائرية بقطر 73–265 مم · مربعة 120–240 مم',
  'r.c2t': 'علب أغذية', 'r.c2d': 'تسعة أقطار من 52 إلى 215 مم.', 'r.c2m': 'من 60 مل إلى 8 لتر',
  'r.c3t': 'علب حليب البودرة', 'r.c3d': 'علب كبيرة الحجم للبودرة والألبان.', 'r.c3m': 'قطر 99–189 مم · حتى 5.5 كغ',
  'r.c4t': 'حاويات وصواني أغذية', 'r.c4d': 'ومنها صواني دائرية ناعمة للكنافة والمنسف.',
  'r.c5t': 'قوالب خاصة', 'r.c5d': 'علب قهوة تحفظ العبير، وعلب Two-piece بدون لحام، وعلب بنافذة شفافة، وعلب تبغ، وأي شكل حسب الطلب.',
  'r.c6t': 'الأغطية والقطع', 'r.c6d': 'Easy Open وPeel Off وPenny Lever وألمنيوم وأغطية عادية.',
  'r.c7t': 'علب صناعية', 'r.c7d': 'للدهانات والكيماويات والبراميل.',
  'r.cat': 'حمّل الكتالوج',

  'z.eyebrow': E('المواسم'), 'z.title': 'تغليف يتبع المواسم.', 'z.lead': 'للأغذية مواسمها، وعلبك يجب أن تكون جاهزة قبلها.',
  'z.t1k': 'الخريف', 'z.t1': 'زيت الزيتون', 'z.now': 'الموسم الآن',
  'z.t2k': 'رمضان والعيد', 'z.t2': 'حلويات وكعك وشوكولاتة', 'z.t3k': 'الربيع', 'z.t3': 'الجبنة البيضاء',
  'z.fine': 'التصميم المعروض نموذج توضيحي وليس تصميم عميل.',

  'st.eyebrow': E('قصتنا'), 'st.title': 'معدن تصنعه عائلة واحدة منذ 1998.', 'st.years': 'عاماً في صناعة التغليف المعدني',
  'st.p1': 'تأسس المصنع عام 1998 ويقوده اليوم الجيل الثالث من العائلة، وأصبح مصنعاً بخطوط إنتاج أوتوماتيكية بالكامل وفريق تصميم داخل المصنع وكوادر ماهرة.',
  'st.vision': 'رؤيتنا: أن نكون روّاد التغليف المعدني في المنطقة والخيار الأول للعملاء حول العالم.',
  'st.p2': 'ورسالتنا تقديم منتجات وخدمات بجودة عالية باستخدام أحدث التقنيات وكوادر ماهرة.',
  'st.pr1': 'الشهادات', 'st.pr2': 'الطاقة الإنتاجية', 'st.pr3': 'العملاء ودراسات الحالة', 'st.tbc': 'بانتظار تأكيد الإدارة',

  'n.eyebrow': E('الأخبار والفعاليات'), 'n.title': 'حاضرون في العالم.',
  'n.t1': 'مقابلة · نيسان 2025', 'n.h1': 'معرض Saudi Food Manufacturing 2025',
  'n.p1': 'أجرى موقع «شركات مباشر» مقابلة مع شريكنا Omar Abu Salha خلال المعرض.', 'n.read': 'اقرأ',
  'n.t2': 'دبي · 2017', 'n.h2': 'معرض Gulfood Manufacturing', 'n.t3': 'نيويورك · 2017', 'n.h3': 'معرض Fancy Food Show', 'n.t4': 'بغداد · 2017',
  'n.p2': 'لقاء مصنّعي الأغذية من أنحاء المنطقة.', 'n.p3': 'علبنا في جناحنا في أمريكا الشمالية.',
  'n.h4': 'معرض بغداد الدولي', 'n.p4': 'لقاء السوق العراقي وجهاً لوجه.',

  'c.eyebrow': E('لنتحدث'), 'c.title': 'لنطبع علامتك على المعدن.',
  'c.phone': 'الهاتف', 'c.mail': 'البريد', 'c.addr': 'العنوان', 'c.addrv': 'الزميلات – الموقّر، الأردن',
  'c.qt': 'اطلب عرض سعر', 'c.qp': 'صِف عبوتك ومقاساتها وكمياتها في أداة الطلب الإلكترونية، وسيعود إليك فريق المبيعات.',
  'c.qgo': 'افتح أداة الطلب', 'c.qnew': '(يفتح في تبويب جديد)', 'c.qalt': 'تفضّل البريد؟',
  'foot.name': NAME_AR, 'foot.proto': 'نموذج أولي للصفحة الرئيسية · محتوى توضيحي', 'foot.review': 'وضع المراجعة',

  // aria-labels (data-i18n-aria)
  'a.brand': NAME_AR, 'a.lang': 'تغيير اللغة', 'a.theme': 'التبديل بين الوضع الفاتح والداكن', 'a.menu': 'القائمة', 'a.nav': 'التنقل الرئيسي', 'a.sectors': 'القطاعات',
  'a.s_hero': 'علبة ثلاثية الأبعاد — اسحب لتدويرها', 'a.s_journey': 'رحلة الصفيحة المعدنية بثلاثية الأبعاد', 'a.s_finish': 'علبة ثلاثية الأبعاد يمكنك تغيير تشطيبها',
  'a.s_shapes': 'أشكال العلب بثلاثية الأبعاد', 'a.s_seasons': 'علبة موسمية ثلاثية الأبعاد',
  'a.finishes': 'التشطيبات', 'a.shapes': 'الأشكال', 'a.cw': 'ألوان التصميم', 'a.cw0': 'كحلي', 'a.cw1': 'نحاسي', 'a.cw2': 'أخضر مزرق', 'a.cw3': 'كريمي', 'a.seasons': 'المواسم'
};

export const DYN = {
  title: { en: 'Jordan Tinplate Canning — Custom Metal Packaging for Food & Beverage', ar: NAME_AR + ' — تغليف معدني مخصّص للأغذية والمشروبات' },
  desc: {
    en: 'Jordan Tinplate Canning designs, prints, forms and packs custom tinplate cans for food and beverage brands — made in Jordan since 1998.',
    ar: NAME_AR + ' يصمّم ويطبع ويشكّل علب الصفيح المخصّصة لعلامات الأغذية والمشروبات ويجهّزها للتصدير — صُنع في الأردن منذ 1998.'
  },
  ogDesc: {
    en: 'Custom tinplate cans for food and beverage brands — designed, printed, formed and packed in Jordan since 1998.',
    ar: 'علب صفيح مخصّصة لعلامات الأغذية والمشروبات — تصميم وطباعة وتشكيل وتجهيز للتصدير في الأردن منذ 1998.'
  },
  marquee: {
    en: ['Olive oil', 'Milk powder', "Ka'ak & sweets", 'Chocolate', 'White cheese', 'Coffee', 'Tea', 'Edible oils', 'Gift tins'],
    ar: ['زيت الزيتون', 'حليب البودرة', 'كعك وحلويات', 'شوكولاتة', 'جبنة بيضاء', 'قهوة', 'شاي', 'زيوت', 'علب هدايا']
  },
  finish: {
    gloss: { en: 'Special gloss — alone or combined with matte — for bright, lively visuals on the metal.', ar: 'لمعة خاصة — منفردة أو مع المطفي — لمظهر مشرق ونابض بالحياة على المعدن.' },
    matte: { en: 'A low-glare surface that gives colours a calmer, deeper look.', ar: 'سطح قليل الانعكاس يمنح الألوان مظهراً أهدأ وأعمق.' },
    soft: { en: 'A silky coating over the whole pack that invites touch.', ar: 'طلاء حريري على العبوة كلها يدعو إلى لمسها.' },
    rough: { en: 'A textured coating that stimulates the senses and gives the pack a distinctive look.', ar: 'طلاء بملمس خشن يحفّز الحواس ويمنح العبوة طابعاً مميزاً.' },
    emboss: { en: 'Raised and recessed effects on lid and body that add movement and make the design stand out.', ar: 'تأثيرات بارزة وغائرة على الغطاء والجسم تضيف حركة وتُبرز التصميم.' }
  },
  shapes: {
    round: { n: { en: 'Round tin', ar: 'علبة دائرية' }, d: { en: 'Ø 73–265 mm · H 34–210 mm', ar: 'قطر 73–265 مم · ارتفاع 34–210 مم' }, p: { en: 'Six standard diameters, in many heights.', ar: 'ستة أقطار قياسية، بارتفاعات متعددة.' } },
    square: { n: { en: 'Square tin', ar: 'علبة مربعة' }, d: { en: '120–240 mm sides · H 40–100 mm', ar: 'ضلع 120–240 مم · ارتفاع 40–100 مم' }, p: { en: 'Five standard sizes, from about 100 g to 1 kg.', ar: 'خمسة مقاسات قياسية، من نحو 100 غ إلى 1 كغ.' } },
    rect: { n: { en: 'Rectangular tin', ar: 'علبة مستطيلة' }, d: { en: 'Sizes on request', ar: 'المقاسات عند الطلب' }, p: { en: 'Made to your specification.', ar: 'تُصنَّع وفق مواصفاتك.' } },
    oval: { n: { en: 'Oval tin', ar: 'علبة بيضاوية' }, d: { en: 'Ø 300 mm · H 40–100 mm', ar: 'قطر 300 مم · ارتفاع 40–100 مم' }, p: { en: 'A special-mold shape for presentation packs.', ar: 'شكل بقالب خاص لعلب التقديم.' } },
    oil: { n: { en: 'Oil tin (illustrative)', ar: 'تنكة زيت (توضيحية)' }, d: { en: '1 · 4 · 8 · 16 L/kg', ar: '1 · 4 · 8 · 16 لتر/كغ' }, p: { en: 'Olive-oil tins, made in all four sizes for the pressing season.', ar: 'تنكات زيت الزيتون، تُنتَج بالأحجام الأربعة لموسم العصر.' } }
  },
  season: {
    olive: { en: 'Olive-oil tins in 1, 4, 8 and 16 L/kg, ready before the pressing season.', ar: 'تنكات زيت الزيتون بسعات 1 و4 و8 و16 لتر/كغ، جاهزة قبل موسم العصر.' },
    eid: { en: "Gift tins for sweets, ka'ak and chocolate — embossed, soft-touch and unmistakably festive.", ar: 'علب هدايا للحلويات والكعك والشوكولاتة — بنقش بارز وملمس ناعم وطابع احتفالي لا يُخطئ.' },
    cheese: { en: 'Tins for the spring white-cheese season.', ar: 'علب لموسم الجبنة البيضاء في الربيع.' }
  },
  cursor: { en: 'Drag', ar: 'اسحب' }
};
