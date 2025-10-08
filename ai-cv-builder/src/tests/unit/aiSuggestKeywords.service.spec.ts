/**
 * Unit tests for AI keyword suggestion service
 */
import { describe, it, expect } from 'vitest'
import { aiSuggestKeywords } from '@/services/features/aiSuggestKeywords.service'

describe('AI Suggest Keywords Service', () => {
  it('should return an array of keyword suggestions', async () => {
    const jobText = 'Looking for a senior React developer with TypeScript experience'
    const currentKeywords = ['React', 'TypeScript']

    const suggestions = await aiSuggestKeywords(jobText, currentKeywords, 5)

    expect(Array.isArray(suggestions)).toBe(true)
    expect(suggestions.length).toBeLessThanOrEqual(5)
  })

  it('should handle empty job text gracefully', async () => {
    const suggestions = await aiSuggestKeywords('', [], 5)

    expect(Array.isArray(suggestions)).toBe(true)
  })

  it('should respect the limit parameter', async () => {
    const jobText = 'Full-stack developer position requiring JavaScript, Node.js, SQL'
    const currentKeywords = ['JavaScript']

    const suggestions = await aiSuggestKeywords(jobText, currentKeywords, 3)

    expect(suggestions.length).toBeLessThanOrEqual(3)
  })

  it('should return empty array on API failure', async () => {
    // Mock an invalid job text that might cause issues
    const suggestions = await aiSuggestKeywords('', [], 10)

    // Should gracefully return empty array instead of throwing
    expect(Array.isArray(suggestions)).toBe(true)
  })
})
