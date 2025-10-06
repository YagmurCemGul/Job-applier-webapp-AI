import type { Objective } from '@/types/okr.types'

/**
 * Weighted average of KR progress (current/target)
 * Returns [0..1]
 */
export function objectiveProgress(o: Objective): number {
  if (!o.krs.length) return 0

  const totals = o.krs.map((kr) => ({
    w: kr.weight ?? 1,
    frac: Math.min(
      1,
      Math.max(0, kr.target ? kr.current / kr.target : 0)
    )
  }))

  const W = totals.reduce((a, b) => a + b.w, 0)

  return W ? totals.reduce((a, b) => a + b.frac * b.w, 0) / W : 0
}
