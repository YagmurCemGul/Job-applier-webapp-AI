import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiRoute } from '@/services/ai/router.service'
import { aiCache } from '@/services/ai/cache.service'

describe('router.service', () => {
  beforeEach(() => {
    aiCache.clear()
    vi.clearAllMocks()
  })

  it('should route request to provider', async () => {
    const result = await aiRoute({
      task: 'generate',
      prompt: 'Hello',
    })

    expect(result.ok).toBeDefined()
    expect(result.provider).toBeDefined()
    expect(result.model).toBeDefined()
  })

  it('should handle cache hit', async () => {
    const req = { task: 'generate' as const, prompt: 'Test cache' }

    // First call
    const result1 = await aiRoute(req, { allowCache: true })
    expect(result1.cached).toBeUndefined()

    // Second call should be cached
    const result2 = await aiRoute(req, { allowCache: true })
    expect(result2.cached).toBe(true)
  })

  it('should respect allowCache false', async () => {
    const req = { task: 'generate' as const, prompt: 'No cache' }

    const result1 = await aiRoute(req, { allowCache: false })
    const result2 = await aiRoute(req, { allowCache: false })

    expect(result1.cached).toBeUndefined()
    expect(result2.cached).toBeUndefined()
  })

  it('should use fallback when provider unavailable', async () => {
    const result = await aiRoute({
      task: 'generate',
      prompt: 'Fallback test',
    })

    expect(result.ok).toBe(true)
    expect(result.text).toBeDefined()
  })

  it('should handle embeddings task', async () => {
    const result = await aiRoute({
      task: 'embed',
      texts: ['Hello', 'World'],
    })

    expect(result.ok).toBe(true)
    expect(result.embeddings).toBeDefined()
  })

  it('should handle moderation task', async () => {
    const result = await aiRoute({
      task: 'moderate',
      contentToCheck: 'This is safe content',
    })

    expect(result.ok).toBe(true)
    expect(result.moderated).toBeDefined()
    expect(result.moderated?.allowed).toBe(true)
  })

  it('should block unsafe content in pre-check', async () => {
    const result = await aiRoute({
      task: 'generate',
      prompt: 'credit card 1234-5678-9012-3456',
    })

    // Safety gate should catch this
    expect(result.ok).toBe(false)
    expect(result.moderated?.allowed).toBe(false)
  })

  it('should include usage metrics', async () => {
    const result = await aiRoute({
      task: 'generate',
      prompt: 'Test',
    })

    expect(result.usage).toBeDefined()
    expect(result.usage?.inputTokens).toBeGreaterThanOrEqual(0)
    expect(result.usage?.outputTokens).toBeGreaterThanOrEqual(0)
    expect(result.usage?.totalTokens).toBeGreaterThanOrEqual(0)
    expect(result.usage?.costUSD).toBeGreaterThanOrEqual(0)
  })
})
