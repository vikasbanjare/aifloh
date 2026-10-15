import { loadContent, TYPE_LABEL } from './content.ts';

export interface LibItem { kind: string; title: string; summary: string; url: string; year: number; tools: string[] }

/** Everything published, in one list. URLs are site-absolute paths (prefix with href()). */
export function libraryItems(): LibItem[] {
  const c = loadContent();
  return [
    ...c.resources.map((r) => ({ kind: TYPE_LABEL[r.type], title: r.title, summary: r.summary, url: `/free/${r.slug}/`, year: r.date.getUTCFullYear(), tools: r.tools })),
    ...c.tools.map((t) => ({ kind: 'Tool', title: t.title, summary: t.summary, url: `/tools/${t.slug}/`, year: t.date.getUTCFullYear(), tools: t.tools })),
    ...c.experiments.map((e) => ({ kind: 'Experiment', title: e.title, summary: e.summary, url: `/lab/${e.slug}/`, year: e.date.getUTCFullYear(), tools: e.tools })),
    ...c.work.map((w) => ({ kind: 'Work', title: w.title, summary: w.summary, url: `/work/${w.slug}/`, year: w.date.getUTCFullYear(), tools: w.tools })),
    ...c.repos.map((r) => ({ kind: 'Repo', title: r.title, summary: r.summary, url: r.readmeHtml ? `/code/${r.slug}/` : '/code/', year: new Date(r.pushedAt).getUTCFullYear(), tools: r.builtWith })),
  ];
}
