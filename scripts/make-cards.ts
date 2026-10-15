// Share cards for every resource, built without a browser (satori + resvg):
// public/og/[slug].png (1200x630) and public/story/[slug].png (1080x1920), plus public/og/site.png.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { loadContent, TYPE_LABEL } from '../src/lib/content.ts';

const ROOT = process.cwd();
const font = (w: number) => readFileSync(join(ROOT, `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff`));
const fonts = [
  { name: 'Inter', data: font(400), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font(800), weight: 800 as const, style: 'normal' as const },
];
const C = { bg: '#0a0a0c', text: '#f2f3f5', muted: '#a3a5ac', a: '#b8f000', b: '#2b4bff' };
const SITE = (process.env.SITE_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});

function card(w: number, ht: number, title: string, kicker: string, word: string | null, stamp: string): Node {
  const big = w > ht ? 64 : 96;
  return h(
    'div',
    { width: w, height: ht, background: C.bg, color: C.text, fontFamily: 'Inter', flexDirection: 'column', justifyContent: 'space-between', padding: w > ht ? 72 : 96 },
    h('div', { fontSize: w > ht ? 26 : 36, color: C.muted, fontWeight: 400 }, kicker),
    h('div', { fontSize: big, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }, title),
    h(
      'div',
      { flexDirection: 'column', gap: 16 },
      word ? h('div', { fontSize: w > ht ? 34 : 48, fontWeight: 800, color: C.a }, `Type “${word}”${SITE ? ` at ${SITE}` : ''}`) : '',
      h('div', { fontSize: w > ht ? 22 : 30, color: C.muted }, stamp),
      h('div', { gap: 10, alignItems: 'center', fontSize: w > ht ? 24 : 32, fontWeight: 800 }, 'AI-Floh', h('div', { width: 14, height: 14, borderRadius: 7, background: C.a }), h('div', { width: 14, height: 14, borderRadius: 7, background: C.b })),
    ),
  );
}

async function render(node: Node, w: number, ht: number, out: string) {
  const svg = await satori(node as any, { width: w, height: ht, fonts });
  writeFileSync(out, new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng());
}

mkdirSync(join(ROOT, 'public/og'), { recursive: true });
mkdirSync(join(ROOT, 'public/story'), { recursive: true });
const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const { resources } = loadContent();
for (const r of resources) {
  const stamp = r.tested ? `Tested ${fmt(r.tested.on)} · ${r.tested.tool} · ${r.tested.version}` : 'Free on AI-Floh';
  await render(card(1200, 630, r.title, `Free · ${TYPE_LABEL[r.type]}`, r.codeWord, stamp), 1200, 630, join(ROOT, `public/og/${r.slug}.png`));
  await render(card(1080, 1920, r.title, `Free · ${TYPE_LABEL[r.type]}`, r.codeWord, stamp), 1080, 1920, join(ROOT, `public/story/${r.slug}.png`));
}
await render(card(1200, 630, 'We keep the craft. We automate the grind.', 'AI-Floh · creative automation studio', null, 'Free prompts, skills and tools from the work'), 1200, 630, join(ROOT, 'public/og/site.png'));
console.log(`make-cards: ${resources.length * 2 + 1} share cards written`);
