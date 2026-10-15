// "Finish my line": the visitor draws the hand half of Fig. 1, the machine finishes it.
// Pointer-down drawing only (the cursor itself is untouched). Keyboard users get "Draw for me".
// Nothing is stored or sent; the drawing lives in memory until the page reloads.
const NS = 'http://www.w3.org/2000/svg';
const W = 1200, H = 380, GRID = 40;

type Pt = { x: number; y: number };

function smooth(points: Pt[]): string {
  if (points.length < 2) return '';
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mx = (points[i].x + points[i + 1].x) / 2;
    const my = (points[i].y + points[i + 1].y) / 2;
    d += ` Q${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  const last = points[points.length - 1];
  return d + ` L${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
}

/** The machine's answer: from the last point, right angles only, every corner on the grid, to the right edge. */
function machine(from: Pt, seed: number): Pt[] {
  let s = seed % 2147483647 || 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const snap = (v: number) => Math.round(v / GRID) * GRID;
  const pts: Pt[] = [from];
  let x = Math.min(W - GRID, snap(from.x + GRID / 2));
  let y = Math.max(GRID, Math.min(H - GRID, snap(from.y)));
  pts.push({ x, y: from.y }, { x, y });
  while (x < W - GRID * 1.5) {
    let ny = y;
    while (ny === y) ny = GRID * (1 + Math.floor(rnd() * ((H - 2 * GRID) / GRID + 1)));
    pts.push({ x, y: ny });
    y = ny;
    x = Math.min(W - GRID, x + GRID * (2 + Math.floor(rnd() * 2)));
    pts.push({ x, y });
  }
  return pts;
}

/** A believable hand line for keyboard users: a wobble with one loop. */
function handFor(seed: number): Pt[] {
  let s = seed || 11;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pts: Pt[] = [];
  const amp = 50 + rnd() * 40, loopAt = 0.3 + rnd() * 0.3;
  for (let i = 0; i <= 120; i++) {
    const t = i / 120;
    let x = 30 + t * 560, y = 210 + Math.sin(t * Math.PI * (3 + rnd() * 0.02)) * amp * (1 - t * 0.4);
    const k = (t - loopAt) * 18;
    if (Math.abs(k) < Math.PI) { x -= Math.sin(k) * 34; y += (1 + Math.cos(k)) * 22; }
    pts.push({ x, y });
  }
  return pts;
}

export function startDrawing(fig: HTMLElement, svg: SVGSVGElement, ui: { status: HTMLElement; auto: HTMLButtonElement }): () => void {
  fig.classList.add('is-drawing');
  const layer = document.createElementNS(NS, 'g');
  layer.setAttribute('class', 'draw-layer');
  svg.appendChild(layer);
  const hit = document.createElementNS(NS, 'rect');
  hit.setAttribute('class', 'draw-hit');
  hit.setAttribute('x', '0'); hit.setAttribute('y', '0'); hit.setAttribute('width', String(W)); hit.setAttribute('height', String(H));
  svg.appendChild(hit);

  let pts: Pt[] = [];
  let hand: SVGPathElement | null = null;
  let drawing = false;

  const toSvg = (e: PointerEvent): Pt => {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: Math.max(0, Math.min(W, p.x)), y: Math.max(0, Math.min(H, p.y)) };
  };
  const clear = () => { layer.replaceChildren(); pts = []; hand = null; };

  const finish = () => {
    if (pts.length < 6) { clear(); ui.status.textContent = 'A little longer. Draw a line, then let go.'; return; }
    const end = pts[pts.length - 1];
    const route = machine(end, pts.length * 7919 + Math.round(end.x * 31 + end.y));
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('class', 'draw-machine');
    path.setAttribute('pathLength', '1');
    path.setAttribute('d', 'M' + route.map((p) => `${p.x} ${p.y}`).join(' L'));
    layer.appendChild(path);
    route.slice(2).forEach((p, i) => {
      if (i % 2) return; // one node per corner pair keeps it calm
      const r = document.createElementNS(NS, 'rect');
      r.setAttribute('class', 'draw-node');
      r.setAttribute('x', String(p.x - 5)); r.setAttribute('y', String(p.y - 5)); r.setAttribute('width', '10'); r.setAttribute('height', '10');
      r.style.animationDelay = `${120 + i * 45}ms`; // CSSOM, allowed by the CSP
      layer.appendChild(r);
    });
    ui.status.textContent = 'The machine finished your line. Draw again to start over.';
  };

  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    clear();
    drawing = true;
    hit.setPointerCapture(e.pointerId);
    hand = document.createElementNS(NS, 'path');
    hand.setAttribute('class', 'draw-hand');
    layer.appendChild(hand);
    pts.push(toSvg(e));
  };
  const move = (e: PointerEvent) => {
    if (!drawing || !hand) return;
    const p = toSvg(e);
    const l = pts[pts.length - 1];
    if (Math.hypot(p.x - l.x, p.y - l.y) < 4) return;
    pts.push(p);
    hand.setAttribute('d', smooth(pts));
  };
  const up = () => { if (!drawing) return; drawing = false; finish(); };

  const auto = () => {
    clear();
    pts = handFor(Date.now() % 100000);
    hand = document.createElementNS(NS, 'path');
    hand.setAttribute('class', 'draw-hand draw-hand-auto');
    hand.setAttribute('pathLength', '1');
    hand.setAttribute('d', smooth(pts));
    layer.appendChild(hand);
    setTimeout(finish, 700);
  };

  hit.addEventListener('pointerdown', down);
  hit.addEventListener('pointermove', move);
  hit.addEventListener('pointerup', up);
  hit.addEventListener('pointercancel', up);
  ui.auto.addEventListener('click', auto);
  ui.status.textContent = 'Draw a line from the left. Let go, and the machine finishes it.';

  return () => {
    ui.auto.removeEventListener('click', auto);
    layer.remove();
    hit.remove();
    fig.classList.remove('is-drawing');
    ui.status.textContent = '';
  };
}
