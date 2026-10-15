# AI-Floh site

Static site for AI-Floh, built with Astro. SITE-BUILD.md is the source of truth; read it first.

```
npm ci
npm run dev        # local server
npm run check      # typecheck + content and privacy rules
npm test           # unit tests
npm run build      # static output in dist/
BASE_PATH=/aifloh/ npm run build   # build for the GitHub Pages preview sub-path
```

Settings are environment variables; see `.env.example`. Nothing secret lives in this repo.
