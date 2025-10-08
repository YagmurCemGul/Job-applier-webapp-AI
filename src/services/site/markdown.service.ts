/**
 * @fileoverview Minimal Markdown to HTML converter (safe, client-side).
 * @module services/site/markdown
 */

/**
 * Convert Markdown to HTML (safe for client).
 * Supports: headings, paragraphs, lists, links, code blocks.
 * Escapes all HTML to prevent XSS.
 */
export function mdToHtml(md: string): string {
  const esc = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (m) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;',
        })[m]!
    );

  return md
    .split('\n\n')
    .map((block) => {
      // Headings
      if (/^#{1,6}\s/.test(block)) {
        const m = block.match(/^(#{1,6})\s(.+)/)!;
        const lvl = m[1].length;
        return `<h${lvl}>${esc(m[2])}</h${lvl}>`;
      }
      // Unordered lists
      if (/^-\s/m.test(block)) {
        const items = block
          .split('\n')
          .map((l) => l.replace(/^-+\s*/, '').trim())
          .filter(Boolean);
        return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
      }
      // Ordered lists
      if (/^\d+\.\s/m.test(block)) {
        const items = block
          .split('\n')
          .map((l) => l.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);
        return `<ol>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ol>`;
      }
      // Code blocks
      if (/^```/.test(block)) {
        return `<pre><code>${esc(block.replace(/^```.*\n?/, '').replace(/```$/, ''))}</code></pre>`;
      }
      // Paragraphs
      return `<p>${esc(block)}</p>`;
    })
    .join('\n')
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_, $1, $2) =>
        `<a href="${$2}" rel="noopener noreferrer" target="_blank">${$1}</a>`
    );
}

/**
 * Extract plain text from Markdown (no formatting).
 */
export function mdToText(md: string): string {
  return md
    .replace(/^#{1,6}\s/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim();
}

/**
 * Generate excerpt from Markdown (first ~160 chars).
 */
export function mdToExcerpt(md: string, maxLength = 160): string {
  const text = mdToText(md);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '…';
}