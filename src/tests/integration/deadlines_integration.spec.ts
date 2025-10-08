/**
 * @fileoverview Integration test for deadlines with calendar
 * @module tests/integration/deadlines_integration
 */

import { describe, it, expect, vi } from 'vitest';
import { createDeadlineEvent, getDeadlineStatus, isDeadlineApproaching } from '@/services/offer/deadline.service';

// Mock calendar and OAuth services
vi.mock('@/services/integrations/calendar.real.service', () => ({
  calendarCreate: vi.fn(async (_bearer, opts) => ({
    id: 'event-123',
    htmlLink: 'https://calendar.google.com/event/123',
    summary: opts.title
  }))
}));

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn(async () => 'mock-token')
}));

describe('Deadlines Integration', () => {
  describe('Calendar Integration', () => {
    it('should create calendar event for deadline', async () => {
      const result = await createDeadlineEvent({
        accountId: 'test-account',
        label: 'Accept by Dec 31',
        atISO: '2025-12-31T23:59:59',
        attendees: ['recruiter@company.com']
      });

      expect(result.eventId).toBe('event-123');
      expect(result.htmlLink).toContain('calendar.google.com');
    });

    it('should handle calendar creation failure gracefully', async () => {
      const { calendarCreate } = await import('@/services/integrations/calendar.real.service');
      vi.mocked(calendarCreate).mockRejectedValueOnce(new Error('API Error'));

      await expect(
        createDeadlineEvent({
          accountId: 'test-account',
          label: 'Test deadline',
          atISO: '2025-12-31T23:59:59'
        })
      ).rejects.toThrow();
    });
  });

  describe('Deadline Status', () => {
    it('should detect approaching deadlines', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      expect(isDeadlineApproaching(tomorrow.toISOString())).toBe(true);
    });

    it('should not flag deadlines far in future', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 100);

      expect(isDeadlineApproaching(farFuture.toISOString())).toBe(false);
    });

    it('should correctly categorize deadline status', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);

      const approaching = new Date();
      approaching.setHours(approaching.getHours() + 24);

      const future = new Date();
      future.setDate(future.getDate() + 10);

      expect(getDeadlineStatus(past.toISOString())).toBe('past');
      expect(getDeadlineStatus(approaching.toISOString())).toBe('approaching');
      expect(getDeadlineStatus(future.toISOString())).toBe('future');
    });
  });
});
