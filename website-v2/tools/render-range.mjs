#!/usr/bin/env node
// Renders the Products page pictures from tools/render-range.html (folder served on http://localhost:8803).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const OUT = process.argv[3] || '/tmp/range';
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const s of (process.argv[2] || 'food-cans,fancy').split(',')) {
  const p = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://localhost:8803/tools/render-range.html?scene=${s}&turn=-1`, { waitUntil: 'commit' });
  await p.waitForSelector('body[data-ready]', { timeout: 180000 });
  await p.locator('#c').screenshot({ path: `${OUT}/${s}.png`, omitBackground: true, timeout: 120000 });
  await p.close(); console.log('rendered', s);
}
await b.close();
