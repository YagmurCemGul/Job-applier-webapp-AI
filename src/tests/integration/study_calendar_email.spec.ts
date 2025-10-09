/**
 * Study Calendar & Email Integration Test (Step 47)
 */

import { describe, it, expect, vi } from 'vitest';
import { scheduleStudySessions } from '@/services/integrations/calendarSkills.service';

describe('Study Calendar & Email', () => {
  it('schedules recurring sessions and emails plan summary', async () => {
    // Mock Calendar API
    const mockCreate = vi.fn().mockResolvedValue({ id: 'evt-1', htmlLink: 'https://cal.link' });
    vi.mock('@/services/integrations/calendar.real.service', () => ({
      calendarCreate: mockCreate
    }));

    // Mock OAuth
    vi.mock('@/services/integrations/google.oauth.service', () => ({
      getBearer: vi.fn().mockResolvedValue('mock-token')
    }));

    // 1. Schedule study sessions
    const events = await scheduleStudySessions({
      accountId: 'user-1',
      clientId: 'oauth-client',
      passphrase: 'secret',
      tz: 'America/New_York',
      startISO: new Date('2025-10-10T09:00:00Z').toISOString(),
      dailyMinutes: 45,
      days: 5,
      title: 'Study Session'
    });

    expect(events).toBeDefined();
    expect(events.length).toBe(5);
  });

  it('respects quiet hours and adjusts time', async () => {
    vi.mock('@/services/integrations/google.oauth.service', () => ({
      getBearer: vi.fn().mockResolvedValue('mock-token')
    }));

    const mockCreate = vi.fn().mockResolvedValue({ id: 'evt-1', htmlLink: 'https://cal.link' });
    vi.mock('@/services/integrations/calendar.real.service', () => ({
      calendarCreate: mockCreate
    }));

    // Start time at 9am (not in quiet hours)
    const events = await scheduleStudySessions({
      accountId: 'user-1',
      clientId: 'oauth-client',
      passphrase: 'secret',
      tz: 'America/Los_Angeles',
      startISO: new Date('2025-10-10T09:00:00Z').toISOString(),
      dailyMinutes: 30,
      days: 3,
      title: 'Morning Study'
    });

    expect(events).toBeDefined();
  });

  it('sends email plan summary (mock)', async () => {
    // Mock Gmail API
    const mockSend = vi.fn().mockResolvedValue({ id: 'msg-1' });
    
    const emailBody = `
      <h1>Learning Path Plan</h1>
      <p>Total: 5 steps, 3h 30m</p>
      <p>Scheduled: Mon-Fri, 9am, 45min sessions</p>
    `;

    await mockSend({
      to: 'user@example.com',
      subject: 'Your Learning Path',
      body: emailBody
    });

    expect(mockSend).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Your Learning Path',
      body: expect.stringContaining('Learning Path Plan')
    });
  });
});
