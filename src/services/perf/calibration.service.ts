/**
 * Calibration Service
 * 
 * Aggregates rubric scores and detects outliers across feedback responses.
 */

import type { CalibSummary, RubricKey } from '@/types/perf.types';
import { usePerf } from '@/stores/perf.store';

/**
 * Aggregate rubric scores from responses; detect outliers per key.
 */
export function calibrate(cycleId: string): CalibSummary {
  const resps = usePerf
    .getState()
    .responses.filter(
      (r) =>
        usePerf
          .getState()
          .requests.find((q) => q.id === r.requestId)?.cycleId === cycleId
    );
  const keys: RubricKey[] = ['clarity', 'structure', 'impact', 'ownership', 'collaboration', 'craft'];
  const agg: Record<RubricKey, number> = {
    clarity: 0,
    structure: 0,
    impact: 0,
    ownership: 0,
    collaboration: 0,
    craft: 0,
  };
  const counts: Record<RubricKey, number> = {
    clarity: 0,
    structure: 0,
    impact: 0,
    ownership: 0,
    collaboration: 0,
    craft: 0,
  };
  for (const r of resps) {
    if (!r.rubric) continue;
    for (const k of keys) {
      if (r.rubric[k] !== undefined) {
        agg[k] += r.rubric[k]!;
        counts[k]++;
      }
    }
  }
  for (const k of keys) agg[k] = counts[k] ? Number((agg[k] / counts[k]).toFixed(2)) : 0;
  const overall = Number((keys.reduce((a, k) => a + (agg[k] || 0), 0) / keys.length).toFixed(2));
  // Outliers: any reviewer deviates >1.0 from mean on any key
  const outliers: CalibSummary['outliers'] = [];
  for (const r of resps) {
    if (!r.rubric) continue;
    for (const k of keys) {
      const delta = (r.rubric[k] ?? agg[k]) - agg[k];
      if (Math.abs(delta) > 1.0)
        outliers.push({ reviewer: r.id, key: k, delta: Number(delta.toFixed(2)) });
    }
  }
  const summary: CalibSummary = { id: crypto.randomUUID(), cycleId, aggScores: agg, overall, outliers };
  usePerf.getState().upsertCalib(summary);
  return summary;
}
