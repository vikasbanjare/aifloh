// Screenshots for one iteration: home (full page) at 375 / 768 / 1440, plus /free at 375.
// usage: node iterations/tools/shoot.mjs NN   (serves nothing; expects the build on http://localhost:4331)
import { chromium } from '../../node_modules/playwright-core/index.mjs';
import { mkdirSync } from 'node:fs';
const nn = process.argv[2];
const out = `iterations/screens/iter-${nn}`;
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errors = [];
const jobs = [['/', 375], ['/', 768], ['/', 1440], ['/free/', 375]];
for (const [path, w] of jobs) {
  const pg = await b.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  pg.on('pageerror', (e) => errors.push(`${path}@${w}: ${e.message}`));
  pg.on('console', (m) => { if (m.type() === 'error' || /Content Security Policy/.test(m.text())) errors.push(`${path}@${w}: ${m.text().slice(0, 140)}`); });
  await pg.goto('http://localhost:4331' + path, { waitUntil: 'networkidle' });
  await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
  await pg.waitForTimeout(400);
  const sw = await pg.evaluate(() => document.documentElement.scrollWidth);
  if (sw > w) errors.push(`${path}@${w}: horizontal overflow ${sw}px`);
  const name = `${out}/${path === '/' ? 'home' : path.replace(/\//g, '')}-${w}.jpg`;
  await pg.screenshot({ path: name, fullPage: true, type: 'jpeg', quality: 55 });
  await pg.close();
}
await b.close();
console.log(errors.length ? 'ISSUES:\n' + errors.join('\n') : 'clean: no console errors, no overflow');
