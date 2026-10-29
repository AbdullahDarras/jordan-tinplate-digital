#!/usr/bin/env node
// Renders the card pictures (assets/img/renders/<tin>.png) with the site's own 3D engine. Needs Playwright and the folder served
// on http://localhost:8801 (python3 -m http.server 8801 in website-v2/). Then convert to webp (tools/README in the v2 README).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW || 'playwright');
const KEYS = (process.argv[2] || 'qaisi,oil,paint,nejmah,maamoul,marouf,habybee,jojo,melties,givinova,shawra,rayhan,kous,abedc,havana').split(',');
const OUT = new URL('../assets/img/renders/', import.meta.url).pathname;
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const k of KEYS) {
  const p = await b.newPage({ viewport: { width: 800, height: 640 }, deviceScaleFactor: 1 });
  await p.goto(`http://localhost:8801/tools/render.html?tin=${k}`, { waitUntil: 'commit' });
  await p.waitForSelector('body[data-ready]', { timeout: 90000 });
  await p.locator('#c').screenshot({ path: OUT + k + '.png', omitBackground: true });
  await p.close(); console.log('rendered', k);
}
await b.close();
