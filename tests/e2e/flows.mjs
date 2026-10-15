// Browser flows from SITE-BUILD.md Sections 8 and 13. Serve a build, then:
//   E2E_URL=http://localhost:4321/aifloh CHROME_PATH=/path/to/chrome npm run e2e
// Exits non-zero if any check fails.
import { chromium } from 'playwright-core';
const B = (process.env.E2E_URL || 'http://localhost:4321').replace(/\/$/, '');
const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
let failed = 0;
const ok = (n, c) => { if (!c) failed++; console.log(`${c ? 'PASS' : 'FAIL'} ${n}`); };
let ctx = await b.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
let p = await ctx.newPage();
const errs = []; p.on('pageerror', (e) => errs.push(String(e)));

// 1. code word keeps query string
await p.goto(`${B}/hooks/?utm_source=instagram&utm_medium=post&utm_campaign=viral-hooks&fbclid=abc`);
await p.waitForURL(/free\/viral-hooks/);
const u = new URL(p.url());
ok('code word lands on resource', u.pathname.endsWith('/free/viral-hooks/'));
ok('utm kept through redirect', u.searchParams.get('utm_source') === 'instagram');
ok('fbclid stripped before analytics', !u.searchParams.has('fbclid'));
// 2. vanity utms when none
await p.goto(`${B}/hooks/`); await p.waitForURL(/free\/viral-hooks/);
ok('vanity UTMs added', new URL(p.url()).searchParams.get('utm_source') === 'vanity');
// 3. copy
await p.click('.copy-btn');
const clip = await p.evaluate(() => navigator.clipboard.readText());
ok('copy puts skill text on clipboard', clip.includes('name: viral-hooks'));
ok('after-copy source chips appear', await p.isVisible('.after-copy'));
// 4. wrong word suggestions
await p.goto(`${B}/free/`);
await p.fill('#codeword', 'hoks'); await p.press('#codeword', 'Enter');
await p.waitForTimeout(200);
ok('wrong word suggests close match', (await p.textContent('.cw-msg')).includes('hooks'));
// 5. 404 suggestion
await p.goto(`${B}/hookz/`);
await p.waitForTimeout(300);
// 6. stale stamp
await p.goto(`${B}/free/desk-flatlay/`);
ok('stale stamp shows after 90 days', await p.isVisible('.stamp[data-stale] .stamp-stale'));
// 7. filter
await p.goto(`${B}/free/`);
await p.selectOption('#f-intent', 'make a reel');
const visible = await p.$$eval('.ledger > .row', (rows) => rows.filter((r) => !r.hidden).length);
ok(`filter sentence narrows list (${visible} rows)`, visible === 2);
// 8. keyboard: rows are focusable summaries
await p.goto(`${B}/free/`);
await p.focus('.ledger summary'); await p.keyboard.press('Enter');
ok('row opens with keyboard', await p.$eval('.ledger details', (d) => d.open));
// 9. library search
await p.goto(`${B}/library/`);
await p.fill('#q', 'thumbnail'); await p.waitForTimeout(400);
const n = await p.$$eval('.lib li', (l) => l.length);
ok(`library search works (${n} hits)`, n > 0 && n < 30);
ok('no storage used', (await p.evaluate(() => Object.keys(localStorage).length + Object.keys(sessionStorage).length)) === 0);
ok('no cookies', (await ctx.cookies()).length === 0);
ok('no page errors', errs.length === 0);
await ctx.close();

// 10. in-app modes
for (const [app, ua] of [['instagram', 'Mozilla/5.0 (iPhone) Instagram 300.0'], ['linkedin', 'Mozilla/5.0 (iPhone) LinkedInApp'], ['facebook', 'Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/400.0]'], ['x', 'Mozilla/5.0 (iPhone) Twitter for iPhone']]) {
  ctx = await b.newContext({ userAgent: ua, viewport: { width: 390, height: 844 } });
  p = await ctx.newPage();
  await p.goto(`${B}/free/viral-hooks/`);
  const banner = await p.isVisible('.inapp');
  const dl = await p.isVisible('.dl-btn');
  ok(`in-app ${app}: banner shown, download hidden`, banner && !dl);
  await ctx.close();
}
// 11. no JS: content readable
ctx = await b.newContext({ javaScriptEnabled: false });
p = await ctx.newPage();
await p.goto(`${B}/free/`);
const rows = await p.$$eval('.ledger > .row', (r) => r.filter((x) => !x.hidden).length);
ok(`free works without JS (${rows} rows visible)`, rows === 17);
await p.goto(`${B}/`);
ok('home works without JS', (await p.textContent('h1')).replace(/\s+/g, ' ').toLowerCase().includes('keep the craft'));
await b.close();
if (failed) process.exit(1);
