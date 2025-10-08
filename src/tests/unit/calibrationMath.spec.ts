/**
 * @fileoverview Unit tests for calibration math
 */

import { describe, it, expect } from 'vitest';
import { mapToRubric } from '@/services/review/calibrationPrep.service';
import type { RubricExpectation } from '@/types/promotion.types';
import type { ImpactEntry } from '@/types/review.types';

describe('calibrationMath', () => {
  it('maps impacts to rubric expectations', () => {
    const rubric: RubricExpectation[] = [
      { level: 'L4', competency: 'execution', description: 'Delivers complex projects' },
      { level: 'L4', competency: 'leadership', description: 'Mentors others' },
    ];

    const impacts: ImpactEntry[] = [
      { id: '1', cycleId: 'c1', source: 'manual', title: 'Led migration', competency: 'execution', score: 1.0 },
      { id: '2', cycleId: 'c1', source: 'manual', title: 'Mentored 3 engineers', competency: 'leadership', score: 1.1 },
    ];

    const result = mapToRubric('L4', rubric, impacts);

    expect(result.length).toBe(2);
    expect(result.some(r => r.rubric.competency === 'execution')).toBe(true);
    expect(result.some(r => r.rubric.competency === 'leadership')).toBe(true);
  });

  it('computes delta correctly based on strength', () => {
    const rubric: RubricExpectation[] = [
      { level: 'L4', competency: 'craft', description: 'High quality code' },
    ];

    const highImpact: ImpactEntry[] = [
      { id: '1', cycleId: 'c1', source: 'manual', title: 'Refactored system', competency: 'craft', score: 1.2 },
    ];

    const lowImpact: ImpactEntry[] = [
      { id: '1', cycleId: 'c1', source: 'manual', title: 'Minor fix', competency: 'craft', score: 0.3 },
    ];

    const high = mapToRubric('L4', rubric, highImpact);
    const low = mapToRubric('L4', rubric, lowImpact);

    expect(high[0].delta).toBeGreaterThanOrEqual(1);
    expect(low[0].delta).toBeLessThanOrEqual(-1);
  });

  it('bounds evidence list to 5 items', () => {
    const rubric: RubricExpectation[] = [
      { level: 'L4', competency: 'impact', description: 'Drives results' },
    ];

    const manyImpacts: ImpactEntry[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      cycleId: 'c1',
      source: 'manual' as const,
      title: `Impact ${i}`,
      competency: 'impact' as const,
      score: 0.8,
    }));

    const result = mapToRubric('L4', rubric, manyImpacts);

    expect(result[0].evidence.length).toBeLessThanOrEqual(5);
  });

  it('returns empty for non-matching level', () => {
    const rubric: RubricExpectation[] = [
      { level: 'L5', competency: 'execution', description: 'Senior level' },
    ];

    const impacts: ImpactEntry[] = [
      { id: '1', cycleId: 'c1', source: 'manual', title: 'Task', competency: 'execution', score: 1.0 },
    ];

    const result = mapToRubric('L4', rubric, impacts);

    expect(result.length).toBe(0);
  });
});
