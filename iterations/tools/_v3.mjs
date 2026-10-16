import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('console', m => console.log('console:', m.text()));
await p.goto('http://localhost:4331/');
await p.mouse.move(5,5); await p.waitForSelector('.film-stage.is-video');
console.log(await p.evaluate(async () => { const v = document.querySelector('.film-video'); v.currentTime = 5; await new Promise(r => setTimeout(r, 1500)); return [v.currentTime, v.seekable.length && v.seekable.end(0), v.buffered.length && v.buffered.end(0)].join(' '); }));
await b.close();
