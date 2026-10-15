// Loads every manifest, validates it, and applies the publish gates.
// Used by the Astro pages at build time and by `npm run check`.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { resourceSchema, toolSchema, experimentSchema, workSchema } from './schema.ts';
import type { Resource, Tool, Experiment, Work } from './schema.ts';
import { RESERVED } from './rules.ts';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'content');

export interface RepoItem {
  repo: string;
  slug: string;
  group: 'tool' | 'experiment' | 'skills' | 'site';
  name: string;
  title: string;
  summary: string;
  status: string;
  htmlUrl: string;
  homepage?: string;
  language?: string;
  languages: Record<string, number>;
  topics: string[];
  pushedAt: string;
  license?: string;
  builtWith: string[];
  readmeExcerpt: string;
  readmeHtml: string;
  private: boolean;
}

export interface SiteContent {
  resources: Resource[];
  tools: Tool[];
  experiments: Experiment[];
  work: Work[];
  repos: RepoItem[];
  errors: string[];
  warnings: string[];
}

function splitFrontmatter(raw: string): { data: unknown; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  return { data: parseYaml(m[1]), body: m[2].trim() };
}

function readDir(dir: string): { file: string; data: Record<string, unknown>; body: string }[] {
  const full = join(CONTENT, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
    .sort()
    .map((f) => {
      const file = `content/${dir}/${f}`;
      try {
        const { data, body } = splitFrontmatter(readFileSync(join(full, f), 'utf8'));
        return { file, data: (data ?? {}) as Record<string, unknown>, body };
      } catch (e) {
        return { file, data: { __yamlError: (e as Error).message.split('\n')[0] }, body: '' };
      }
    });
}

function fmtIssues(file: string, issues: { path: PropertyKey[]; message: string }[]): string[] {
  return issues.map((i) => `${file}: ${i.path.map(String).join('.') || '(root)'}: ${i.message}`);
}

/** Publish gate: publish true, approval not pending, employer work only when approved. */
export function isPublic(item: { publish: boolean; approval: { status: string }; employer?: boolean }): boolean {
  if (!item.publish) return false;
  if (item.approval.status === 'pending') return false;
  if (item.employer && item.approval.status !== 'approved') return false;
  return true;
}

function loadGenerated(): { repos: any[] } | null {
  const p = join(ROOT, '.generated', 'github.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}

const SKILL_INTENT: Record<string, string> = {
  design: 'design with Claude',
  prompts: 'write image and video prompts',
  writing: 'write posts people finish',
};

let cache: SiteContent | null = null;

export function loadContent(opts: { fresh?: boolean } = {}): SiteContent {
  if (cache && !opts.fresh) return cache;
  const errors: string[] = [];
  const warnings: string[] = [];

  const parseAll = <T>(dir: string, schema: { safeParse: (v: unknown) => any }, kind: string, bodyKey: string): T[] => {
    const out: T[] = [];
    for (const { file, data, body } of readDir(dir)) {
      if ((data as any).__yamlError) {
        errors.push(`${file}: frontmatter is not valid YAML: ${(data as any).__yamlError}`);
        continue;
      }
      const res = schema.safeParse({ kind, ...data, [bodyKey]: (data as any)[bodyKey] ?? body });
      if (res.success) out.push(res.data as T);
      else errors.push(...fmtIssues(file, res.error.issues));
    }
    return out;
  };

  const resources = parseAll<Resource>('resources', resourceSchema, 'resource', 'howTo');
  const tools = parseAll<Tool>('tools', toolSchema, 'tool', 'body');
  const experiments = parseAll<Experiment>('lab', experimentSchema, 'experiment', 'body');
  const work = parseAll<Work>('work', workSchema, 'work', 'body');

  // GitHub items (fetched at build time by scripts/fetch-github.ts)
  const repos: RepoItem[] = [];
  const gen = loadGenerated();
  if (!gen) warnings.push('No .generated/github.json yet. Run `npm run fetch:github`. GitHub items are left out of this build.');
  for (const r of gen?.repos ?? []) {
    if (r.group === 'skills' && r.skill) {
      const meta = r.meta ?? {};
      const set = (meta.tags ?? []).find((t: string) => SKILL_INTENT[t]) ?? 'design';
      const res = resourceSchema.safeParse({
        kind: 'resource',
        type: 'skill',
        slug: r.path,
        title: meta.title ?? r.skill.name,
        summary: meta.summary ?? String(r.skill.description).slice(0, 140),
        status: meta.status ?? 'live',
        date: r.pushedAt,
        tags: meta.tags ?? [],
        tools: meta.tools ?? ['Claude'],
        publish: meta.publish === true,
        approval: meta.approval ?? { status: 'own' },
        codeWord: meta.codeWord,
        intent: SKILL_INTENT[set],
        tested: meta.tested?.on ? meta.tested : undefined,
        body: r.skill.text,
        links: { repo: r.htmlUrl },
        skill: {
          skillPath: `${r.repo}/${r.path}`,
          installNote: 'Add it to Claude as a skill. The steps are in Anthropic’s current skills documentation.',
          useWhen: r.skill.description,
          fileCount: r.skill.fileCount,
          bytes: r.skill.bytes,
          zip: r.skill.zip,
        },
        howTo: '',
      });
      if (res.success) resources.push(res.data);
      else errors.push(...fmtIssues(`github:${r.repo}/${r.path}/aifloh.yml`, res.error.issues));
      continue;
    }
    const meta = r.meta ?? {};
    if (meta.publish === false) continue;
    repos.push({
      repo: r.repo,
      slug: r.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 40),
      group: r.group,
      name: r.name,
      title: meta.title ?? r.name,
      summary: (meta.summary ?? r.description ?? '').slice(0, 140),
      status: meta.status ?? (r.archived ? 'archived' : 'live'),
      htmlUrl: r.htmlUrl,
      homepage: r.homepage || undefined,
      language: r.language ?? undefined,
      languages: r.languages ?? {},
      topics: r.topics ?? [],
      pushedAt: r.pushedAt,
      license: r.license ?? undefined,
      builtWith: meta.builtWith ?? [],
      readmeExcerpt: r.private ? '' : (r.readmeExcerpt ?? ''),
      readmeHtml: r.private ? '' : (r.readmeHtml ?? ''),
      private: !!r.private,
    });
  }

  // Cross-item rules
  const words = new Map<string, string>();
  const slugs = new Set(resources.map((r) => r.slug));
  for (const r of resources) {
    if (RESERVED.has(r.codeWord)) errors.push(`resource ${r.slug}: code word "${r.codeWord}" is a reserved word`);
    if (words.has(r.codeWord)) errors.push(`resource ${r.slug}: code word "${r.codeWord}" is already used by ${words.get(r.codeWord)}`);
    words.set(r.codeWord, r.slug);
    if (slugs.has(r.codeWord) && r.codeWord !== r.slug) errors.push(`resource ${r.slug}: code word "${r.codeWord}" equals the slug of another resource`);
    if (r.tested && r.tested.on.getTime() > Date.now()) errors.push(`resource ${r.slug}: tested date is in the future`);
  }
  const dupes = (items: { slug: string }[], kind: string) => {
    const seen = new Set<string>();
    for (const i of items) {
      if (seen.has(i.slug)) errors.push(`${kind} ${i.slug}: duplicate slug`);
      seen.add(i.slug);
    }
  };
  dupes(resources, 'resource');
  dupes(tools, 'tool');
  dupes(experiments, 'experiment');
  dupes(work, 'work');

  cache = {
    resources: resources.filter(isPublic).sort((a, b) => b.date.getTime() - a.date.getTime()),
    tools: tools.filter(isPublic),
    experiments: experiments.filter(isPublic).sort((a, b) => b.date.getTime() - a.date.getTime()),
    work: work.filter(isPublic).sort((a, b) => b.date.getTime() - a.date.getTime()),
    repos,
    errors,
    warnings,
  };
  return cache;
}

export const TYPE_LABEL: Record<Resource['type'], string> = {
  'prompt-image': 'Image prompt',
  'prompt-video': 'Video prompt',
  skill: 'Claude skill',
  template: 'Template',
  'cheat-sheet': 'Cheat sheet',
  guide: 'Guide',
};

/** The text a visitor copies from a resource. */
export function copyText(r: Resource): string {
  if (r.image) return r.image.prompt;
  if (r.video) return r.video.prompt.en;
  return r.body;
}
