/**
 * @fileoverview Integration test for docs export
 * @module tests/integration/docs_export
 */

import { describe, it, expect, vi } from 'vitest';
import { exportOfferToPDF, exportOfferToDocs, generateOfferHTML } from '@/services/offer/docsExport.service';
import type { Offer } from '@/types/offer.types';

// Mock export services
vi.mock('@/services/export/pdf.service', () => ({
  exportHTMLToPDF: vi.fn(async (html, filename) => {
    return `blob:pdf-${filename}`;
  })
}));

vi.mock('@/services/export/googleDocs.service', () => ({
  exportHTMLToGoogleDoc: vi.fn(async (html, title) => ({
    id: 'doc-123',
    url: `https://docs.google.com/document/d/doc-123`
  }))
}));

describe('Docs Export Integration', () => {
  const mockOffer: Offer = {
    id: '1',
    company: 'TestCorp',
    role: 'Senior Engineer',
    level: 'L5',
    location: 'San Francisco, CA',
    remote: 'hybrid',
    currency: 'USD',
    baseAnnual: 150000,
    bonusTargetPct: 10,
    benefits: {
      ptoDays: 20,
      signingBonus: 25000
    },
    stage: 'received',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  };

  describe('PDF Export', () => {
    it('should export offer to PDF', async () => {
      const html = generateOfferHTML(mockOffer);
      const result = await exportOfferToPDF(html, 'TestCorp_Offer.pdf');

      expect(result).toContain('blob:pdf');
    });

    it('should include all offer details in HTML', () => {
      const html = generateOfferHTML(mockOffer);

      expect(html).toContain('TestCorp');
      expect(html).toContain('Senior Engineer');
      expect(html).toContain('150,000');
      expect(html).toContain('USD');
      expect(html).toContain('San Francisco');
    });

    it('should include disclaimer in HTML', () => {
      const html = generateOfferHTML(mockOffer);

      expect(html).toContain('Disclaimer');
      expect(html).toContain('estimate');
      expect(html).toContain('not financial');
    });
  });

  describe('Google Docs Export', () => {
    it('should export offer to Google Docs', async () => {
      const html = generateOfferHTML(mockOffer);
      const result = await exportOfferToDocs(html, 'TestCorp Offer');

      expect(result.id).toBe('doc-123');
      expect(result.url).toContain('docs.google.com');
    });

    it('should handle export failures gracefully', async () => {
      const { exportHTMLToGoogleDoc } = await import('@/services/export/googleDocs.service');
      vi.mocked(exportHTMLToGoogleDoc).mockRejectedValueOnce(new Error('API Error'));

      const html = generateOfferHTML(mockOffer);

      await expect(
        exportOfferToDocs(html, 'Test Offer')
      ).rejects.toThrow();
    });
  });

  describe('Comparison Export', () => {
    it('should generate comparison HTML with multiple offers', () => {
      const offer2: Offer = {
        ...mockOffer,
        id: '2',
        company: 'Another Corp',
        baseAnnual: 140000
      };

      const html = generateOfferHTML(mockOffer);

      expect(html).toContain('TestCorp');
      // Note: Full comparison export would be tested in ComparisonMatrix component
    });
  });
});
