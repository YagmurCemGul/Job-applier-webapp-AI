/**
 * 360 Feedback Request Service
 * 
 * Manages feedback templates and sending requests via Gmail.
 */

import type { FeedbackTemplate, FeedbackRequest } from '@/types/perf.types';
import { usePerf } from '@/stores/perf.store';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { buildMime } from '@/services/integrations/gmail.real.service';

/**
 * Built-in templates (behavioral & role-agnostic). Idempotent seed.
 */
export function seedFeedbackTemplates() {
  if (usePerf.getState().templates.length) return;
  const mk = (
    name: string,
    sections: Array<{ key: string; title: string; prompt: string }>
  ): FeedbackTemplate => ({
    id: crypto.randomUUID(),
    name,
    sections,
    rubric: ['clarity', 'impact', 'collaboration'],
  });
  usePerf.getState().upsertTemplate(
    mk('Behavior & Impact', [
      {
        key: 'strengths',
        title: 'Strengths',
        prompt: 'What did I do particularly well? Reference specific outcomes.',
      },
      {
        key: 'improve',
        title: 'Improvements',
        prompt: 'What should I do differently to increase impact?',
      },
      {
        key: 'evidence',
        title: 'Evidence',
        prompt: 'Links or examples that illustrate your points.',
      },
    ])
  );
}

/**
 * Send feedback request email via Gmail.
 */
export async function sendFeedbackRequest(
  req: FeedbackRequest & { accountId: string; clientId: string; passphrase: string }
) {
  const bearer = await getBearer(req.accountId, req.passphrase, req.clientId);
  const raw = buildMime({
    id: crypto.randomUUID(),
    accountId: req.accountId,
    to: [req.toEmail],
    subject: req.subject,
    html: req.messageHtml,
    createdAt: new Date().toISOString(),
    status: 'pending',
  } as any);
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${bearer}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) throw new Error('Feedback request send failed');
  usePerf.getState().upsertRequest({ ...req, sentAt: new Date().toISOString(), status: 'sent' });
  return await res.json();
}
