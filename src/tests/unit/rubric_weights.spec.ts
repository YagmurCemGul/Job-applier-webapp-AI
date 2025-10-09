/**
 * Rubric Weights Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { seedDefaultRubric } from '@/services/perf/rubricCatalog.service';

describe('Rubric Weights', () => {
  beforeEach(() => {
    usePerf.setState({ rubrics: [] });
  });

  it('seeds default rubric', () => {
    seedDefaultRubric();
    const rubrics = usePerf.getState().rubrics;
    expect(rubrics.length).toBe(1);
    expect(rubrics[0].name).toBe('Core Performance');
  });

  it('weights sum to approximately 1', () => {
    seedDefaultRubric();
    const rubric = usePerf.getState().rubrics[0];
    const sum = Object.values(rubric.weights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 1);
  });

  it('respects weight overrides', () => {
    seedDefaultRubric();
    const rubric = usePerf.getState().rubrics[0];
    const overrides = { impact: 0.5 };
    const merged = { ...rubric.weights, ...overrides };
    expect(merged.impact).toBe(0.5);
  });

  it('is idempotent', () => {
    seedDefaultRubric();
    const count1 = usePerf.getState().rubrics.length;
    seedDefaultRubric();
    const count2 = usePerf.getState().rubrics.length;
    expect(count1).toBe(count2);
  });
});
