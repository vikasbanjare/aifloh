// Viewport shots down the home page: the nav over the film, then rooms as the sun travels the margin.
import { chromium } from 'playwright-core';
const out = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4331/', { waitUntil: 'networkidle' });
await p.mouse.move(400, 400);
await p.evaluate(() => scrollTo(0, innerHeight * 1.5));
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}/nav-film.jpg`, type: 'jpeg', quality: 75 });
for (const [sel, frac, name] of [['#work', 0.1, 'work-a'], ['#work', 0.6, 'work-b'], ['#free-h', 0, 'free'], ['#built-h', 0.2, 'tools']]) {
  await p.evaluate(([s, f]) => { const el = document.querySelector(s).closest('section'); const r = el.getBoundingClientRect(); scrollTo(0, scrollY + r.top + el.offsetHeight * f - 120); }, [sel, frac]);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 75 });
}
await b.close();
