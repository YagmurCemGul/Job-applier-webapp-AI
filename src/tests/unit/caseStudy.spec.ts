/**
 * @fileoverview Unit tests for case study service.
 * @module tests/unit/caseStudy
 */

import { describe, it, expect } from 'vitest';
import { buildCaseFromEvidence, addQuotesToCase } from '@/services/site/caseStudy.service';
import type { OnboardingPlan } from '@/types/onboarding.types';
import type { CaseStudy } from '@/types/site.types';

describe('caseStudy.service', () => {
  describe('buildCaseFromEvidence', () => {
    const mockPlan: OnboardingPlan = {
      id: '1',
      title: 'Q1 Onboarding',
      companyName: 'TestCo',
      startDate: '2025-01-01',
      stage: 'active',
      evidence: [
        {
          id: '1',
          title: 'Shipped Feature X',
          kind: 'metric',
          text: 'Increased conversion by 15%',
          createdAt: '2025-01-15',
        },
        {
          id: '2',
          title: 'Led Design Review',
          kind: 'doc',
          url: 'https://docs.example.com/review',
          createdAt: '2025-01-20',
        },
        {
          id: '3',
          title: 'Mentored Junior Dev',
          kind: 'note',
          text: 'Helped onboard new team member',
          createdAt: '2025-01-25',
        },
      ],
      tasks: [],
      stakeholders: [],
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };

    it('creates a case study with evidence highlights', () => {
      const cs = buildCaseFromEvidence(mockPlan, 'My Impact at TestCo');
      expect(cs.title).toBe('My Impact at TestCo');
      expect(cs.contentMd).toContain('# My Impact at TestCo');
      expect(cs.contentMd).toContain('Shipped Feature X');
    });

    it('generates a slug from title', () => {
      const cs = buildCaseFromEvidence(mockPlan, 'Product Launch 2025');
      expect(cs.slug).toBe('product-launch-2025');
    });

    it('creates highlights from evidence', () => {
      const cs = buildCaseFromEvidence(mockPlan, 'Test');
      expect(cs.highlights).toBeDefined();
      expect(cs.highlights!.length).toBeGreaterThan(0);
      expect(cs.highlights![0]).toContain('Shipped Feature X');
    });

    it('sets visibility to draft', () => {
      const cs = buildCaseFromEvidence(mockPlan, 'Test');
      expect(cs.visibility).toBe('draft');
    });

    it('generates excerpt from content', () => {
      const cs = buildCaseFromEvidence(mockPlan, 'Test');
      expect(cs.excerpt).toBeDefined();
      expect(cs.excerpt!.length).toBeLessThanOrEqual(160);
    });

    it('includes competence tags', () => {
      const cs = buildCaseFromEvidence(mockPlan, 'Test');
      expect(cs.competenceTags).toBeDefined();
      expect(cs.competenceTags).toContain('execution');
    });

    it('limits evidence to 6 items', () => {
      const manyEvidence: OnboardingPlan = {
        ...mockPlan,
        evidence: Array.from({ length: 10 }, (_, i) => ({
          id: String(i),
          title: `Evidence ${i}`,
          kind: 'note' as const,
          createdAt: '2025-01-01',
        })),
      };
      const cs = buildCaseFromEvidence(manyEvidence, 'Test');
      const bulletCount = (cs.contentMd.match(/^-\s/gm) || []).length;
      expect(bulletCount).toBeLessThanOrEqual(6);
    });
  });

  describe('addQuotesToCase', () => {
    const mockCase: CaseStudy = {
      id: '1',
      title: 'Test Case',
      slug: 'test-case',
      contentMd: '# Test\n\nOriginal content',
      dateISO: '2025-01-01',
      visibility: 'draft',
    };

    it('adds quotes to case study', () => {
      const quotes = [
        'Great work on the project!',
        'Excellent collaboration skills',
      ];
      const updated = addQuotesToCase(mockCase, quotes);
      expect(updated.quotes).toEqual(quotes);
      expect(updated.contentMd).toContain('## Feedback');
      expect(updated.contentMd).toContain('> Great work');
    });

    it('preserves existing content', () => {
      const updated = addQuotesToCase(mockCase, ['New quote']);
      expect(updated.contentMd).toContain('Original content');
    });

    it('appends to existing quotes', () => {
      const withQuotes = { ...mockCase, quotes: ['Old quote'] };
      const updated = addQuotesToCase(withQuotes, ['New quote']);
      expect(updated.quotes).toHaveLength(2);
      expect(updated.quotes).toContain('Old quote');
      expect(updated.quotes).toContain('New quote');
    });
  });
});