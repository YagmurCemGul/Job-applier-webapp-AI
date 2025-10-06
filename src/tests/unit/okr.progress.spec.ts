import { describe, it, expect } from 'vitest'
import { objectiveProgress } from '@/services/onboarding/okr.service'
import type { Objective } from '@/types/okr.types'

describe('okr.service', () => {
  it('should calculate weighted progress correctly', () => {
    const objective: Objective = {
      id: 'okr1',
      planId: 'plan1',
      title: 'Launch Feature',
      owner: 'me',
      krs: [
        {
          id: 'kr1',
          label: 'Complete design',
          target: 100,
          current: 100,
          unit: '%',
          weight: 1,
        },
        {
          id: 'kr2',
          label: 'Ship to production',
          target: 100,
          current: 50,
          unit: '%',
          weight: 2,
        },
      ],
      confidence: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const progress = objectiveProgress(objective)

    // (1*1 + 0.5*2) / (1+2) = 2 / 3 = 0.667
    expect(progress).toBeCloseTo(0.667, 2)
  })

  it('should handle objective with no KRs', () => {
    const objective: Objective = {
      id: 'okr1',
      planId: 'plan1',
      title: 'Empty',
      owner: 'me',
      krs: [],
      confidence: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(objectiveProgress(objective)).toBe(0)
  })

  it('should handle zero targets', () => {
    const objective: Objective = {
      id: 'okr1',
      planId: 'plan1',
      title: 'Test',
      owner: 'me',
      krs: [
        {
          id: 'kr1',
          label: 'Test',
          target: 0,
          current: 10,
          weight: 1,
        },
      ],
      confidence: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(objectiveProgress(objective)).toBe(0)
  })

  it('should cap progress at 100%', () => {
    const objective: Objective = {
      id: 'okr1',
      planId: 'plan1',
      title: 'Test',
      owner: 'me',
      krs: [
        {
          id: 'kr1',
          label: 'Over target',
          target: 100,
          current: 150,
          weight: 1,
        },
      ],
      confidence: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    expect(objectiveProgress(objective)).toBe(1)
  })
})
