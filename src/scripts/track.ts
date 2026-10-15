// Tracking shim (SITE-BUILD.md Section 13). Counts only; never free text, emails, names or handles.
// Does nothing when the analytics script is blocked or not configured. Never throws, never delays a click.
import { ALLOWED_PROPS, EVENTS } from '../lib/events.ts';

const EVENT_NAMES = new Set<string>(Object.values(EVENTS));

function readList(id: string): Set<string> {
  try {
    const el = document.getElementById(id);
    return new Set(el ? (JSON.parse(el.textContent || '[]') as string[]) : []);
  } catch {
    return new Set();
  }
}
const SLUGS = readList('track-slugs');
const INTENTS = readList('track-intents');

function clean(props: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(props)) {
    const rule = ALLOWED_PROPS[k];
    if (!rule || typeof v !== 'string') continue;
    if (rule === 'slug' ? /^[a-z0-9-]{1,40}$/.test(v) && SLUGS.has(v) : rule === 'intent' ? INTENTS.has(v) : rule.test(v)) out[k] = v;
  }
  return out;
}

export function track(name: string, props: Record<string, string> = {}): void {
  try {
    if (!EVENT_NAMES.has(name)) return;
    const p = clean(props);
    const w = window as any;
    if (typeof w.plausible === 'function') w.plausible(name, Object.keys(p).length ? { props: p } : undefined);
    else if (w.umami && typeof w.umami.track === 'function') w.umami.track(name, p);
  } catch {
    /* analytics must never break the page */
  }
}

// One delegated listener for [data-track]. Counts the click, not clipboard success.
document.addEventListener(
  'click',
  (e) => {
    const el = (e.target as Element | null)?.closest?.('[data-track]') as HTMLElement | null;
    if (!el) return;
    const props: Record<string, string> = {};
    for (const [k, v] of Object.entries(el.dataset)) {
      if (k.startsWith('track') && k !== 'track' && v) props[k.slice(5).toLowerCase()] = v;
    }
    track(el.dataset.track || '', props);
  },
  { capture: true, passive: true },
);

// In-app browser detection, once per load (also used by pages through the class on <html>).
const ua = navigator.userAgent || '';
const app = /Instagram/i.test(ua) ? 'instagram' : /FBAN|FBAV/.test(ua) ? 'facebook' : /LinkedInApp/i.test(ua) ? 'linkedin' : /Twitter|\bX\//.test(ua) ? 'x' : '';
if (app) {
  document.documentElement.classList.add('in-app');
  document.documentElement.dataset.app = app;
  track(EVENTS.inAppBrowser, { app });
}

(window as any).aiflohTrack = track;
