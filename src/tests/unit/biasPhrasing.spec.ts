import { describe, it, expect } from 'vitest'
import { suggestBiasSafe } from '@/services/onboarding/biasPhrasing.service'

describe('biasPhrasing.service', () => {
  it('should suggest alternatives for "culture fit"', () => {
    const text = 'Good culture fit for the team'
    const suggestions = suggestBiasSafe(text)

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0]).toContain('culture add')
  })

  it('should suggest alternatives for "aggressive"', () => {
    const text = 'Can be aggressive in meetings'
    const suggestions = suggestBiasSafe(text)

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0]).toContain('specific behaviors')
  })

  it('should suggest alternatives for "rockstar"', () => {
    const text = 'Looking for a rockstar engineer'
    const suggestions = suggestBiasSafe(text)

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions[0]).toContain('competencies')
  })

  it('should return empty for neutral text', () => {
    const text = 'Strong technical skills and good collaboration'
    const suggestions = suggestBiasSafe(text)

    expect(suggestions).toHaveLength(0)
  })

  it('should handle case insensitive matching', () => {
    const text = 'CULTURE FIT is important'
    const suggestions = suggestBiasSafe(text)

    expect(suggestions.length).toBeGreaterThan(0)
  })
})
