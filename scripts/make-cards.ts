// Share cards for every resource, built without a browser (satori + resvg):
// public/og/[slug].png (1200x630) and public/story/[slug].png (1080x1920), plus public/og/site.png.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { loadContent, TYPE_LABEL } from '../src/lib/content.ts';

const ROOT = process.cwd();
// TTF, not WOFF: satori's WOFF path produced .notdef boxes ("NO GLYPH") on every card. Inter is OFL; the files
// are the @fontsource Latin subset converted with fontTools.
const font = (w: number) => readFileSync(join(ROOT, `scripts/fonts/inter-latin-${w}.ttf`));
const fonts = [
  { name: 'Inter', data: font(400), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font(800), weight: 800 as const, style: 'normal' as const },
];
const C = { bg: '#f3f1ea', text: '#141414', muted: '#5b5850', a: '#b8f000', b: '#2b4bff', line: '#141414' };
const SITE = (process.env.SITE_URL || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

// Fig. 1 in miniature: the hand line (lime) finished by the machine (cobalt). Same shape as the home hero.
const FIG = 'data:image/svg+xml;base64,' + Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 96"><path d="M8 62 C 16 40, 24 78, 34 64 S 42 40, 54 52 C 62 60, 58 72, 50 68 C 44 64, 52 48, 66 52 S 82 76, 94 62 S 108 36, 122 50 S 140 66, 150 50" fill="none" stroke="${'#b8f000'}" stroke-width="7" stroke-linecap="round"/><path d="M150 50 L170 50 L170 30 L200 30 L200 70 L230 70 L230 40 L260 40 L260 60 L292 60" fill="none" stroke="${'#2b4bff'}" stroke-width="3"/></svg>`,
).toString('base64');

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (Node | string)[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});
const img = (src: string, w: number, ht: number): Node => ({ type: 'img', props: { src, width: w, height: ht, style: { width: w, height: ht } } });

function card(w: number, ht: number, title: string, kicker: string, word: string | null, stamp: string): Node {
  const wide = w > ht;
  const big = wide ? 70 : 140;
  return h(
    'div',
    { width: w, height: ht, background: C.bg, color: C.text, fontFamily: 'Inter', flexDirection: 'column', justifyContent: 'space-between', padding: wide ? 64 : 96 },
    h('div', { alignItems: 'center', gap: 18, fontSize: wide ? 22 : 32, letterSpacing: 2, textTransform: 'uppercase', color: C.muted },
      h('div', { color: C.b }, kicker.split(' · ')[0]), h('div', {}, kicker.split(' · ')[1] ?? ''), h('div', { flexGrow: 1, height: 2, background: C.line })),
    h('div', { fontSize: big, fontWeight: 800, lineHeight: 1.0, letterSpacing: wide ? -3 : -5, whiteSpace: 'pre-wrap' }, title),
    h(
      'div',
      { flexDirection: wide ? 'row' : 'column', justifyContent: 'space-between', alignItems: wide ? 'flex-end' : 'flex-start', gap: 32 },
      h('div', { flexDirection: 'column', gap: 16 },
        word ? h('div', { alignSelf: 'flex-start', fontSize: wide ? 34 : 50, fontWeight: 800, background: C.a, border: `3px solid ${C.text}`, boxShadow: `8px 8px 0 ${C.text}`, padding: wide ? '10px 20px' : '16px 28px' }, `/${word}`) : '',
        h('div', { fontSize: wide ? 22 : 30, color: C.muted }, word && SITE ? `${SITE}/${word} · ${stamp}` : stamp),
      ),
      h('div', { flexDirection: 'column', alignItems: wide ? 'flex-end' : 'flex-start', gap: 10 },
        img(FIG, wide ? 300 : 420, wide ? 96 : 134),
        h('div', { fontSize: wide ? 24 : 32, fontWeight: 800, letterSpacing: -0.5 }, 'Vikas Banjare · AI-Floh')),
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
  const stamp = r.tested ? `Tested ${fmt(r.tested.on)} · ${r.tested.tool}` : 'Free';
  await render(card(1200, 630, r.title, `( Free ) · ${TYPE_LABEL[r.type]}`, r.codeWord, stamp), 1200, 630, join(ROOT, `public/og/${r.slug}.png`));
  await render(card(1080, 1920, r.title, `( Free ) · ${TYPE_LABEL[r.type]}`, r.codeWord, stamp), 1080, 1920, join(ROOT, `public/story/${r.slug}.png`));
}
// Site card: a still from his Google Flow film (scripts/cards/at-work.jpg, cut from public/media/day/at-work.webp)
// beside the line, so a shared link looks like the home page does.
const STILL = 'data:image/jpeg;base64,' + readFileSync(join(ROOT, 'scripts/cards/at-work.jpg')).toString('base64');
const siteCard = h(
  'div',
  { width: 1200, height: 630, background: C.bg, color: C.text, fontFamily: 'Inter' },
  h('div', { width: 520, height: 630, flexDirection: 'column', justifyContent: 'space-between', padding: 56 },
    h('div', { alignItems: 'center', gap: 14, fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', color: C.muted },
      h('div', { background: '#161518', color: C.bg, borderRadius: 999, padding: '6px 14px', fontWeight: 800, letterSpacing: 1 }, '1:15 PM'),
      h('div', { color: C.b }, 'Vikas Banjare')),
    h('div', { fontSize: 58, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2.5, whiteSpace: 'pre-wrap' }, 'I keep the craft.\nI automate the grind.'),
    h('div', { flexDirection: 'column', gap: 12 },
      h('div', { fontSize: 22, color: C.muted }, 'Designer, editor, storyteller'),
      h('div', { fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }, 'AI-Floh · free prompts and tools')),
  ),
  h('div', { width: 680, height: 630, padding: '28px 28px 28px 0' },
    { type: 'img', props: { src: STILL, width: 652, height: 574, style: { width: 652, height: 574, objectFit: 'cover', borderRadius: 28 } } }),
);
await render(siteCard, 1200, 630, join(ROOT, 'public/og/site.png'));
console.log(`make-cards: ${resources.length * 2 + 1} share cards written`);
