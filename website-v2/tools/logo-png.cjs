// Renders the final vector logo (brand/logo) to the PNGs the 3D scenes draw from, recoloured only (shapes untouched):
//   assets/img/brand/jc-logo-h-navy.png, jc-logo-h-white.png, jc-logo-v-white.png (cartons, container, ship)
//   and, with an output folder argument, jc-v.png: the vertical logo as a white mask for tools/jc-tin.py.
// Run from website-v2: node tools/logo-png.cjs [mask-dir]   (needs Playwright's Chromium)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const LOGO = path.join(__dirname, '../../brand/logo/'), OUT = path.join(__dirname, '../assets/img/brand/');
(async () => {
  const b = await chromium.launch();
  const jobs = [['logo-horizontal.svg', 1400, '#002F6C', OUT + 'jc-logo-h-navy.png'], ['logo-horizontal.svg', 1400, '#ffffff', OUT + 'jc-logo-h-white.png'], ['logo-vertical.svg', 900, '#ffffff', OUT + 'jc-logo-v-white.png']];
  if (process.argv[2]) jobs.push(['logo-vertical.svg', 1600, '#ffffff', path.join(process.argv[2], 'jc-v.png')]);
  for (const [f, W, col, out] of jobs) {
    let svg = fs.readFileSync(LOGO + f, 'utf8').replace(/fill:\s*#17365b/g, 'fill: ' + col);
    const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number), H = Math.round((W * vb[3]) / vb[2]);
    svg = svg.replace('<svg ', `<svg width="${W}" height="${H}" `);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
  }
  await b.close();
})();
