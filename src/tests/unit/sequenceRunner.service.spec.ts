import { describe, it, expect, beforeEach } from 'vitest'
import { useSequenceRunsStore } from '@/store/sequenceRunsStore'
import { useOutboxStore } from '@/store/outboxStore'
import { useEmailAccountsStore } from '@/store/emailAccountsStore'
import { useEmailTemplatesStore } from '@/store/emailTemplatesStore'
import { useOutreachStore } from '@/store/outreachStore'

describe('sequenceRunner.service', () => {
  beforeEach(() => {
    useSequenceRunsStore.setState({ runs: [] })
    useOutboxStore.setState({ messages: [] })
    useEmailAccountsStore.setState({ items: [] })
    useEmailTemplatesStore.setState({ items: [] })
    useOutreachStore.setState({ sequences: [] })
  })

  it('should create run with initial state', () => {
    const run = {
      id: 'run1',
      sequenceId: 'seq1',
      accountId: 'test@example.com',
      currentStepIndex: 0,
      variables: { Company: 'Acme' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'running' as const,
      history: [],
    }

    useSequenceRunsStore.getState().upsert(run)

    const runs = useSequenceRunsStore.getState().runs
    expect(runs).toHaveLength(1)
    expect(runs[0].sequenceId).toBe('seq1')
  })

  it('should mark step complete', () => {
    const run = {
      id: 'run1',
      sequenceId: 'seq1',
      accountId: 'test@example.com',
      currentStepIndex: 0,
      variables: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'running' as const,
      history: [],
    }

    useSequenceRunsStore.getState().upsert(run)

    useSequenceRunsStore.getState().markStep(
      'run1',
      {
        at: new Date().toISOString(),
        stepIndex: 0,
        outboxId: 'msg1',
        ok: true,
      },
      new Date(Date.now() + 3600000).toISOString(),
      1
    )

    const runs = useSequenceRunsStore.getState().runs
    expect(runs[0].history).toHaveLength(1)
    expect(runs[0].currentStepIndex).toBe(1)
  })

  it('should change run status', () => {
    const run = {
      id: 'run1',
      sequenceId: 'seq1',
      accountId: 'test@example.com',
      currentStepIndex: 0,
      variables: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'running' as const,
      history: [],
    }

    useSequenceRunsStore.getState().upsert(run)
    useSequenceRunsStore.getState().setStatus('run1', 'paused')

    const runs = useSequenceRunsStore.getState().runs
    expect(runs[0].status).toBe('paused')
  })
})
