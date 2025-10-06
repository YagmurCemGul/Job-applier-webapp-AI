import { describe, it, expect } from 'vitest'
import { materializeSelfReview } from '@/services/review/selfReviewAI.service'

describe('selfReviewAI.service', () => {
  it('should compute word count correctly', () => {
    const text = 'This is a test self-review with some content'
    const review = materializeSelfReview('cycle1', 'en', text)

    expect(review.wordCount).toBe(9)
  })

  it('should calculate clarity score', () => {
    const shortText = 'Brief overview'
    const review = materializeSelfReview('cycle1', 'en', shortText)

    expect(review.clarityScore).toBeGreaterThan(0)
    expect(review.clarityScore).toBeLessThanOrEqual(1)
  })

  it('should set correct language', () => {
    const text = 'Test'
    const enReview = materializeSelfReview('cycle1', 'en', text)
    const trReview = materializeSelfReview('cycle1', 'tr', text)

    expect(enReview.lang).toBe('en')
    expect(trReview.lang).toBe('tr')
  })

  it('should have required fields', () => {
    const text = 'Test overview'
    const review = materializeSelfReview('cycle1', 'en', text)

    expect(review.id).toBeDefined()
    expect(review.cycleId).toBe('cycle1')
    expect(review.overview).toBeDefined()
    expect(Array.isArray(review.highlights)).toBe(true)
    expect(Array.isArray(review.growthAreas)).toBe(true)
    expect(Array.isArray(review.nextObjectives)).toBe(true)
  })
})
