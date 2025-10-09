/**
 * @fileoverview Currency stub unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { fxRate, convert } from '@/services/offers/currency.stub.service';

describe('Currency Stub', () => {
  it('should be reversible within rounding', () => {
    const usd = 1000;
    const eur = convert(usd, 'USD', 'EUR');
    const backToUsd = convert(eur, 'EUR', 'USD');

    expect(backToUsd).toBeCloseTo(usd, 0);
  });

  it('should have stable rates', () => {
    const rate1 = fxRate('USD', 'EUR');
    const rate2 = fxRate('USD', 'EUR');

    expect(rate1).toBe(rate2);
  });

  it('should handle same currency', () => {
    const amount = 1000;
    const result = convert(amount, 'USD', 'USD');

    expect(result).toBe(amount);
  });
});
