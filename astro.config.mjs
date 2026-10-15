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
});
