// Render the home film at several playhead positions. Usage: node iterations/tools/film-frames.mjs OUTDIR [width height]
import { chromium } from 'playwright-core';
const [out, W = '1440', H = '900'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +W, height: +H } });
const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(String(e)));
await p.goto('http://localhost:4331/');
await p.evaluate(() => document.documentElement.classList.remove('booting'));
await p.mouse.move(10, 10);
await p.waitForSelector('.film-stage.is-3d, .film-stage.is-video', { timeout: 20000 }).catch(() => errs.push('no 3d'));
const run = await p.evaluate(() => { const f = document.querySelector('.film'); return { top: f.offsetTop, run: f.offsetHeight - innerHeight }; });
for (const q of (process.env.PTS || '0,0.22,0.45,0.66,0.95').split(',').map(Number)) {
  await p.evaluate((y) => scrollTo(0, y), run.top + run.run * q);
  await p.waitForTimeout(+(process.env.WAIT || 900));
  await p.screenshot({ path: `${out}/film-${W}-${String(Math.round(q * 100)).padStart(3, '0')}.png` });
}
console.log(errs.length ? errs.join('\n') : 'clean');
await b.close();
