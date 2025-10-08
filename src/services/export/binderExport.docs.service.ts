/**
 * @fileoverview Google Docs export service for evidence binder.
 * @module services/export/binderExport.docs
 */

import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service';
import type { EvidenceItem } from '@/types/onboarding.types';

/**
 * Export evidence binder as Google Doc.
 * @param items - Evidence items
 * @returns Google Doc ID
 */
export async function exportBinderDoc(items: EvidenceItem[]): Promise<string> {
  const html = renderBinderHTML(items);
  const { exportHTMLToGoogleDoc } = await import(
    '@/services/export/googleDocs.service'
  );
  return await exportHTMLToGoogleDoc(html, 'Evidence Binder');
}
