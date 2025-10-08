/**
 * @fileoverview Contact form submission handler (Gmail delivery).
 * @module services/site/contact
 */

import type { ContactForm } from '@/types/site.types';

/**
 * Send contact form submission via Gmail (Step 35).
 */
export async function sendContactSubmission(
  form: ContactForm,
  payload: Record<string, string>,
  accountId: string,
  passphrase: string,
  clientId: string
): Promise<{ id: string }> {
  // Spam protection: honeypot
  if (form.captchaHoneypot && payload['website']) {
    throw new Error('Spam detected');
  }

  // Spam protection: time-gate
  const started = Number(payload['_started'] || '0');
  if (form.timeGateSec && Date.now() - started < form.timeGateSec * 1000) {
    throw new Error('Form submitted too quickly');
  }

  // Build email body
  const lines = form.fields
    .map((f) => `<li><b>${f.label}:</b> ${escapeHtml(payload[f.id] || '')}</li>`)
    .join('');
  const html = `<div><h3>${escapeHtml(form.title)}</h3><ul>${lines}</ul></div>`;

  // Get Gmail bearer token (Step 35)
  const { getBearer } = await import('@/services/integrations/google.oauth.service');
  const bearer = await getBearer(accountId, passphrase, clientId);

  // Build MIME message
  const { buildMime } = await import('@/services/integrations/gmail.real.service');
  const msg = {
    id: crypto.randomUUID(),
    accountId,
    to: [form.sendToEmail],
    subject: `New contact: ${form.title}`,
    html,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const raw = buildMime(msg as any);

  // Send via Gmail API
  const res = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    }
  );

  if (!res.ok) {
    throw new Error(`Gmail send failed: ${res.status} ${res.statusText}`);
  }

  const result = await res.json();
  return { id: result.id };
}

function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[m]!
  );
}