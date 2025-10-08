/**
 * Indeed HTML Adapter
 * Step 32 - Conservative HTML parser for user-provided Indeed content
 * 
 * IMPORTANT: This adapter requires explicit legal mode consent.
 * Only use with content you have legal rights to access.
 */

import type { SourceConfig, JobRaw } from '@/types/jobs.types';

/**
 * Parse Indeed HTML for job postings
 * Requires legalMode=true and user-provided HTML
 */
export async function fetchIndeedHTML(source: SourceConfig): Promise<JobRaw[]> {
  if (!source.legalMode) {
    throw new Error('legalMode required for html adapter');
  }
  
  const html = source.params?.html;
  if (!html) {
    console.warn('No HTML content provided for Indeed HTML adapter');
    return [];
  }
  
  // Conservative parser: extract job card links
  const matches = Array.from(
    html.matchAll(/<a[^>]+href="([^"]*\/viewjob[^"]+)"[^>]*>(.*?)<\/a>/gi)
  );
  
  return matches.map((m, i) => ({
    id: `${m[1]}#${i}`,
    url: m[1].startsWith('http') ? m[1] : `https://www.indeed.com${m[1]}`,
    source: { name: 'indeed.html', kind: 'html', domain: 'indeed.com' },
    title: stripHtml(m[2]),
    fetchedAt: new Date().toISOString(),
    description: '',
  }));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}
