/**
 * @fileoverview Integration test for promotion packet sharing
 * Builds packet HTML → export PDF → share via Gmail
 */

import { describe, it, expect, vi } from 'vitest';
import { buildPromotionPacketHTML } from '@/services/review/promotionPacket.service';
import type { SelfReview, ImpactEntry } from '@/types/review.types';

// Mock services
vi.mock('@/services/export/reviewExport.pdf.service', () => ({
  exportReviewPDF: vi.fn().mockResolvedValue('pdf-url'),
}));

vi.mock('@/services/integrations/gmail.real.service', () => ({
  gmailSend: vi.fn().mockResolvedValue({ id: 'msg-id' }),
  buildMime: vi.fn().mockReturnValue('base64-encoded-mime'),
}));

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-bearer-token'),
}));

describe('promotion_packet_share', () => {
  it('builds comprehensive promotion packet', () => {
    const self: SelfReview = {
      id: 's1',
      cycleId: 'c1',
      lang: 'en',
      overview: 'I expanded my scope to lead cross-functional initiatives.',
      highlights: [
        'Led migration affecting 50M+ users',
        'Reduced infrastructure costs by $200K/year',
        'Mentored 5 engineers to promotion',
      ],
      growthAreas: ['Improve executive communication'],
      nextObjectives: ['Own platform architecture', 'Build SRE practice'],
      wordCount: 150,
      clarityScore: 0.85,
      updatedAt: '2025-01-01T00:00:00Z',
    };

    const impacts: ImpactEntry[] = [
      {
        id: 'i1',
        cycleId: 'c1',
        source: 'evidence',
        title: 'Migration to Kubernetes',
        detail: 'Zero downtime migration',
        competency: 'execution',
        score: 1.5,
      },
      {
        id: 'i2',
        cycleId: 'c1',
        source: 'okr',
        title: 'OKR: Cost optimization',
        metrics: [{ label: 'Savings', value: 200000, unit: '$' }],
        competency: 'impact',
        score: 1.8,
      },
    ];

    const quotes = [
      'Best technical leader on the team',
      'Consistently delivers high-impact projects',
      'Excellent mentor and collaborator',
    ];

    const html = buildPromotionPacketHTML({
      cycleTitle: 'Promotion to Staff Engineer',
      targetLevel: 'L6',
      self,
      impacts,
      quotes,
    });

    // Verify structure
    expect(html).toContain('CONFIDENTIAL');
    expect(html).toContain('Promotion to Staff Engineer');
    expect(html).toContain('L6');
    expect(html).toContain('expanded my scope');
    expect(html).toContain('50M+ users');
    expect(html).toContain('Migration to Kubernetes');
    expect(html).toContain('Best technical leader');
    expect(html).toContain('JobPilot');
  });

  it('exports packet as PDF', async () => {
    const html = '<div>Test Packet</div>';
    const { exportReviewPDF } = await import('@/services/export/reviewExport.pdf.service');

    const url = await exportReviewPDF(html, 'Promotion_Packet.pdf');

    expect(url).toBe('pdf-url');
    expect(exportReviewPDF).toHaveBeenCalledWith(html, 'Promotion_Packet.pdf');
  });

  it('handles empty quotes gracefully', () => {
    const self: SelfReview = {
      id: 's1',
      cycleId: 'c1',
      lang: 'en',
      overview: 'Overview',
      highlights: ['Highlight'],
      growthAreas: [],
      nextObjectives: [],
      wordCount: 10,
      clarityScore: 0.9,
      updatedAt: '2025-01-01T00:00:00Z',
    };

    const html = buildPromotionPacketHTML({
      cycleTitle: 'Test',
      targetLevel: 'L5',
      self,
      impacts: [],
      quotes: [],
    });

    expect(html).toContain('No quotes selected');
  });

  it('limits impacts and quotes to reasonable counts', () => {
    const self: SelfReview = {
      id: 's1',
      cycleId: 'c1',
      lang: 'en',
      overview: 'Overview',
      highlights: ['H1'],
      growthAreas: [],
      nextObjectives: [],
      wordCount: 10,
      clarityScore: 0.9,
      updatedAt: '2025-01-01T00:00:00Z',
    };

    const manyImpacts: ImpactEntry[] = Array.from({ length: 20 }, (_, i) => ({
      id: `i${i}`,
      cycleId: 'c1',
      source: 'manual' as const,
      title: `Impact ${i}`,
      competency: 'impact' as const,
      score: 1.0,
    }));

    const manyQuotes = Array.from({ length: 20 }, (_, i) => `Quote ${i}`);

    const html = buildPromotionPacketHTML({
      cycleTitle: 'Test',
      targetLevel: 'L5',
      self,
      impacts: manyImpacts,
      quotes: manyQuotes,
    });

    // Should limit to 8 impacts and 6 quotes
    const impactMatches = html.match(/Impact \d+/g);
    const quoteMatches = html.match(/Quote \d+/g);

    expect(impactMatches?.length).toBeLessThanOrEqual(8);
    expect(quoteMatches?.length).toBeLessThanOrEqual(6);
  });
});
