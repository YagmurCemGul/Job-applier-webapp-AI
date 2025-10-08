/**
 * @fileoverview Unit tests for equity valuation service
 * @module tests/unit/equityValuation
 */

import { describe, it, expect } from 'vitest';
import { annualizeEquity } from '@/services/offer/equityValuation.service';
import type { Offer, EquityGrant } from '@/types/offer.types';

describe('equityValuation.service', () => {
  const baseOffer: Offer = {
    id: '1',
    company: 'TestCo',
    role: 'Engineer',
    currency: 'USD',
    baseAnnual: 100000,
    stage: 'received',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  };

  describe('RSU valuation', () => {
    it('should calculate RSU value for 1 year horizon', async () => {
      const grant: EquityGrant = {
        id: '1',
        type: 'RSU',
        units: 1000,
        assumedSharePrice: 100,
        vestSchedule: '4y_no_cliff'
      };

      const offer = { ...baseOffer, equity: [grant] };
      const result = await annualizeEquity(offer, { horizonYears: 1 });

      // 1000 units * $100 * 25% vested / 1 year = 25000
      expect(result).toBe(25000);
    });

    it('should calculate RSU value for 4 year horizon', async () => {
      const grant: EquityGrant = {
        id: '1',
        type: 'RSU',
        units: 1000,
        assumedSharePrice: 100,
        vestSchedule: '4y_no_cliff'
      };

      const offer = { ...baseOffer, equity: [grant] };
      const result = await annualizeEquity(offer, { horizonYears: 4 });

      // 1000 units * $100 * 100% vested / 4 years = 25000
      expect(result).toBe(25000);
    });
  });

  describe('Options valuation', () => {
    it('should calculate options intrinsic value', async () => {
      const grant: EquityGrant = {
        id: '1',
        type: 'Options',
        units: 1000,
        strikePrice: 50,
        assumedSharePrice: 100,
        vestSchedule: '4y_no_cliff'
      };

      const offer = { ...baseOffer, equity: [grant] };
      const result = await annualizeEquity(offer, { horizonYears: 4 });

      // (100 - 50) * 1000 * 100% / 4 = 12500
      expect(result).toBe(12500);
    });

    it('should return 0 for underwater options', async () => {
      const grant: EquityGrant = {
        id: '1',
        type: 'Options',
        units: 1000,
        strikePrice: 100,
        assumedSharePrice: 50,
        vestSchedule: '4y_no_cliff'
      };

      const offer = { ...baseOffer, equity: [grant] };
      const result = await annualizeEquity(offer, { horizonYears: 4 });

      expect(result).toBe(0);
    });
  });

  describe('Target value', () => {
    it('should use target value when units not specified', async () => {
      const grant: EquityGrant = {
        id: '1',
        type: 'RSU',
        targetValue: 100000,
        vestSchedule: '4y_no_cliff'
      };

      const offer = { ...baseOffer, equity: [grant] };
      const result = await annualizeEquity(offer, { horizonYears: 4 });

      // 100000 * 100% / 4 = 25000
      expect(result).toBe(25000);
    });
  });

  describe('Vesting schedules', () => {
    it('should handle 1 year cliff correctly', async () => {
      const grant: EquityGrant = {
        id: '1',
        type: 'RSU',
        units: 1000,
        assumedSharePrice: 100,
        vestSchedule: '4y_1y_cliff'
      };

      const offer = { ...baseOffer, equity: [grant] };

      // Before cliff
      const result6mo = await annualizeEquity(offer, { horizonYears: 1 });
      expect(result6mo).toBeGreaterThan(0); // Should have some vesting

      // After full vesting
      const result4y = await annualizeEquity(offer, { horizonYears: 4 });
      expect(result4y).toBeCloseTo(25000, 0);
    });
  });

  describe('Multiple grants', () => {
    it('should sum multiple equity grants', async () => {
      const grants: EquityGrant[] = [
        {
          id: '1',
          type: 'RSU',
          units: 500,
          assumedSharePrice: 100,
          vestSchedule: '4y_no_cliff'
        },
        {
          id: '2',
          type: 'RSU',
          units: 500,
          assumedSharePrice: 100,
          vestSchedule: '4y_no_cliff'
        }
      ];

      const offer = { ...baseOffer, equity: grants };
      const result = await annualizeEquity(offer, { horizonYears: 4 });

      // (500 + 500) * 100 * 100% / 4 = 25000
      expect(result).toBe(25000);
    });
  });
});
