import { describe, it, expect } from 'vitest'
import { mapToRubric } from '@/services/review/calibrationPrep.service'
import type { ImpactEntry } from '@/types/review.types'
import type { RubricExpectation } from '@/types/promotion.types'

describe('calibrationPrep.service', () => {
  it('should map impacts to rubric with deltas', () => {
    const rubric: RubricExpectation[] = [
      {
        level: 'L4',
        competency: 'execution',
        description: 'Delivers on commitments',
      },
      {
        level: 'L4',
        competency: 'impact',
        description: 'Drives measurable results',
      },
    ]

    const impacts: ImpactEntry[] = [
      {
        id: 'i1',
        cycleId: 'c1',
        source: 'manual',
        title: 'Shipped feature',
        competency: 'execution',
        score: 1.0,
      },
      {
        id: 'i2',
        cycleId: 'c1',
        source: 'manual',
        title: 'Improved KPI',
        competency: 'impact',
        score: 0.8,
      },
    ]

    const mapped = mapToRubric('L4', rubric, impacts)

    expect(mapped).toHaveLength(2)
    expect(mapped[0].rubric.competency).toBe('execution')
    expect(mapped[0].delta).toBeGreaterThanOrEqual(-2)
    expect(mapped[0].delta).toBeLessThanOrEqual(2)
    expect(mapped[0].evidence.length).toBeGreaterThan(0)
  })

  it('should handle empty impacts', () => {
    const rubric: RubricExpectation[] = [
      {
        level: 'L4',
        competency: 'execution',
        description: 'Test',
      },
    ]

    const mapped = mapToRubric('L4', rubric, [])

    expect(mapped).toHaveLength(1)
    expect(mapped[0].evidence).toEqual([])
    expect(mapped[0].delta).toBe(-2) // No evidence = lowest delta
  })
})
