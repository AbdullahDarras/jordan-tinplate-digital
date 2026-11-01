// The Products page drawings: each family's sizes drawn to scale (one scale per drawing), with dimension lines, in the style
// of a technical drawing. Sizes from the factory's 2022 catalogue. plan(id, lang) returns an inline SVG.
const NUM = "font-family:'Bricolage Grotesque',sans-serif;font-weight:700";
const LAB = (l) => (l === 'ar' ? "font-family:'Readex Pro',sans-serif;font-weight:500" : "font-family:'DM Sans',sans-serif;font-weight:500");
const r1 = (v) => Math.round(v * 10) / 10;
const txt = (x, y, s, { size = 13, cls = 'n', anchor = 'middle', l = 'en', rot = 0 } = {}) => {
  if (l === 'ar' && cls !== 'n' && anchor === 'start') x = 640 - x;   // Arabic captions sit at the right (in RTL text, start is the right edge)
  return `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${anchor}" class="${cls}" style="${cls === 'n' ? NUM : LAB(l)};font-size:${size}px"${l === 'ar' && cls !== 'n' ? ' direction="rtl"' : ' direction="ltr"'}${rot ? ` transform="rotate(${rot} ${r1(x)} ${r1(y)})"` : ''}>${s}</text>`;
};
// a dimension line with end ticks: horizontal (y fixed) or vertical (x fixed)
const dimH = (x1, x2, y, label, l) => `<g class="dim"><line x1="${r1(x1)}" y1="${r1(y)}" x2="${r1(x2)}" y2="${r1(y)}"/><line x1="${r1(x1)}" y1="${r1(y - 5)}" x2="${r1(x1)}" y2="${r1(y + 5)}"/><line x1="${r1(x2)}" y1="${r1(y - 5)}" x2="${r1(x2)}" y2="${r1(y + 5)}"/></g>${txt((x1 + x2) / 2, y - 8, label, { size: 13, l })}`;
const dimV = (x, y1, y2, label, l, side = 1) => `<g class="dim"><line x1="${r1(x)}" y1="${r1(y1)}" x2="${r1(x)}" y2="${r1(y2)}"/><line x1="${r1(x - 5)}" y1="${r1(y1)}" x2="${r1(x + 5)}" y2="${r1(y1)}"/><line x1="${r1(x - 5)}" y1="${r1(y2)}" x2="${r1(x + 5)}" y2="${r1(y2)}"/></g>${txt(x + side * 12, (y1 + y2) / 2, label, { size: 13, l, rot: -90 })}`;
const svg = (body, l, title) => `<svg viewBox="0 0 640 480" role="img" aria-label="${title}" direction="ltr" xmlns="http://www.w3.org/2000/svg">
<defs><pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" class="grid"/></pattern></defs>
<rect width="640" height="480" fill="url(#g)"/>${body}</svg>`;
const T = (v, l) => (typeof v === 'object' ? v[l] : v);

