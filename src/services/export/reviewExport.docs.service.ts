/**
 * @fileoverview Review packet Google Docs export service
 */

/**
 * Export review packet HTML to Google Doc
 */
export async function exportReviewDoc(
  html: string,
  title = 'Review Packet'
): Promise<any> {
  const { exportHTMLToGoogleDoc } = await import('@/services/export/googleDocs.service');
  return await exportHTMLToGoogleDoc(html, title);
}
