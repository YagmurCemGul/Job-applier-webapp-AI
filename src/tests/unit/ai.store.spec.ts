import { describe, it, expect, beforeEach } from 'vitest'
import { useAIStore } from '@/store/aiStore'

describe('aiStore', () => {
  beforeEach(() => {
    // Reset to defaults
    useAIStore.getState().reset()
  })

  it('should initialize with defaults', () => {
    const state = useAIStore.getState()

    expect(state.settings.defaults.temperature).toBe(0.2)
    expect(state.settings.defaults.timeoutMs).toBe(30000)
    expect(state.settings.defaults.retryAttempts).toBe(2)
    expect(state.settings.enableSafety).toBe(true)
    expect(state.settings.enableCache).toBe(true)
  })

  it('should set model for task', () => {
    const { setModelForTask } = useAIStore.getState()

    setModelForTask('coverLetter', {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
      kind: 'chat',
      maxTokens: 4096,
    })

    const state = useAIStore.getState()
    expect(state.settings.perTask.coverLetter?.provider).toBe('anthropic')
    expect(state.settings.perTask.coverLetter?.model).toBe('claude-3-5-sonnet')
  })

  it('should update defaults', () => {
    const { setDefaults } = useAIStore.getState()

    setDefaults({ temperature: 0.5, retryAttempts: 3 })

    const state = useAIStore.getState()
    expect(state.settings.defaults.temperature).toBe(0.5)
    expect(state.settings.defaults.retryAttempts).toBe(3)
  })

  it('should update toggles', () => {
    const { setToggles } = useAIStore.getState()

    setToggles({ enableSafety: false, enableCache: false })

    const state = useAIStore.getState()
    expect(state.settings.enableSafety).toBe(false)
    expect(state.settings.enableCache).toBe(false)
  })

  it('should reset to defaults', () => {
    const { setModelForTask, setDefaults, reset } = useAIStore.getState()

    setModelForTask('parse', {
      provider: 'google',
      model: 'gemini-pro',
      kind: 'chat',
    })
    setDefaults({ temperature: 0.9 })

    reset()

    const state = useAIStore.getState()
    expect(state.settings.perTask).toEqual({})
    expect(state.settings.defaults.temperature).toBe(0.2)
  })

  it('should persist settings', () => {
    const { setModelForTask } = useAIStore.getState()

    setModelForTask('suggest', {
      provider: 'openai',
      model: 'gpt-4o',
      kind: 'chat',
    })

    const state = useAIStore.getState()
    expect(state.settings.perTask.suggest).toBeDefined()
  })
})
