// Public, non-secret settings read at build time. Analytics is wired in Step 4.
export const DEPLOY_TARGET = import.meta.env.DEPLOY_TARGET ?? 'github-pages';
export const ANALYTICS_TOOL = import.meta.env.ANALYTICS_TOOL ?? 'none';
export const ANALYTICS_SRC = import.meta.env.ANALYTICS_SRC ?? '';
export const ANALYTICS_DOMAIN = import.meta.env.ANALYTICS_DOMAIN ?? '';

export const SITE_NAME = 'AI-Floh';
export const GITHUB_URL = 'https://github.com/vikasbanjare';
export const BEHANCE_URL = 'https://www.behance.net/vikas-banjare';

// Handles are not supplied yet ([CONFIRM] in SITE-BUILD.md Section 16).
// url stays null until a real handle exists; the footer then shows a STAND-IN label.
export const SOCIALS: { platform: string; label: string; url: string | null }[] = [
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/vikasbanjare/' },
  { platform: 'instagram', label: 'Instagram', url: null },
  { platform: 'threads', label: 'Threads', url: null },
  { platform: 'x', label: 'X', url: null },
  { platform: 'facebook', label: 'Facebook', url: null },
  { platform: 'youtube', label: 'YouTube', url: null },
];
