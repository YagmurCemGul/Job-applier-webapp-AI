import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service'
import type { EvidenceItem } from '@/types/onboarding.types'

/**
 * Export evidence binder to PDF
 */
export async function exportBinderPDF(
  items: EvidenceItem[]
): Promise<string> {
  const html = renderBinderHTML(items)

  // Create blob URL for now
  // In production, use jsPDF
  const blob = new Blob([html], { type: 'text/html' })
  return URL.createObjectURL(blob)
}
