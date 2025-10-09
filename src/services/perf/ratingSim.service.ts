/**
 * Rating Simulator Service
 * 
 * Simulates performance ratings with configurable weights and evidence boosts.
 */

import type { RatingScenario, RubricDef, RubricKey } from '@/types/perf.types';

/**
 * Simulate a final rating by applying weights, optional evidence boost, and mild sensitivity noise.
 */
export function simulateRating(
  rubric: RubricDef,
  inputs: { perKey: Record<RubricKey, number>; scenario?: Partial<RatingScenario> }
): { overall: number; perKey: Record<RubricKey, number> } {
  const weights = { ...rubric.weights, ...(inputs.scenario?.weightOverrides || {}) };
  const boost = inputs.scenario?.evidenceBoostPct ?? 0;
  const sens = inputs.scenario?.sensitivity ?? 0;
  const perKey = { ...inputs.perKey };
  for (const k of Object.keys(perKey) as RubricKey[]) {
    perKey[k] = Math.min(
      4,
      Math.max(0, perKey[k] * (1 + boost / 100) + (sens ? Math.random() * sens - sens / 2 : 0))
    );
    perKey[k] = Number(perKey[k].toFixed(2));
  }
  let total = 0,
    denom = 0;
  for (const [k, w] of Object.entries(weights)) {
    total += (perKey[k as RubricKey] ?? 0) * (w as number);
    denom += w as number;
  }
  return { overall: Number((total / Math.max(denom, 0.0001)).toFixed(2)), perKey };
}
