/**
 * Unit tests for AI settings store
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { useAIStore } from '@/stores/ai.store'
import type { AIModelRef } from '@/types/ai.types'

describe('AI Settings Store', () => {
  beforeEach(() => {
    useAIStore.getState().reset()
  })

  it('should initialize with default settings', () => {
    const { settings } = useAIStore.getState()

    expect(settings.defaults.temperature).toBe(0.2)
    expect(settings.defaults.timeoutMs).toBe(30000)
    expect(settings.defaults.retryAttempts).toBe(2)
    expect(settings.enableSafety).toBe(true)
    expect(settings.enableCache).toBe(true)
  })

  it('should set model for specific task', () => {
    const model: AIModelRef = {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      kind: 'chat',
      maxTokens: 8000
    }

    useAIStore.getState().setModelForTask('coverLetter', model)

    const { settings } = useAIStore.getState()
    expect(settings.perTask.coverLetter).toEqual(model)
  })

  it('should update default values', () => {
    useAIStore.getState().setDefaults({ temperature: 0.7, timeoutMs: 60000 })

    const { settings } = useAIStore.getState()
    expect(settings.defaults.temperature).toBe(0.7)
    expect(settings.defaults.timeoutMs).toBe(60000)
    expect(settings.defaults.retryAttempts).toBe(2) // Unchanged
  })

  it('should toggle safety and cache settings', () => {
    useAIStore.getState().setToggles({ 
      enableSafety: false, 
      enableCache: false,
      showMeters: false
    })

    const { settings } = useAIStore.getState()
    expect(settings.enableSafety).toBe(false)
    expect(settings.enableCache).toBe(false)
    expect(settings.showMeters).toBe(false)
  })

  it('should reset to defaults', () => {
    // Make changes
    useAIStore.getState().setDefaults({ temperature: 1.5 })
    useAIStore.getState().setToggles({ enableSafety: false })
    useAIStore.getState().setModelForTask('generate', {
      provider: 'google',
      model: 'gemini-1.5-pro',
      kind: 'chat'
    })

    // Reset
    useAIStore.getState().reset()

    const { settings } = useAIStore.getState()
    expect(settings.defaults.temperature).toBe(0.2)
    expect(settings.enableSafety).toBe(true)
    expect(settings.perTask.generate).toBeUndefined()
  })
})
