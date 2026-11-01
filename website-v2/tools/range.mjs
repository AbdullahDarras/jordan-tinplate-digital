// The product range on the Products page (owner, 2026-11-02): five families, the basics only, from the factory's catalogue
// (catalogue 2022, pages 6-57: codes, diameters, heights and capacities). img: assets/img/range/<key>.webp
const t = (en, ar) => ({ en, ar });
export const RANGE5 = {
  eyebrow: t('Products', 'المنتجات'),
  title: t('The full range', 'المجموعة كاملة'),
  lead: t('Five families of tinplate packaging, each in many sizes and shapes. Custom sizes and shapes on request.', 'خمس عائلات من عبوات الصفيح، لكل منها مقاسات وأشكال كثيرة. والمقاسات والأشكال الخاصة متاحة عند الطلب.'),
  items: [
    { id: 'fancy-cans', img: 'fancy', h: t('Fancy cans', 'علب الهدايا والحلويات'),
      p: t('Printed gift tins for sweets, ka’ak, chocolate, dates and coffee: flat, embossed or windowed lids, plain or beaded bodies.', 'علب هدايا مطبوعة للحلويات والكعك والشوكولاتة والتمور والقهوة: أغطية مسطحة أو بنقش بارز أو بنافذة، وأبدان ملساء أو بفرزات.'),
      specs: [
        [t('Round', 'دائري'), t('Ø 99 – 265 mm', 'قطر 99 – 265 ملم')],
        [t('Square', 'مربع'), t('120 × 120 – 240 × 240 mm', '120 × 120 – 240 × 240 ملم')],
        [t('Rectangular', 'مستطيل'), t('19 × 11 – 35 × 22 cm', '19 × 11 – 35 × 22 سم')],
        [t('Also', 'وأيضاً'), t('Oval, octagonal and special shapes', 'بيضاوي وثماني وأشكال خاصة')]
      ] },
    { id: 'food-cans', img: 'food-cans', h: t('Food cans', 'العبوات الغذائية'),
      p: t('Three-piece food cans for milk powder, tomato paste, beans, meat and cheese, with the end that suits the product.', 'علب غذائية من ثلاث قطع لحليب البودرة ومعجون الطماطم والفول واللحوم والأجبان، مع الغطاء الذي يناسب المنتج.'),
      specs: [
        [t('Diameters', 'الأقطار'), t('73, 84, 99, 127, 153, 189 and 215 mm', '73 و84 و99 و127 و153 و189 و215 ملم')],
        [t('Heights', 'الارتفاع'), t('52 – 240 mm', '52 – 240 ملم')],
        [t('Capacity', 'السعة'), t('180 g – 5 kg', '180 غم – 5 كغم')],
        [t('Body', 'البدن'), t('Plain or beaded', 'مسطح أو بفرزات')]
      ] },
    { id: 'food-containers', img: 'containers', h: t('Food containers', 'الحاويات الغذائية'),
      p: t('Square tins and gallons for olive oil, ghee and white cheese, and tall containers for coffee, tea and spices.', 'تنك وجالونات لزيت الزيتون والسمن والجبنة البيضاء، وعبوات طويلة للقهوة والشاي والبهارات.'),
      specs: [
        [t('Tins', 'التنك'), t('8 L, 9 L and 18 L (7 – 16 kg)', '8 و9 و18 لتراً (7 – 16 كغم)')],
        [t('Gallons', 'الجالونات'), t('1, 2, 3 and 4 L', '1 و2 و3 و4 لتر')],
        [t('Openings', 'الفتحات'), t('Several neck sizes', 'أحجام فتحات مختلفة')]
      ] },
    { id: 'trays', img: 'trays', h: t('Trays', 'الصواني'),
      p: t('Round printed trays for knafeh, mansaf and sweets, with a flat face or an embossed rim.', 'صواني دائرية مطبوعة للكنافة والمنسف والحلويات، بسطح مستوٍ أو بحواف بفرزات.'),
      specs: [
        [t('Large', 'كبيرة'), t('Ø 427 mm (inside 330 mm)', 'قطر 427 ملم (الداخلي 330 ملم)')],
        [t('Medium', 'وسط'), t('Ø 380 mm (inside 285 mm)', 'قطر 380 ملم (الداخلي 285 ملم)')],
        [t('Small', 'صغيرة'), t('Ø 248 mm (inside 180 mm)', 'قطر 248 ملم (الداخلي 180 ملم)')]
      ] },
    { id: 'ends', img: 'ends', h: t('Easy open ends & lids', 'الأغطية وأغطية الفتح السهل'),
      p: t('The ends that close our cans, made on our own lines for the can diameters we make.', 'الأغطية التي تُغلق علبنا، تُصنع على خطوطنا لأقطار العلب التي ننتجها.'),
      specs: [
        [t('Types', 'الأنواع'), t('Normal end, easy open, penny lever, peel-off', 'غطاء عادي، فتح سهل، غطاء بعتلة، غطاء بالسحب (Peel-off)')],
        [t('Finish', 'اللون'), t('Gold or silver lacquer', 'طلاء ذهبي أو فضي')]
      ] }
  ]
};
