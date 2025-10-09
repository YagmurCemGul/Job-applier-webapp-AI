/**
 * @fileoverview Integration test for Gmail send and threading
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendOutreachEmail } from '@/services/integrations/gmailOutreach.service';
import { useOutreach } from '@/stores/outreach.store';
import type { Prospect } from '@/types/outreach.types';

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-token'),
}));

vi.mock('@/services/integrations/gmail.real.service', () => ({
  buildMime: vi.fn().mockReturnValue('mock-mime-data'),
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ id: 'msg-123', threadId: 'thread-456' }),
});

describe('Gmail Send and Thread', () => {
  beforeEach(() => {
    useOutreach.setState({ logs: [], suppressions: [] });
    vi.clearAllMocks();
  });

  it('sends email via Gmail and stores log with message id', async () => {
    const prospect: Prospect = {
      id: 'p-1',
      email: 'prospect@example.com',
      name: 'John Doe',
      tags: [],
      status: 'new',
    };

    const log = await sendOutreachEmail({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      prospect,
      subject: 'Test Email',
      html: '<p>Hello</p>',
      campaignId: 'camp-1',
      stepId: 'step-1',
    });

    expect(log.gmailMsgId).toBe('msg-123');
    expect(log.status).toBe('sent');
    expect(log.prospectId).toBe('p-1');
    expect(log.campaignId).toBe('camp-1');

    const { logs } = useOutreach.getState();
    expect(logs.length).toBe(1);
    expect(logs[0].id).toBe(log.id);
  });

  it('prevents sending to suppressed recipient', async () => {
    useOutreach.getState().upsertSuppression({
      id: 's-1',
      email: 'blocked@example.com',
      reason: 'unsub',
      addedAt: new Date().toISOString(),
    });

    const prospect: Prospect = {
      id: 'p-1',
      email: 'blocked@example.com',
      name: 'Blocked User',
      tags: [],
      status: 'new',
    };

    await expect(
      sendOutreachEmail({
        accountId: 'acc-1',
        clientId: 'client-1',
        passphrase: 'pass',
        prospect,
        subject: 'Test',
        html: '<p>Test</p>',
        campaignId: 'camp-1',
        stepId: 'step-1',
      })
    ).rejects.toThrow('Suppressed recipient');
  });

  it('includes variant in log when A/B testing', async () => {
    const prospect: Prospect = {
      id: 'p-1',
      email: 'test@example.com',
      name: 'Test',
      tags: [],
      status: 'new',
    };

    const log = await sendOutreachEmail({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      prospect,
      subject: 'Test',
      html: '<p>Variant B</p>',
      campaignId: 'camp-1',
      stepId: 'step-1',
      variant: 'B',
    });

    expect(log.variant).toBe('B');
  });

  it('calls Gmail API with correct bearer token', async () => {
    const prospect: Prospect = {
      id: 'p-1',
      email: 'test@example.com',
      name: 'Test',
      tags: [],
      status: 'new',
    };

    await sendOutreachEmail({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      prospect,
      subject: 'Test',
      html: '<p>Test</p>',
      campaignId: 'camp-1',
      stepId: 'step-1',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
      })
    );
  });
});
