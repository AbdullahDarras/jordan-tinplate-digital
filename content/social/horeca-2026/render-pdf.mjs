// Exports the adopted ticket card alone (the .card inside the .pass frame of src/horeca2026.html) as a one-page vector PDF,
// sized to the card, white background, nothing else on the page: the file sent to clients.
//   node content/social/horeca-2026/render-pdf.mjs   (writes media/horeca2026-ticket-invitation.pdf)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1400 } });
await p.goto('file://' + path.join(here, 'src', 'horeca2026.html') + '?stand=' + (process.env.STAND || '—') + '', { waitUntil: 'networkidle' });
await p.addStyleTag({ content: `
  html, body { margin: 0; padding: 0; background: #fff; }
  body > *:not(.frame.pass) { display: none !important; }
  .frame.pass { position: static !important; width: 936px !important; height: auto !important; background: none !important; overflow: visible !important; }
  .frame.pass > *:not(.card) { display: none !important; }
  .frame.pass .card { position: static !important; left: auto !important; right: auto !important; width: 936px; box-shadow: none !important; }
  .frame.pass .tear::before, .frame.pass .tear::after { background: #fff !important; box-shadow: inset 0 0 0 3px #c9d3e0 !important; }
` });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
const h = await p.evaluate(() => Math.ceil(document.querySelector('.frame.pass .card').getBoundingClientRect().height));
await p.pdf({ path: path.join(here, 'media', 'horeca2026-ticket-invitation.pdf'), width: '936px', height: h + 'px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
console.log('wrote media/horeca2026-ticket-invitation.pdf', 936, 'x', h);
await b.close();
