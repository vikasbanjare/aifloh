// npm run check: content schemas and gates (SITE-BUILD.md Section 5) plus the privacy rules (Section 1).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { loadContent } from '../src/lib/content.ts';
import { blocklist, blocklistHits } from '../src/lib/rules.ts';

const problems: string[] = [];

// 1. Manifests
const c = loadContent();
problems.push(...c.errors);
for (const w of c.warnings) console.warn(`warning: ${w}`);

function* walk(dir: string, exts: Set<string>): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p, exts);
    else if (exts.has(extname(p))) yield p;
  }
}

// 2. No browser storage, no third-party requests baked into source
const STORAGE: [RegExp, string][] = [
  [/\blocalStorage\b/, 'localStorage'],
  [/\bsessionStorage\b/, 'sessionStorage'],
  [/\bindexedDB\b/, 'IndexedDB'],
  [/document\.cookie/, 'document.cookie'],
];
for (const root of ['src', 'public']) {
  for (const file of walk(root, new Set(['.astro', '.ts', '.js', '.mjs', '.html', '.css']))) {
    const text = readFileSync(file, 'utf8');
    for (const [re, label] of STORAGE) {
      if (re.test(text)) problems.push(`${file}: uses ${label}. The site may not store anything in the browser (Section 1).`);
    }
  }
}

// 3. Remote images inside markdown bodies
for (const file of walk('content', new Set(['.md']))) {
  const text = readFileSync(file, 'utf8');
  if (/!\[[^\]]*\]\((https?:)?\/\//.test(text) || /<img[^>]+src=["'](https?:)?\/\//i.test(text)) {
    problems.push(`${file}: remote image. Self-host it under public/ instead.`);
  }
}

// 4. BLOCKLIST on content (the build checks the generated output too)
const list = blocklist();
if (list.length) {
  for (const file of walk('content', new Set(['.md', '.yml', '.yaml', '.json']))) {
    const hits = blocklistHits(readFileSync(file, 'utf8'), list);
    if (hits.length) problems.push(`${file}: contains a BLOCKLIST string (${hits.length} hit${hits.length > 1 ? 's' : ''}).`);
  }
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  console.error(`\ncheck-content: ${problems.length} problem(s).`);
  process.exit(1);
}
console.log(
  `check-content: ok · ${c.resources.length} resources, ${c.tools.length} tools, ${c.experiments.length} experiments, ${c.work.length} work, ${c.repos.length} repos`,
);
