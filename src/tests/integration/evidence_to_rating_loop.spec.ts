/**
 * Evidence to Rating Loop Integration Test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { linkEvidence, goalProgress } from '@/services/perf/evidenceGraph.service';
import { seedDefaultRubric } from '@/services/perf/rubricCatalog.service';
import { simulateRating } from '@/services/perf/ratingSim.service';
import type { RubricKey } from '@/types/perf.types';

describe('Evidence to Rating Loop', () => {
  beforeEach(() => {
    usePerf.setState({ graph: [], rubrics: [], scenarios: [] });
    seedDefaultRubric();
  });

  it('links evidence and uses in rating simulation', () => {
    // 1. Link multiple evidence items to a goal
    const goalId = 'goal-perf-improvement';
    linkEvidence({
      goalId,
      source: 'evidence',
      refId: 'ev-1',
      title: 'Reduced API latency by 40%',
      metricDelta: 40,
    });
    linkEvidence({
      goalId,
      source: 'portfolio',
      refId: 'port-1',
      title: 'Built monitoring dashboard',
      metricDelta: 15,
    });
    linkEvidence({
      goalId,
      source: 'interview',
      refId: 'int-1',
      title: 'Discussed system design improvements',
      metricDelta: 10,
    });

    // 2. Compute progress
    const progress = goalProgress(goalId);
    expect(progress.count).toBe(3);
    expect(progress.delta).toBe(65);

    // 3. Use progress to boost rating
    const rubric = usePerf.getState().rubrics[0];
    const baseScores: Record<RubricKey, number> = {
      clarity: 3.0,
      structure: 3.0,
      impact: 3.0,
      ownership: 3.0,
      collaboration: 3.0,
      craft: 2.5,
    };

    // Apply evidence boost based on number of artifacts
    const boostPct = Math.min(progress.count * 5, 20); // 5% per artifact, max 20%
    const result = simulateRating(rubric, {
      perKey: baseScores,
      scenario: { evidenceBoostPct: boostPct },
    });

    // 4. Verify boost applied
    expect(result.overall).toBeGreaterThan(3.0);
    expect(result.perKey.impact).toBeGreaterThan(3.0);

    // 5. Save scenario
    const scenario = {
      id: crypto.randomUUID(),
      rubricId: rubric.id,
      evidenceBoostPct: boostPct,
      result,
    };
    usePerf.getState().upsertScenario(scenario);

    const scenarios = usePerf.getState().scenarios;
    expect(scenarios.length).toBe(1);
    expect(scenarios[0].evidenceBoostPct).toBe(boostPct);
  });

  it('handles goals with no evidence', () => {
    const goalId = 'goal-no-evidence';
    const progress = goalProgress(goalId);
    expect(progress.count).toBe(0);
    expect(progress.delta).toBe(0);

    // Rating should work without boost
    const rubric = usePerf.getState().rubrics[0];
    const result = simulateRating(rubric, {
      perKey: {
        clarity: 2.5,
        structure: 2.5,
        impact: 2.5,
        ownership: 2.5,
        collaboration: 2.5,
        craft: 2.5,
      },
    });
    expect(result.overall).toBeCloseTo(2.5, 1);
  });
});
