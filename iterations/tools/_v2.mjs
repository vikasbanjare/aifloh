import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4331/');
await p.evaluate(() => document.documentElement.classList.remove('booting'));
await p.mouse.move(5,5); await p.waitForSelector('.film-stage.is-video');
const r = await p.evaluate(() => { const f = document.querySelector('.film'); return { top: f.offsetTop, run: f.offsetHeight - innerHeight }; });
for (const q of [0.3, 0.6, 0.9]) {
  await p.evaluate((y) => scrollTo(0, y), r.top + r.run * q); await p.waitForTimeout(1500);
  console.log(q, await p.evaluate(() => { const v = document.querySelector('.film-video'); return [v.currentTime.toFixed(2), v.seeking, v.paused, v.readyState, v.currentSrc.split('/').pop()].join(' '); }));
}
await b.close();
