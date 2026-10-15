// Build-time GitHub fetch (SITE-BUILD.md Section 9). The browser never calls GitHub.
// Reads content/sources.yml, fetches only items with publish: true, writes .generated/github.json
// and builds skill zips into public/files/skills/.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { parse as parseYaml } from 'yaml';
import { zipSync } from 'fflate';
import { renderUntrusted, plainExcerpt } from '../src/lib/markdown.ts';

const ROOT = process.cwd();
const GEN = join(ROOT, '.generated');
const CLONES = join(GEN, 'clones');
const ZIPS = join(ROOT, 'public', 'files', 'skills');
const CI = !!process.env.CI;
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_READ_TOKEN || '';

interface Source {
  repo: string;
  path?: string;
  group: 'tool' | 'experiment' | 'skills' | 'site';
  publish: boolean;
  allowPrivate?: boolean;
  readme?: boolean;
}

const sources = (parseYaml(readFileSync(join(ROOT, 'content', 'sources.yml'), 'utf8')).items as Source[]).filter((s) => s.publish === true);
mkdirSync(CLONES, { recursive: true });
rmSync(ZIPS, { recursive: true, force: true });
mkdirSync(ZIPS, { recursive: true });

const fail = (msg: string): never => {
  console.error(`fetch-github: ${msg}`);
  process.exit(1);
};

async function api(path: string): Promise<any | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'aifloh-site-build' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://api.github.com${path}`, { headers });
    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 1500));
      continue;
    }
    if (!res.ok) return null;
    return res.json();
  }
  return null;
}

const cloned = new Map<string, string>();
function clone(repo: string): string {
  if (cloned.has(repo)) return cloned.get(repo)!;
  const dir = join(CLONES, repo.replace('/', '__'));
  rmSync(dir, { recursive: true, force: true });
  try {
    execFileSync('git', ['clone', '--quiet', '--depth', '1', `https://github.com/${repo}.git`, dir], {
      stdio: ['ignore', 'ignore', 'pipe'],
      env: { ...process.env, GIT_LFS_SKIP_SMUDGE: '1', GIT_TERMINAL_PROMPT: '0' },
    });
  } catch {
    fail(`listed item ${repo} could not be fetched. It may have been renamed, deleted or made private.`);
  }
  cloned.set(repo, dir);
  return dir;
}

function gitDate(dir: string): string {
  return execFileSync('git', ['-C', dir, 'log', '-1', '--format=%cI'], { encoding: 'utf8' }).trim();
}
function gitBranch(dir: string): string {
  return execFileSync('git', ['-C', dir, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
}

function readYaml(p: string): any {
  return existsSync(p) ? (parseYaml(readFileSync(p, 'utf8')) ?? {}) : {};
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

const out: any[] = [];
const metaCache = new Map<string, any>();

for (const s of sources) {
  const htmlUrl = `https://github.com/${s.repo}`;
  let meta = metaCache.get(s.repo);
  if (meta === undefined) {
    meta = await api(`/repos/${s.repo}`);
    if (meta) meta.languagesMap = (await api(`/repos/${s.repo}/languages`)) ?? {};
    metaCache.set(s.repo, meta);
  }
  if (!meta && CI) fail(`GitHub API returned nothing for ${s.repo}.`);
  if (meta?.private && !s.allowPrivate) fail(`${s.repo} is private. Set allowPrivate: true in content/sources.yml (and GH_READ_TOKEN) or remove it.`);

  if (meta?.private) {
    out.push({ repo: s.repo, group: s.group, name: meta.name, private: true, description: meta.description ?? '', htmlUrl, pushedAt: meta.pushed_at, meta: {} });
    continue;
  }

  const dir = clone(s.repo);
  const branch = meta?.default_branch ?? gitBranch(dir);
  const base = {
    repo: s.repo,
    group: s.group,
    name: meta?.name ?? s.repo.split('/')[1],
    description: meta?.description ?? '',
    topics: meta?.topics ?? [],
    language: meta?.language ?? null,
    languages: meta?.languagesMap ?? {},
    pushedAt: meta?.pushed_at ?? gitDate(dir),
    defaultBranch: branch,
    license: meta?.license?.spdx_id ?? null,
    archived: meta?.archived ?? false,
    homepage: meta?.homepage ?? null,
    htmlUrl,
    private: false,
  };

  if (s.group === 'skills') {
    if (!s.path) fail(`${s.repo}: a skills item needs a path (one folder per skill).`);
    const folder = join(dir, s.path!);
    const skillMd = join(folder, 'SKILL.md');
    if (!existsSync(skillMd)) fail(`${s.repo}/${s.path}: SKILL.md is missing.`);
    const text = readFileSync(skillMd, 'utf8');
    const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const front = fm ? parseYaml(fm[1]) : {};
    const files = walkFiles(folder).filter((f) => !f.endsWith('aifloh.yml'));
    const entries: Record<string, Uint8Array> = {};
    let bytes = 0;
    for (const f of files) {
      const data = readFileSync(f);
      bytes += data.length;
      entries[`${s.path}/${relative(folder, f)}`] = new Uint8Array(data);
    }
    writeFileSync(join(ZIPS, `${s.path}.zip`), zipSync(entries, { level: 9, mtime: new Date('2026-01-01') }));
    out.push({
      ...base,
      path: s.path,
      meta: readYaml(join(folder, 'aifloh.yml')),
      skill: {
        name: front.name ?? s.path,
        description: String(front.description ?? ''),
        text,
        fileCount: files.length,
        bytes,
        zip: `/files/skills/${s.path}.zip`,
      },
    });
    continue;
  }

  let readmeHtml = '';
  if (s.readme !== false) {
    const readmeFile = readdirSync(dir).find((f) => /^readme\.md$/i.test(f));
    if (readmeFile) readmeHtml = renderUntrusted(readFileSync(join(dir, readmeFile), 'utf8'), htmlUrl, branch);
  }
  out.push({
    ...base,
    path: s.path,
    meta: readYaml(join(dir, s.path ?? '', 'aifloh.yml')),
    readmeHtml,
    readmeExcerpt: plainExcerpt(readmeHtml),
  });
}

// Never let a section vanish silently: compare with the last good snapshot (kept in the CI cache).
const snapPath = join(GEN, 'github.json');
if (existsSync(snapPath)) {
  const prev = JSON.parse(readFileSync(snapPath, 'utf8')).repos?.length ?? 0;
  if (prev > 0 && out.length < prev * 0.8) fail(`${prev - out.length} of ${prev} items vanished since the last good run (more than 20%). Check content/sources.yml.`);
}
writeFileSync(snapPath, JSON.stringify({ fetchedAt: new Date().toISOString(), repos: out }, null, 1));
console.log(`fetch-github: ${out.length} item(s) written to .generated/github.json${meta() }`);
function meta() {
  return TOKEN ? '' : ' (no token: repo metadata came from git where the API was unavailable)';
}
