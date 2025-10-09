/**
 * Promotion Readiness Service
 * 
 * Analyzes gaps between current performance and promotion level expectations.
 */

import type { PromotionExpectation, GapAnalysis, RubricKey } from '@/types/perf.types';

/**
 * Compare current averages to target bar for a level and compute gaps.
 */
export function analyzeGaps(
  level: string,
  current: Record<RubricKey, number>,
  expectations: PromotionExpectation[]
): GapAnalysis {
  const e = expectations.find((x) => x.level === level);
  const gaps = (e?.behaviors ?? []).map((b) => {
    const cur = current[b.key] ?? 0;
    const actions =
      cur >= b.bar
        ? []
        : [
            `Increase ${b.key} from ${cur} to ${b.bar}`,
            `Target opportunities demonstrating ${b.descriptor}`,
          ];
    return { key: b.key, current: cur, target: b.bar, actions };
  });
  const ready = gaps.every((g) => g.current >= g.target);
  return { id: crypto.randomUUID(), level, gaps, ready };
}
