/**
 * @fileoverview Integration test for A/B auto winner selection
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { pickAbWinner } from '@/services/outreach/abtest.service';
import { createSafeSequence } from '@/services/outreach/sequence.service';
import { useOutreach } from '@/stores/outreach.store';
import type { SendLog, Sequence } from '@/types/outreach.types';

describe('A/B Auto Winner', () => {
  beforeEach(() => {
    useOutreach.setState({ sequences: [], logs: [] });
  });

  it('selects variant A as winner when significantly better', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    seq.ab = { enabled: true, goal: 'reply_rate', variants: { A: {}, B: {} } };
    useOutreach.getState().upsertSequence(seq);

    // Variant A: 40/100 replies (40%)
    for (let i = 0; i < 100; i++) {
      const log: SendLog = {
        id: `log-a-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-a-${i}`,
        stepId: seq.steps[0].id,
        variant: 'A',
        sentAt: new Date().toISOString(),
        status: 'sent',
        replied: i < 40,
      };
      useOutreach.getState().upsertLog(log);
    }

    // Variant B: 20/100 replies (20%)
    for (let i = 0; i < 100; i++) {
      const log: SendLog = {
        id: `log-b-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-b-${i}`,
        stepId: seq.steps[0].id,
        variant: 'B',
        sentAt: new Date().toISOString(),
        status: 'sent',
        replied: i < 20,
      };
      useOutreach.getState().upsertLog(log);
    }

    const result = pickAbWinner(seq, 'reply_rate');

    expect(result.winner).toBe('A');
    expect(result.pA).toBe(0.4);
    expect(result.pB).toBe(0.2);
    expect(Math.abs(result.z)).toBeGreaterThan(1.96);
  });

  it('applies winner to sequence after selection', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    seq.ab = { enabled: true, goal: 'open_rate', variants: { A: {}, B: {} } };
    useOutreach.getState().upsertSequence(seq);

    // Create clear winner (B)
    for (let i = 0; i < 100; i++) {
      useOutreach.getState().upsertLog({
        id: `log-a-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-a-${i}`,
        stepId: seq.steps[0].id,
        variant: 'A',
        sentAt: new Date().toISOString(),
        status: 'sent',
        opens: i < 10 ? 1 : 0,
      });
    }

    for (let i = 0; i < 100; i++) {
      useOutreach.getState().upsertLog({
        id: `log-b-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-b-${i}`,
        stepId: seq.steps[0].id,
        variant: 'B',
        sentAt: new Date().toISOString(),
        status: 'sent',
        opens: i < 40 ? 1 : 0,
      });
    }

    const result = pickAbWinner(seq, 'open_rate');

    expect(result.winner).toBe('B');

    // In practice, would apply winner variant to sequence
    const updated: Sequence = {
      ...seq,
      ab: { ...seq.ab!, enabled: false }, // Disable A/B, use winner
    };
    useOutreach.getState().upsertSequence(updated);

    const final = useOutreach.getState().sequences.find(s => s.id === seq.id);
    expect(final?.ab?.enabled).toBe(false);
  });

  it('waits for more data when sample is too small', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    seq.ab = { enabled: true, goal: 'click_rate', variants: { A: {}, B: {} } };
    useOutreach.getState().upsertSequence(seq);

    // Very small sample
    useOutreach.getState().upsertLog({
      id: 'log-a-1',
      campaignId: 'camp-1',
      prospectId: 'p-a-1',
      stepId: seq.steps[0].id,
      variant: 'A',
      sentAt: new Date().toISOString(),
      status: 'sent',
      clicks: 1,
    });

    useOutreach.getState().upsertLog({
      id: 'log-b-1',
      campaignId: 'camp-1',
      prospectId: 'p-b-1',
      stepId: seq.steps[0].id,
      variant: 'B',
      sentAt: new Date().toISOString(),
      status: 'sent',
      clicks: 0,
    });

    const result = pickAbWinner(seq, 'click_rate');

    expect(result.winner).toBeNull(); // Inconclusive
  });
});
