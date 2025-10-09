/**
 * @fileoverview Offer parsing unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { parseOffer } from '@/services/offers/parseOffer.service';
import type { Offer } from '@/types/offer.types.step44';

describe('Offer Parsing', () => {
  it('should extract base salary from text', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 0,
      source: 'text',
      rawText: 'Base salary: $150,000 per year',
      extractedAt: new Date().toISOString()
    };

    const parsed = parseOffer(offer);
    expect(parsed.baseAnnual).toBe(150000);
  });

  it('should extract bonus percentage', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 0,
      source: 'text',
      rawText: 'Annual bonus: 15% of base',
      extractedAt: new Date().toISOString()
    };

    const parsed = parseOffer(offer);
    expect(parsed.bonusTargetPct).toBe(15);
  });

  it('should extract equity details', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 0,
      source: 'text',
      rawText: 'RSU grant: 10,000 shares vesting over 4 years with 12 month cliff',
      extractedAt: new Date().toISOString()
    };

    const parsed = parseOffer(offer);
    expect(parsed.equity?.grantShares).toBe(10000);
    expect(parsed.equity?.vestYears).toBe(4);
    expect(parsed.equity?.cliffMonths).toBe(12);
  });

  it('should detect currency code', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 0,
      source: 'text',
      rawText: 'Salary in EUR: 120,000',
      extractedAt: new Date().toISOString()
    };

    const parsed = parseOffer(offer);
    expect(parsed.currency).toBe('EUR');
  });

  it('should leave unknowns untouched', () => {
    const offer: Offer = {
      id: '1',
      company: 'TestCo',
      role: 'Engineer',
      currency: 'USD',
      baseAnnual: 100000,
      source: 'text',
      rawText: 'No equity information',
      extractedAt: new Date().toISOString()
    };

    const parsed = parseOffer(offer);
    expect(parsed.baseAnnual).toBe(100000);
    expect(parsed.equity).toBeUndefined();
  });
});
