/**
 * @fileoverview Job posting parser service
 * Extracts structured data from job posting text
 */

import type { JobPosting, Screener } from '@/types/apply.types';

/**
 * Lightweight parser: uses headings/keywords to extract fields
 * @param p - Base job posting object with raw text
 * @returns Parsed job posting with extracted fields
 */
export function parsePosting(p: JobPosting): JobPosting {
  const t = (p.rawText||'').replace(/\r/g,'');
  const grab = (re:RegExp)=> t.match(re)?.[1]?.trim();
  
  const role = grab(/role[:\-]\s*(.+)/i) || grab(/^(?:title|position)[:\-]\s*(.+)$/im) || undefined;
  const company = grab(/company[:\-]\s*(.+)/i) || undefined;
  const location = grab(/location[:\-]\s*(.+)/i) || undefined;
  
  const requirements = Array.from(t.matchAll(/(?:requirements|qualifications)[:\s]*\n([\s\S]+?)(?:\n\n|$)/i))
    .flatMap(m => m[1].split('\n').map(s=>s.replace(/^[-*•]\s*/,'').trim()).filter(Boolean));
  
  const nice = Array.from(t.matchAll(/(?:nice to have|preferred)[:\s]*\n([\s\S]+?)(?:\n\n|$)/i))
    .flatMap(m => m[1].split('\n').map(s=>s.replace(/^[-*•]\s*/,'').trim()).filter(Boolean));
  
  const qs = extractScreenerQuestions(t);
  
  return {
    ...p,
    role,
    company,
    location,
    description: t.slice(0, 2000),
    requirements,
    niceToHave: nice,
    questions: qs
  };
}

/**
 * Extract screener questions from job posting text
 * @param text - Job posting text
 * @returns Array of screener questions
 */
function extractScreenerQuestions(text: string): Screener[] {
  const lines = text.split('\n').map(l=>l.trim());
  const qs: Screener[] = [];
  
  for (const l of lines) {
    const q = l.match(/^(?:Q:|Question:)\s*(.+)$/i)?.[1];
    if (q) {
      const kind = /work authorization|visa|salary|location/i.test(q) ? 'legal' : 'screener';
      qs.push({
        id: crypto.randomUUID(),
        kind,
        prompt: q
      });
    }
  }
  
  return qs;
}
