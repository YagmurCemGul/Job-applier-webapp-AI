/**
 * Evidence Graph Service
 * 
 * Links SMART goals to concrete evidence artifacts with metric tracking.
 */

import type { EvidenceLink } from '@/types/perf.types';
import { usePerf } from '@/stores/perf.store';

/**
 * Link a SMART goal to a concrete evidence artifact with optional metric delta.
 */
export function linkEvidence(e: Omit<EvidenceLink, 'id'>) {
  const link: EvidenceLink = { id: crypto.randomUUID(), ...e };
  usePerf.getState().upsertEvidence(link);
  return link;
}

/**
 * Compute progress for a goal based on attached metric deltas.
 */
export function goalProgress(goalId: string) {
  const items = usePerf.getState().graph.filter((g) => g.goalId === goalId);
  const total = items.reduce((a, b) => a + (b.metricDelta ?? 0), 0);
  return { count: items.length, delta: total };
}
