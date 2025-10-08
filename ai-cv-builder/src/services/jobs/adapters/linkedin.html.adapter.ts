/**
 * LinkedIn HTML Adapter
 * Step 32 - Conservative HTML parser for user-provided LinkedIn content
 * 
 * IMPORTANT: This adapter requires explicit legal mode consent.
 * Only use with content you have legal rights to access.
 */

import type { SourceConfig, JobRaw } from '@/types/jobs.types';

/**
 * Parse LinkedIn HTML for job postings
 * Requires legalMode=true and user-provided HTML
 */
export async function fetchLinkedInHTML(source: SourceConfig): Promise<JobRaw[]> {
  if (!source.legalMode) {
    throw new Error('legalMode required for html adapter');
  }
  
  // For testing: accept HTML via params.html
  const html = source.params?.html;
  if (!html) {
    console.warn('No HTML content provided for LinkedIn HTML adapter');
    return [];
  }
  
  // Extremely conservative parser: extract anchors with "/jobs/view/"
  const matches = Array.from(
    html.matchAll(/<a[^>]+href="([^"]*\/jobs\/view\/[^"]+)"[^>]*>(.*?)<\/a>/gi)
  );
  
  return matches.map((m, i) => ({
    id: `${m[1]}#${i}`,
    url: m[1],
    source: { name: 'linkedin.html', kind: 'html', domain: 'linkedin.com' },
    title: stripHtml(m[2]),
    fetchedAt: new Date().toISOString(),
    description: '',
  }));
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim();
}
