/**
 * @fileoverview Integration test for sequence stop on reply
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runCampaignTick } from '@/services/outreach/campaign.service';
import { track } from '@/services/outreach/tracking.service';
import { createSafeSequence } from '@/services/outreach/sequence.service';
import { createList, upsertProspect } from '@/services/outreach/prospect.service';
import { useOutreach } from '@/stores/outreach.store';
import type { Campaign } from '@/types/outreach.types';

vi.mock('@/services/integrations/gmailOutreach.service', () => ({
  sendOutreachEmail: vi.fn().mockImplementation(async (opts) => {
    const log = {
      id: crypto.randomUUID(),
      campaignId: opts.campaignId,
      prospectId: opts.prospect.id,
      stepId: opts.stepId,
      gmailMsgId: 'msg-1',
      sentAt: new Date().toISOString(),
      status: 'sent',
      opens: 0,
      clicks: 0,
      replied: false,
    };
    useOutreach.getState().upsertLog(log);
    return log;
  }),
}));

describe('Sequence Stop on Reply', () => {
  beforeEach(() => {
    useOutreach.setState({
      prospects: [],
      lists: [],
      sequences: [],
      campaigns: [],
      logs: [],
      events: [],
      suppressions: [],
    });
    vi.clearAllMocks();
  });

  it('stops sequence when reply is tracked', async () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    useOutreach.getState().upsertSequence(seq);

    const prospect = upsertProspect({ email: 'p1@example.com', name: 'P1' });
    const list = createList('Test List', [prospect]);

    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test Campaign',
      sequenceId: seq.id,
      listId: list.id,
      status: 'draft',
      metrics: { sent: 0, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };
    useOutreach.getState().upsertCampaign(campaign);

    // First tick: send step 1
    await runCampaignTick({
      campaignId: campaign.id,
      accountId: 'test',
      clientId: 'test',
      passphrase: 'test',
      unsubscribeUrl: 'http://unsub',
      postalAddress: '123 Main St',
    });

    let { logs } = useOutreach.getState();
    expect(logs.length).toBe(1);

    // Track reply
    track(logs[0].id, 'reply');

    // Second tick: should NOT send step 3 (follow-up) due to reply
    const sent = await runCampaignTick({
      campaignId: campaign.id,
      accountId: 'test',
      clientId: 'test',
      passphrase: 'test',
      unsubscribeUrl: 'http://unsub',
      postalAddress: '123 Main St',
    });

    expect(sent).toBe(0); // No new sends
    
    const finalLogs = useOutreach.getState().logs;
    expect(finalLogs.length).toBe(1); // Still only the first email
  });

  it('stops sequence when unsubscribe is tracked', async () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    useOutreach.getState().upsertSequence(seq);

    const prospect = upsertProspect({ email: 'p1@example.com', name: 'P1' });
    const list = createList('Test List', [prospect]);

    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test Campaign',
      sequenceId: seq.id,
      listId: list.id,
      status: 'draft',
      metrics: { sent: 0, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };
    useOutreach.getState().upsertCampaign(campaign);

    // First tick
    await runCampaignTick({
      campaignId: campaign.id,
      accountId: 'test',
      clientId: 'test',
      passphrase: 'test',
      unsubscribeUrl: 'http://unsub',
      postalAddress: '123 Main St',
    });

    // Add to suppression (simulates unsub)
    useOutreach.getState().upsertSuppression({
      id: 's-1',
      email: 'p1@example.com',
      reason: 'unsub',
      addedAt: new Date().toISOString(),
    });

    // Second tick: should NOT send due to suppression
    const sent = await runCampaignTick({
      campaignId: campaign.id,
      accountId: 'test',
      clientId: 'test',
      passphrase: 'test',
      unsubscribeUrl: 'http://unsub',
      postalAddress: '123 Main St',
    });

    expect(sent).toBe(0);
  });
});
