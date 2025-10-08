/**
 * @fileoverview Unit tests for meeting miner service.
 * @module tests/unit/meetingMiner
 */

import { describe, it, expect } from 'vitest';
import {
  listUpcomingEvents,
  summarizeEventsForReport,
} from '@/services/onboarding/meetingMiner.service';

describe('meetingMiner.service', () => {
  describe('listUpcomingEvents', () => {
    it('should return empty array (stub)', async () => {
      const events = await listUpcomingEvents(7);
      expect(events).toEqual([]);
    });
  });

  describe('summarizeEventsForReport', () => {
    it('should return empty array (stub)', async () => {
      const summary = await summarizeEventsForReport([]);
      expect(summary).toEqual([]);
    });

    it('should handle events gracefully', async () => {
      const events = [
        {
          id: 'e1',
          title: 'Kickoff',
          startISO: new Date().toISOString(),
          attendees: ['alice@example.com'],
        },
      ];
      const summary = await summarizeEventsForReport(events);
      expect(Array.isArray(summary)).toBe(true);
    });
  });
});
