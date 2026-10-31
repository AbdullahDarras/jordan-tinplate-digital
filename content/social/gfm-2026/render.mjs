#!/usr/bin/env node
// GFM 2026 invitation. Set the stand number with STAND=..., default CC1-190, e.g. STAND="CC1-190" node content/social/gfm-2026/render.mjs
// Export every .frame in src/*.html to media/<data-name>.png at its exact pixel size.
//   node content/social/gfm-2026/render.mjs            all frames
//   node content/social/gfm-2026/render.mjs slide-2    only frames whose name contains "slide-2"
// Needs the globally installed playwright package (Chromium) and network access for Google Fonts.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'))); }
const here = path.dirname(fileURLToPath(import.meta.url));
const only = process.argv[2] || '';
const GUIDES = !!process.env.GUIDES;            // GUIDES=1 OUT=<dir>: QA render with the safe box drawn
const OUTDIR = process.env.OUT || path.join(here, 'media');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2400, height: 2000 }, deviceScaleFactor: 1 });
for (const file of fs.readdirSync(path.join(here, 'src')).filter((f) => f.endsWith('.html'))) {
  await page.goto('file://' + path.join(here, 'src', file) + '?stand=' + encodeURIComponent(process.env.STAND || 'CC1-190') + (GUIDES ? '&guides' : ''), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  for (const el of await page.$$('.frame')) {
    const name = await el.getAttribute('data-name');
    if (only && !name.includes(only)) continue;
    const out = path.join(OUTDIR, name + '.png');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await el.screenshot({ path: out });
    console.log('wrote', path.relative(process.cwd(), out));
  }
}
await browser.close();
