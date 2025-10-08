/**
 * Unit Tests: Scheduling - Availability Merge
 * Tests multi-panelist availability merging and slot proposal
 */

import { describe, it, expect } from 'vitest';
import { mergeAvailabilities, proposeSlots } from '@/services/interview/scheduling.service';
import type { CalendarProposal } from '@/services/interview/scheduling.service';

describe('Scheduling: Availability Merge', () => {
  it('should propose hourly slots within the time window', () => {
    const proposal: CalendarProposal = {
      startISO: '2025-10-10T09:00:00Z',
      endISO: '2025-10-10T17:00:00Z',
      durationMin: 60,
    };

    const { slots } = proposeSlots(proposal);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots.length).toBeLessThanOrEqual(8); // 9am-5pm = 8 hours
  });

  it('should exclude slots overlapping with busy windows', () => {
    const proposal: CalendarProposal = {
      startISO: '2025-10-10T09:00:00Z',
      endISO: '2025-10-10T17:00:00Z',
      durationMin: 60,
    };

    // Panelist 1 busy 10-11, Panelist 2 busy 14-15
    const busyWindows = [
      { busy: [['2025-10-10T10:00:00Z', '2025-10-10T11:00:00Z']] as Array<[string, string]> },
      { busy: [['2025-10-10T14:00:00Z', '2025-10-10T15:00:00Z']] as Array<[string, string]> },
    ];

    const { slots } = mergeAvailabilities(busyWindows, proposal);

    // Verify no slots start at 10:00 or 14:00
    const hasBusySlot = slots.some(
      s => s === '2025-10-10T10:00:00.000Z' || s === '2025-10-10T14:00:00.000Z'
    );
    expect(hasBusySlot).toBe(false);
  });

  it('should respect business hours only flag', () => {
    const proposal: CalendarProposal = {
      startISO: '2025-10-10T08:00:00Z', // 8am
      endISO: '2025-10-10T18:00:00Z', // 6pm
      durationMin: 60,
      businessHoursOnly: true,
    };

    const { slots } = mergeAvailabilities([], proposal);

    // All slots should be between 9am-5pm
    slots.forEach(slot => {
      const hour = new Date(slot).getUTCHours();
      expect(hour).toBeGreaterThanOrEqual(9);
      expect(hour).toBeLessThan(17);
    });
  });

  it('should handle overlapping busy windows across multiple panelists', () => {
    const proposal: CalendarProposal = {
      startISO: '2025-10-10T09:00:00Z',
      endISO: '2025-10-10T12:00:00Z',
      durationMin: 60,
    };

    const busyWindows = [
      { busy: [['2025-10-10T09:00:00Z', '2025-10-10T10:00:00Z']] as Array<[string, string]> },
      { busy: [['2025-10-10T10:00:00Z', '2025-10-10T11:00:00Z']] as Array<[string, string]> },
      { busy: [['2025-10-10T11:00:00Z', '2025-10-10T12:00:00Z']] as Array<[string, string]> },
    ];

    const { slots } = mergeAvailabilities(busyWindows, proposal);

    // With all time blocked, should have no available slots
    expect(slots.length).toBe(0);
  });

  it('should handle empty busy windows', () => {
    const proposal: CalendarProposal = {
      startISO: '2025-10-10T09:00:00Z',
      endISO: '2025-10-10T12:00:00Z',
      durationMin: 60,
    };

    const { slots } = mergeAvailabilities([], proposal);

    // Should propose all slots when no one is busy
    expect(slots.length).toBeGreaterThan(0);
  });
});
