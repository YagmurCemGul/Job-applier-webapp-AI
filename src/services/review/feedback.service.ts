import { useFeedbackStore } from '@/store/feedbackStore'
import type { FeedbackRequest, FeedbackResponse } from '@/types/review.types'
import { renderTemplate } from '@/services/outreach/templateRender.service'
import { redactPII } from './privacy.service'
import { analyzeSentiment } from './sentiment.service'

/**
 * Build a polite feedback request email (HTML)
 * with optional anonymous link (stub)
 */
export function buildFeedbackEmail(
  req: FeedbackRequest,
  vars: Record<string, string>
): { subject: string; html: string; text: string } {
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

  const bodyWithAnon = tpl.body.replace(
    '{{Anon}}',
    vars['AnonLink'] ? ` or use this anonymous form: ${vars['AnonLink']}` : ''
  )

  return renderTemplate({ subject: tpl.subject, body: bodyWithAnon }, vars)
}

/**
 * Send feedback requests via Gmail (Step 35)
 * Mock implementation for now
 */
export async function sendFeedbackRequests(opts: {
  accountId: string
  clientId: string
  passphrase: string
  requests: FeedbackRequest[]
  vars: (r: FeedbackRequest) => Record<string, string>
}): Promise<void> {
  // In production, integrate with Step 35 Gmail service
  // For now, just mark as sent
  for (const r of opts.requests) {
    useFeedbackStore.getState().markSent(r.id)
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
