/**
 * Sequence runner service
 * Executes delayed email steps reliably with foreground scheduler
 */
import { useSequenceRuns } from '@/stores/sequenceRuns.store';
import { useOutbox } from '@/stores/outbox.store';
import { useEmailAccounts } from '@/stores/emailAccounts.store';
import { renderTemplate } from './templateRender.service';
import { makeOpenPixel, wrapLinksForClick, generateTrackingId } from './tracking.service';
import { gmailSend } from '@/services/integrations/gmail.real.service';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { useSequenceScheduler } from '@/stores/sequenceScheduler.store';
import type { OutboxMessage } from '@/types/gmail.types';

// Dynamic imports for stores from ai-cv-builder (Step 33 structures)
let useEmailTemplates: any;
let useOutreachStore: any;

async function loadStores() {
  if (!useEmailTemplates) {
    useEmailTemplates = (await import('@/stores/emailTemplates.store')).useEmailTemplates;
  }
  if (!useOutreachStore) {
    useOutreachStore = (await import('@/stores/outreach.store')).useOutreachStore;
  }
}

let timer: NodeJS.Timeout | null = null;

/**
 * Start sequence scheduler
 * Runs tick at configured interval
 */
export function startSequenceScheduler(): void {
  stopSequenceScheduler();
  const { tickSec } = useSequenceScheduler.getState();
  timer = setInterval(tick, tickSec * 1000);
}

/**
 * Stop sequence scheduler
 */
export function stopSequenceScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * Tick handler - process due sequence steps
 */
async function tick(): Promise<void> {
  const { running } = useSequenceScheduler.getState();
  if (!running) return;

  const now = Date.now();
  const runs = useSequenceRuns
    .getState()
    .runs.filter(
      (r) =>
        r.status === 'running' &&
        (!r.nextSendAt || new Date(r.nextSendAt).getTime() <= now)
    );

  for (const run of runs) {
    try {
      await runStep(run.id);
    } catch (error) {
      console.error('Sequence step failed:', error);
    }
  }

  useSequenceScheduler.getState().updateLastTick();
}

/**
 * Execute single sequence step
 */
export async function runStep(runId: string): Promise<void> {
  await loadStores();

  const runs = useSequenceRuns.getState().runs;
  const run = runs.find((r) => r.id === runId);
  if (!run) throw new Error('Run not found');

  const seq = useOutreachStore.getState().getById(run.sequenceId);
  if (!seq) throw new Error('Sequence not found');

  const step = seq.steps[run.currentStepIndex];
  if (!step) {
    // Sequence complete
    useSequenceRuns.getState().setStatus(run.id, 'stopped');
    return;
  }

  const tpl = useEmailTemplates.getState().getById(step.templateId);
  if (!tpl) throw new Error('Template not found');

  // Render template with variables
  const rendered = renderTemplate(
    { subject: tpl.subject, body: tpl.body },
    run.variables
  );

  const trackingId = generateTrackingId();
  const htmlTracked =
    wrapLinksForClick(rendered.html, trackingId) +
    `<img src="${makeOpenPixel(trackingId)}" width="1" height="1" alt="" />`;

  const acc = useEmailAccounts.getState().getById(run.accountId);
  if (!acc) throw new Error('Account not found');

  const outbox: OutboxMessage = {
    id: generateTrackingId(),
    accountId: acc.id,
    to: [
      run.variables['RecruiterEmail'] ??
        run.variables['To'] ??
        run.variables['Email'] ??
        ''
    ],
    subject: rendered.subject,
    html: htmlTracked,
    text: rendered.text,
    status: acc.dryRun ? 'scheduled' : 'pending',
    createdAt: new Date().toISOString(),
    tracking: {
      openId: trackingId,
      pixelUrl: makeOpenPixel(trackingId)
    }
  };

  useOutbox.getState().upsert(outbox);

  // Dry-run mode - just log
  if (acc.dryRun) {
    useSequenceRuns.getState().markStep(
      run.id,
      {
        at: new Date().toISOString(),
        stepIndex: run.currentStepIndex,
        outboxId: outbox.id,
        ok: true,
        error: undefined
      },
      calculateNextSendTime(step),
      run.currentStepIndex + 1
    );
    return;
  }

  // Real send
  try {
    const bearer = await getBearer(
      acc.id,
      getEnvPassphrase(),
      getEnvClientId()
    );
    const { id, threadId } = await gmailSend(bearer, outbox);

    useOutbox.getState().setStatus(outbox.id, 'sent', {
      sentAt: new Date().toISOString(),
      headers: { 'X-Message-Id': id },
      threadId
    });

    useSequenceRuns.getState().markStep(
      run.id,
      {
        at: new Date().toISOString(),
        stepIndex: run.currentStepIndex,
        outboxId: outbox.id,
        ok: true
      },
      calculateNextSendTime(step),
      run.currentStepIndex + 1
    );
  } catch (e: any) {
    useOutbox.getState().setStatus(outbox.id, 'failed', {
      error: e?.message ?? String(e)
    });

    // Exponential backoff - retry after 6 hours
    const backoffTime = new Date(Date.now() + 6 * 3600 * 1000).toISOString();

    useSequenceRuns.getState().markStep(
      run.id,
      {
        at: new Date().toISOString(),
        stepIndex: run.currentStepIndex,
        outboxId: outbox.id,
        ok: false,
        error: e?.message
      },
      backoffTime,
      run.currentStepIndex // Retry same step
    );
  }
}

/**
 * Calculate next send time based on step configuration
 */
function calculateNextSendTime(step: {
  offsetDays: number;
  sendTime?: string;
}): string {
  const base = new Date();
  base.setDate(base.getDate() + (step.offsetDays ?? 0));

  if (step.sendTime) {
    const [h, m] = step.sendTime.split(':').map(Number);
    base.setHours(h, m ?? 0, 0, 0);
  }

  return base.toISOString();
}

/**
 * Get environment passphrase
 */
function getEnvPassphrase(): string {
  return import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass';
}

/**
 * Get environment client ID
 */
function getEnvClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
}
