# QA log

## Step 1 · 15 Oct 2026 · automated, in the build container

- `npm run build` passes with BASE_PATH=/, /aifloh/ and /aifloh-site/. Every internal link, the stylesheet, the font URLs inside CSS and the font preload carry the base path.
- Lighthouse 13.5 (Chromium, sub-path build served statically):

| Page | Form factor | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|
| / | mobile | 100 | 100 | 100 | 100 |
| / | desktop | 100 | 100 | 100 | 100 |
| /free | mobile | 99 | 100 | 100 | 100 |
| /free | desktop | 100 | 100 | 100 | 100 |

- 390 px (mobile emulation): no horizontal scroll, Free stays visible and highlighted in the nav.
- Zero cookies and zero localStorage keys after load. No script tags on either page.

Manual device checks (iPhone, Android, in-app browsers) start at Step 6, once there is a preview URL.
