import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4331/');
await p.evaluate(() => document.documentElement.classList.remove('booting'));
await p.mouse.move(5, 5);
await p.waitForSelector('.film-stage.is-3d', { timeout: 30000 });
const r = await p.evaluate(() => { const f = document.querySelector('.film'); return { top: f.offsetTop, run: f.offsetHeight - innerHeight }; });
for (const q of (process.env.PTS || '0.5').split(',').map(Number)) {
  await p.evaluate((y) => scrollTo(0, y), r.top + r.run * q); await p.waitForTimeout(3500);
  await p.screenshot({ path: `/tmp/claude-0/-home-user/2435d96e-3d1a-5d1f-bc15-c750ab10b1f2/scratchpad/film/b-${q}.png` });
}
await b.close();
