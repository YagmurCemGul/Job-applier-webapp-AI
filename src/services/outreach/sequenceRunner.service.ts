import { useSequenceRunsStore } from '@/store/sequenceRunsStore'
import { useOutboxStore } from '@/store/outboxStore'
import { useEmailTemplatesStore } from '@/store/emailTemplatesStore'
import { useEmailAccountsStore } from '@/store/emailAccountsStore'
import { useOutreachStore } from '@/store/outreachStore'
import { useSequenceSchedulerStore } from '@/store/sequenceSchedulerStore'
import { renderTemplate } from './templateRender.service'
import { makeOpenPixel, wrapLinksForClick } from './tracking.service'
import { gmailSend } from '@/services/integrations/gmail.real.service'
import { getBearer } from '@/services/integrations/google.oauth.service'
import type { OutboxMessage } from '@/types/gmail.types'

let timer: any = null

/**
 * Start the sequence scheduler
 */
export function startSequenceScheduler(): void {
  stopSequenceScheduler()
  const { tickSec } = useSequenceSchedulerStore.getState()
  timer = setInterval(tick, tickSec * 1000)
}

/**
 * Stop the sequence scheduler
 */
export function stopSequenceScheduler(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

/**
 * Tick function - checks and runs pending steps
 */
async function tick(): Promise<void> {
  const { running } = useSequenceSchedulerStore.getState()
  if (!running) return

  const now = Date.now()
  const runs = useSequenceRunsStore
    .getState()
    .runs.filter(
      (r) => r.status === 'running' && (!r.nextSendAt || new Date(r.nextSendAt).getTime() <= now)
    )

  for (const run of runs) {
    await runStep(run.id).catch(() => {
      // Ignore errors - they're logged
    })
  }
}

/**
 * Execute a single sequence step
 */
export async function runStep(runId: string): Promise<void> {
  const runs = useSequenceRunsStore.getState().runs
  const run = runs.find((r) => r.id === runId)

  if (!run) {
    throw new Error('Run not found')
  }

  const seq = useOutreachStore.getState().getById(run.sequenceId)
  if (!seq) {
    throw new Error('Sequence not found')
  }

  const step = seq.steps[run.currentStepIndex]
  if (!step) {
    // No more steps - mark as stopped
    useSequenceRunsStore.getState().setStatus(run.id, 'stopped')
    return
  }

  const tpl = useEmailTemplatesStore.getState().getById(step.templateId)
  if (!tpl) {
    throw new Error('Template not found')
  }

  // Render template with variables
  const rendered = renderTemplate({ subject: tpl.subject, body: tpl.body }, run.variables)

  // Add tracking
  const trackingId =
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())

  const htmlTracked =
    wrapLinksForClick(rendered.html, trackingId) +
    `<img src="${makeOpenPixel(trackingId)}" width="1" height="1" alt="" />`

  const acc = useEmailAccountsStore.getState().items.find((a) => a.id === run.accountId)
  if (!acc) {
    throw new Error('Account not found')
  }

  const outbox: OutboxMessage = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    accountId: acc.id,
    to: [run.variables['RecruiterEmail'] ?? run.variables['To'] ?? ''],
    subject: rendered.subject,
    html: htmlTracked,
    text: rendered.text,
    status: acc.dryRun ? 'scheduled' : 'pending',
    createdAt: new Date().toISOString(),
    tracking: {
      openId: trackingId,
      pixelUrl: makeOpenPixel(trackingId),
    },
  }

  useOutboxStore.getState().upsert(outbox)

  if (acc.dryRun) {
    // Dry-run mode - don't actually send
    useSequenceRunsStore.getState().markStep(
      run.id,
      {
        at: new Date().toISOString(),
        stepIndex: run.currentStepIndex,
        outboxId: outbox.id,
        ok: true,
        error: undefined,
      },
      nextTime(step),
      run.currentStepIndex + 1
    )
    return
  }

  try {
    // Get bearer token
    const bearer = await getBearer(acc.id, envPassphrase(), envClientId())

    // Send via Gmail API
    const { id, threadId } = await gmailSend(bearer, outbox)

    // Update outbox status
    useOutboxStore.getState().setStatus(outbox.id, 'sent', {
      sentAt: new Date().toISOString(),
      headers: { 'X-Message-Id': id },
      threadId,
    })

    // Mark step complete and schedule next
    useSequenceRunsStore.getState().markStep(
      run.id,
      {
        at: new Date().toISOString(),
        stepIndex: run.currentStepIndex,
        outboxId: outbox.id,
        ok: true,
      },
      nextTime(step),
      run.currentStepIndex + 1
    )
  } catch (e: any) {
    // Send failed - mark as failed and retry in 6 hours
    useOutboxStore.getState().setStatus(outbox.id, 'failed', {
      error: e?.message ?? String(e),
    })

    // Backoff 6 hours
    useSequenceRunsStore.getState().markStep(
      run.id,
      {
        at: new Date().toISOString(),
        stepIndex: run.currentStepIndex,
        outboxId: outbox.id,
        ok: false,
        error: e?.message,
      },
      new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      run.currentStepIndex
    )
  }
}

/**
 * Calculate next send time based on step offset and send time
 */
function nextTime(step: { offsetDays: number; sendTime?: string }): string {
  const base = new Date()
  base.setDate(base.getDate() + (step.offsetDays ?? 0))

  if (step.sendTime) {
    const [h, m] = step.sendTime.split(':').map(Number)
    base.setHours(h, m ?? 0, 0, 0)
  }

  return base.toISOString()
}

/**
 * Get OAuth passphrase from env
 */
function envPassphrase(): string {
  return import.meta.env.VITE_OAUTH_PASSPHRASE || 'demo-pass'
}

/**
 * Get Google Client ID from env
 */
function envClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}
