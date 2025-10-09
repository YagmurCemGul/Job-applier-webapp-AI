/**
 * @fileoverview Import case studies and blog posts from external sources.
 * @module services/site/importers
 */

import type { CaseStudy, BlogPost } from '@/types/site.types';
import { slugify } from './seo.service';
import { mdToExcerpt } from './markdown.service';

/**
 * Convert pasted Google Doc or plain text to a CaseStudy.
 */
export function importCaseFromText(title: string, raw: string): CaseStudy {
  const md = raw
    .replace(/\r\n/g, '\n')
    .replace(/^([A-Z].+)\n=+\n/gm, '# $1\n')
    .replace(/^([A-Z].+)\n-+\n/gm, '## $1\n');

  return {
    id: crypto.randomUUID(),
    title,
    slug: slugify(title),
    excerpt: mdToExcerpt(md, 160),
    contentMd: md,
    dateISO: new Date().toISOString(),
    visibility: 'draft',
  };
}

/**
 * Convert pasted text to a BlogPost.
 */
export function importPostFromText(title: string, raw: string): BlogPost {
  return {
    id: crypto.randomUUID(),
    title,
    slug: slugify(title),
    contentMd: raw,
    dateISO: new Date().toISOString(),
    visibility: 'draft',
  };
}

/**
 * Import from JSON export.
 */
export function importCaseFromJSON(json: string): CaseStudy {
  const data = JSON.parse(json);
  return {
    id: data.id || crypto.randomUUID(),
    title: data.title,
    slug: data.slug || slugify(data.title),
    excerpt: data.excerpt || mdToExcerpt(data.contentMd, 160),
    contentMd: data.contentMd,
    dateISO: data.dateISO || new Date().toISOString(),
    visibility: data.visibility || 'draft',
    highlights: data.highlights || [],
    quotes: data.quotes || [],
    links: data.links || [],
    competenceTags: data.competenceTags || [],
  };
}