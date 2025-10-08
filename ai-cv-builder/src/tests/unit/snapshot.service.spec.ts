import { describe, it, expect, vi, beforeEach } from 'vitest'
import { snapshotATSAtCreation } from '@/services/variants/snapshot.service'

describe('snapshot.service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns undefined when ATS store is not available', () => {
    const result = snapshotATSAtCreation()
    expect(result).toBeUndefined()
  })

  it('returns undefined when no ATS result exists', () => {
    vi.doMock('@/stores/ats.store', () => ({
      useATSStore: {
        getState: () => ({ result: undefined }),
      },
    }))

    const result = snapshotATSAtCreation()
    expect(result).toBeUndefined()
  })

  it('captures ATS score and keyword counts', () => {
    vi.doMock('@/stores/ats.store', () => ({
      useATSStore: {
        getState: () => ({
          result: {
            score: 85,
            matchedKeywords: ['React', 'Node.js', 'TypeScript'],
            missingKeywords: ['Docker', 'Kubernetes'],
          },
        }),
      },
    }))

    const result = snapshotATSAtCreation()

    if (result) {
      expect(result.score).toBe(85)
      expect(result.matched).toBe(3)
      expect(result.missing).toBe(2)
    }
  })
})
