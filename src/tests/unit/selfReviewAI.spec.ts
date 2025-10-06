import { describe, it, expect } from 'vitest'
import { materializeSelfReview } from '@/services/review/selfReviewAI.service'

describe('selfReviewAI.service', () => {
  it('should parse overview and highlights from text', () => {
    const text = `
Overview: Successfully delivered major features

Highlights:
- Shipped feature X with 95% adoption
- Reduced latency by 40%
- Mentored 3 junior engineers

Growth:
- Improve communication in large meetings
    `

    const review = materializeSelfReview('cycle1', 'en', text)

    expect(review.overview).toContain('delivered')
    expect(review.highlights.length).toBeGreaterThan(0)
    expect(review.growthAreas.length).toBeGreaterThan(0)
  })

  it('should compute word count', () => {
    const text = 'This is a test review with some words'

    const review = materializeSelfReview('cycle1', 'en', text)

    expect(review.wordCount).toBeGreaterThan(0)
  })

  it('should compute clarity score', () => {
    const text = 'Short review'

    const review = materializeSelfReview('cycle1', 'en', text)

    expect(review.clarityScore).toBeGreaterThan(0)
    expect(review.clarityScore).toBeLessThanOrEqual(1)
  })
})
