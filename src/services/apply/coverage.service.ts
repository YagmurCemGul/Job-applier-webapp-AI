/**
 * @fileoverview Resume coverage analysis service
 * Calculates keyword match percentage and identifies gaps
 */

import type { CoverageReport } from '@/types/apply.types';

/**
 * Calculate coverage from resume text against job posting keywords
 * @param text - Resume text
 * @param keywords - Job posting keywords
 * @returns Coverage report with match percentage and gaps
 */
export function coverageFromText(text: string, keywords: string[]): CoverageReport {
  const lower = text.toLowerCase();
  const miss = keywords.filter(k => !lower.includes(k.toLowerCase()));
  const pct = Math.round((1 - miss.length / Math.max(1, keywords.length)) * 100);
  
  const gaps: string[] = [];
  if (!/education/i.test(text)) gaps.push('Education');
  if (!/experience|employment/i.test(text)) gaps.push('Experience');
  if (!/projects?/i.test(text)) gaps.push('Projects');
  
  return {
    keywordMatchPct: Math.max(0, Math.min(100, pct)),
    missingKeywords: miss,
    sectionGaps: gaps
  };
}
