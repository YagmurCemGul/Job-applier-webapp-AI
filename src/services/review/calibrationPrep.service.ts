import type { ImpactEntry } from '@/types/review.types'
import type { RubricExpectation } from '@/types/promotion.types'

/**
 * Map impact entries to rubric lines and compute deltas (−2..+2)
 */
export function mapToRubric(
  level: string,
  rubric: RubricExpectation[],
  impacts: ImpactEntry[]
): Array<{
  rubric: RubricExpectation
  evidence: string[]
  delta: -2 | -1 | 0 | 1 | 2
}> {
  const relevant = rubric.filter((r) => r.level === level)

  return relevant.map((r) => {
    const hits = impacts.filter(
      (i) => (i.competency ?? 'impact') === r.competency
    )

    const strength =
      hits.reduce((a, b) => a + (b.score ?? 0), 0) / Math.max(1, hits.length)

    const delta: -2 | -1 | 0 | 1 | 2 =
      strength >= 1
        ? 2
        : strength >= 0.9
          ? 1
          : strength >= 0.7
            ? 0
            : strength >= 0.5
              ? -1
              : -2

    return {
      rubric: r,
      evidence: hits.slice(0, 5).map((h) => h.title),
      delta
    }
  })
}
