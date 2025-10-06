import { describe, it, expect } from 'vitest'
import { mapToRubric } from '@/services/review/calibrationPrep.service'
import type { RubricExpectation } from '@/types/promotion.types'
import type { ImpactEntry } from '@/types/review.types'

describe('calibrationPrep.service', () => {
  it('should map impacts to rubric expectations', () => {
    const rubric: RubricExpectation[] = [
      {
        level: 'Senior',
        competency: 'execution',
        description: 'Delivers complex projects',
      },
      {
        level: 'Senior',
        competency: 'impact',
        description: 'Drives measurable outcomes',
      },
    ]

    const impacts: ImpactEntry[] = [
      {
        id: '1',
        cycleId: 'cycle1',
        source: 'manual',
        title: 'Migration project',
        competency: 'execution',
        score: 1.2,
      },
      {
        id: '2',
        cycleId: 'cycle1',
        source: 'okr',
        title: 'Revenue KPI',
        competency: 'impact',
        score: 1.1,
      },
    ]

    const mapped = mapToRubric('Senior', rubric, impacts)

    expect(mapped).toHaveLength(2)
    expect(mapped[0].rubric.competency).toBe('execution')
    expect(mapped[0].evidence.length).toBeGreaterThan(0)
    expect(mapped[0].delta).toBeGreaterThanOrEqual(-2)
    expect(mapped[0].delta).toBeLessThanOrEqual(2)
  })

  it('should return deltas between -2 and +2', () => {
    const rubric: RubricExpectation[] = [
      {
        level: 'L4',
        competency: 'craft',
        description: 'High quality code',
      },
    ]

    const impacts: ImpactEntry[] = [
      {
        id: '1',
        cycleId: 'cycle1',
        source: 'evidence',
        title: 'Refactored system',
        competency: 'craft',
        score: 0.5,
      },
    ]

    const mapped = mapToRubric('L4', rubric, impacts)

    expect(mapped[0].delta).toBeGreaterThanOrEqual(-2)
    expect(mapped[0].delta).toBeLessThanOrEqual(2)
  })
})
