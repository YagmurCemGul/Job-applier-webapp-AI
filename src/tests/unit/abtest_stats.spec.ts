/**
 * @fileoverview Unit tests for A/B test statistics
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { pickAbWinner } from '@/services/outreach/abtest.service';
import { createSafeSequence } from '@/services/outreach/sequence.service';
import { useOutreach } from '@/stores/outreach.store';
import type { SendLog } from '@/types/outreach.types';

describe('A/B Test Stats', () => {
  beforeEach(() => {
    useOutreach.setState({ 
      sequences: [], 
      logs: [],
    });
  });

  it('picks winner when z-score >= 1.96', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    seq.ab = { enabled: true, goal: 'open_rate', variants: { A: {}, B: {} } };
    useOutreach.getState().upsertSequence(seq);

    // Variant A: 10/100 opens
    for (let i = 0; i < 100; i++) {
      const log: SendLog = {
        id: `log-a-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-${i}`,
        stepId: seq.steps[0].id,
        variant: 'A',
        sentAt: new Date().toISOString(),
        status: 'sent',
        opens: i < 10 ? 1 : 0,
      };
      useOutreach.getState().upsertLog(log);
    }

    // Variant B: 30/100 opens (much better)
    for (let i = 0; i < 100; i++) {
      const log: SendLog = {
        id: `log-b-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-b-${i}`,
        stepId: seq.steps[0].id,
        variant: 'B',
        sentAt: new Date().toISOString(),
        status: 'sent',
        opens: i < 30 ? 1 : 0,
      };
      useOutreach.getState().upsertLog(log);
    }

    const result = pickAbWinner(seq, 'open_rate');

    expect(result.winner).toBe('B');
    expect(Math.abs(result.z)).toBeGreaterThanOrEqual(1.96);
    expect(result.pB).toBeGreaterThan(result.pA);
  });

  it('returns null winner when inconclusive', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    seq.ab = { enabled: true, goal: 'reply_rate', variants: { A: {}, B: {} } };
    useOutreach.getState().upsertSequence(seq);

    // Variant A: 5/10 replies
    for (let i = 0; i < 10; i++) {
      const log: SendLog = {
        id: `log-a-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-${i}`,
        stepId: seq.steps[0].id,
        variant: 'A',
        sentAt: new Date().toISOString(),
        status: 'sent',
        replied: i < 5,
      };
      useOutreach.getState().upsertLog(log);
    }

    // Variant B: 6/10 replies (close, small sample)
    for (let i = 0; i < 10; i++) {
      const log: SendLog = {
        id: `log-b-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-b-${i}`,
        stepId: seq.steps[0].id,
        variant: 'B',
        sentAt: new Date().toISOString(),
        status: 'sent',
        replied: i < 6,
      };
      useOutreach.getState().upsertLog(log);
    }

    const result = pickAbWinner(seq, 'reply_rate');

    expect(result.winner).toBeNull();
    expect(Math.abs(result.z)).toBeLessThan(1.96);
  });

  it('calculates correct proportions', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    seq.ab = { enabled: true, goal: 'click_rate', variants: { A: {}, B: {} } };
    useOutreach.getState().upsertSequence(seq);

    // Variant A: 2/10 clicks
    for (let i = 0; i < 10; i++) {
      const log: SendLog = {
        id: `log-a-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-${i}`,
        stepId: seq.steps[0].id,
        variant: 'A',
        sentAt: new Date().toISOString(),
        status: 'sent',
        clicks: i < 2 ? 1 : 0,
      };
      useOutreach.getState().upsertLog(log);
    }

    // Variant B: 3/10 clicks
    for (let i = 0; i < 10; i++) {
      const log: SendLog = {
        id: `log-b-${i}`,
        campaignId: 'camp-1',
        prospectId: `p-b-${i}`,
        stepId: seq.steps[0].id,
        variant: 'B',
        sentAt: new Date().toISOString(),
        status: 'sent',
        clicks: i < 3 ? 1 : 0,
      };
      useOutreach.getState().upsertLog(log);
    }

    const result = pickAbWinner(seq, 'click_rate');

    expect(result.pA).toBe(0.2); // 2/10
    expect(result.pB).toBe(0.3); // 3/10
  });
});
