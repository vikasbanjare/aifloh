// The home film: a miniature clay bedroom, shot like a short animated movie. Scroll is the playhead.
//   12:57 PM. The bedside clock ticks, he sleeps. 1:00 PM, the alarm, the sun comes up in the window.
//   He sits up, stretches, swings his legs out, walks to the desk, sits, the monitor wakes into an edit, he works.
//   Then the camera pulls back and the room is a small box floating in the dark.
// Everything is built in code (no downloaded models): rounded clay forms, soft shadows, ambient occlusion.
// Rules (SITE-BUILD.md Section 7, relaxed for the film in DECISIONS.md): self-hosted Three.js, loaded after first
// paint, DPR <= 2, paused off-screen and in hidden tabs; the poster image is the fallback and the LCP.
import {
  ACESFilmicToneMapping, AmbientLight, CanvasTexture, CapsuleGeometry, Color, CylinderGeometry, DirectionalLight,
  Euler, Group, HemisphereLight, Mesh, MeshStandardMaterial, Object3D, PCFShadowMap, PerspectiveCamera, PlaneGeometry,
  PMREMGenerator, PointLight, Scene, SphereGeometry, SRGBColorSpace, TextureLoader, TorusGeometry, Vector3, WebGLRenderer,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

export type Room = { dispose: () => void; frameTimes: number[] };

const BG = new Color('#1c1a1e');
const LIME = '#b8f000';
const COBALT = '#2b4bff';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => t * t * (3 - 2 * t);
const seg = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Clay: matte, soft, slightly warm. */
const clay = (hex: string, rough = 0.88) => new MeshStandardMaterial({ color: new Color(hex), roughness: rough, metalness: 0 });

function rbox(w: number, h: number, d: number, r: number, mat: MeshStandardMaterial, x = 0, y = 0, z = 0) {
  const m = new Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
function part<T extends Mesh>(m: T, x = 0, y = 0, z = 0) {
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------- the person
type Joints = Record<'pelvis' | 'spine' | 'head' | 'shL' | 'elL' | 'shR' | 'elR' | 'hipL' | 'knL' | 'hipR' | 'knR', Object3D>;
type Pose = {
  pos: [number, number, number]; ry: number; rx: number;
  spine: number; head: number; shL: [number, number]; elL: number; shR: [number, number]; elR: number;
  hipL: number; knL: number; hipR: number; knR: number;
};

function makePerson() {
  const skin = clay('#b9805f', 0.7);
  const hair = clay('#1d1915', 0.8);
  const tee = clay('#ece8df');
  const pants = clay('#3a3f4b');
  const sock = clay('#f4f1ea');
  const dark = clay('#1b1714', 0.5);

  const root = new Group();
  const pelvis = new Group();
  root.add(pelvis);
  pelvis.add(rbox(0.34, 0.17, 0.21, 0.08, pants, 0, 0.02, 0));

  const spine = new Group();
  spine.position.y = 0.06;
  pelvis.add(spine);
  const torso = part(new Mesh(new CapsuleGeometry(0.165, 0.26, 6, 20), tee), 0, 0.27, 0);
  torso.scale.set(1.08, 1, 0.78);
  spine.add(torso);
  spine.add(part(new Mesh(new CylinderGeometry(0.05, 0.055, 0.1, 12), skin), 0, 0.6, 0));

  const head = new Group();
  head.position.y = 0.62;
  spine.add(head);
  const skull = part(new Mesh(new SphereGeometry(0.125, 32, 24), skin), 0, 0.12, 0.005);
  skull.scale.set(0.9, 1.08, 0.98);
  head.add(skull);
  const cap = part(new Mesh(new SphereGeometry(0.134, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62), hair), 0, 0.14, -0.018);
  cap.scale.set(0.96, 1.06, 1.05);
  cap.rotation.x = -0.55;
  head.add(cap);
  for (const [x, y, z, r] of [[-0.05, 0.245, 0.03, 0.06], [0.04, 0.25, 0.01, 0.065], [0.0, 0.235, -0.06, 0.07], [0.07, 0.22, 0.06, 0.045]] as const) {
    const tuft = part(new Mesh(new SphereGeometry(r, 16, 12), hair), x, y, z);
    tuft.scale.set(1.1, 0.6, 1);
    head.add(tuft);
  }
  for (const s of [-1, 1]) head.add(part(new Mesh(new SphereGeometry(0.026, 12, 10), skin), s * 0.112, 0.11, -0.005));
  head.add(part(new Mesh(new SphereGeometry(0.02, 12, 10), skin), 0, 0.1, 0.12));
  // eyes: closed (two soft arcs) while asleep, open after the alarm
  const closed = new Group();
  const open = new Group();
  for (const s of [-1, 1]) {
    const lid = part(new Mesh(new TorusGeometry(0.018, 0.0045, 6, 14, Math.PI), dark), s * 0.042, 0.13, 0.112);
    lid.rotation.z = Math.PI;
    closed.add(lid);
    open.add(part(new Mesh(new SphereGeometry(0.017, 12, 10), dark), s * 0.042, 0.128, 0.112));
    const brow = rbox(0.045, 0.01, 0.01, 0.005, hair, s * 0.044, 0.165, 0.112);
    brow.rotation.z = s * -0.12;
    head.add(brow);
  }
  open.visible = false;
  head.add(closed, open);
  const mouth = part(new Mesh(new TorusGeometry(0.022, 0.004, 6, 14, Math.PI * 0.8), clay('#7a4a3a', 0.6)), 0, 0.068, 0.116);
  mouth.rotation.z = Math.PI * 1.1;
  head.add(mouth);

  const arm = (s: number) => {
    const sh = new Group();
    sh.position.set(s * 0.215, 0.5, 0);
    spine.add(sh);
    sh.add(part(new Mesh(new CapsuleGeometry(0.068, 0.1, 4, 14), tee), 0, -0.06, 0));
    sh.add(part(new Mesh(new CapsuleGeometry(0.056, 0.2, 4, 12), skin), 0, -0.16, 0));
    const el = new Group();
    el.position.y = -0.29;
    sh.add(el);
    el.add(part(new Mesh(new SphereGeometry(0.054, 16, 12), skin), 0, 0, 0));
    el.add(part(new Mesh(new CapsuleGeometry(0.05, 0.19, 4, 12), skin), 0, -0.12, 0));
    const hand = part(new Mesh(new CapsuleGeometry(0.042, 0.06, 4, 12), skin), 0, -0.27, 0.006);
    hand.scale.set(1.0, 1.0, 0.62);
    el.add(hand);
    const thumb = part(new Mesh(new CapsuleGeometry(0.016, 0.04, 4, 8), skin), s * -0.035, -0.24, 0.02);
    thumb.rotation.z = s * 0.5;
    el.add(thumb);
    return { sh, el };
  };
  const L = arm(1), R = arm(-1);

  const leg = (s: number) => {
    const hip = new Group();
    hip.position.set(s * 0.09, -0.03, 0);
    pelvis.add(hip);
    hip.add(part(new Mesh(new CapsuleGeometry(0.074, 0.28, 4, 14), pants), 0, -0.2, 0));
    const kn = new Group();
    kn.position.y = -0.42;
    hip.add(kn);
    kn.add(part(new Mesh(new SphereGeometry(0.07, 16, 12), pants), 0, 0, 0));
    kn.add(part(new Mesh(new CapsuleGeometry(0.06, 0.3, 4, 14), pants), 0, -0.2, 0));
    kn.add(rbox(0.095, 0.065, 0.21, 0.03, sock, 0, -0.43, 0.045));
    return { hip, kn };
  };
  const LL = leg(1), RL = leg(-1);

  root.traverse((o) => { if ((o as Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const joints: Joints = { pelvis, spine, head, shL: L.sh, elL: L.el, shR: R.sh, elR: R.el, hipL: LL.hip, knL: LL.kn, hipR: RL.hip, knR: RL.kn };
  return { root, joints, torso, closed, open };
}

const P = (o: Partial<Pose>): Pose => ({
  pos: [0, 0.95, 0], ry: 0, rx: 0, spine: 0, head: 0, shL: [0, 0.08], elL: -0.1, shR: [0, -0.08], elR: -0.1,
  hipL: 0, knL: 0, hipR: 0, knR: 0, ...o,
});
const HP = Math.PI / 2;
// key poses (world units: the room floor is y = 0)
const POSE = {
  sleep: P({ pos: [-2.08, 0.64, -1.68], rx: -HP, head: 0.12, shL: [0, 0.06], shR: [0, -0.06], elL: 0, elR: 0, hipL: 0, hipR: 0, knL: 0.05, knR: 0.05 }),
  sitUp: P({ pos: [-2.08, 0.6, -1.7], rx: 0, spine: -0.08, head: 0, shL: [-2.9, 0.25], shR: [-2.9, -0.25], elL: -0.2, elR: -0.2, hipL: -HP, hipR: -HP }),
  sitUpRest: P({ pos: [-2.08, 0.6, -1.7], rx: 0, spine: 0.08, shL: [-0.2, 0.15], shR: [-0.2, -0.15], elL: -0.6, elR: -0.6, hipL: -HP, hipR: -HP }),
  edge: P({ pos: [-1.5, 0.58, -1.55], ry: HP, spine: 0.12, head: 0.15, shL: [-0.25, 0.12], shR: [-0.25, -0.12], elL: -0.5, elR: -0.5, hipL: -HP, hipR: -HP, knL: HP, knR: HP }),
  stand: P({ pos: [-1.0, 0.95, -1.5], ry: 1.25 }),
  chairBehind: P({ pos: [1.05, 0.95, -1.55], ry: HP }),
  sitChair: P({ pos: [1.7, 0.58, -1.62], ry: Math.PI, spine: 0.12, head: 0.1, shL: [-0.9, 0.18], shR: [-0.9, -0.18], elL: -1.05, elR: -1.05, hipL: -HP, hipR: -HP, knL: HP, knR: HP }),
};
function blend(a: Pose, b: Pose, t: number): Pose {
  const l = (x: number, y: number) => lerp(x, y, t);
  return {
    pos: [l(a.pos[0], b.pos[0]), l(a.pos[1], b.pos[1]), l(a.pos[2], b.pos[2])], ry: l(a.ry, b.ry), rx: l(a.rx, b.rx),
    spine: l(a.spine, b.spine), head: l(a.head, b.head), shL: [l(a.shL[0], b.shL[0]), l(a.shL[1], b.shL[1])], elL: l(a.elL, b.elL),
    shR: [l(a.shR[0], b.shR[0]), l(a.shR[1], b.shR[1])], elR: l(a.elR, b.elR), hipL: l(a.hipL, b.hipL), knL: l(a.knL, b.knL),
    hipR: l(a.hipR, b.hipR), knR: l(a.knR, b.knR),
  };
}
function apply(root: Object3D, j: Joints, q: Pose) {
  root.position.set(...q.pos);
  root.rotation.copy(new Euler(q.rx, q.ry, 0, 'YXZ'));
  j.spine.rotation.x = q.spine;
  j.head.rotation.x = q.head;
  j.shL.rotation.set(q.shL[0], 0, q.shL[1]);
  j.shR.rotation.set(q.shR[0], 0, q.shR[1]);
  j.elL.rotation.x = q.elL;
  j.elR.rotation.x = q.elR;
  j.hipL.rotation.x = q.hipL;
  j.hipR.rotation.x = q.hipR;
  j.knL.rotation.x = q.knL;
  j.knR.rotation.x = q.knR;
}

// ---------------------------------------------------------------- screens
function clockFace() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 128;
  const g = c.getContext('2d')!;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  let last = '';
  const draw = (text: string, alarm: boolean) => {
    const key = text + alarm;
    if (key === last) return;
    last = key;
    g.fillStyle = '#0d0e0c';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = alarm ? LIME : '#e8ffe0';
    g.font = '700 74px ui-monospace, Menlo, Consolas, monospace';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 118, 66);
    g.font = '600 22px ui-monospace, Menlo, monospace';
    g.fillText('PM', 228, 92);
    tex.needsUpdate = true;
  };
  return { tex, draw };
}

function editorScreen(poster: HTMLImageElement | null) {
  const c = document.createElement('canvas');
  c.width = 640; c.height = 380;
  const g = c.getContext('2d')!;
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const clips = [
    // track, start, length, colour
    [0, 0.02, 0.22, COBALT], [0, 0.26, 0.3, COBALT], [0, 0.6, 0.36, COBALT],
    [1, 0.08, 0.18, LIME], [1, 0.3, 0.12, LIME], [1, 0.52, 0.26, LIME],
    [2, 0.0, 0.62, '#8f8a7e'], [2, 0.66, 0.32, '#8f8a7e'],
    [3, 0.12, 0.08, '#e7e2d6'], [3, 0.4, 0.1, '#e7e2d6'], [3, 0.72, 0.08, '#e7e2d6'],
  ] as const;
  let lastKey = -1;
  const draw = (on: number, head: number) => {
    const key = Math.round(on * 20) * 1000 + Math.round(head * 400);
    if (key === lastKey) return;
    lastKey = key;
    g.fillStyle = '#060607';
    g.fillRect(0, 0, 640, 380);
    if (on <= 0) { tex.needsUpdate = true; return; }
    g.globalAlpha = on;
    g.fillStyle = '#16161a';
    g.fillRect(0, 0, 640, 380);
    // viewer
    g.fillStyle = '#0b0b0d';
    g.fillRect(150, 14, 340, 196);
    if (poster && poster.complete) {
      const w = 196 * (poster.width / poster.height);
      g.drawImage(poster, 320 - w / 2, 14, w, 196);
    }
    g.fillStyle = '#26262c';
    g.fillRect(12, 14, 126, 196);
    g.fillRect(502, 14, 126, 196);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#34343c' : '#2c2c33'; g.fillRect(20, 24 + i * 30, 110, 22); }
    for (let i = 0; i < 5; i++) { g.fillStyle = '#34343c'; g.fillRect(510, 24 + i * 34, 60 + (i % 3) * 18, 10); }
    // timeline
    g.fillStyle = '#1e1e23';
    g.fillRect(0, 222, 640, 158);
    for (const [t, s, l, col] of clips) {
      g.fillStyle = col;
      g.fillRect(60 + s * 570, 236 + t * 34, l * 570 - 3, 26);
    }
    g.fillStyle = '#ffffff';
    g.fillRect(60 + head * 570, 226, 2, 150);
    g.beginPath(); g.moveTo(54 + head * 570, 226); g.lineTo(68 + head * 570, 226); g.lineTo(61 + head * 570, 234); g.fill();
    g.globalAlpha = 1;
    tex.needsUpdate = true;
  };
  return { tex, draw };
}

function windowSky() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, '#bcd7f2');
  grad.addColorStop(1, '#f6e7c8');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------- the room
export function mountRoom(stage: HTMLElement, getProgress: () => number, onFirstFrame: () => void, base = '/'): Room {
  const small = Math.min(innerWidth, innerHeight) < 600;
  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setPixelRatio(Math.min(small ? 1.75 : 1.5, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  renderer.setClearColor(BG);
  const canvas = renderer.domElement;
  canvas.className = 'film-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  stage.prepend(canvas);

  const scene = new Scene();
  scene.background = BG;
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.32;

  const camera = new PerspectiveCamera(30, 16 / 9, 0.05, 80);

  // light: a soft sky, a sun that comes up at 1 PM, the bedside lamp until then
  const hemi = new HemisphereLight(0xf3ecff, 0x3a2e24, 0.55);
  scene.add(hemi);
  scene.add(new AmbientLight(0xffffff, 0.08));
  const sun = new DirectionalLight(0xffe2b8, 0.6);
  sun.position.set(5.5, 9, 6);
  sun.target.position.set(0, 0, -1);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -6; sun.shadow.camera.right = 6; sun.shadow.camera.top = 6; sun.shadow.camera.bottom = -6;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 30;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  sun.shadow.radius = 5;
  scene.add(sun, sun.target);

  const room = new Group();
  scene.add(room);

  // shell: a thick floor slab and two walls, cut open like a miniature
  const floorMat = clay('#d8bf9f');
  const wallMat = clay('#efe7da');
  const trimMat = clay('#e2d6c4');
  room.add(rbox(6.4, 0.42, 6.4, 0.1, floorMat, 0, -0.21, 0));
  for (let i = 0; i < 9; i++) room.add(rbox(0.012, 0.004, 6.2, 0.002, clay('#c9ad8b'), -2.8 + i * 0.7, 0.002, 0));
  room.add(rbox(6.4, 3.3, 0.24, 0.06, wallMat, 0, 1.65, -3.08));
  room.add(rbox(0.24, 3.3, 6.4, 0.06, wallMat, -3.08, 1.65, 0));
  room.add(rbox(6.0, 0.12, 0.05, 0.02, trimMat, 0.15, 0.06, -2.94));
  room.add(rbox(0.05, 0.12, 6.0, 0.02, trimMat, -2.94, 0.06, 0.15));

  // window over the desk, with the day behind it
  const frameMat = clay('#f7f3ec');
  const glassMat = new MeshStandardMaterial({ map: windowSky(), emissive: new Color('#ffffff'), emissiveIntensity: 0.25, roughness: 0.2 });
  glassMat.emissiveMap = glassMat.map;
  const win = new Group();
  win.position.set(1.7, 2.05, -2.95);
  win.add(rbox(1.7, 1.2, 0.08, 0.04, frameMat, 0, 0, 0));
  const glass = new Mesh(new PlaneGeometry(1.5, 1.0), glassMat);
  glass.position.z = 0.045;
  win.add(glass);
  win.add(rbox(0.05, 1.0, 0.05, 0.02, frameMat, 0, 0, 0.06));
  win.add(rbox(1.5, 0.05, 0.05, 0.02, frameMat, 0, 0, 0.06));
  win.add(rbox(1.9, 0.07, 0.22, 0.03, frameMat, 0, -0.63, 0.08));
  // curtains, drawn while he sleeps
  const curtainMat = clay('#d9d2c4');
  const curtL = rbox(0.5, 1.35, 0.06, 0.03, curtainMat, -0.48, -0.02, 0.16);
  const curtR = rbox(0.5, 1.35, 0.06, 0.03, curtainMat, 0.48, -0.02, 0.16);
  win.add(curtL, curtR);
  room.add(win);

  // rug
  const rug = part(new Mesh(new CylinderGeometry(1.25, 1.25, 0.025, 48), clay('#e9dfcf')), 0.1, 0.013, -0.35);
  rug.scale.z = 0.72;
  room.add(rug);

  // bed against the left and back walls
  const wood = clay('#a97c56', 0.75);
  const linen = clay('#f6f3ec');
  room.add(rbox(1.76, 0.3, 2.56, 0.06, wood, -2.06, 0.19, -1.76));
  room.add(rbox(1.76, 0.95, 0.14, 0.06, wood, -2.06, 0.6, -2.93));
  room.add(rbox(1.64, 0.18, 2.4, 0.08, linen, -2.06, 0.42, -1.72));
  const pillow = rbox(0.95, 0.15, 0.42, 0.07, linen, -2.06, 0.57, -2.6);
  pillow.rotation.x = 0.12;
  room.add(pillow);
  const blanketMat = clay('#3550d8', 0.92);
  const blanket = rbox(1.7, 0.4, 1.8, 0.16, blanketMat, -2.06, 0.62, -1.22);
  room.add(blanket);

  // bedside table, clock, lamp, mug
  room.add(rbox(0.62, 0.52, 0.5, 0.05, wood, -0.86, 0.26, -2.68));
  room.add(rbox(0.5, 0.16, 0.02, 0.01, clay('#b58a63'), -0.86, 0.33, -2.42));
  room.add(part(new Mesh(new SphereGeometry(0.025, 12, 8), clay('#e8dcc8')), -0.86, 0.33, -2.4));
  const clockBody = rbox(0.34, 0.2, 0.14, 0.05, clay('#2a2a2e', 0.6), -0.92, 0.62, -2.62);
  clockBody.rotation.y = 0.3;
  room.add(clockBody);
  const face = clockFace();
  const clockScreen = new Mesh(new PlaneGeometry(0.27, 0.135), new MeshStandardMaterial({ map: face.tex, emissive: new Color('#ffffff'), emissiveMap: face.tex, emissiveIntensity: 1.1 }));
  clockScreen.position.set(0, 0, 0.072);
  clockBody.add(clockScreen);
  const lampShadeMat = new MeshStandardMaterial({ color: new Color('#f4e6cc'), emissive: new Color('#ffcf8a'), emissiveIntensity: 0.6, roughness: 0.9 });
  room.add(part(new Mesh(new CylinderGeometry(0.07, 0.09, 0.04, 20), clay('#2a2a2e', 0.5)), -0.64, 0.54, -2.78));
  room.add(part(new Mesh(new CylinderGeometry(0.012, 0.012, 0.3, 8), clay('#2a2a2e', 0.5)), -0.64, 0.7, -2.78));
  room.add(part(new Mesh(new CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), lampShadeMat), -0.64, 0.88, -2.78));
  const lampLight = new PointLight(0xffc27a, 1.6, 3.5, 2);
  lampLight.position.set(-0.64, 0.84, -2.7);
  room.add(lampLight);
  room.add(part(new Mesh(new CylinderGeometry(0.05, 0.045, 0.1, 18), clay(LIME)), -0.66, 0.57, -2.52));

  // posters on the wall above the bed: his own type posters
  const loader = new TextureLoader();
  const posterURL = (n: string) => `${base}media/room/poster-${n}.webp`;
  const posters: MeshStandardMaterial[] = [];
  ['vision', 'impact', 'flow'].forEach((n, i) => {
    const fr = rbox(0.06, 0.66, 0.5, 0.02, clay('#1f1f22', 0.6), -2.93, 1.95 + (i === 1 ? 0.12 : 0), -2.25 + i * 0.66);
    room.add(fr);
    const t = loader.load(posterURL(n));
    t.colorSpace = SRGBColorSpace;
    const mat = new MeshStandardMaterial({ map: t, roughness: 0.7 });
    posters.push(mat);
    const pl = new Mesh(new PlaneGeometry(0.42, 0.58), mat);
    pl.rotation.y = HP;
    pl.position.set(-2.895, fr.position.y, fr.position.z);
    room.add(pl);
  });

  // shelf with books on the left wall, nearer the front
  room.add(rbox(0.3, 0.05, 1.2, 0.02, wood, -2.8, 1.55, 0.95));
  const bookCols = ['#2b4bff', '#e9e3d6', '#b8f000', '#3a3f4b', '#c96f4a', '#e9e3d6', '#2a2a2e'];
  bookCols.forEach((col, i) => {
    const h = 0.26 + ((i * 37) % 9) / 60;
    const b = rbox(0.2, h, 0.07, 0.015, clay(col), -2.8, 1.575 + h / 2, 0.5 + i * 0.085);
    if (i === 6) b.rotation.x = 0.25;
    room.add(b);
  });

  // desk, monitor, keyboard, chair
  const deskMat = clay('#f2ede4');
  room.add(rbox(2.1, 0.07, 0.78, 0.03, deskMat, 1.7, 0.8, -2.55));
  for (const [x, z] of [[0.72, -2.25], [2.68, -2.25], [0.72, -2.86], [2.68, -2.86]]) room.add(rbox(0.06, 0.78, 0.06, 0.02, clay('#2a2a2e', 0.5), x, 0.39, z));
  const monitor = new Group();
  monitor.position.set(1.7, 0.84, -2.78);
  monitor.add(rbox(0.28, 0.02, 0.18, 0.01, clay('#2a2a2e', 0.4), 0, 0.01, 0));
  monitor.add(rbox(0.05, 0.3, 0.04, 0.02, clay('#2a2a2e', 0.4), 0, 0.16, -0.02));
  monitor.add(rbox(1.08, 0.66, 0.05, 0.025, clay('#1f1f22', 0.35), 0, 0.6, 0));
  const img = new Image();
  img.src = posterURL('impact');
  const editor = editorScreen(null);
  const screenMat = new MeshStandardMaterial({ map: editor.tex, emissive: new Color('#ffffff'), emissiveMap: editor.tex, emissiveIntensity: 0.9, roughness: 0.35 });
  const screen = new Mesh(new PlaneGeometry(1.0, 0.59), screenMat);
  screen.position.set(0, 0.6, 0.027);
  monitor.add(screen);
  room.add(monitor);
  const screenLight = new PointLight(0x9fb0ff, 0, 2.2, 2);
  screenLight.position.set(1.7, 1.4, -2.3);
  room.add(screenLight);
  room.add(rbox(0.6, 0.03, 0.19, 0.012, clay('#2a2a2e', 0.5), 1.7, 0.85, -2.33));
  room.add(rbox(0.07, 0.03, 0.11, 0.02, clay('#2a2a2e', 0.5), 2.18, 0.85, -2.33));
  // a plant on the desk and a tall one on the floor
  const potMat = clay('#d7c8b2');
  const leafMat = clay('#6d8a5a', 0.8);
  room.add(part(new Mesh(new CylinderGeometry(0.08, 0.065, 0.14, 20), potMat), 2.5, 0.9, -2.75));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const lf = part(new Mesh(new SphereGeometry(0.06, 14, 10), leafMat), 2.5 + Math.cos(a) * 0.05, 1.03 + (i % 2) * 0.05, -2.75 + Math.sin(a) * 0.05);
    lf.scale.set(0.7, 1.4, 0.5);
    lf.rotation.set(Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5);
    room.add(lf);
  }
  room.add(part(new Mesh(new CylinderGeometry(0.22, 0.17, 0.42, 24), potMat), 2.6, 0.21, 0.9));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const lf = part(new Mesh(new SphereGeometry(0.16, 16, 12), leafMat), 2.6 + Math.cos(a) * 0.12, 0.62 + (i % 3) * 0.17, 0.9 + Math.sin(a) * 0.12);
    lf.scale.set(0.55, 1.5, 0.35);
    lf.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6);
    room.add(lf);
  }

  const chair = new Group();
  chair.position.set(1.7, 0, -1.55);
  const chairMat = clay(LIME, 0.85);
  const metal = clay('#2a2a2e', 0.4);
  chair.add(rbox(0.56, 0.09, 0.54, 0.04, chairMat, 0, 0.47, 0));
  chair.add(rbox(0.54, 0.58, 0.08, 0.05, chairMat, 0, 0.86, 0.27));
  chair.add(part(new Mesh(new CylinderGeometry(0.03, 0.03, 0.36, 10), metal), 0, 0.26, 0));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = rbox(0.3, 0.04, 0.05, 0.02, metal, Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15);
    leg.rotation.y = -a;
    chair.add(leg);
    chair.add(part(new Mesh(new SphereGeometry(0.035, 10, 8), metal), Math.cos(a) * 0.29, 0.035, Math.sin(a) * 0.29));
  }
  room.add(chair);

  // him
  const me = makePerson();
  room.add(me.root);

  // ---------------------------------------------------------------- post: ambient occlusion makes it read as clay
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  let gtao: GTAOPass | null = null;
  if (!small) {
    gtao = new GTAOPass(scene, camera, 1, 1);
    gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1.2, scale: 1.0, samples: 12 });
    gtao.blendIntensity = 0.85;
    composer.addPass(gtao);
  }
  // shallow focus, like a macro lens on a real miniature (desktop only)
  let bokeh: BokehPass | null = null;
  if (!small) {
    bokeh = new BokehPass(scene, camera, { focus: 4, aperture: 0.0016, maxblur: 0.006 });
    composer.addPass(bokeh);
  }
  composer.addPass(new OutputPass());

  // ---------------------------------------------------------------- camera: [progress, position, look-at]
  const KEYS: [number, Vector3, Vector3][] = [
    [0.0, new Vector3(-0.1, 0.95, -1.55), new Vector3(-0.9, 0.62, -2.62)],
    [0.08, new Vector3(0.1, 1.15, -1.1), new Vector3(-1.0, 0.6, -2.4)],
    [0.22, new Vector3(1.4, 2.5, 1.5), new Vector3(-1.5, 0.6, -1.8)],
    [0.42, new Vector3(1.5, 2.4, 1.9), new Vector3(-1.3, 0.75, -1.6)],
    [0.62, new Vector3(3.6, 3.2, 3.6), new Vector3(0.2, 0.8, -1.2)],
    [0.76, new Vector3(3.0, 1.9, 0.6), new Vector3(1.6, 1.1, -2.2)],
    [0.9, new Vector3(2.55, 1.55, -0.55), new Vector3(1.65, 1.35, -2.75)],
    [1.0, new Vector3(10.4, 8.9, 10.4), new Vector3(0, 0.6, -0.4)],
  ];
  const camPos = new Vector3(), camLook = new Vector3(), dir = new Vector3(), side = new Vector3();
  const UP = new Vector3(0, 1, 0);
  let aspect = 16 / 9;
  const placeCamera = (p: number) => {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    const [p0, a0, l0] = KEYS[i], [p1, a1, l1] = KEYS[i + 1];
    const t = ease(clamp((p - p0) / (p1 - p0)));
    camPos.lerpVectors(a0, a1, t);
    camLook.lerpVectors(l0, l1, t);
    const f = clamp(1.25 / aspect, 1, 2.1);
    dir.subVectors(camPos, camLook).multiplyScalar(f);
    // the closing wide shot on wide screens: frame the room to the right so the title sits on the dark
    if (aspect > 1.2) {
      const k = ease(clamp((p - 0.9) / 0.1)) * Math.min(4.4, (aspect - 1.0) * 5.0);
      side.crossVectors(dir, UP).normalize().multiplyScalar(k);
      camLook.add(side);
    }
    camera.position.copy(camLook).add(dir);
    camera.lookAt(camLook);
  };

  const resize = () => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
  };

  // the walk: from beside the bed to behind the chair
  const walkFrom = new Vector3(...POSE.stand.pos), walkTo = new Vector3(...POSE.chairBehind.pos);
  const walkLen = walkFrom.distanceTo(walkTo);

  const frameTimes: number[] = [];
  let raf = 0, last = 0, visible = true, first = true;
  const t0 = performance.now();

  const frame = (now: number) => {
    raf = 0;
    if (last && frameTimes.length < 120) frameTimes.push(now - last);
    last = now;
    const time = (now - t0) / 1000;
    const p = getProgress();

    // ---- the clock: 12:57 to 1:00 by p = 0.26, then the day keeps going
    const minutes = p < 0.26 ? 57 + (p / 0.26) * 3 : 60 + ((p - 0.26) / 0.74) * 14;
    const hh = minutes >= 60 ? 1 : 12;
    const mm = Math.floor(minutes >= 60 ? minutes - 60 : minutes);
    const ringing = p >= 0.26 && p < 0.34;
    face.draw(`${hh}:${String(mm).padStart(2, '0')}`, ringing && Math.floor(time * 3) % 2 === 0);
    clockBody.position.x = -0.92 + (ringing ? Math.sin(time * 60) * 0.006 : 0);

    // ---- light: lamp and drawn curtains until 1 PM, then the sun
    const day = seg(p, 0.26, 0.36);
    sun.intensity = lerp(0.35, 2.4, day);
    hemi.intensity = lerp(0.35, 0.75, day);
    lampLight.intensity = lerp(1.6, 0, day);
    lampShadeMat.emissiveIntensity = lerp(0.7, 0.05, day);
    glassMat.emissiveIntensity = lerp(0.1, 0.55, day);
    curtL.position.x = -0.48 - day * 0.36;
    curtR.position.x = 0.48 + day * 0.36;

    // ---- him
    let q: Pose;
    if (p < 0.3) q = POSE.sleep;
    else if (p < 0.38) q = blend(POSE.sleep, POSE.sitUp, seg(p, 0.3, 0.38));
    else if (p < 0.42) q = blend(POSE.sitUp, POSE.sitUpRest, seg(p, 0.38, 0.42));
    else if (p < 0.48) q = blend(POSE.sitUpRest, POSE.edge, seg(p, 0.42, 0.48));
    else if (p < 0.53) q = blend(POSE.edge, POSE.stand, seg(p, 0.48, 0.53));
    else if (p < 0.68) {
      const k = clamp((p - 0.53) / 0.15);
      const pos = new Vector3().lerpVectors(walkFrom, walkTo, k);
      const phase = k * walkLen * 5.2;
      const sw = Math.sin(phase) * (1 - Math.abs(k - 0.5) * 0.6);
      q = P({
        pos: [pos.x, 0.95 + Math.abs(Math.cos(phase)) * 0.025, pos.z], ry: Math.atan2(walkTo.x - walkFrom.x, walkTo.z - walkFrom.z),
        hipL: -sw * 0.45, hipR: sw * 0.45, knL: Math.max(0, sw) * 0.7, knR: Math.max(0, -sw) * 0.7,
        shL: [sw * 0.4, 0.1], shR: [-sw * 0.4, -0.1], elL: -0.25, elR: -0.25,
      });
    } else if (p < 0.72) q = blend({ ...POSE.chairBehind, ry: Math.atan2(walkTo.x - walkFrom.x, walkTo.z - walkFrom.z) }, POSE.chairBehind, seg(p, 0.68, 0.72));
    else if (p < 0.78) q = blend(POSE.chairBehind, POSE.sitChair, seg(p, 0.72, 0.78));
    else {
      q = { ...POSE.sitChair };
      const type = seg(p, 0.8, 0.84);
      q.elL += Math.sin(time * 14) * 0.06 * type;
      q.elR += Math.sin(time * 13 + 1.3) * 0.06 * type;
      q.head += Math.sin(time * 0.9) * 0.03;
    }
    // asleep: slow breathing; awake: a little life
    if (p < 0.3) me.torso.scale.y = 1 + Math.sin(time * 1.4) * 0.025;
    else me.torso.scale.y = 1;
    apply(me.root, me.joints, q);
    const awake = p >= 0.29;
    me.closed.visible = !awake || (time % 3.6) > 3.48;
    me.open.visible = !me.closed.visible;

    // the blanket slides to the foot of the bed as he sits up
    const off = seg(p, 0.4, 0.47);
    blanket.position.z = -1.22 + off * 0.6;
    blanket.scale.set(1, 1 - off * 0.55, 1 - off * 0.55);
    blanket.position.y = 0.62 - off * 0.1;

    // chair rolls back a little for him to sit, then in
    chair.position.z = -1.55 + seg(p, 0.6, 0.7) * 0.12 - seg(p, 0.74, 0.8) * 0.12;

    // the monitor wakes into an edit; the playhead runs while he works
    const on = seg(p, 0.76, 0.8);
    editor.draw(on, 0.08 + clamp((p - 0.8) / 0.2) * 0.84);
    screenLight.intensity = on * 0.9;

    placeCamera(p);
    if (bokeh) {
      (bokeh.uniforms as any).focus.value = dir.length();
      (bokeh.uniforms as any).aperture.value = 0.0016 * (1 - seg(p, 0.88, 1) * 0.85);
    }
    composer.render();
    if (first) { first = false; onFirstFrame(); }
    if (visible) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  // the editor's viewer shows one of his posters once it has loaded
  img.addEventListener('load', () => {
    const e2 = editorScreen(img);
    screenMat.map = e2.tex;
    screenMat.emissiveMap = e2.tex;
    screenMat.needsUpdate = true;
    editor.draw = e2.draw;
  });

  let ready = false, gone = false;
  const wake = () => { if (ready && !raf && visible) raf = requestAnimationFrame(frame); };
  const ro = new ResizeObserver(() => { resize(); wake(); });
  ro.observe(stage);
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; wake(); });
  io.observe(stage);
  const onVis = () => { visible = !document.hidden; wake(); };
  document.addEventListener('visibilitychange', onVis);
  resize();
  // compile every shader off the main path first (parallel compile where the GPU supports it), then start
  placeCamera(getProgress());
  renderer.compileAsync(scene, camera).catch(() => {}).finally(() => { ready = true; wake(); });

  return {
    frameTimes,
    dispose() {
      if (gone) return;
      gone = true;
      visible = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      scene.traverse((o) => {
        const mesh = o as Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as MeshStandardMaterial | MeshStandardMaterial[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => { x.map?.dispose(); x.dispose(); });
      });
      envTex.dispose();
      pmrem.dispose();
      composer.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
