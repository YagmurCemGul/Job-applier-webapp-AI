/**
 * Outreach sequence run types
 */

export type SequenceRunStatus = 'idle' | 'running' | 'paused' | 'stopped'

export interface SequenceRun {
  id: string
  sequenceId: string
  applicationId?: string // Step 33 link
  accountId: string // Gmail account
  currentStepIndex: number
  nextSendAt?: string
  variables: Record<string, string>
  createdAt: string
  updatedAt: string
  status: SequenceRunStatus
  history: Array<{
    at: string
    stepIndex: number
    outboxId: string
    ok: boolean
    error?: string
  }>
}
