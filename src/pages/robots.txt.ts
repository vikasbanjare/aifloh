export function GET({ site }: { site: URL }) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(`${base}/sitemap.xml`, site)}\n`, { headers: { 'Content-Type': 'text/plain' } });
}
