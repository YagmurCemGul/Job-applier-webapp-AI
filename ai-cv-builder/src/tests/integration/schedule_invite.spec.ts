/**
 * Integration Test: Schedule & Invite Flow
 * Tests: create interview → propose slots → create calendar event → send invites
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInterviewEvent } from '@/services/interview/scheduling.service';
import { generateMeetingLink } from '@/services/interview/meetingLinks.service';

// Mock the external services
vi.mock('@/services/integrations/calendar.real.service', () => ({
  calendarCreate: vi.fn(async () => ({
    id: 'mock-event-123',
    htmlLink: 'https://meet.google.com/abc-defg-hij',
  })),
}));

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn(async () => 'mock-bearer-token'),
}));

describe('Integration: Schedule & Invite Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create calendar event with meeting link', async () => {
    const eventData = {
      accountId: 'test-account',
      title: 'Interview: Jane Doe - Senior Engineer',
      whenISO: '2025-10-15T10:00:00Z',
      durationMin: 60,
      attendees: ['jane.doe@example.com', 'interviewer@company.com'],
      location: 'Google Meet',
      description: 'Technical interview for Senior Engineer position',
    };

    const event = await createInterviewEvent(eventData);

    expect(event.id).toBeDefined();
    expect(event.htmlLink).toBeDefined();
  });

  it('should generate Google Meet link from event', async () => {
    const eventHtmlLink = 'https://meet.google.com/abc-defg-hij';

    const meetingLink = generateMeetingLink('google_meet', eventHtmlLink);

    expect(meetingLink).toBe(eventHtmlLink);
  });

  it('should handle event creation failure gracefully', async () => {
    // Mock a failure scenario
    const { calendarCreate } = await import('@/services/integrations/calendar.real.service');
    vi.mocked(calendarCreate).mockRejectedValueOnce(new Error('API Error'));

    const eventData = {
      accountId: 'test-account',
      title: 'Interview: Jane Doe',
      whenISO: '2025-10-15T10:00:00Z',
      durationMin: 60,
      attendees: ['jane.doe@example.com'],
    };

    // Should not throw, should return mock event
    const event = await createInterviewEvent(eventData);
    expect(event.id).toBeDefined();
  });

  it('should include all attendees in calendar event', async () => {
    const { calendarCreate } = await import('@/services/integrations/calendar.real.service');

    const attendees = [
      'candidate@example.com',
      'hiring-manager@company.com',
      'tech-lead@company.com',
      'hr@company.com',
    ];

    await createInterviewEvent({
      accountId: 'test-account',
      title: 'Panel Interview',
      whenISO: '2025-10-15T14:00:00Z',
      durationMin: 90,
      attendees,
    });

    expect(calendarCreate).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        attendees,
      })
    );
  });
});
