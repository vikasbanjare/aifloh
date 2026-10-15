// Slug, code-word and reserved-word rules (SITE-BUILD.md Sections 3 and 5).
export const SLUG_RE = /^[a-z0-9-]{1,40}$/;
export const CODEWORD_RE = /^[a-z0-9-]{3,24}$/;

export const RESERVED = new Set([
  'free', 'prompts', 'skills', 'library', 'work', 'lab', 'tools', 'code', 'play', 'studio', 'about',
  'contact', 'privacy', '404', 'files', 'og', 'story', 'assets', 'search', 'admin', 'api', 'sitemap', 'robots',
]);

export const STALE_DAYS = 90;

/** Levenshtein distance, used for "did you mean" on code words. */
export function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** Strings from the BLOCKLIST secret (comma-separated). Never stored in the repo. */
export function blocklist(env: string | undefined = process.env.BLOCKLIST): string[] {
  return (env ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function blocklistHits(text: string, list: string[]): string[] {
  const low = text.toLowerCase();
  return list.filter((w) => low.includes(w));
}
