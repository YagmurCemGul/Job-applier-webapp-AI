/**
 * Export review packet to Google Docs format
 */
export async function exportReviewDoc(html: string, title = 'Review Packet'): Promise<string> {
  // In production, use Google Docs API
  // For now, return HTML blob
  const blob = new Blob([html], { type: 'text/html' })
  return URL.createObjectURL(blob)
}
