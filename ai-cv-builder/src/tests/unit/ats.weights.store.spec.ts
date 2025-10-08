import { describe, it, expect, beforeEach } from 'vitest'
import { useATSWeightsStore, DEFAULT_WEIGHTS } from '@/stores/ats.weights.store'

describe('ats.weights.store', () => {
  beforeEach(() => {
    // Reset store before each test
    useATSWeightsStore.setState({
      weights: { ...DEFAULT_WEIGHTS },
    })
  })

  describe('initial state', () => {
    it('should have default weights', () => {
      const { weights } = useATSWeightsStore.getState()
      
      expect(weights.keywords).toBe(0.4)
      expect(weights.sections).toBe(0.2)
      expect(weights.length).toBe(0.1)
      expect(weights.experience).toBe(0.2)
      expect(weights.formatting).toBe(0.1)
    })

    it('should sum to 1', () => {
      const { weights } = useATSWeightsStore.getState()
      const sum = Object.values(weights).reduce((acc, val) => acc + val, 0)
      
      expect(sum).toBeCloseTo(1.0, 10)
    })
  })

  describe('setWeight', () => {
    it('should update individual weight', () => {
      const { setWeight } = useATSWeightsStore.getState()
      
      setWeight('keywords', 0.5)
      expect(useATSWeightsStore.getState().weights.keywords).toBe(0.5)
    })

    it('should clamp values to 0-1 range', () => {
      const { setWeight } = useATSWeightsStore.getState()
      
      setWeight('keywords', 1.5)
      expect(useATSWeightsStore.getState().weights.keywords).toBe(1.0)
      
      setWeight('keywords', -0.5)
      expect(useATSWeightsStore.getState().weights.keywords).toBe(0.0)
    })

    it('should handle edge cases', () => {
      const { setWeight } = useATSWeightsStore.getState()
      
      setWeight('keywords', 0)
      expect(useATSWeightsStore.getState().weights.keywords).toBe(0)
      
      setWeight('keywords', 1)
      expect(useATSWeightsStore.getState().weights.keywords).toBe(1)
    })
  })

  describe('reset', () => {
    it('should reset to default weights', () => {
      const { setWeight, reset } = useATSWeightsStore.getState()
      
      // Modify weights
      setWeight('keywords', 0.8)
      setWeight('sections', 0.1)
      
      // Reset
      reset()
      
      const { weights } = useATSWeightsStore.getState()
      expect(weights).toEqual(DEFAULT_WEIGHTS)
    })
  })

  describe('normalized', () => {
    it('should return normalized weights that sum to 1', () => {
      const { setWeight, normalized } = useATSWeightsStore.getState()
      
      // Set weights that don't sum to 1
      setWeight('keywords', 0.5)
      setWeight('sections', 0.3)
      setWeight('length', 0.1)
      setWeight('experience', 0.1)
      setWeight('formatting', 0.1)
      // Sum = 1.1
      
      const norm = normalized()
      const sum = Object.values(norm).reduce((acc, val) => acc + val, 0)
      
      expect(sum).toBeCloseTo(1.0, 10)
    })

    it('should preserve ratios when normalizing', () => {
      const { setWeight, normalized } = useATSWeightsStore.getState()
      
      setWeight('keywords', 0.4)
      setWeight('sections', 0.2)
      setWeight('length', 0.2)
      setWeight('experience', 0.2)
      setWeight('formatting', 0.2)
      // Sum = 1.2
      
      const norm = normalized()
      
      // Check ratios are preserved
      expect(norm.keywords / norm.sections).toBeCloseTo(0.4 / 0.2, 5)
      expect(norm.sections / norm.length).toBeCloseTo(0.2 / 0.2, 5)
    })

    it('should handle all-zero weights', () => {
      const { setWeight, normalized } = useATSWeightsStore.getState()
      
      setWeight('keywords', 0)
      setWeight('sections', 0)
      setWeight('length', 0)
      setWeight('experience', 0)
      setWeight('formatting', 0)
      
      const norm = normalized()
      
      // Should return defaults when sum is 0
      expect(norm).toEqual(DEFAULT_WEIGHTS)
    })

    it('should handle already normalized weights', () => {
      const { normalized } = useATSWeightsStore.getState()
      
      // Default weights already sum to 1
      const norm = normalized()
      
      expect(norm.keywords).toBeCloseTo(DEFAULT_WEIGHTS.keywords, 10)
      expect(norm.sections).toBeCloseTo(DEFAULT_WEIGHTS.sections, 10)
      expect(norm.length).toBeCloseTo(DEFAULT_WEIGHTS.length, 10)
      expect(norm.experience).toBeCloseTo(DEFAULT_WEIGHTS.experience, 10)
      expect(norm.formatting).toBeCloseTo(DEFAULT_WEIGHTS.formatting, 10)
    })

    it('should handle weights that sum to less than 1', () => {
      const { setWeight, normalized } = useATSWeightsStore.getState()
      
      setWeight('keywords', 0.2)
      setWeight('sections', 0.1)
      setWeight('length', 0.1)
      setWeight('experience', 0.1)
      setWeight('formatting', 0.1)
      // Sum = 0.6
      
      const norm = normalized()
      const sum = Object.values(norm).reduce((acc, val) => acc + val, 0)
      
      expect(sum).toBeCloseTo(1.0, 10)
      expect(norm.keywords).toBeCloseTo(0.2 / 0.6, 10)
    })
  })

  describe('bounds checking', () => {
    it('should maintain bounds after multiple operations', () => {
      const { setWeight } = useATSWeightsStore.getState()
      
      setWeight('keywords', 0.9)
      setWeight('keywords', 1.2)
      setWeight('keywords', -0.1)
      setWeight('keywords', 0.5)
      
      const { weights } = useATSWeightsStore.getState()
      expect(weights.keywords).toBe(0.5)
      expect(weights.keywords).toBeGreaterThanOrEqual(0)
      expect(weights.keywords).toBeLessThanOrEqual(1)
    })
  })
})
