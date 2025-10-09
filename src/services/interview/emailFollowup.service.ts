/**
 * @fileoverview Email follow-up service for Step 43
 * @module services/interview/emailFollowup
 */

import type { FollowUp } from '@/types/interview.types';
import { getBearer } from '@/services/integrations/google.oauth.service';

/**
 * Build MIME message for Gmail API
 * @param to - Recipient email
 * @param subject - Email subject
 * @param html - Email HTML content
 * @returns Base64 encoded MIME message
 */
function buildMime(to: string, subject: string, html: string): string {
  const boundary = '----=_Part_' + Date.now();
  
  const mime = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    html,
    '',
    `--${boundary}--`
  ].join('\r\n');

  return btoa(unescape(encodeURIComponent(mime)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Send follow-up email via Gmail API
 * @param f - Follow-up email details
 * @param accountId - Google account ID
 * @param clientId - OAuth client ID
 * @param passphrase - Encryption passphrase
 * @returns Sent message details
 */
export async function sendFollowUp(
  f: FollowUp,
  accountId: string,
  clientId: string,
  passphrase: string
): Promise<{ id: string; threadId: string }> {
  const bearer = await getBearer(accountId, passphrase, clientId);
  const raw = buildMime(f.to, f.subject, f.html);

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

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gmail send failed: ${res.status} ${error}`);
  }

  return res.json();
}

/**
 * Generate thank you email template
 * @param interviewerName - Interviewer name
 * @param company - Company name
 * @param role - Role title
 * @param customNote - Custom thank you note
 * @returns Thank you email HTML
 */
export function generateThankYouEmail(
  interviewerName: string,
  company: string,
  role: string,
  customNote?: string
): string {
  return `
<p>Dear ${interviewerName},</p>

<p>Thank you for taking the time to speak with me today about the ${role} position at ${company}. I enjoyed learning more about the team and the exciting challenges you're tackling.</p>

${customNote ? `<p>${customNote}</p>` : ''}

<p>I'm very enthusiastic about the opportunity to contribute to ${company} and would welcome the chance to continue our conversation.</p>

<p>Thank you again for your time and consideration.</p>

<p>Best regards</p>
  `.trim();
}

/**
 * Generate follow-up email template
 * @param interviewerName - Interviewer name
 * @param company - Company name
 * @param daysSinceInterview - Days since interview
 * @returns Follow-up email HTML
 */
export function generateFollowUpEmail(
  interviewerName: string,
  company: string,
  daysSinceInterview: number
): string {
  return `
<p>Dear ${interviewerName},</p>

<p>I wanted to follow up on my recent interview for the position at ${company}. It's been ${daysSinceInterview} days since we spoke, and I remain very interested in the opportunity.</p>

<p>I'd appreciate any updates you might have on the hiring timeline or next steps in the process.</p>

<p>Thank you for your consideration, and I look forward to hearing from you.</p>

<p>Best regards</p>
  `.trim();
}
