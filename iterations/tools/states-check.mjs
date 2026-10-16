import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4331/free/', { waitUntil: 'networkidle' });
await p.fill('#codeword', 'zzqqx'); await p.click('form.cw button[type=submit]'); await p.waitForTimeout(300);
console.log('codeword no-match:', await p.textContent('.cw-msg'));
await p.fill('#codeword', 'deks'); await p.click('form.cw button[type=submit]'); await p.waitForTimeout(300);
console.log('codeword near:', await p.textContent('.cw-msg'));
// find a filter pair with no matches
const intents = await p.$$eval('#f-intent option', (o) => o.map((x) => x.value).filter(Boolean));
const tools = await p.$$eval('#f-tool option', (o) => o.map((x) => x.value).filter(Boolean));
let found = false;
for (const i of intents) { for (const t of tools) {
  await p.selectOption('#f-intent', i); await p.selectOption('#f-tool', t); await p.waitForTimeout(50);
  if (await p.isVisible('.filter-empty')) { console.log('filter empty:', i, '+', t, '→', (await p.textContent('.filter-empty')).trim(), '|', await p.textContent('.filter-count'));
    await p.click('.filter-reset'); await p.waitForTimeout(100); console.log('after reset:', await p.textContent('.filter-count'), 'empty visible:', await p.isVisible('.filter-empty')); found = true; break; } }
  if (found) break; }
if (!found) console.log('no empty filter combination exists');
await p.goto('http://localhost:4331/library/', { waitUntil: 'networkidle' });
await p.fill('input[type=search], #q', 'xylophone'); await p.waitForTimeout(800);
console.log('library:', await p.evaluate(() => document.querySelector('[role=status], .count, .s-count')?.textContent));
await b.close();
