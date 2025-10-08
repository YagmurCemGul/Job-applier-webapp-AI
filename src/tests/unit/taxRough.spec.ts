/**
 * @fileoverview Unit tests for tax calculation service
 * @module tests/unit/taxRough
 */

import { describe, it, expect } from 'vitest';
import { roughTax, taxAmount } from '@/services/offer/taxRough.service';

describe('taxRough.service', () => {
  describe('roughTax', () => {
    it('should apply tax rate correctly', () => {
      expect(roughTax(100000, 30)).toBe(70000);
      expect(roughTax(50000, 25)).toBe(37500);
    });

    it('should handle 0% tax rate', () => {
      expect(roughTax(100000, 0)).toBe(100000);
    });

    it('should handle 100% tax rate', () => {
      expect(roughTax(100000, 100)).toBe(0);
    });

    it('should clamp negative tax rates to 0', () => {
      expect(roughTax(100000, -10)).toBe(100000);
    });

    it('should clamp tax rates above 100 to 100', () => {
      expect(roughTax(100000, 150)).toBe(0);
    });

    it('should handle decimal amounts', () => {
      const result = roughTax(123456.78, 33.3);
      expect(result).toBeCloseTo(82337.77, 2);
    });
  });

  describe('taxAmount', () => {
    it('should calculate tax amount correctly', () => {
      expect(taxAmount(100000, 30)).toBe(30000);
      expect(taxAmount(50000, 25)).toBe(12500);
    });

    it('should handle 0% tax rate', () => {
      expect(taxAmount(100000, 0)).toBe(0);
    });

    it('should handle 100% tax rate', () => {
      expect(taxAmount(100000, 100)).toBe(100000);
    });
  });
});
