/**
 * @fileoverview Google Docs export service stub
 * In production, this would use the Google Docs API
 */

/**
 * Export HTML to Google Doc
 * @param html - HTML content to export
 * @param title - Document title
 * @returns Document metadata
 */
export async function exportHTMLToGoogleDoc(
  html: string,
  title: string
): Promise<{ id: string; url: string; title: string }> {
  // Stub: return mock document metadata
  return {
    id: `doc_${Date.now()}`,
    url: `https://docs.google.com/document/d/${Date.now()}`,
    title
  };
}
