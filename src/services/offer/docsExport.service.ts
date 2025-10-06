/**
 * Export offer/comparison as HTML -> PDF/Docs
 * Reuses Step 35 docs export patterns
 */

export async function exportOfferToPDF(
  html: string,
  filename = 'Offer_Summary.pdf'
): Promise<string> {
  // For now, create a blob URL
  // In production, use jsPDF or similar
  const blob = new Blob([html], { type: 'text/html' })
  return URL.createObjectURL(blob)
}

export async function exportOfferToDocs(html: string, title = 'Offer Summary'): Promise<string> {
  // In production, use Google Docs API
  // For now, return HTML blob
  const blob = new Blob([html], { type: 'text/html' })
  return URL.createObjectURL(blob)
}
