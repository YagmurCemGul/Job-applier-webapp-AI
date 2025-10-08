/**
 * @fileoverview E-signature service for Step 37 — stub for document signing
 * @module services/offer/esign
 * 
 * This is a minimal stub. In production, integrate with DocuSign, Dropbox Sign,
 * or similar e-signature providers.
 */

export interface ESignRequest {
  id: string;
  url: string;
  status: 'pending' | 'signed' | 'declined' | 'expired';
  createdAt: string;
}

/**
 * Start e-signature process for document
 * 
 * In production, this would:
 * 1. Upload document to e-sign provider
 * 2. Create signing request
 * 3. Send to recipients
 * 4. Return tracking URL
 * 
 * @param opts - Document details
 * @returns E-sign request with URL
 */
export async function startESign(opts: {
  html: string;
  docTitle: string;
  recipients?: string[];
}): Promise<ESignRequest> {
  // Stub implementation - creates local blob URL
  const id = crypto?.randomUUID?.() ?? String(Date.now());
  
  // Create signable HTML with signature fields
  const signableHtml = createSignableHTML(opts.html, opts.docTitle, opts.recipients);
  
  const blob = new Blob([signableHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  return {
    id,
    url,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
}

/**
 * Create HTML with signature fields
 */
function createSignableHTML(
  content: string,
  title: string,
  recipients?: string[]
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title} - E-Signature</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; }
        .notice { background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3; margin: 20px 0; }
        .signature-section { margin: 40px 0; padding: 20px; border: 2px dashed #ccc; }
        .signature-field { margin: 20px 0; }
        .signature-field label { display: block; font-weight: bold; margin-bottom: 5px; }
        .signature-field input { width: 100%; max-width: 400px; padding: 10px; border: 1px solid #ccc; }
        button { background: #2196f3; color: white; padding: 12px 24px; border: none; cursor: pointer; font-size: 16px; }
        button:hover { background: #1976d2; }
      </style>
    </head>
    <body>
      <div class="notice">
        <strong>E-Signature Stub:</strong> This is a demonstration interface. 
        In production, integrate with DocuSign, Dropbox Sign, or similar services.
      </div>

      ${content}

      <div class="signature-section">
        <h2>Signature</h2>
        ${(recipients ?? ['You']).map((r, i) => `
          <div class="signature-field">
            <label>Signature - ${r}:</label>
            <input type="text" placeholder="Type your name to sign" id="sig-${i}" />
            <p style="font-size: 12px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
        `).join('')}
        <button onclick="alert('Signature recorded (stub)')">Complete Signature</button>
      </div>
    </body>
    </html>
  `;
}

/**
 * Check signature status
 */
export async function getESignStatus(id: string): Promise<ESignRequest['status']> {
  // Stub - always returns pending
  return 'pending';
}
