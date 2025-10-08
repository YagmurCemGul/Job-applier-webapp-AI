/**
 * @fileoverview Unit tests for meeting miner service (consent-based).
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
  });
});
