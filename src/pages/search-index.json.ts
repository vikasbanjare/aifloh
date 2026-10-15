// Static search index, fetched by /library only when the search box is focused. No external service.
import { libraryItems } from '../lib/library';
export function GET() {
  const items = libraryItems().map((i) => ({ k: i.kind, t: i.title, s: i.summary, u: i.url, y: i.year, o: i.tools }));
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
}
