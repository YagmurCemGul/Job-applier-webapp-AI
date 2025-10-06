/**
 * Export review/promotion packet to PDF
 */
export async function exportReviewPDF(
  html: string,
  filename = 'Review_Packet.pdf'
): Promise<string> {
  // Create blob URL for now
  // In production, use jsPDF
  const blob = new Blob([html], { type: 'text/html' })
  return URL.createObjectURL(blob)
}
