import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service'
import type { EvidenceItem } from '@/types/onboarding.types'

/**
 * Export evidence binder to Google Docs format
 */
export async function exportBinderDoc(items: EvidenceItem[]): Promise<string> {
  const html = renderBinderHTML(items)

  // In production, use Google Docs API
  // For now, return HTML blob
  const blob = new Blob([html], { type: 'text/html' })
  return URL.createObjectURL(blob)
}
