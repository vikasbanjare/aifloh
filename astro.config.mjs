// @ts-check
import { defineConfig } from 'astro/config';

// All deploy settings come from env (see .env.example). BASE_PATH lets the same
// build run at the domain root or under a GitHub Pages project sub-path.
const SITE_URL = process.env.SITE_URL || 'http://localhost:4321';
const rawBase = process.env.BASE_PATH || '/';
const BASE_PATH = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  prefetch: false,
  // Content-Security-Policy as a <meta> tag on every page (GitHub Pages cannot send headers).
  // Astro hashes every script and stylesheet it emits, so nothing else can run.
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ],
    },
  },
});
