/**
 * @fileoverview Review packet PDF export service
 */

/**
 * Export review packet HTML to PDF
 */
export async function exportReviewPDF(
  html: string,
  filename = 'Review_Packet.pdf'
): Promise<string> {
  const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
  return await exportHTMLToPDF(html, filename, 'en', { returnUrl: true } as any);
}
