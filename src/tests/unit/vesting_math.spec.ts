/**
 * @fileoverview Vesting math unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { scheduleVesting } from '@/services/equity/vesting.service';

describe('Vesting Math', () => {
  it('should create monthly schedule summing to total shares', () => {
    const events = scheduleVesting({
      kind: 'rsu',
      totalShares: 1000,
      years: 4,
      cliffMonths: 12,
      schedule: 'monthly'
    });

    const totalShares = events.reduce((sum, e) => sum + e.shares, 0);
    expect(totalShares).toBeCloseTo(1000, 2);
  });

  it('should create quarterly schedule', () => {
    const events = scheduleVesting({
      kind: 'rsu',
      totalShares: 1200,
      years: 4,
      cliffMonths: 12,
      schedule: 'quarterly'
    });

    // After 12 month cliff, quarterly for 3 years = 12 events
    expect(events.length).toBe(12);
    expect(events[0].cliff).toBe(true);
    expect(events[0].monthIndex).toBe(12);
  });

  it('should honor cliff period', () => {
    const events = scheduleVesting({
      kind: 'rsu',
      totalShares: 1000,
      years: 4,
      cliffMonths: 6,
      schedule: 'monthly'
    });

    const firstEvent = events[0];
    expect(firstEvent.cliff).toBe(true);
    expect(firstEvent.monthIndex).toBe(6);
  });

  it('should apply rounding fix', () => {
    const events = scheduleVesting({
      kind: 'rsu',
      totalShares: 1001,
      years: 4,
      cliffMonths: 12,
      schedule: 'monthly'
    });

    const totalShares = events.reduce((sum, e) => sum + e.shares, 0);
    expect(totalShares).toBe(1001);
  });
});
