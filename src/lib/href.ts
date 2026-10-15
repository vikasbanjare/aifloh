/**
 * Build every internal link through this helper so a preview served under a
 * sub-path (for example /aifloh/ on GitHub Pages) keeps working.
 * Pass a site-absolute path such as "/free" or "/free/my-slug#copy".
 */
export function joinBase(base: string, path: string): string {
  const b = base.endsWith('/') ? base : `${base}/`;
  const p = path.replace(/^\/+/, '');
  return `${b}${p}`;
}

export function href(path: string = '/'): string {
  return joinBase(import.meta.env.BASE_URL, path);
}
