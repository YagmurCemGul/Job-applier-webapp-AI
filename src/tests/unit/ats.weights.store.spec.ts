import { describe, it, expect, beforeEach } from 'vitest'
import { useATSWeightsStore } from '@/store/atsWeightsStore'

describe('atsWeightsStore', () => {
  beforeEach(() => {
    // Reset to defaults
    useATSWeightsStore.getState().reset()
  })

  it('should initialize with default weights', () => {
    const { weights } = useATSWeightsStore.getState()

    expect(weights.keywords).toBe(0.4)
    expect(weights.sections).toBe(0.2)
    expect(weights.length).toBe(0.1)
    expect(weights.experience).toBe(0.2)
    expect(weights.formatting).toBe(0.1)
  })

  it('should set individual weight', () => {
    const { setWeight } = useATSWeightsStore.getState()

    setWeight('keywords', 0.5)
    expect(useATSWeightsStore.getState().weights.keywords).toBe(0.5)
  })

  it('should clamp weights to [0, 1]', () => {
    const { setWeight } = useATSWeightsStore.getState()

    setWeight('keywords', 1.5)
    expect(useATSWeightsStore.getState().weights.keywords).toBe(1)

    setWeight('sections', -0.1)
    expect(useATSWeightsStore.getState().weights.sections).toBe(0)
  })

  it('should reset to defaults', () => {
    const { setWeight, reset } = useATSWeightsStore.getState()

    setWeight('keywords', 0.9)
    setWeight('sections', 0.1)

    reset()

    const { weights } = useATSWeightsStore.getState()
    expect(weights.keywords).toBe(0.4)
    expect(weights.sections).toBe(0.2)
  })

  it('should normalize weights to sum to 1', () => {
    const { setWeight, normalized } = useATSWeightsStore.getState()

    setWeight('keywords', 0.5)
    setWeight('sections', 0.5)
    setWeight('length', 0)
    setWeight('experience', 0)
    setWeight('formatting', 0)

    const norm = normalized()
    const sum = Object.values(norm).reduce((a, b) => a + b, 0)

    expect(sum).toBeCloseTo(1, 5)
    expect(norm.keywords).toBeCloseTo(0.5, 5)
    expect(norm.sections).toBeCloseTo(0.5, 5)
  })

  it('should handle all zero weights', () => {
    const { setWeight, normalized } = useATSWeightsStore.getState()

    // Set all to zero
    ;['keywords', 'sections', 'length', 'experience', 'formatting'].forEach((k) => {
      setWeight(k as any, 0)
    })

    const norm = normalized()

    // Should return defaults when all zero
    expect(norm.keywords).toBe(0.4)
    expect(norm.sections).toBe(0.2)
  })
})
