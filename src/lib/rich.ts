const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Turns content strings into safe HTML.
 *   *text*   → <em>
 *   [[text]] → visible placeholder marker
 */
export function rich(input: string): string {
  return escape(input)
    .replace(/\[\[(.+?)\]\]/g, '<span class="ph" title="Placeholder — replace in src/content/site.ts">$1</span>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Plain text version (for alt text, meta tags, aria labels). */
export function plain(input: string): string {
  return input.replace(/\[\[(.+?)\]\]/g, '$1').replace(/\*(.+?)\*/g, '$1');
}

export const isPlaceholder = (s: string) => s.includes('[[');

/** Links whose URL is still a placeholder point to the contact section instead of a broken URL. */
export const safeHref = (href: string) => (isPlaceholder(href) ? '#contact' : href);

/** Prefix internal paths with the configured base (needed for GitHub Pages project sites). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
