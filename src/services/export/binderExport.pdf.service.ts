/**
 * @fileoverview PDF export service for evidence binder.
 * @module services/export/binderExport.pdf
 */

import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service';
import type { EvidenceItem } from '@/types/onboarding.types';

/**
 * Export evidence binder as PDF.
 * @param items - Evidence items
 * @returns PDF URL or blob
 */
export async function exportBinderPDF(items: EvidenceItem[]): Promise<string> {
  const html = renderBinderHTML(items);
  const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
  return (await exportHTMLToPDF(html, 'Evidence_Binder.pdf', 'en', {
    returnUrl: true,
  } as any)) as string;
}
