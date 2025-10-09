/**
 * @fileoverview Email sending service for Step 44
 * @module services/negotiation/email
 */

import { getBearer } from '@/services/integrations/google.oauth.service';
import { buildMime } from '@/services/integrations/gmail.real.service';

/**
 * Send negotiation email via Gmail
 * @param opts - Email options
 * @returns Gmail API response
 */
export async function sendNegotiationEmail(opts: {
  to: string;
  subject: string;
  html: string;
  accountId: string;
  clientId: string;
  passphrase: string;
}) {
  const bearer = await getBearer(
    opts.accountId,
    opts.passphrase,
    opts.clientId
  );

  const raw = buildMime({
    id: crypto.randomUUID(),
    accountId: opts.accountId,
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
    createdAt: new Date().toISOString(),
    status: 'pending'
  } as any);

  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    }
  );

  if (!res.ok) throw new Error('Email send failed');
  return await res.json();
}
