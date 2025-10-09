/**
 * @fileoverview Resume and cover letter variant selection service
 * Ranks variants by keyword overlap and role/company relevance
 */

import type { VariantDoc } from '@/types/apply.types';

/**
 * Rank variants by keyword overlap and exact role/company mentions.
 * @param vars - Array of variant documents
 * @param keywords - Job posting keywords
 * @param role - Job role
 * @param company - Company name
 * @returns Sorted variants (best first)
 */
export function rankVariants(
  vars: VariantDoc[],
  keywords: string[],
  role?: string,
  company?: string
): VariantDoc[] {
  const kw = new Set(keywords.map(k=>k.toLowerCase()));
  
  return [...vars].map(v => {
    const hits = (v.keywords||[]).filter(k=>kw.has(k.toLowerCase())).length;
    const bonus = (role && (v.title.toLowerCase().includes(role.toLowerCase()))) ? 2 : 0
                + (company && (v.title.toLowerCase().includes(company.toLowerCase()))) ? 1 : 0;
    return { v, score: hits + bonus };
  }).sort((a,b)=>b.score-a.score).map(x=>x.v);
}
