#!/usr/bin/env node
// Export the 30 s reel (src/reel/reel.html) to media/04-instagram-reel/reel-1080x1920.mp4.
// Each frame is set with window.setT(t) and captured, then ffmpeg encodes H.264 at 30 fps (no audio: music is added in the Instagram app).
//   node content/social/week1/render-reel.mjs [fps=30]
// Needs the globally installed playwright package (Chromium), ffmpeg, and network access for Google Fonts.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright'))); }
const here = path.dirname(fileURLToPath(import.meta.url));
const FPS = +(process.argv[2] || 30), DUR = 30;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reel-'));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto('file://' + path.join(here, 'src', 'reel', 'reel.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const el = await page.$('#reel');
const n = FPS * DUR;
for (let i = 0; i < n; i++) {
  await page.evaluate((t) => window.setT(t), i / FPS);
  await el.screenshot({ path: path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 94 });
  if (i % 150 === 0) console.log(`frame ${i}/${n}`);
}
await browser.close();
const out = path.join(here, 'media', '04-instagram-reel', 'reel-1080x1920.mp4');
fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.jpg'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
console.log('wrote', path.relative(process.cwd(), out));
