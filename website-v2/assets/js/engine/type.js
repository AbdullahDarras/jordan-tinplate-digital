// Arabic titles on the 3D title wall. Arabic letters reach much higher (ط ل ك, the shadda, the dots) and lower (ب ع ي, the
// dots below) than Latin ones, so a Latin line height makes big Arabic lines touch. Here every line is measured as drawn
// (its real highest and lowest marks), the lines are stacked with clear air between them, and the whole block is sized to fit
// the wall, never touching its edges.
export function arabicBlock(x, lines, cols, { W = 4096, H = 1600, maxW = 3800, maxH = 1150, maxSize = 620, face = '700 {s}px "Readex Pro", sans-serif' } = {}) {
  const S0 = 400;
  x.font = face.replace('{s}', S0); x.direction = 'rtl'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  if ('letterSpacing' in x) x.letterSpacing = '0px';
  const m = lines.map((l) => { const t = x.measureText(l); return { w: t.width, a: t.actualBoundingBoxAscent, d: t.actualBoundingBoxDescent }; });
  const gap = S0 * 0.14;                                     // air between the lowest mark of a line and the highest of the next
  const blockH = m.reduce((s, v) => s + v.a + v.d, 0) + gap * (lines.length - 1);
  const k = Math.min(maxW / Math.max(...m.map((v) => v.w)), maxH / blockH, maxSize / S0);
  x.font = face.replace('{s}', Math.floor(S0 * k));
  let y = (H - blockH * k) / 2;
  lines.forEach((l, i) => { y += m[i].a * k; x.fillStyle = cols[Math.min(i, cols.length - 1)]; x.fillText(l, W / 2, y); y += (m[i].d + gap) * k; });
  return S0 * k;
}
