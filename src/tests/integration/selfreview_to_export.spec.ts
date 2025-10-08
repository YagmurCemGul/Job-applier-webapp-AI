/**
 * @fileoverview Integration test for self-review to export flow
 * Generates self-review from impacts → export PDF/Doc
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useReviews } from '@/stores/review.store';
import { materializeSelfReview } from '@/services/review/selfReviewAI.service';
import { buildPromotionPacketHTML } from '@/services/review/promotionPacket.service';
import type { ImpactEntry, SelfReview } from '@/types/review.types';

// Mock export services
vi.mock('@/services/export/reviewExport.pdf.service', () => ({
  exportReviewPDF: vi.fn().mockResolvedValue('pdf-url'),
}));

vi.mock('@/services/export/reviewExport.docs.service', () => ({
  exportReviewDoc: vi.fn().mockResolvedValue({ id: 'doc-id' }),
}));

describe('selfreview_to_export', () => {
  beforeEach(() => {
    useReviews.setState({ cycles: [], impacts: [], selfReviews: [] });
  });

  it('generates and exports self-review successfully', async () => {
    const cycleId = 'cycle-1';

    // Add impacts
    const impacts: ImpactEntry[] = [
      {
        id: 'i1',
        cycleId,
        source: 'evidence',
        title: 'Led migration to microservices',
        detail: 'Reduced latency by 40%',
        competency: 'execution',
        score: 1.2,
      },
      {
        id: 'i2',
        cycleId,
        source: 'okr',
        title: 'OKR: Improve system reliability',
        detail: '95% progress',
        metrics: [{ label: 'Uptime', value: 99.9, unit: '%' }],
        competency: 'impact',
        score: 1.5,
      },
    ];

    impacts.forEach(i => useReviews.getState().addImpact(i));

    // Generate self-review
    const aiText = `
Overview: I led the migration to microservices and improved system reliability.

Highlights:
- Reduced latency by 40% through architecture redesign
- Achieved 99.9% uptime for critical services
- Mentored 3 junior engineers

Growth Areas:
- Improve documentation practices
- Enhance cross-team communication

Next Objectives:
- Lead architecture redesign for mobile platform
- Establish coding standards
    `.trim();

    const selfReview = materializeSelfReview(cycleId, 'en', aiText);
    useReviews.getState().upsertSelfReview(selfReview);

    // Verify self-review structure
    expect(selfReview.overview).toContain('migration');
    expect(selfReview.highlights.length).toBeGreaterThan(0);
    expect(selfReview.growthAreas.length).toBeGreaterThan(0);
    expect(selfReview.nextObjectives.length).toBeGreaterThan(0);

    // Build promotion packet HTML
    const html = buildPromotionPacketHTML({
      cycleTitle: 'H1 2025 Review',
      targetLevel: 'L5',
      self: selfReview,
      impacts,
      quotes: ['Great technical leadership', 'Excellent execution'],
    });

    expect(html).toContain('CONFIDENTIAL');
    expect(html).toContain('H1 2025 Review');
    expect(html).toContain('L5');
    expect(html).toContain('migration');
    expect(html).toContain('Great technical leadership');

    // Export (mocked)
    const { exportReviewPDF } = await import('@/services/export/reviewExport.pdf.service');
    const pdfUrl = await exportReviewPDF(html);
    expect(pdfUrl).toBe('pdf-url');
  });

  it('handles Turkish language self-review', () => {
    const cycleId = 'cycle-tr';
    const aiText = 'Genel Bakış: Proje liderliği yaptım ve sistem güvenilirliğini artırdım.';

    const selfReview = materializeSelfReview(cycleId, 'tr', aiText);

    expect(selfReview.lang).toBe('tr');
    expect(selfReview.overview).toContain('Proje');
  });

  it('computes metrics correctly', () => {
    const shortReview = materializeSelfReview(
      'c1',
      'en',
      'Brief overview. One highlight. One growth area. One objective.'
    );

    const longReview = materializeSelfReview(
      'c2',
      'en',
      Array(200).fill('word').join(' ')
    );

    expect(shortReview.wordCount).toBeLessThan(longReview.wordCount);
    expect(shortReview.clarityScore).toBeGreaterThan(longReview.clarityScore);
  });
});
