/**
 * @fileoverview SEO utilities for portfolio sites.
 * @module services/site/seo
 */

/**
 * Convert a string to a URL-safe slug (max 80 chars).
 */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

interface MetaOptions {
  title: string;
  description?: string;
  url?: string;
  ogImageUrl?: string;
  noAI?: boolean;
}

/**
 * Build HTML meta tags (title, description, Open Graph, Twitter cards).
 */
export function buildMeta(opts: MetaOptions): string {
  const meta = [
    `<title>${escapeHtml(opts.title)}</title>`,
    `<meta name="description" content="${escapeHtml(opts.description ?? '')}">`,
    `<meta property="og:title" content="${escapeHtml(opts.title)}">`,
    `<meta property="og:description" content="${escapeHtml(opts.description ?? '')}">`,
    opts.ogImageUrl
      ? `<meta property="og:image" content="${opts.ogImageUrl}">`
      : '',
    opts.url ? `<meta property="og:url" content="${opts.url}">` : '',
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(opts.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(opts.description ?? '')}">`,
    opts.noAI ? `<meta name="robots" content="noai, noimageai">` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return meta;
}

/**
 * Escape HTML entities for safe rendering.
 */
function escapeHtml(s: string): string {
  return s.replace(
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
}

/**
 * Build an XML sitemap from a list of slugs.
 */
export function buildSitemap(baseUrl: string, slugs: string[]): string {
  const cleanBase = baseUrl.replace(/\/$/, '');
  const urls = slugs
    .map(
      (s) =>
        `  <url>\n    <loc>${cleanBase}/${s}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

/**
 * Build robots.txt content.
 */
export function buildRobotsTxt(sitemapUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}`;
}

/**
 * Validate SEO best practices.
 */
export interface SEOValidation {
  valid: boolean;
  warnings: string[];
}

export function validateSEO(opts: {
  title: string;
  description?: string;
  slug?: string;
}): SEOValidation {
  const warnings: string[] = [];
  if (opts.title.length > 60) warnings.push('Title exceeds 60 characters');
  if (opts.title.length < 10) warnings.push('Title too short (min 10 chars)');
  if (opts.description && opts.description.length > 160)
    warnings.push('Description exceeds 160 characters');
  if (opts.slug && opts.slug.length > 80)
    warnings.push('Slug exceeds 80 characters');
  return { valid: warnings.length === 0, warnings };
}