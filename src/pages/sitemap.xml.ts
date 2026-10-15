import { loadContent } from '../lib/content';
// Code-word pages are excluded on purpose (they are noindex redirects).
export function GET({ site }: { site: URL }) {
  const base = import.meta.env.BASE_URL;
  const c = loadContent();
  const paths = [
    '/', '/free/', '/prompts/image/', '/prompts/video/', '/skills/', '/tools/', '/work/', '/lab/', '/code/', '/library/', '/studio/', '/about/', '/contact/', '/privacy/',
    ...c.resources.map((r) => `/free/${r.slug}/`),
    ...c.tools.map((t) => `/tools/${t.slug}/`),
    ...c.experiments.map((e) => `/lab/${e.slug}/`),
    ...c.work.map((w) => `/work/${w.slug}/`),
    ...c.repos.filter((r) => r.readmeHtml).map((r) => `/code/${r.slug}/`),
  ];
  const urls = paths.map((p) => `<url><loc>${new URL(base.replace(/\/$/, '') + p, site).toString()}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
