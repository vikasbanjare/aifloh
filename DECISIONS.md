# Decisions

One line per decision made without asking (SITE-BUILD.md Section 0, rule 5).

- 2026-10-15 · Step 1 · Astro pinned to 7.3.5 (latest stable 7.3.8 is a week old; 7.3.5 is three weeks old). TypeScript pinned to 5.9.3 because @astrojs/check 0.9.10 supports TypeScript 5 or 6, not 7.
- 2026-10-15 · Step 1 · The repo is named `aifloh`, not `aifloh-site`, so the GitHub Pages preview lives at /aifloh/ and the preview build uses BASE_PATH=/aifloh/. The build was also verified with BASE_PATH=/aifloh-site/ as the guide asks.
- 2026-10-15 · Step 1 · No /design export was in the repo, so tokens.css holds STAND-IN color, type and spacing values. Motion tokens are final (Section 6). Swap in /design tokens when the export lands.
- 2026-10-15 · Step 1 · Fonts: Inter (variable, Latin and Latin Extended) as the STAND-IN text face, Noto Sans Devanagari (variable) for Hindi lines. Two families, the cap in Section 14. Both SIL OFL 1.1, self-hosted from /public/fonts, licences alongside. Inter Latin is preloaded; a metric-matched Arial fallback (size-adjust) avoids layout shift.
- 2026-10-15 · Step 1 · Hosting defaults to Path A (GitHub Pages) per Section 15 until Vikas decides. DEPLOY_TARGET=github-pages, ANALYTICS_TOOL=none.
- 2026-10-15 · Step 1 · The nav search icon links to /library, where static search will live (Section 11).
- 2026-10-15 · Step 1 · `npm run check` currently runs `astro check` plus a scan that fails on localStorage, sessionStorage, IndexedDB or document.cookie in src/ or public/. Content schemas and gates join it in Step 2. The new:* scaffolders exit with a message until Step 2.
- 2026-10-15 · Step 8 prep · content/sources.yml lists every public repo that is safe to show (Show list at publish: true, Hold list at publish: false) plus 11 skills from the planned aifloh-skills repo, all at publish: false until that repo exists. Repos that are unsafe to show are left out of the file entirely, as Section 9 requires (opt-in only, never "all repos").
