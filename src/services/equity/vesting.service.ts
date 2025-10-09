/**
 * @fileoverview Vesting schedule service for Step 44
 * @module services/equity/vesting
 */

import type { VestingEvent } from '@/types/equity.types';

/**
 * Build month-level vesting schedule with cliff
 * @param input - Vesting parameters
 * @returns Array of vesting events
 */
export function scheduleVesting(input: {
  kind: 'rsu' | 'options';
  totalShares: number;
  strikePrice?: number;
  years: number;
  cliffMonths: number;
  schedule: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
}): VestingEvent[] {
  const months = input.years * 12;
  const step = 
    input.schedule === 'monthly' ? 1 :
    input.schedule === 'quarterly' ? 3 :
    input.schedule === 'semiannual' ? 6 : 12;

  const events: VestingEvent[] = [];
  const vestMonths = months - input.cliffMonths + step; // include first vest after cliff
  const perStep = input.totalShares / Math.ceil(vestMonths / step);

  for (let m = input.cliffMonths; m <= months; m += step) {
    events.push({
      monthIndex: m,
      shares: Number(perStep.toFixed(6)),
      amount: 0,
      cliff: m === input.cliffMonths
    });
  }

  // Adjust for rounding
  const sum = events.reduce((a, b) => a + b.shares, 0);
  if (sum !== input.totalShares && events.length) {
    const diff = input.totalShares - sum;
    events[events.length - 1].shares = Number(
      (events[events.length - 1].shares + diff).toFixed(6)
    );
  }

  return events;
}
