#!/usr/bin/env node
// Headless-Chromium helper. Usage:
//   node tools/screenshots.mjs og-tin <baseUrl>                capture the site's 3D hero tin (transparent) to tools/og-tin.png
//   node tools/screenshots.mjs og <out.png>                    render tools/og-card.html (with the logo from brand/logo) to the 1200x630 Open Graph image
//   node tools/screenshots.mjs shots <baseUrl> <outDir> [theme] screenshot every page at 1440 and 390 px (+ console/overflow report)
// Needs the globally installed `playwright` package and a Chromium (set CHROMIUM_PATH if it is not found).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'))); }
const here = path.dirname(fileURLToPath(import.meta.url));
const exe = process.env.CHROMIUM_PATH || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium/chrome-linux/chrome'].find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox'] });
const [mode, a, b, theme] = process.argv.slice(2);

if (mode === 'og-tin') {
  // the hero tin of the home page on a transparent background (light lighting, the signature navy-and-gold tin)
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(a.replace(/\/$/, '') + '/en/?skip', { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  await page.addStyleTag({ content: 'html,body{background:transparent!important}body::before,.grain,.cursor,#curtain{display:none!important}.nav,.hero__text,.scrollcue,.marquee,main>section:not(.hero){visibility:hidden!important}.hero{background:transparent!important}' });
  const el = await page.$('.hero .stage');
  await page.evaluate(() => { window.__jt.scene.instance('hero').hold = -0.22; });
  await page.waitForTimeout(1200);
  await el.screenshot({ path: path.join(here, 'og-tin.png'), omitBackground: true });
} else if (mode === 'og') {
  const { LOGO } = await import('./logo.mjs');
  const html = fs.readFileSync(path.join(here, 'og-card.html'), 'utf8').replace('<!--LOGO-->', `<svg class="logo" viewBox="${LOGO.H.viewBox.join(' ')}"><path d="${LOGO.H.gear}"/><path d="${LOGO.H.word}${LOGO.H.arabic}"/></svg>`);
  const tmp = path.join(here, '.og-render.html');
  fs.writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: a });
  fs.rmSync(tmp);
} else if (mode === 'shots') {
  fs.mkdirSync(b, { recursive: true });
  const sm = fs.readFileSync(path.join(here, '..', 'sitemap.xml'), 'utf8');
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const report = [];
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: theme === 'dark' ? 'dark' : 'light' });
    for (const u of urls) {
      const page = await ctx.newPage();
      const errs = [];
      page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push(m.text()); });
      page.on('pageerror', (e) => errs.push(String(e)));
      await page.goto(a.replace(/\/$/, '') + u, { waitUntil: 'load' });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
      await page.waitForTimeout(500);
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, dir: document.documentElement.dir, h1: document.querySelectorAll('h1').length }));
      const name = u.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'root';
      await page.screenshot({ path: path.join(b, `${name}-${w}${theme === 'dark' ? '-dark' : ''}.png`), fullPage: true });
      report.push(`${w} ${u} scrollW=${m.sw}/${m.cw}${m.sw > m.cw ? '  OVERFLOW' : ''} dir=${m.dir} h1=${m.h1}${errs.length ? ' ERR ' + errs.join(' | ') : ''}`);
      await page.close();
    }
    await ctx.close();
  }
  console.log(report.join('\n'));
}
await browser.close();
