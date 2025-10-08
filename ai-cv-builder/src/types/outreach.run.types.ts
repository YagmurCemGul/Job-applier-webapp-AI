/**
 * Sequence run types for outreach automation
 */

export type SequenceRunStatus = 'idle' | 'running' | 'paused' | 'stopped';

/**
 * Active sequence run with history and state
 */
export interface SequenceRun {
  id: string;
  sequenceId: string;
  applicationId?: string;       // Step 33 link
  accountId: string;            // Gmail account
  currentStepIndex: number;
  nextSendAt?: string;
  variables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  status: SequenceRunStatus;
  history: Array<{ 
    at: string; 
    stepIndex: number; 
    outboxId: string; 
    ok: boolean; 
    error?: string;
  }>;
}
