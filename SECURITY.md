# Security

This is a static site on GitHub Pages. There is no server, no login, no database and no cookies.

## What protects it

- **Content-Security-Policy** on every page (a `<meta>` tag; Pages cannot send headers). Only this
  site's own scripts and styles run, each pinned by a SHA-256 hash Astro computes at build time.
  No inline `style=""` attributes, no `eval`, no third-party hosts, `object-src 'none'`, `base-uri 'self'`.
  The e2e suite fails on any CSP violation.
- **Escaped data in pages.** JSON embedded in `<script>` tags goes through `safeJson()`, so text such as
  `</script>` in a title cannot break out (unit test in `tests/json.test.ts`).
- **Sanitised markdown.** Fetched READMEs are untrusted: no scripts, iframes, forms, styles or remote images.
- **Build pipeline.** Actions pinned to commit SHAs, workflow token read-only, only the deploy job may
  write to Pages, checkout does not keep credentials, `npm ci --ignore-scripts`, pull requests never deploy.
- **Repo hygiene.** No secrets in the repo. The private inventory file is blocked by `.gitignore`.
  The `BLOCKLIST` secret (if set) fails the build when a listed string appears in the output.

## Known limits

- GitHub Pages cannot send `frame-ancestors`, `X-Frame-Options` or HSTS headers. Turn on
  "Enforce HTTPS" in the Pages settings; for frame protection the site would need a CDN in front.

## Owner actions (cannot be done from code)

- Rotate the admin key that appears in the ContentIntel repo's README, then remove it from that README.
- Add the `BLOCKLIST` repository secret.
- Tick "Enforce HTTPS" once GitHub has issued the certificate.

Report a problem: vikas.banjare@gmail.com
