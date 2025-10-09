/**
 * Review Cycle Service
 * 
 * Creates and manages review cycles with tasks and calendar integration.
 */

import type { ReviewCycle, FeedbackRequest } from '@/types/perf.types';
import { usePerf } from '@/stores/perf.store';
import { withinQuietHours } from '@/services/integrations/timezone.service';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { calendarCreate } from '@/services/integrations/calendar.real.service';

/**
 * Create a review cycle with default tasks and reviewers.
 */
export function createCycle(input: {
  kind: ReviewCycle['kind'];
  title?: string;
  startISO: string;
  dueISO: string;
  tz: string;
  reviewers?: Array<Pick<FeedbackRequest, 'toEmail' | 'toName' | 'role'>>;
}): ReviewCycle {
  const tasks = [
    { id: crypto.randomUUID(), title: 'Draft self-review narrative', done: false, owner: 'self' as const },
    { id: crypto.randomUUID(), title: 'Request 360 feedback', done: false, owner: 'self' as const },
    { id: crypto.randomUUID(), title: 'Manager review notes', done: false, owner: 'manager' as const },
  ];
  const cycle: ReviewCycle = {
    id: crypto.randomUUID(),
    kind: input.kind,
    title: input.title ?? 'Review Cycle',
    startISO: input.startISO,
    dueISO: input.dueISO,
    tz: input.tz,
    tasks,
    reviewers: (input.reviewers ?? []).map((r) => ({
      id: crypto.randomUUID(),
      toEmail: r.toEmail,
      toName: r.toName,
      role: r.role,
      subject: '360 Feedback Request',
      messageHtml: '<p>Please share feedback.</p>',
      status: 'draft',
      token: crypto.randomUUID(),
    })),
  };
  usePerf.getState().upsertCycle(cycle);
  return cycle;
}

/**
 * Add a calendar reminder for the cycle due date.
 */
export async function scheduleCycleReminder(
  cycle: ReviewCycle,
  accountId: string,
  clientId: string,
  passphrase: string
) {
  let dueISO = cycle.dueISO;
  if (withinQuietHours(cycle.dueISO, cycle.tz)) {
    const dt = new Date(cycle.dueISO);
    dt.setHours(10);
    dueISO = dt.toISOString();
  }
  const bearer = await getBearer(accountId, passphrase, clientId);
  return await calendarCreate(bearer, {
    title: `${cycle.title} — Due`,
    whenISO: dueISO,
    durationMin: 30,
  });
}
