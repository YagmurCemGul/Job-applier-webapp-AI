/**
 * @fileoverview Confirmation email service
 * Sends application confirmation emails via Gmail
 */

import { getBearer } from '@/services/integrations/google.oauth.service';
import { buildMime } from '@/services/integrations/gmail.real.service';

/**
 * Send an email summary/confirmation to self or recruiter after submission.
 * @param opts - Email options
 * @returns Gmail API response
 */
export async function sendConfirmationEmail(opts: {
  accountId: string;
  clientId: string;
  passphrase: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ id: string; threadId: string }> {
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId);
  const raw = buildMime({
    id: crypto.randomUUID(),
    accountId: opts.accountId,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
    createdAt: new Date().toISOString(),
    status: 'pending'
  } as any);
  
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw })
  });
  
  if (!res.ok) throw new Error('Email send failed');
  return await res.json();
}
