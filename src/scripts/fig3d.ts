// Fig. 1 in 3D: one line, drawn by hand (a lime tube that wobbles and loops through depth),
// finished by machine (cobalt bars that only ever move along x, y or z, with a cube at every turn),
// floating in a dot lattice. Built from the SVG drawing on the page, so the two always match.
// Rules (SITE-BUILD.md Section 7): lazy, render on demand (no idle loop), DPR <= 2, paused off-screen,
// the SVG stays as the poster and the fallback.
import {
  AmbientLight, BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, DirectionalLight, EdgesGeometry, Float32BufferAttribute,
  Group, LineBasicMaterial, LineSegments, Mesh, MeshStandardMaterial, PerspectiveCamera, Points, PointsMaterial, Scene,
  SphereGeometry, SRGBColorSpace, TubeGeometry, Vector3, WebGLRenderer,
} from 'three';

const LIME = new Color('#b8f000');
const COBALT = new Color('#2b4bff');
const DOT = new Color('#a9a596');

type Mount = { dispose: () => void; frameTimes: number[] };

/** SVG user units (1200 x 380, centre 600,190) to scene units. */
const toScene = (x: number, y: number, z = 0) => new Vector3((x - 600) / 100, -(y - 190) / 100, z);

export function mountFig3d(fig: HTMLElement, svg: SVGSVGElement, onFirstFrame: () => void, opts: { instant?: boolean } = {}): Mount {
  const hand = svg.querySelector<SVGPathElement>('.by-hand')!;
  const machine = svg.querySelector<SVGPathElement>('.by-machine')!;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.domElement.className = 'fig3d-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  fig.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(26, 1200 / 380, 0.1, 100);
  camera.position.set(0, 0.15, 9.4);
  camera.lookAt(0, 0, 0);

  scene.add(new AmbientLight(0xffffff, 1.6));
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-4, 6, 8);
  scene.add(key);

  const world = new Group();
  scene.add(world);

  // --- by hand: sample the drawn path, then let it breathe in and out of the page ---
  const len = hand.getTotalLength();
  const handPts: Vector3[] = [];
  const N = 140;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = hand.getPointAtLength(t * len);
    handPts.push(toScene(p.x, p.y, Math.sin(t * Math.PI * 3.2) * 0.55 * (1 - t * 0.6)));
  }
  const handCurve = new CatmullRomCurve3(handPts);
  const handGeo = new TubeGeometry(handCurve, 420, 0.085, 14, false);
  const handMat = new MeshStandardMaterial({ color: LIME, roughness: 0.62, metalness: 0 });
  const handMesh = new Mesh(handGeo, handMat);
  world.add(handMesh);
  const handIndexCount = handGeo.index!.count;

  // ink blots where the pen first touched the page
  const blot = new MeshStandardMaterial({ color: LIME, roughness: 0.7 });
  for (const [x, y, r] of [[34, 246, 0.13], [14, 268, 0.04], [52, 276, 0.03], [22, 222, 0.03]] as const) {
    const s = new Mesh(new SphereGeometry(r, 20, 14), blot);
    s.position.copy(toScene(x, y));
    world.add(s);
  }

  // --- by machine: read the vertices, add depth in exact steps, one axis per segment ---
  const segs = (machine.getAttribute('d') || '').replace(/[ML]/g, ' ').trim().split(/\s+/).map(Number);
  const corners: Vector3[] = [];
  const DEPTH = [0, 0, -0.4, -0.4, 0.4, 0.4, 0, 0.4, 0.4, 0];
  for (let i = 0; i < segs.length; i += 2) corners.push(toScene(segs[i], segs[i + 1], DEPTH[(i / 2) % DEPTH.length]));
  // the hand ends on the first corner; make the joint exact
  corners[0].copy(handPts[handPts.length - 1]);
  const path: Vector3[] = [corners[0].clone()];
  for (let i = 1; i < corners.length; i++) {
    const a = path[path.length - 1];
    const b = corners[i];
    // move x, then y, then z, so every bar is axis-aligned
    for (const axis of ['x', 'y', 'z'] as const) {
      if (Math.abs(a[axis] - b[axis]) > 1e-4) {
        const next = path[path.length - 1].clone();
        next[axis] = b[axis];
        path.push(next);
      }
    }
  }
  const barMat = new MeshStandardMaterial({ color: COBALT, roughness: 0.35, metalness: 0.1 });
  const bars: Mesh[] = [];
  const T = 0.06;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const d = new Vector3().subVectors(b, a);
    const geo = new BoxGeometry(Math.abs(d.x) + T, Math.abs(d.y) + T, Math.abs(d.z) + T);
    const m = new Mesh(geo, barMat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.visible = false;
    world.add(m);
    bars.push(m);
  }
  const nodeMat = new MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.5 });
  const edgeMat = new LineBasicMaterial({ color: COBALT });
  const nodes: Group[] = [];
  for (const c of corners.slice(1)) {
    const g = new Group();
    const box = new BoxGeometry(0.16, 0.16, 0.16);
    g.add(new Mesh(box, nodeMat));
    g.add(new LineSegments(new EdgesGeometry(box), edgeMat));
    g.position.copy(c);
    g.scale.setScalar(0.001);
    world.add(g);
    nodes.push(g);
  }

  // --- the lattice the machine snaps to ---
  const lattice: number[] = [];
  for (let x = 0; x <= 5.8; x += 0.4) for (let y = -1.6; y <= 1.61; y += 0.4) for (let z = -0.8; z <= 0.81; z += 0.4) lattice.push(x, y, z);
  const latGeo = new BufferGeometry();
  latGeo.setAttribute('position', new Float32BufferAttribute(lattice, 3));
  const latPts = new Points(latGeo, new PointsMaterial({ color: DOT, size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
  world.add(latPts);

  // --- sizing ---
  const resize = () => {
    const w = fig.clientWidth;
    const h = Math.round(w * (380 / 1200));
    renderer.setSize(w, h, true);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  };

  // --- on-demand rendering ---
  // Arriving after the drawing has finished: appear fully drawn, no second draw-in.
  const start = performance.now() - (opts.instant ? 1e5 : 0);
  const DRAW_HAND = 1100, DRAW_GAP = 60, BAR_STEP = 70;
  let targetRX = 0, targetRY = 0, rx = 0, ry = 0;
  let raf = 0, visible = true, first = true;
  const frameTimes: number[] = [];
  let last = 0;

  const frame = (now: number) => {
    raf = 0;
    if (last) frameTimes.push(now - last);
    last = now;
    const t = now - start;
    // draw in: the hand first, then the machine bar by bar
    const hp = Math.min(1, t / DRAW_HAND);
    const eased = 1 - Math.pow(1 - hp, 3);
    handGeo.setDrawRange(0, Math.floor((handIndexCount * eased) / 3) * 3);
    let animating = hp < 1;
    const tm = t - DRAW_HAND - DRAW_GAP;
    bars.forEach((b, i) => (b.visible = tm > i * BAR_STEP));
    nodes.forEach((n, i) => {
      const k = Math.max(0, Math.min(1, (tm - (i + 1) * BAR_STEP * (bars.length / nodes.length)) / 220));
      n.scale.setScalar(Math.max(0.001, 1 - Math.pow(1 - k, 3)));
      if (k < 1) animating = true;
    });
    // ease the tilt toward the pointer
    rx += (targetRX - rx) * 0.08;
    ry += (targetRY - ry) * 0.08;
    world.rotation.set(rx, ry, 0);
    if (Math.abs(targetRX - rx) > 1e-4 || Math.abs(targetRY - ry) > 1e-4) animating = true;
    renderer.render(scene, camera);
    if (first) { first = false; onFirstFrame(); }
    if (animating && visible) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  function invalidate() { if (!raf && visible) raf = requestAnimationFrame(frame); }

  const onPointer = (e: PointerEvent) => {
    const r = fig.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    targetRY = nx * 0.55;
    targetRX = ny * 0.35;
    invalidate();
  };
  const onScroll = () => {
    const r = fig.getBoundingClientRect();
    const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / innerHeight));
    targetRX = p * 0.28;
    invalidate();
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  const ro = new ResizeObserver(resize);
  ro.observe(fig);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) invalidate(); });
  io.observe(fig);
  const onVis = () => { visible = !document.hidden; if (visible) invalidate(); };
  document.addEventListener('visibilitychange', onVis);
  resize();

  return {
    frameTimes,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
      io.disconnect();
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
