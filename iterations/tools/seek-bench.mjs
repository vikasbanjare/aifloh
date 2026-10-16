import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
await p.goto('http://localhost:4340/index.html');
for (const f of ['before.webm', 'after.webm']) {
  const r = await p.evaluate(async (src) => {
    const v = document.getElementById('v'); v.src = src;
    await new Promise((res) => v.addEventListener('loadeddata', res, { once: true }));
    // make sure the whole file is buffered so we time decoding, not the network
    await new Promise((res) => { const c = () => (v.buffered.length && v.buffered.end(0) >= v.duration - 0.05 ? res() : setTimeout(c, 100)); c(); });
    const times = []; let t = 0.5;
    for (let i = 0; i < 80; i++) {
      t = (t + 0.37 + Math.random() * 0.2) % (v.duration - 0.1); // small forward steps, like scrolling
      const s = performance.now(); v.currentTime = t;
      await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
      times.push(performance.now() - s);
    }
    times.sort((a, b) => a - b);
    return { median: times[40].toFixed(1), p90: times[72].toFixed(1), max: times[79].toFixed(1) };
  }, f);
  console.log(f, JSON.stringify(r));
}
await b.close();