function foodCans(l) {
  // diameters with a typical height each (mm); the heights run 52-240 mm across the range
  const C = [[73, 105], [84, 118], [99, 122], [127, 145], [153, 178], [189, 220], [215, 240]];
  const s = 0.53, gap = 17, base = 372; let x = (640 - (C.reduce((a, [d]) => a + d * s, 0) + gap * (C.length - 1))) / 2; let out = '';
  C.forEach(([d, h], i) => {
    const w = d * s, H = h * s, ry = Math.max(3, w * 0.13), cx = x + w / 2;
    out += `<path class="body" d="M${r1(x)} ${r1(base - H)} V${r1(base)} A${r1(w / 2)} ${r1(ry)} 0 0 0 ${r1(x + w)} ${r1(base)} V${r1(base - H)}"/>`;
    out += `<ellipse class="top" cx="${r1(cx)}" cy="${r1(base - H)}" rx="${r1(w / 2)}" ry="${r1(ry)}"/>`;
    [0.3, 0.45, 0.6, 0.75].forEach((f) => { out += `<path class="bead" d="M${r1(x)} ${r1(base - H * f)} A${r1(w / 2)} ${r1(ry)} 0 0 0 ${r1(x + w)} ${r1(base - H * f)}"/>`; });
    out += txt(cx, base + ry + 22, d, { size: 14 });
    x += w + gap;
  });
  const xl = 640 - 34;
  out += dimV(xl, base, base - 240 * s, '52–240 mm', l, 1);
  out += txt(36, 70, T({ en: 'Diameter Ø (mm)', ar: 'القطر Ø (ملم)' }, l), { size: 13, cls: 'l', anchor: 'start', l });
  out += txt(36, 92, T({ en: 'Capacity 180 g – 5 kg', ar: 'السعة 180 غم – 5 كغم' }, l), { size: 13, cls: 'l', anchor: 'start', l });
  return svg(out, l, T({ en: 'Food can diameters to scale', ar: 'أقطار العبوات الغذائية بمقياس رسم' }, l));
}
function fancy(l) {
  const s = 0.62, cy = 250; let out = '';
  // round: Ø265 outer, Ø99 inner (the range)
  const rx = 30 + 265 * s / 2;
  out += `<circle class="body" cx="${r1(rx)}" cy="${cy}" r="${r1(265 * s / 2)}"/><circle class="alt" cx="${r1(rx)}" cy="${cy}" r="${r1(99 * s / 2)}"/>`;
  out += dimH(rx - 265 * s / 2, rx + 265 * s / 2, cy - 265 * s / 2 - 16, 'Ø 99–265', l);
  // square: 240 outer, 120 inner
  const sx = rx + 265 * s / 2 + 34 + 240 * s / 2;
  out += `<rect class="body" x="${r1(sx - 120 * s)}" y="${r1(cy - 120 * s)}" width="${r1(240 * s)}" height="${r1(240 * s)}" rx="6"/><rect class="alt" x="${r1(sx - 60 * s)}" y="${r1(cy - 60 * s)}" width="${r1(120 * s)}" height="${r1(120 * s)}" rx="4"/>`;
  out += dimH(sx - 120 * s, sx + 120 * s, cy - 265 * s / 2 - 16, '120–240', l);
  // rectangular: 350 x 220 outer, 190 x 110 inner, turned upright to fit
  const qx = sx + 120 * s + 30 + 220 * s / 2, W = 220 * s, H = 350 * s;
  out += `<rect class="body" x="${r1(qx - W / 2)}" y="${r1(cy - H / 2)}" width="${r1(W)}" height="${r1(H)}" rx="6"/><rect class="alt" x="${r1(qx - 55 * s)}" y="${r1(cy - 95 * s)}" width="${r1(110 * s)}" height="${r1(190 * s)}" rx="4"/>`;
  out += dimH(qx - W / 2, qx + W / 2, cy - H / 2 - 16, '11–22', l);
  out += txt(qx + W / 2 + 14, cy, '19–35 cm', { size: 13, rot: -90 });
  out += txt(rx, 440, T({ en: 'Round', ar: 'دائري' }, l), { size: 14, cls: 'l', l }) + txt(sx, 440, T({ en: 'Square', ar: 'مربع' }, l), { size: 14, cls: 'l', l }) + txt(qx, 440, T({ en: 'Rectangular', ar: 'مستطيل' }, l), { size: 14, cls: 'l', l });
  out += txt(320, 466, T({ en: 'Top view, mm · also oval, octagonal and special shapes', ar: 'منظر علوي بالملم · وأيضاً بيضاوي وثماني وأشكال خاصة' }, l), { size: 12, cls: 'l', l });
  return svg(out, l, T({ en: 'Gift tin sizes to scale', ar: 'مقاسات علب الهدايا بمقياس رسم' }, l));
}
function containers(l) {
  // front width x height (mm) and capacity
  const C = [[250, 350, '18 L'], [200, 230, '9 L'], [180, 220, '8 L'], [165, 250, '4 L'], [105, 188, '1 L']];
  const s = 0.52, gap = 22, base = 380; let x = (640 - (C.reduce((a, [w]) => a + w * s, 0) + gap * (C.length - 1))) / 2; let out = '';
  C.forEach(([w, h, cap], i) => {
    const W = w * s, H = h * s;
    out += `<rect class="body" x="${r1(x)}" y="${r1(base - H)}" width="${r1(W)}" height="${r1(H)}" rx="5"/>`;
    [0.33, 0.66].forEach((f) => { out += `<line class="bead" x1="${r1(x + 3)}" y1="${r1(base - H * f)}" x2="${r1(x + W - 3)}" y2="${r1(base - H * f)}"/>`; });
    out += `<rect class="top" x="${r1(x + W * 0.62)}" y="${r1(base - H - 8)}" width="${r1(Math.max(10, W * 0.18))}" height="8" rx="2"/>`;
    out += txt(x + W / 2, base + 24, cap, { size: 15 });
    out += txt(x + W / 2, base + 42, `${h}`, { size: 11, cls: 'n' });
    if (i === 0) out += dimH(x, x + W, base - H - 22, `${w} mm`, l);
    x += W + gap;
  });
  out += txt(36, 70, T({ en: 'Tins and gallons, front view', ar: 'التنك والجالونات، منظر أمامي' }, l), { size: 13, cls: 'l', anchor: 'start', l });
  out += txt(36, 92, T({ en: 'Height in mm under each', ar: 'الارتفاع بالملم تحت كل عبوة' }, l), { size: 13, cls: 'l', anchor: 'start', l });
  return svg(out, l, T({ en: 'Tin and gallon sizes to scale', ar: 'مقاسات التنك والجالونات بمقياس رسم' }, l));
}
function trays(l) {
  const C = [[427, 330], [380, 285], [248, 180]];
  const s = 0.5, gap = 30, cy = 230; let x = (640 - (C.reduce((a, [d]) => a + d * s, 0) + gap * 2)) / 2; let out = '';
  C.forEach(([D, d]) => {
    const R = D * s / 2, cx = x + R;
    out += `<circle class="body" cx="${r1(cx)}" cy="${cy}" r="${r1(R)}"/><circle class="alt" cx="${r1(cx)}" cy="${cy}" r="${r1(d * s / 2)}"/>`;
    out += dimH(cx - R, cx + R, cy + 427 * s / 2 + 40, `Ø ${D}`, l);
    out += txt(cx, cy + 5, `Ø ${d}`, { size: 12 });
    x += D * s + gap;
  });
  out += txt(36, 70, T({ en: 'Outer and inner diameter, mm', ar: 'القطر الخارجي والداخلي بالملم' }, l), { size: 13, cls: 'l', anchor: 'start', l });
  return svg(out, l, T({ en: 'Tray sizes to scale', ar: 'مقاسات الصواني بمقياس رسم' }, l));
}
function ends(l) {
  const N = [[{ en: 'Normal end', ar: 'غطاء عادي' }, 'normal'], [{ en: 'Easy open', ar: 'فتح سهل' }, 'eo'], [{ en: 'Penny lever', ar: 'غطاء بعتلة' }, 'lever'], [{ en: 'Peel-off', ar: 'غطاء بالسحب' }, 'peel']];
  let out = ''; const R = 58;
  N.forEach(([name, k], i) => {
    const cx = 92 + i * 152, cy = 220;
    out += `<circle class="body" cx="${cx}" cy="${cy}" r="${R}"/><circle class="bead" cx="${cx}" cy="${cy}" r="${R - 7}"/>`;
    if (k === 'normal') out += `<circle class="bead" cx="${cx}" cy="${cy}" r="${R - 20}"/><circle class="bead" cx="${cx}" cy="${cy}" r="${R - 30}"/>`;
    if (k === 'eo') out += `<circle class="alt" cx="${cx}" cy="${cy}" r="${R - 14}"/><rect class="top" x="${cx - 14}" y="${cy - 30}" width="28" height="44" rx="12"/><circle class="body" cx="${cx}" cy="${cy - 2}" r="6"/>`;
    if (k === 'lever') out += `<circle class="bead" cx="${cx}" cy="${cy}" r="${R - 22}"/><path class="top" d="M${cx + 18} ${cy - 40} q14 6 18 18 l-10 6 q-6 -10 -14 -14z"/>`;
    if (k === 'peel') out += `<circle class="alt" cx="${cx}" cy="${cy}" r="${R - 12}"/><path class="top" d="M${cx + R - 14} ${cy - 14} h18 a6 6 0 0 1 6 6 v16 a6 6 0 0 1 -6 6 h-18z"/>`;
    out += txt(cx, cy + R + 32, T(name, l), { size: 14, cls: 'l', l });
  });
  out += txt(320, 400, T({ en: 'Top views · for the can diameters we make · gold or silver lacquer', ar: 'مناظر علوية · لأقطار العلب التي ننتجها · طلاء ذهبي أو فضي' }, l), { size: 12, cls: 'l', l });
  return svg(out, l, T({ en: 'Can end types', ar: 'أنواع الأغطية' }, l));
}
const PLANS = { 'food-cans': foodCans, 'fancy-cans': fancy, 'food-containers': containers, trays, ends };
export const plan = (id, l) => (PLANS[id] ? PLANS[id](l) : '');
