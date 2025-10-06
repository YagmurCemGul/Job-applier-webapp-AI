import { describe, it, expect, vi } from 'vitest'
import { aiSuggestKeywords } from '@/services/features/aiSuggestKeywords.service'

describe('aiSuggestKeywords.service', () => {
  it('should return array of keywords', async () => {
    const result = await aiSuggestKeywords(
      'Job posting for backend engineer with TypeScript',
      ['TypeScript', 'Node.js'],
      10
    )

    expect(Array.isArray(result)).toBe(true)
  })

  it('should limit results to specified limit', async () => {
    const result = await aiSuggestKeywords('Job posting text', ['keyword1', 'keyword2'], 5)

    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('should handle empty job text', async () => {
    const result = await aiSuggestKeywords('', [], 10)

    expect(Array.isArray(result)).toBe(true)
  })

  it('should handle errors gracefully', async () => {
    const result = await aiSuggestKeywords('Test', [], 10)

    expect(Array.isArray(result)).toBe(true)
  })

  it('should return empty array on invalid JSON', async () => {
    // Mock aiRoute to return invalid JSON
    vi.mock('@/services/ai/router.service', () => ({
      aiRoute: async () => ({ ok: true, text: 'not valid json' }),
    }))

    const result = await aiSuggestKeywords('Test', [], 10)

    expect(result).toEqual([])
  })
})
