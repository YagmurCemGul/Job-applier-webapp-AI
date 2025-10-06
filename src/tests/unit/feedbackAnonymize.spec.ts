import { describe, it, expect } from 'vitest'
import { buildFeedbackEmail } from '@/services/review/feedback.service'
import type { FeedbackRequest } from '@/types/review.types'

describe('feedback.service', () => {
  it('should build feedback email with subject', () => {
    const req: FeedbackRequest = {
      id: 'req1',
      cycleId: 'cycle1',
      reviewerEmail: 'reviewer@example.com',
      reviewerName: 'Jane Reviewer',
      status: 'pending'
    }

    const vars = {
      YourName: 'John',
      CycleTitle: '2025 Q4 Review',
      ReviewerName: 'Jane'
    }

    const email = buildFeedbackEmail(req, vars)

    expect(email.subject).toContain('John')
    expect(email.subject).toContain('2025 Q4 Review')
    expect(email.html).toContain('Jane')
  })

  it('should include anonymous link when provided', () => {
    const req: FeedbackRequest = {
      id: 'req1',
      cycleId: 'cycle1',
      reviewerEmail: 'reviewer@example.com',
      anonymous: true,
      status: 'pending'
    }

    const vars = {
      YourName: 'John',
      CycleTitle: 'Review',
      ReviewerName: 'Jane',
      AnonLink: 'https://example.com/anon/123'
    }

    const email = buildFeedbackEmail(req, vars)

    expect(email.html).toContain('https://example.com/anon/123')
    expect(email.html).toContain('anonymous form')
  })
})
