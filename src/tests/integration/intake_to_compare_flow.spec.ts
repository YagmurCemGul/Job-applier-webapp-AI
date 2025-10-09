/**
 * @fileoverview Intake to compare flow integration test for Step 44
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { intakeOffer } from '@/services/offers/intake.service';
import { compareOffer } from '@/services/offers/comparison.service';

describe('Intake to Compare Flow', () => {
  it('should flow from intake to comparison', async () => {
    // Step 1: Intake offer
    const offer = await intakeOffer({
      text: 'Base salary: $150,000. Bonus: 15%. RSU: 10,000 shares vesting over 4 years.',
      company: 'TestCo'
    });

    expect(offer.baseAnnual).toBeGreaterThan(0);

    // Step 2: Compare
    const comparison = compareOffer(offer, {
      years: 4,
      discountRatePct: 3,
      growthRatePct: 10,
      taxRatePct: 25
    }, 'USD');

    expect(comparison.npv).toBeGreaterThan(0);
    expect(comparison.company).toBe('TestCo');
  });

  it('should handle PDF intake', async () => {
    // Mock PDF file
    const mockPdf = new File(['offer content'], 'offer.pdf', { type: 'application/pdf' });
    
    const offer = await intakeOffer({
      pdf: mockPdf,
      company: 'PDFCo'
    });

    expect(offer.source).toBe('pdf');
    expect(offer.company).toBe('PDFCo');
  });
});
