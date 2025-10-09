/**
 * @fileoverview Application review service
 * Builds human-readable review HTML from run and screeners
 */

import type { ApplyRun, Screener } from '@/types/apply.types';

/**
 * Build a human-readable review HTML from run + screeners.
 * @param run - Application run
 * @param company - Company name
 * @param role - Job role
 * @param qs - Screener questions
 * @returns HTML review document
 */
export function buildReviewHtml(
  run: ApplyRun,
  company?: string,
  role?: string,
  qs?: Screener[]
): string {
  const qa = (qs||[]).map(q=>
    `<li><b>${escape(q.prompt)}</b><div>${escape((q.redactedAnswer||q.answer||'').slice(0,1200))}</div></li>`
  ).join('');
  
  return `<div>
    <h2>Review Application — ${escape(company||'')}</h2>
    <p>Role: ${escape(role||'')}</p>
    <h3>Screener Answers</h3><ol>${qa}</ol>
    <h3>Coverage</h3><p>${run.coverage.keywordMatchPct}% keywords matched. Missing: ${run.coverage.missingKeywords.join(', ') || '—'}</p>
  </div>`;
}

function escape(s:string){
  return s.replace(/[&<>"]/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m]!));
}
