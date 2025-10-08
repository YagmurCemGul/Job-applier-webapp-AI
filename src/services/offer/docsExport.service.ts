/**
 * @fileoverview Docs export service for Step 37 — export offers to PDF/Google Docs
 * @module services/offer/docsExport
 * 
 * Integrates with Step 35/30 export services
 */

/**
 * Export offer summary to PDF
 * 
 * @param html - HTML content to export
 * @param filename - Output filename
 * @returns URL or blob for download
 */
export async function exportOfferToPDF(
  html: string,
  filename = 'Offer_Summary.pdf'
): Promise<string | Blob> {
  try {
    // Try to import Step 35 PDF export service
    const { exportHTMLToPDF } = await import('@/services/export/pdf.service');
    
    return await exportHTMLToPDF(html, filename, 'en', { returnUrl: true } as any);
  } catch (error) {
    console.error('PDF export failed:', error);
    
    // Fallback: create downloadable HTML
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }
}

/**
 * Export offer summary to Google Docs
 * 
 * @param html - HTML content to export
 * @param title - Document title
 * @returns Document ID or URL
 */
export async function exportOfferToDocs(
  html: string,
  title = 'Offer Summary'
): Promise<{ id?: string; url?: string }> {
  try {
    // Try to import Step 35 Google Docs export service
    const { exportHTMLToGoogleDoc } = await import('@/services/export/googleDocs.service');
    
    const result = await exportHTMLToGoogleDoc(html, title);
    return result;
  } catch (error) {
    console.error('Google Docs export failed:', error);
    throw new Error('Google Docs export unavailable. Ensure integration is configured.');
  }
}

/**
 * Generate HTML summary for offer
 */
export function generateOfferHTML(offer: any, compResult?: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Offer Summary - ${offer.company}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .section { margin: 20px 0; }
        .label { font-weight: bold; color: #666; }
        .value { color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .disclaimer { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>${offer.company} - ${offer.role}</h1>
      
      <div class="section">
        <p><span class="label">Level:</span> <span class="value">${offer.level ?? 'N/A'}</span></p>
        <p><span class="label">Location:</span> <span class="value">${offer.location ?? 'N/A'}</span></p>
        <p><span class="label">Remote:</span> <span class="value">${offer.remote ?? 'N/A'}</span></p>
      </div>

      <h2>Compensation</h2>
      <table>
        <tr><th>Component</th><th>Amount</th></tr>
        <tr><td>Base Salary</td><td>${offer.baseAnnual.toLocaleString()} ${offer.currency}</td></tr>
        <tr><td>Target Bonus</td><td>${offer.bonusTargetPct ?? 0}% (${((offer.bonusTargetPct ?? 0) / 100 * offer.baseAnnual).toLocaleString()} ${offer.currency})</td></tr>
        ${compResult ? `
          <tr><td>Equity (annualized)</td><td>${compResult.equity.toLocaleString()} ${offer.currency}</td></tr>
          <tr><td>Benefits (annualized)</td><td>${compResult.benefits.annualValue.toLocaleString()} ${offer.currency}</td></tr>
          <tr><td><strong>Total (pre-tax)</strong></td><td><strong>${compResult.gross.toLocaleString()} ${offer.currency}</strong></td></tr>
        ` : ''}
      </table>

      <div class="disclaimer">
        <strong>Disclaimer:</strong> This is an estimate for comparison purposes only. 
        Not financial or tax advice. Actual compensation may vary.
      </div>

      <p style="color: #999; font-size: 12px; margin-top: 40px;">
        Generated on ${new Date().toLocaleDateString()}
      </p>
    </body>
    </html>
  `;
}
