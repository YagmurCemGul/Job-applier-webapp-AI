/**
 * @fileoverview Unit tests for campaign throttle
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runCampaignTick } from '@/services/outreach/campaign.service';
import { createSafeSequence } from '@/services/outreach/sequence.service';
import { createList, upsertProspect } from '@/services/outreach/prospect.service';
import { useOutreach } from '@/stores/outreach.store';
import type { Campaign } from '@/types/outreach.types';

vi.mock('@/services/integrations/gmailOutreach.service', () => ({
  sendOutreachEmail: vi.fn().mockResolvedValue({
    id: 'log-1',
    campaignId: 'camp-1',
    prospectId: 'p-1',
    stepId: 'step-1',
    gmailMsgId: 'msg-1',
    sentAt: new Date().toISOString(),
    status: 'sent',
    opens: 0,
    clicks: 0,
    replied: false,
  }),
}));

describe('Campaign Throttle', () => {
  beforeEach(() => {
    useOutreach.setState({ 
      prospects: [], 
      lists: [], 
      sequences: [], 
      campaigns: [], 
      logs: [],
      suppressions: [],
    });
  });

  it('enforces throttlePerHour limit', async () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    seq.rules!.throttlePerHour = 2; // Only 2 per tick
    useOutreach.getState().upsertSequence(seq);

    const prospects = [
      upsertProspect({ email: 'p1@example.com', name: 'P1' }),
      upsertProspect({ email: 'p2@example.com', name: 'P2' }),
      upsertProspect({ email: 'p3@example.com', name: 'P3' }),
    ];

    const list = createList('Test List', prospects);

    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test Campaign',
      sequenceId: seq.id,
      listId: list.id,
      status: 'draft',
      metrics: { sent: 0, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };
    useOutreach.getState().upsertCampaign(campaign);

    const sent = await runCampaignTick({
      campaignId: campaign.id,
      accountId: 'test',
      clientId: 'test',
      passphrase: 'test',
      unsubscribeUrl: 'http://unsub',
      postalAddress: '123 Main St',
    });

    expect(sent).toBe(2); // Throttled to 2
  });

  it('respects suppression list', async () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');
    useOutreach.getState().upsertSequence(seq);

    const p1 = upsertProspect({ email: 'p1@example.com', name: 'P1' });
    const p2 = upsertProspect({ email: 'p2@example.com', name: 'P2' });

    // Suppress p2
    useOutreach.getState().upsertSuppression({
      id: 's-1',
      email: 'p2@example.com',
      reason: 'unsub',
      addedAt: new Date().toISOString(),
    });

    const list = createList('Test List', [p1, p2]);

    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test Campaign',
      sequenceId: seq.id,
      listId: list.id,
      status: 'draft',
      metrics: { sent: 0, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };
    useOutreach.getState().upsertCampaign(campaign);

    const sent = await runCampaignTick({
      campaignId: campaign.id,
      accountId: 'test',
      clientId: 'test',
      passphrase: 'test',
      unsubscribeUrl: 'http://unsub',
      postalAddress: '123 Main St',
    });

    expect(sent).toBe(1); // Only p1
  });
});
