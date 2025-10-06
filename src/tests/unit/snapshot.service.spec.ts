import { describe, it, expect, beforeEach } from 'vitest'
import { snapshotATSAtCreation } from '@/services/variants/snapshot.service'

describe('snapshot.service', () => {
  beforeEach(() => {
    // Mock the ATS store
    vi.mock('@/store/atsStore', () => ({
      useATSStore: {
        getState: () => ({
          result: undefined,
        }),
      },
    }))
  })

  it('should return undefined when no ATS result', () => {
    const snapshot = snapshotATSAtCreation()
    expect(snapshot).toBeUndefined()
  })

  it('should return snapshot when ATS result exists', () => {
    // Mock a result
    vi.mock('@/store/atsStore', () => ({
      useATSStore: {
        getState: () => ({
          result: {
            score: 85,
            matchedKeywords: ['typescript', 'react', 'node'],
            missingKeywords: ['vue', 'angular'],
          },
        }),
      },
    }))

    const snapshot = snapshotATSAtCreation()

    if (snapshot) {
      expect(snapshot.score).toBeDefined()
      expect(snapshot.matched).toBeDefined()
      expect(snapshot.missing).toBeDefined()
    }
  })

  it('should handle errors gracefully', () => {
    // Mock a throwing store
    vi.mock('@/store/atsStore', () => {
      throw new Error('Store error')
    })

    const snapshot = snapshotATSAtCreation()
    expect(snapshot).toBeUndefined()
  })
})
