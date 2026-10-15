// Gates on the generated output (SITE-BUILD.md Section 1): BLOCKLIST over every HTML, JSON, XML, text
// and SVG file and inside every zip; no remote images; a listed GitHub item must not be missing in CI.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { parse as parseYaml } from 'yaml';
import { blocklist, blocklistHits } from '../src/lib/rules.ts';

const DIST = join(process.cwd(), 'dist');
const problems: string[] = [];
const list = blocklist();
const TEXT = new Set(['.html', '.json', '.xml', '.txt', '.svg', '.js', '.css', '.md']);

function* walk(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

for (const file of walk(DIST)) {
  const ext = extname(file);
  const rel = file.slice(DIST.length);
  if (TEXT.has(ext)) {
    const text = readFileSync(file, 'utf8');
    const hits = blocklistHits(text, list);
    if (hits.length) problems.push(`${rel}: BLOCKLIST hit (${hits.length}).`);
    if (ext === '.html' && /<img[^>]+src=["'](https?:)?\/\//i.test(text)) problems.push(`${rel}: remote image in HTML.`);
  } else if (ext === '.zip' && list.length) {
    for (const [name, data] of Object.entries(unzipSync(readFileSync(file)))) {
      if (blocklistHits(strFromU8(data), list).length) problems.push(`${rel}!${name}: BLOCKLIST hit inside zip.`);
    }
  }
}

if (process.env.CI) {
  const listed = (parseYaml(readFileSync('content/sources.yml', 'utf8')).items as { publish: boolean }[]).filter((i) => i.publish);
  if (listed.length && !existsSync('.generated/github.json')) problems.push('content/sources.yml lists items but .generated/github.json is missing. Run npm run fetch:github first.');
  if (!list.length) console.warn('postbuild: BLOCKLIST secret is not set; the employer/client name gate is not active.');
}

if (problems.length) {
  console.error(problems.map((p) => `✗ ${p}`).join('\n'));
  process.exit(1);
}
console.log(`postbuild: ok${list.length ? ` (BLOCKLIST: ${list.length} strings checked)` : ' (no BLOCKLIST set)'}`);
