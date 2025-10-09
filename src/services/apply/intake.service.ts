/**
 * @fileoverview Job posting intake service
 * Normalizes various input formats (URL, text, PDF) into JobPosting objects
 */

import type { JobPosting } from '@/types/apply.types';
import { extractTextFromPdf } from '@/services/integrations/pdfText.client';
import { parsePosting } from './postingParser.service';

/**
 * Normalize job posting inputs (URL/text/PDF) into a JobPosting, then parse.
 * @param input - Job posting input (URL, text, or PDF file)
 * @returns Parsed job posting
 */
export async function intakePosting(input: { url?: string; text?: string; pdf?: File }): Promise<JobPosting> {
  const id = crypto.randomUUID();
  let raw = input.text || '';
  let source: JobPosting['source'] = 'text';
  
  if (input.pdf) {
    raw = await extractTextFromPdf(input.pdf);
    source = 'pdf';
  }
  
  if (input.url && !raw) {
    source = 'url';
    raw = input.url; // we only store URL; user will paste JD text if needed
  }
  
  const base: JobPosting = {
    id,
    source,
    url: input.url,
    rawText: raw,
    questions: [],
    extractedAt: new Date().toISOString()
  };
  
  return parsePosting(base);
}
