// Content and rules check. Step 1 covers the privacy rule on browser storage;
// Step 2 adds the content schemas and build gates (SITE-BUILD.md Section 5).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'public'];
const EXTS = new Set(['.astro', '.ts', '.js', '.mjs', '.html', '.css']);
const FORBIDDEN = [
  [/\blocalStorage\b/, 'localStorage'],
  [/\bsessionStorage\b/, 'sessionStorage'],
  [/\bindexedDB\b/, 'IndexedDB'],
  [/document\.cookie/, 'document.cookie'],
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXTS.has(extname(p))) yield p;
  }
}

const problems = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8');
    for (const [re, label] of FORBIDDEN) {
      if (re.test(text)) problems.push(`${file}: uses ${label}. The site may not store anything in the browser (SITE-BUILD.md Section 1).`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('check-content: ok');
