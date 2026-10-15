import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';

const md = new MarkdownIt({ html: true, linkify: true, typographer: false });

/** Local, trusted markdown (our own content folder). Still sanitised: cheap insurance. */
export function renderLocal(src: string): string {
  return sanitizeHtml(md.render(src), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'width', 'height', 'loading'] },
    allowedSchemesByTag: { img: [] }, // only relative image paths
  });
}

/**
 * Fetched README markdown is untrusted (SITE-BUILD.md Section 9): no script, iframe, form, style
 * or on* attributes, no remote images, links open safely. Relative links point at the repo on GitHub.
 */
export function renderUntrusted(src: string, repoUrl: string, branch: string): string {
  const html = md.render(src);
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.filter((t) => !['img', 'iframe', 'style', 'script', 'form'].includes(t)),
    allowedAttributes: { a: ['href', 'title', 'rel', 'target'], code: ['class'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => {
        let href = attribs.href ?? '';
        if (href && !/^[a-z]+:/i.test(href) && !href.startsWith('#')) {
          href = `${repoUrl}/blob/${branch}/${href.replace(/^\.?\//, '')}`;
        }
        return { tagName, attribs: { ...attribs, href, rel: 'noopener noreferrer' } };
      },
    },
    exclusiveFilter: (frame) => frame.tag === 'a' && !frame.text.trim(),
  });
}

export function plainExcerpt(html: string, max = 600): string {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s\S*$/, '')}…` : text;
}
