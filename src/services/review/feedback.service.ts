import { useFeedbackStore } from '@/store/feedbackStore'
import type { FeedbackRequest, FeedbackResponse } from '@/types/review.types'
import { renderTemplate } from '@/services/outreach/templateRender.service'
import { getBearer } from '@/services/integrations/google.oauth.service'
import { redactPII } from './privacy.service'
import { analyzeSentiment } from './sentiment.service'

/**
 * Build a polite feedback request email (HTML)
 */
export function buildFeedbackEmail(
  req: FeedbackRequest,
  vars: Record<string, string>
): { subject: string; html: string; text?: string } {
  const tpl = {
    subject: `Feedback request for ${vars['YourName'] ?? 'me'} (${vars['CycleTitle'] ?? 'Review'})`,
    body: [
      `Hi {{ReviewerName}},`,
      `I'm collecting feedback for {{CycleTitle}}. Would you be willing to share observations on strengths, impact, and growth areas?`,
      `You can reply directly to this email{{Anon}}.`,
      `<ul><li>What went well?</li><li>What could be improved?</li><li>Examples/impact numbers</li></ul>`,
      `Thanks so much!`,
    ].join('\n'),
  }

  const body = tpl.body.replace(
    '{{Anon}}',
    vars['AnonLink'] ? ` or use this anonymous form: ${vars['AnonLink']}` : ''
  )

  return renderTemplate({ subject: tpl.subject, body }, vars)
}

/**
 * Send feedback requests via Gmail (Step 35)
 */
export async function sendFeedbackRequests(opts: {
  accountId: string
  clientId: string
  passphrase: string
  requests: FeedbackRequest[]
  vars: (r: FeedbackRequest) => Record<string, string>
}): Promise<void> {
  const bearer = await getBearer(opts.accountId, opts.passphrase, opts.clientId)

  for (const r of opts.requests) {
    const rendered = buildFeedbackEmail(r, opts.vars(r))

    // Build RFC 822 MIME message
    const boundary = '----boundary'
    const raw = [
      `From: ${opts.accountId}`,
      `To: ${r.reviewerEmail}`,
      `Subject: ${rendered.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      rendered.html,
      `--${boundary}--`,
    ].join('\r\n')

    const encoded = btoa(unescape(encodeURIComponent(raw)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    })

    if (res.ok) {
      useFeedbackStore.getState().markSent(r.id)
    }
  }
}

/**
 * Record an incoming feedback response (manual paste or form)
 */
export async function recordFeedbackResponse(
  req: FeedbackRequest,
  body: string
): Promise<FeedbackResponse> {
  const redacted = redactPII(body)
  const sentiment = await analyzeSentiment(body)

  const res: FeedbackResponse = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    requestId: req.id,
    cycleId: req.cycleId,
    receivedAt: new Date().toISOString(),
    body,
    redactedBody: redacted,
    sentiment,
  }

  useFeedbackStore.getState().upsertResponse(res)
  return res
}
