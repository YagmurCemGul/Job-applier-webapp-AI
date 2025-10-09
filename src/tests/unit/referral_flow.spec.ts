/**
 * @fileoverview Unit tests for referral flow
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { requestIntro } from '@/services/outreach/referral.service';
import { useOutreach } from '@/stores/outreach.store';

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-token'),
}));

vi.mock('@/services/integrations/gmail.real.service', () => ({
  buildMime: vi.fn().mockReturnValue('mock-mime-data'),
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ id: 'msg-1', threadId: 'thread-1' }),
});

describe('Referral Flow', () => {
  beforeEach(() => {
    useOutreach.setState({ referrals: [] });
    vi.clearAllMocks();
  });

  it('creates referral with requested state', async () => {
    const ref = await requestIntro({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      introducerEmail: 'introducer@example.com',
      subject: 'Intro request',
      html: '<p>Please intro me</p>',
      prospectId: 'p-1',
    });

    expect(ref.prospectId).toBe('p-1');
    expect(ref.introducerEmail).toBe('introducer@example.com');
    expect(ref.introState).toBe('requested');

    const { referrals } = useOutreach.getState();
    expect(referrals.length).toBe(1);
    expect(referrals[0].id).toBe(ref.id);
  });

  it('sends intro request via Gmail', async () => {
    await requestIntro({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      introducerEmail: 'introducer@example.com',
      subject: 'Intro request',
      html: '<p>Please intro me</p>',
      prospectId: 'p-1',
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

  it('stores referral in state', async () => {
    const ref = await requestIntro({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      introducerEmail: 'friend@example.com',
      subject: 'Intro',
      html: '<p>Intro</p>',
      prospectId: 'p-1',
    });

    const { referrals } = useOutreach.getState();
    
    expect(referrals[0]).toMatchObject({
      id: ref.id,
      prospectId: 'p-1',
      introducerEmail: 'friend@example.com',
      introState: 'requested',
    });
  });
});
