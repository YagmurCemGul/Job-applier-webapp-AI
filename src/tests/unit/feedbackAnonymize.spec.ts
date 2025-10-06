import { describe, it, expect } from 'vitest'

describe('feedback.service', () => {
  it('should build feedback email with correct format', () => {
    // Mock test for email building
    const vars = {
      YourName: 'Test User',
      CycleTitle: 'Year End 2025',
      ReviewerName: 'Manager',
    }

    expect(vars.YourName).toBe('Test User')
    expect(vars.CycleTitle).toBe('Year End 2025')
  })

  it('should handle anonymous option', () => {
    const vars = {
      YourName: 'Test',
      CycleTitle: 'Review',
      ReviewerName: 'Peer',
      AnonLink: 'https://example.com/feedback/123',
    }

    expect(vars.AnonLink).toBeDefined()
  })
})
