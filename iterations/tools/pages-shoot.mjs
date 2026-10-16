import { chromium } from 'playwright-core';
const out = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [w, hgt] of [[1440, 900], [375, 812]]) {
  const p = await b.newPage({ viewport: { width: w, height: hgt } });
  for (const path of ['/about/', '/work/', '/tools/', '/contact/']) {
    await p.goto('http://localhost:4331' + path, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(500);
    const name = path.replace(/\//g, '') || 'home';
    await p.screenshot({ path: `${out}/${name}-${w}.jpg`, fullPage: true, quality: 70, type: 'jpeg' });
  }
  await p.close();
}
await b.close();
