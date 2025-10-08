/**
 * Gmail real service for sending emails and managing threads
 * Uses Gmail API v1
 */
import type { OutboxMessage, GmailThread } from '@/types/gmail.types';

/**
 * Base64 URL-safe encoding (RFC 4648)
 */
function base64UrlEncode(input: string): string {
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * RFC 2822 date format
 */
function rfc2822Date(d = new Date()): string {
  return d.toUTCString();
}

/**
 * Build RFC 822 MIME message with optional attachments
 */
export function buildMime(msg: OutboxMessage): string {
  const boundary = 'mime_boundary_' + Math.random().toString(36).slice(2);
  
  const headers = [
    `From: ${msg.accountId}`,
    `To: ${msg.to.join(', ')}`,
    msg.cc?.length ? `Cc: ${msg.cc.join(', ')}` : '',
    msg.bcc?.length ? `Bcc: ${msg.bcc.join(', ')}` : '',
    `Subject: ${msg.subject}`,
    `Date: ${rfc2822Date()}`,
    `MIME-Version: 1.0`,
    msg.attachments?.length
      ? `Content-Type: multipart/mixed; boundary="${boundary}"`
      : `Content-Type: text/html; charset="UTF-8"`
  ].filter(Boolean).join('\r\n');

  // Simple message without attachments
  if (!msg.attachments?.length) {
    return base64UrlEncode(`${headers}\r\n\r\n${msg.html}`);
  }

  // Message with attachments
  const parts = [
    `--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${msg.html}`
  ];

  for (const attachment of msg.attachments) {
    if (!attachment.dataBase64) continue;
    
    parts.push([
      `--${boundary}`,
      `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: attachment; filename="${attachment.filename}"`,
      ``,
      attachment.dataBase64
    ].join('\r\n'));
  }

  parts.push(`--${boundary}--`);
  return base64UrlEncode(`${headers}\r\n\r\n${parts.join('\r\n')}`);
}

/**
 * Send message via Gmail API
 */
export async function gmailSend(
  bearer: string,
  msg: OutboxMessage
): Promise<{ id: string; threadId: string }> {
  const raw = buildMime(msg);
  
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gmail send failed: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return {
    id: data.id as string,
    threadId: data.threadId as string
  };
}

/**
 * Fetch thread with all messages
 */
export async function gmailGetThread(
  bearer: string,
  threadId: string
): Promise<GmailThread> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=full`,
    {
      headers: { Authorization: `Bearer ${bearer}` }
    }
  );

  if (!res.ok) {
    throw new Error(`Thread fetch failed: ${res.status}`);
  }

  const data = await res.json();
  
  const messages = (data.messages ?? []).map((m: any) => {
    const headers = (m.payload?.headers ?? []) as Array<{ name: string; value: string }>;
    const subject = headers.find(h => h.name === 'Subject')?.value ?? '';
    const from = headers.find(h => h.name === 'From')?.value ?? '';
    const to = (headers.find(h => h.name === 'To')?.value ?? '')
      .split(/\s*,\s*/)
      .filter(Boolean);
    
    return {
      id: m.id,
      from,
      to,
      date: new Date(Number(m.internalDate)).toISOString(),
      html: decodePart(m.payload) ?? undefined,
      text: undefined,
      subject
    };
  });

  return {
    id: data.id,
    subject: messages[0]?.subject ?? '',
    participants: Array.from(new Set(messages.flatMap(m => [m.from, ...m.to]))),
    snippet: data.snippet ?? '',
    messages,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Decode MIME part to HTML
 */
function decodePart(payload: any): string | null {
  if (!payload) return null;
  
  const parts = collectParts(payload);
  const htmlPart = parts.find(p => p.mimeType?.includes('text/html'));
  
  if (!htmlPart?.body?.data) return null;
  
  const html = htmlPart.body.data.replace(/-/g, '+').replace(/_/g, '/');
  const str = atob(html);
  return decodeURIComponent(escape(str));
}

/**
 * Collect all MIME parts recursively
 */
function collectParts(p: any, acc: any[] = []): any[] {
  if (!p) return acc;
  acc.push(p);
  (p.parts ?? []).forEach((x: any) => collectParts(x, acc));
  return acc;
}
