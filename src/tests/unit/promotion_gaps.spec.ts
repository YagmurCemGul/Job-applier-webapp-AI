/**
 * Promotion Gaps Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { analyzeGaps } from '@/services/perf/promotion.service';
import type { PromotionExpectation, RubricKey } from '@/types/perf.types';

describe('Promotion Gap Analysis', () => {
  const expectations: PromotionExpectation[] = [
    {
      id: 'exp-1',
      level: 'L5',
      behaviors: [
        { key: 'impact', descriptor: 'Leads multi-quarter projects', bar: 3.5 },
        { key: 'ownership', descriptor: 'Takes initiative proactively', bar: 3.0 },
        { key: 'collaboration', descriptor: 'Mentors peers', bar: 3.0 },
      ],
    },
  ];

  it('flags readiness when all bars met', () => {
    const current: Record<RubricKey, number> = {
      clarity: 3,
      structure: 3,
      impact: 4,
      ownership: 3.5,
      collaboration: 3.5,
      craft: 2,
    };

    const gap = analyzeGaps('L5', current, expectations);
    expect(gap.ready).toBe(true);
    expect(gap.gaps.every((g) => g.actions.length === 0)).toBe(true);
  });

  it('identifies gaps when bars not met', () => {
    const current: Record<RubricKey, number> = {
      clarity: 2,
      structure: 2,
      impact: 2.5,
      ownership: 2.5,
      collaboration: 2.5,
      craft: 2,
    };

    const gap = analyzeGaps('L5', current, expectations);
    expect(gap.ready).toBe(false);
    const impactGap = gap.gaps.find((g) => g.key === 'impact');
    expect(impactGap?.actions.length).toBeGreaterThan(0);
  });

  it('populates action items for gaps', () => {
    const current: Record<RubricKey, number> = {
      clarity: 3,
      structure: 3,
      impact: 2.0,
      ownership: 3,
      collaboration: 3,
      craft: 2,
    };

    const gap = analyzeGaps('L5', current, expectations);
    const impactGap = gap.gaps.find((g) => g.key === 'impact');
    expect(impactGap?.actions.length).toBeGreaterThan(0);
    expect(impactGap?.actions[0]).toContain('Increase');
  });

  it('handles missing expectation gracefully', () => {
    const current: Record<RubricKey, number> = {
      clarity: 3,
      structure: 3,
      impact: 3,
      ownership: 3,
      collaboration: 3,
      craft: 3,
    };

    const gap = analyzeGaps('L6', current, expectations);
    expect(gap.gaps.length).toBe(0);
    expect(gap.ready).toBe(true);
  });
});
