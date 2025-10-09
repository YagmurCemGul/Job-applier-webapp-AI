/**
 * @fileoverview Application packet export service
 * Exports complete submission packets as PDF or Google Doc
 */

import type { ApplyRun, JobPosting, VariantDoc, Screener } from '@/types/apply.types';
import { exportHTMLToPDF } from '@/services/export/pdf.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';

/**
 * Export submission packet as PDF/Google Doc.
 * @param opts - Export options
 * @returns Export result (URL or document metadata)
 */
export async function exportPacket(opts: {
  run: ApplyRun;
  posting: JobPosting;
  variants: VariantDoc[];
  screeners: Screener[];
  kind: 'pdf'|'gdoc';
}): Promise<string | { id: string; url: string; title: string }> {
  const html = [
    `<h1>Application Packet — ${opts.posting.company ?? ''} — ${opts.posting.role ?? ''}</h1>`,
    `<p><b>URL:</b> ${opts.posting.url ?? ''}</p>`,
    `<h2>Resume/Cover</h2><ul>${opts.variants.map(v=>`<li>${v.kind.toUpperCase()}: ${v.title} (${v.format})</li>`).join('')}</ul>`,
    `<h2>Screener Answers</h2><ol>${opts.screeners.map(s=>`<li><b>${s.prompt}</b><div>${s.redactedAnswer || s.answer || ''}</div></li>`).join('')}</ol>`,
    `<h2>Coverage</h2><p>${opts.run.coverage.keywordMatchPct}% — Missing: ${opts.run.coverage.missingKeywords.join(', ')}</p>`
  ].join('\n');
  
  if (opts.kind === 'pdf') {
    return await exportHTMLToPDF(html, 'Application_Packet.pdf', 'en', { returnUrl: true } as any) as string;
  } else {
    return await exportHTMLToGoogleDoc(html, 'Application Packet');
  }
}
