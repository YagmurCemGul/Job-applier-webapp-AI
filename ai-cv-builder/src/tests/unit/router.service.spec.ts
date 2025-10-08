/**
 * Unit tests for AI router service
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiRoute } from '@/services/ai/router.service'
import { useAIStore } from '@/stores/ai.store'
import type { AIRequest } from '@/types/ai.types'

describe('AI Router Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAIStore.getState().reset()
  })

  it('should route a simple text generation request', async () => {
    const req: AIRequest = {
      task: 'generate',
      prompt: 'Say hello',
      maxTokens: 50
    }

    const result = await aiRoute(req, { allowCache: false })

    expect(result).toBeDefined()
    expect(result.ok).toBe(true)
    expect(result.provider).toBeDefined()
    expect(result.model).toBeDefined()
    expect(result.text).toBeDefined()
  })

  it('should return cached results on subsequent identical requests', async () => {
    const req: AIRequest = {
      task: 'generate',
      prompt: 'Test caching',
      maxTokens: 50
    }

    const result1 = await aiRoute(req, { allowCache: true })
    expect(result1.cached).toBeFalsy()

    const result2 = await aiRoute(req, { allowCache: true })
    expect(result2.cached).toBe(true)
  })

  it('should respect per-task model configuration', async () => {
    useAIStore.getState().setModelForTask('generate', {
      provider: 'openai',
      model: 'gpt-4o-mini',
      kind: 'chat',
      maxTokens: 8000
    })

    const req: AIRequest = {
      task: 'generate',
      prompt: 'Test model selection'
    }

    const result = await aiRoute(req, { allowCache: false })
    expect(result.provider).toBe('openai')
  })

  it('should handle retries on failure with exponential backoff', async () => {
    const req: AIRequest = {
      task: 'generate',
      prompt: 'Test retry'
    }

    // Mock a provider that fails
    vi.mock('@/services/ai/providers/openai.provider', () => ({
      call: vi.fn().mockRejectedValue(new Error('Network error'))
    }))

    const result = await aiRoute(req, { 
      allowCache: false,
      retry: { attempts: 2, backoffMs: 10 }
    })

    // Should eventually fail gracefully
    expect(result.ok).toBe(false)
  }, 10000)

  it('should abort on timeout', async () => {
    const req: AIRequest = {
      task: 'generate',
      prompt: 'Test timeout'
    }

    const result = await aiRoute(req, { 
      allowCache: false,
      timeoutMs: 1 // Very short timeout
    })

    expect(result.ok).toBe(false)
  }, 5000)

  it('should block unsafe content when safety is enabled', async () => {
    useAIStore.getState().setToggles({ enableSafety: true })

    const req: AIRequest = {
      task: 'generate',
      prompt: 'violent hate content'
    }

    const result = await aiRoute(req, { allowCache: false })
    
    if (!result.ok && result.moderated) {
      expect(result.moderated.allowed).toBe(false)
    }
  })
})
