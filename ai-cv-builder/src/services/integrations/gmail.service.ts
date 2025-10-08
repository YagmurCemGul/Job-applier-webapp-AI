/**
 * Gmail Integration Service (OAuth-ready stub)
 * 
 * Production mode: Calls backend /api/gmail/send when VITE_GMAIL_ENABLED=1
 * Dev mode: Simulates success and logs locally
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  inReplyToId?: string;
}

export interface EmailResponse {
  ok: boolean;
  id: string;
  error?: string;
}

/**
 * Send email via Gmail API (or simulate in dev)
 */
export async function sendEmail(opts: SendEmailOptions): Promise<EmailResponse> {
  // Production path: use backend API
  if (import.meta.env.VITE_GMAIL_ENABLED === '1') {
    try {
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts)
      });
      
      if (!response.ok) {
        throw new Error('Gmail send failed');
      }
      
      return await response.json();
    } catch (error) {
      return {
        ok: false,
        id: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Dev stub: simulate success
  console.log('[Gmail Stub] Email sent:', opts);
  return {
    ok: true,
    id: 'local-' + Date.now()
  };
}
