/**
 * Rubric Catalog Service
 * 
 * Manages performance rubric definitions and weights.
 */

import type { RubricDef } from '@/types/perf.types';
import { usePerf } from '@/stores/perf.store';

/**
 * Seed a default rubric with weights.
 */
export function seedDefaultRubric() {
  if (usePerf.getState().rubrics.length) return;
  const r: RubricDef = {
    id: 'default-perf',
    name: 'Core Performance',
    weights: {
      clarity: 0.2,
      structure: 0.2,
      impact: 0.3,
      ownership: 0.2,
      collaboration: 0.1,
      craft: 0.0,
    },
    notes: 'Weights sum to ~1; craft is folded into impact for IC roles.',
  };
  usePerf.getState().upsertRubric(r);
}
