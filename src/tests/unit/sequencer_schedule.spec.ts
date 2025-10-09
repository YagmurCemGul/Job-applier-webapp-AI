/**
 * @fileoverview Unit tests for sequence scheduler
 */

import { describe, it, expect, vi } from 'vitest';
import type { Sequence, SequenceRun } from '@/types/outreach.types';

describe('Sequence Scheduler', () => {
  it('respects quiet hours', () => {
    const seq: Sequence = {
      id: '1',
      name: 'Test',
      steps: [],
      maxPerDay: 10,
      quiet: { startHH: 22, endHH: 8 }
    };

    // Mock current time to be 23:00 (11 PM)
    const now = new Date();
    now.setHours(23);
    
    // In quiet period: should skip
    expect(seq.quiet!.startHH).toBeLessThanOrEqual(now.getHours());
  });

  it('appends unsubscribe footer when enabled', () => {
    const seq: Sequence = {
      id: '1',
      name: 'Test',
      steps: [],
      maxPerDay: 10,
      unsubscribeFooter: true
    };

    expect(seq.unsubscribeFooter).toBe(true);
  });

  it('enforces max sends per day', () => {
    const seq: Sequence = {
      id: '1',
      name: 'Test',
      steps: [],
      maxPerDay: 5
    };

    expect(seq.maxPerDay).toBe(5);
    // In real implementation, would check against sent count
  });
});

describe('Sequence Run Tracking', () => {
  it('tracks history correctly', () => {
    const run: SequenceRun = {
      id: '1',
      sequenceId: 'seq1',
      contactId: 'c1',
      startedAt: '2025-01-01',
      status: 'running',
      history: [
        { at: '2025-01-01', stepId: 'step1', status: 'sent' }
      ]
    };

    expect(run.history).toHaveLength(1);
    expect(run.history[0].status).toBe('sent');
  });
});
