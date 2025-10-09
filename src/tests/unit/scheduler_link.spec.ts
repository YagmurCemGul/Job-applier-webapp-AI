/**
 * @fileoverview Unit tests for scheduler link
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSchedulerLink } from '@/services/outreach/scheduler.service';
import { schedulerSnippet } from '@/services/integrations/calendarLink.service';
import { useOutreach } from '@/stores/outreach.store';

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-token'),
}));

vi.mock('@/services/integrations/calendar.real.service', () => ({
  calendarCreate: vi.fn().mockResolvedValue({ id: 'cal-1', htmlLink: 'https://cal.link' }),
}));

describe('Scheduler Link', () => {
  beforeEach(() => {
    useOutreach.setState({ schedulers: [] });
    vi.clearAllMocks();
  });

  it('creates scheduler link with proper fields', async () => {
    const link = await createSchedulerLink({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      tz: 'America/Los_Angeles',
      durationMin: 30,
      title: 'Quick Chat',
    });

    expect(link.title).toBe('Quick Chat');
    expect(link.tz).toBe('America/Los_Angeles');
    expect(link.durationMin).toBe(30);
    expect(link.url).toContain('/schedule/');
  });

  it('stores scheduler in state', async () => {
    const link = await createSchedulerLink({
      accountId: 'acc-1',
      clientId: 'client-1',
      passphrase: 'pass',
      tz: 'UTC',
      durationMin: 60,
      title: 'Meeting',
    });

    const { schedulers } = useOutreach.getState();
    
    expect(schedulers.length).toBe(1);
    expect(schedulers[0].id).toBe(link.id);
  });

  it('generates HTML snippet for email', () => {
    const snippet = schedulerSnippet('https://example.com/schedule/123', 'Book a time');
    
    expect(snippet).toContain('<a href="https://example.com/schedule/123"');
    expect(snippet).toContain('Book a time</a>');
    expect(snippet).toContain('target="_blank"');
    expect(snippet).toContain('rel="noopener noreferrer"');
  });
});
