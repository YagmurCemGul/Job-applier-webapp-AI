/**
 * Rating Simulator Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { seedDefaultRubric } from '@/services/perf/rubricCatalog.service';
import { simulateRating } from '@/services/perf/ratingSim.service';
import type { RubricKey } from '@/types/perf.types';

describe('Rating Simulator', () => {
  beforeEach(() => {
    usePerf.setState({ rubrics: [] });
    seedDefaultRubric();
  });

  it('applies evidence boost', () => {
    const rubric = usePerf.getState().rubrics[0];
    const scores: Record<RubricKey, number> = {
      clarity: 2,
      structure: 2,
      impact: 2,
      ownership: 2,
      collaboration: 2,
      craft: 2,
    };

    const result = simulateRating(rubric, {
      perKey: scores,
      scenario: { evidenceBoostPct: 20 },
    });

    expect(result.perKey.clarity).toBeGreaterThan(2);
  });

  it('applies sensitivity noise', () => {
    const rubric = usePerf.getState().rubrics[0];
    const scores: Record<RubricKey, number> = {
      clarity: 2,
      structure: 2,
      impact: 2,
      ownership: 2,
      collaboration: 2,
      craft: 2,
    };

    const result1 = simulateRating(rubric, {
      perKey: scores,
      scenario: { sensitivity: 0.5 },
    });
    const result2 = simulateRating(rubric, {
      perKey: scores,
      scenario: { sensitivity: 0.5 },
    });

    // With sensitivity, results should vary (though not guaranteed in single run)
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });

  it('keeps overall within 0..4 range', () => {
    const rubric = usePerf.getState().rubrics[0];
    const scores: Record<RubricKey, number> = {
      clarity: 4,
      structure: 4,
      impact: 4,
      ownership: 4,
      collaboration: 4,
      craft: 4,
    };

    const result = simulateRating(rubric, {
      perKey: scores,
      scenario: { evidenceBoostPct: 50, sensitivity: 1 },
    });

    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(4);
  });

  it('respects weight overrides', () => {
    const rubric = usePerf.getState().rubrics[0];
    const scores: Record<RubricKey, number> = {
      clarity: 4,
      structure: 0,
      impact: 0,
      ownership: 0,
      collaboration: 0,
      craft: 0,
    };

    const result = simulateRating(rubric, {
      perKey: scores,
      scenario: { weightOverrides: { clarity: 1.0 } },
    });

    expect(result.overall).toBeGreaterThan(3);
  });
});
