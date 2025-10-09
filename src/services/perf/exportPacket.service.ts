/**
 * Export Packet Service
 * 
 * Exports review/promotion packets to PDF or Google Docs.
 */

import type { CalibSummary, NarrativeDoc, GapAnalysis } from '@/types/perf.types';
import { exportHTMLToPDF } from '@/services/export/pdf.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';

/**
 * Export Review/Promotion Packet (PDF or Google Doc).
 */
export async function exportPerfPacket(opts: {
  title: string;
  narrative: NarrativeDoc;
  calib: CalibSummary;
  gap: GapAnalysis;
  disclaimer: string;
  kind: 'pdf' | 'gdoc';
}) {
  const html = [
    `<h1>${opts.title}</h1>`,
    `<p style="color:#ef4444">${opts.disclaimer}</p>`,
    `<h2>Narrative</h2>${opts.narrative.html}`,
    `<h2>Calibration Summary</h2><ul>${Object.entries(opts.calib.aggScores)
      .map(([k, v]) => `<li>${k}: ${v}</li>`)
      .join('')}</ul><p><b>Overall:</b> ${opts.calib.overall}</p>`,
    `<h2>Promotion Readiness</h2><ul>${opts.gap.gaps
      .map((g) => `<li>${g.key}: ${g.current} / ${g.target} ${g.current >= g.target ? '✅' : '⚠️'}</li>`)
      .join('')}</ul><p><b>Ready:</b> ${opts.gap.ready ? 'Yes' : 'Not yet'}</p>`,
  ].join('\n');
  return opts.kind === 'pdf'
    ? exportHTMLToPDF(html, 'Performance_Packet.pdf', 'en', { returnUrl: true } as any)
    : exportHTMLToGoogleDoc(html, 'Performance & Promotion Packet');
}
