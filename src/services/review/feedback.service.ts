/**
 * @fileoverview Feedback request and response management
 * Integrates with Gmail (Step 35) for sending requests
 */

import { useFeedback } from '@/stores/feedback.store';
import type { FeedbackRequest, FeedbackResponse } from '@/types/review.types';
import { renderTemplate } from '@/services/outreach/templateRender.service';
import { gmailSend, buildMime } from '@/services/integrations/gmail.real.service';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { redactPII } from './privacy.service';
import { analyzeSentiment } from './sentiment.service';

/**
 * Build a polite feedback request email (HTML) with optional anonymous link
 */
export function buildFeedbackEmail(
  req: FeedbackRequest,
  vars: Record<string, string>
): { subject: string; html: string } {
  const template = {
    subject: `Feedback request for ${vars['YourName'] ?? 'me'} (${vars['CycleTitle'] ?? 'Review'})`,
    body: [
      `Hi {{ReviewerName}},`,
      ``,
      `I'm collecting feedback for {{CycleTitle}}. Would you be willing to share observations on strengths, impact, and growth areas?`,
      ``,
      `You can reply directly to this email{{Anon}}.`,
      ``,
      `<ul>`,
      `<li>What went well?</li>`,
      `<li>What could be improved?</li>`,
      `<li>Examples/impact numbers</li>`,
      `</ul>`,
      ``,
      `Thanks so much!`,
      `<br>`,
      `{{YourName}}`
    ].join('\n')
  };
  
  const anonText = vars['AnonLink']
    ? ` or use this anonymous form: ${vars['AnonLink']}`
    : '';
  
  const body = template.body.replace('{{Anon}}', anonText);
  
  return renderTemplate({ subject: template.subject, body }, vars);
}

/**
 * Send feedback requests via Gmail (Step 35 integration)
 */
export async function sendFeedbackRequests(opts: {
  accountId: string;
  clientId: string;
  passphrase: string;
  requests: FeedbackRequest[];
  vars: (r: FeedbackRequest) => Record<string, string>;
}): Promise<void> {
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId);
  
  for (const r of opts.requests) {
    const rendered = buildFeedbackEmail(r, opts.vars(r));
    
    const msg = {
      id: crypto.randomUUID(),
      accountId: opts.accountId,
      to: [r.reviewerEmail],
      subject: rendered.subject,
      html: rendered.html,
      status: 'pending',
      createdAt: new Date().toISOString()
    } as any;
    
    const raw = buildMime(msg);
    
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ raw })
    });
    
    if (res.ok) {
      useFeedback.getState().markSent(r.id);
    }
  }
}

/**
 * Record an incoming feedback response (manual paste or form)
 * Applies redaction and sentiment analysis
 */
export async function recordFeedbackResponse(
  req: FeedbackRequest,
  body: string
): Promise<FeedbackResponse> {
  const redacted = redactPII(body);
  const sentiment = await analyzeSentiment(body);
  
  const res: FeedbackResponse = {
    id: crypto.randomUUID(),
    requestId: req.id,
    cycleId: req.cycleId,
    receivedAt: new Date().toISOString(),
    body,
    redactedBody: redacted,
    sentiment
  };
  
  useFeedback.getState().upsertResponse(res);
  
  return res;
}
