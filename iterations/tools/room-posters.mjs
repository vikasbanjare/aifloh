// Render the film's two still frames (opening clock close-up, closing wide shot) for public/media/film.
import { chromium } from 'playwright-core';
const out = process.argv[2] || 'public/media/film';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
for (const [name, q, w, h] of [['room-start', 0, 1600, 900], ['room-end', 1, 1600, 900], ['room-start-tall', 0, 900, 1600], ['room-end-tall', 1, 900, 1600]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto('http://localhost:4331/');
  await p.evaluate(() => {
    document.documentElement.classList.remove('booting');
    document.querySelectorAll('.hud,.caps,.subs,.status,.site-header,.boot').forEach((e) => (e.style.display = 'none'));
    document.querySelector('.film-stage').classList.add('no-vignette');
  });
  await p.mouse.move(5, 5);
  await p.waitForSelector('.film-stage.is-3d', { timeout: 30000 });
  const r = await p.evaluate(() => { const f = document.querySelector('.film'); return { top: f.offsetTop, run: f.offsetHeight - innerHeight }; });
  await p.evaluate((y) => scrollTo(0, y), r.top + r.run * q);
  await p.waitForTimeout(5000);
  await p.locator('.film-stage').screenshot({ path: `${out}/${name}.png` });
  await p.close();
}
await b.close();
