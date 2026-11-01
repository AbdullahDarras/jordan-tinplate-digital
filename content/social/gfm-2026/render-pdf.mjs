// Exports the adopted ticket (the .pass frame of src/gfm2026-ideas.html) as a one-page vector PDF: node content/social/gfm-2026/render-pdf.mjs (run from this folder)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.goto('file://' + process.cwd() + '/src/gfm2026-ideas.html?stand=CC1-190', { waitUntil: 'networkidle' });
await p.addStyleTag({ content: 'html,body{margin:0;padding:0;background:#002F6C} body{display:block} .frame{display:none} .frame.pass{display:block;page-break-after:avoid}' });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
await p.pdf({ path: 'media/gfm2026-ticket-invitation.pdf', width: '1080px', height: '1350px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: '1' });
await b.close();
