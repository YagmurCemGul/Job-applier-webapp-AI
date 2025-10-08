/**
 * Glassdoor HTML Adapter
 * Step 32 - Conservative HTML parser for user-provided Glassdoor content
 * 
 * IMPORTANT: This adapter requires explicit legal mode consent.
 * Only use with content you have legal rights to access.
 */

import type { SourceConfig, JobRaw } from '@/types/jobs.types';

/**
 * Parse Glassdoor HTML for job postings
 * Requires legalMode=true and user-provided HTML
 */
export async function fetchGlassdoorHTML(source: SourceConfig): Promise<JobRaw[]> {
  if (!source.legalMode) {
    throw new Error('legalMode required for html adapter');
  }
  
  const html = source.params?.html;
  if (!html) {
    console.warn('No HTML content provided for Glassdoor HTML adapter');
    return [];
  }
  
  // Conservative parser: extract job links
  const matches = Array.from(
    html.matchAll(/<a[^>]+href="([^"]*\/job-listing\/[^"]+)"[^>]*>(.*?)<\/a>/gi)
  );
  
  return matches.map((m, i) => ({
    id: `${m[1]}#${i}`,
    url: m[1].startsWith('http') ? m[1] : `https://www.glassdoor.com${m[1]}`,
    source: { name: 'glassdoor.html', kind: 'html', domain: 'glassdoor.com' },
    title: stripHtml(m[2]),
    fetchedAt: new Date().toISOString(),
    description: '',
  }));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}
