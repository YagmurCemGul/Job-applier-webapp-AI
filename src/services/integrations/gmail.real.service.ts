/**
 * Gmail API service stub
 * In production, this would use the real Gmail API
 */

export function buildMime(msg: { to: string[]; subject: string; html: string }): string {
  const boundary = '----boundary';
  const mime = [
    `To: ${msg.to.join(', ')}`,
    `Subject: ${msg.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    '',
    msg.html,
    `--${boundary}--`
  ].join('\n');
  return btoa(mime).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendEmail(bearer: string, msg: { to: string[]; subject: string; html: string }): Promise<{ id: string; threadId: string }> {
  const raw = buildMime(msg);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw })
  });
  if (!res.ok) throw new Error(`Gmail API error: ${res.status}`);
  return res.json();
}
