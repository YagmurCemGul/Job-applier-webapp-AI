/**
 * @fileoverview Unit tests for tracking metrics
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { track } from '@/services/outreach/tracking.service';
import { useOutreach } from '@/stores/outreach.store';
import type { SendLog, Campaign } from '@/types/outreach.types';

describe('Tracking Metrics', () => {
  beforeEach(() => {
    useOutreach.setState({ 
      events: [], 
      logs: [], 
      campaigns: [],
    });
  });

  it('creates tracking event and bumps log opens', () => {
    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test',
      sequenceId: 'seq-1',
      listId: 'list-1',
      status: 'running',
      metrics: { sent: 1, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };

    const log: SendLog = {
      id: 'log-1',
      campaignId: 'camp-1',
      prospectId: 'p-1',
      stepId: 'step-1',
      sentAt: new Date().toISOString(),
      status: 'sent',
      opens: 0,
      clicks: 0,
      replied: false,
    };

    useOutreach.getState().upsertCampaign(campaign);
    useOutreach.getState().upsertLog(log);

    track('log-1', 'open');

    const { events, logs, campaigns } = useOutreach.getState();
    
    expect(events.length).toBe(1);
    expect(events[0].type).toBe('open');
    expect(logs[0].opens).toBe(1);
    expect(campaigns[0].metrics.opens).toBe(1);
  });

  it('tracks clicks', () => {
    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test',
      sequenceId: 'seq-1',
      listId: 'list-1',
      status: 'running',
      metrics: { sent: 1, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };

    const log: SendLog = {
      id: 'log-1',
      campaignId: 'camp-1',
      prospectId: 'p-1',
      stepId: 'step-1',
      sentAt: new Date().toISOString(),
      status: 'sent',
      clicks: 0,
    };

    useOutreach.getState().upsertCampaign(campaign);
    useOutreach.getState().upsertLog(log);

    track('log-1', 'click');

    const { logs, campaigns } = useOutreach.getState();
    
    expect(logs[0].clicks).toBe(1);
    expect(campaigns[0].metrics.clicks).toBe(1);
  });

  it('tracks replies', () => {
    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test',
      sequenceId: 'seq-1',
      listId: 'list-1',
      status: 'running',
      metrics: { sent: 1, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };

    const log: SendLog = {
      id: 'log-1',
      campaignId: 'camp-1',
      prospectId: 'p-1',
      stepId: 'step-1',
      sentAt: new Date().toISOString(),
      status: 'sent',
      replied: false,
    };

    useOutreach.getState().upsertCampaign(campaign);
    useOutreach.getState().upsertLog(log);

    track('log-1', 'reply');

    const { logs, campaigns } = useOutreach.getState();
    
    expect(logs[0].replied).toBe(true);
    expect(campaigns[0].metrics.replies).toBe(1);
  });

  it('tracks bounces and updates log status', () => {
    const campaign: Campaign = {
      id: 'camp-1',
      name: 'Test',
      sequenceId: 'seq-1',
      listId: 'list-1',
      status: 'running',
      metrics: { sent: 1, delivered: 0, opens: 0, clicks: 0, replies: 0, bounces: 0, unsubs: 0 },
    };

    const log: SendLog = {
      id: 'log-1',
      campaignId: 'camp-1',
      prospectId: 'p-1',
      stepId: 'step-1',
      sentAt: new Date().toISOString(),
      status: 'sent',
    };

    useOutreach.getState().upsertCampaign(campaign);
    useOutreach.getState().upsertLog(log);

    track('log-1', 'bounce');

    const { logs, campaigns } = useOutreach.getState();
    
    expect(logs[0].status).toBe('bounced');
    expect(campaigns[0].metrics.bounces).toBe(1);
  });
});
