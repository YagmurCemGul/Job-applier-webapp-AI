import { describe, it, expect, beforeEach } from 'vitest'
import { useVariantsStore } from '@/store/variantsStore'

describe('variantsStore', () => {
  beforeEach(() => {
    // Reset store
    useVariantsStore.setState({
      items: [],
      activeId: undefined,
      loading: false,
      error: undefined,
    })

    // Mock CV data store
    vi.mock('@/store/cvDataStore', () => ({
      useCVDataStore: {
        getState: () => ({
          currentCV: {
            personalInfo: { fullName: 'John Doe', email: 'john@test.com' },
            summary: 'Test summary',
            skills: [],
            experience: [],
            education: [],
            projects: [],
          },
        }),
      },
    }))
  })

  it('should initialize with empty items', () => {
    const state = useVariantsStore.getState()
    expect(state.items).toEqual([])
    expect(state.activeId).toBeUndefined()
  })

  it('should create variant from current CV', () => {
    const { createFromCurrent } = useVariantsStore.getState()
    const id = createFromCurrent('Test Variant')

    expect(id).toBeDefined()
    const state = useVariantsStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].meta.name).toBe('Test Variant')
  })

  it('should set active variant', () => {
    const { createFromCurrent, select } = useVariantsStore.getState()
    const id = createFromCurrent('Test')

    if (id) {
      select(id)
      expect(useVariantsStore.getState().activeId).toBe(id)
    }
  })

  it('should rename variant', () => {
    const { createFromCurrent, rename } = useVariantsStore.getState()
    const id = createFromCurrent('Old Name')

    if (id) {
      rename(id, 'New Name')
      const variant = useVariantsStore.getState().items.find((v) => v.meta.id === id)
      expect(variant?.meta.name).toBe('New Name')
    }
  })

  it('should delete variant', () => {
    const { createFromCurrent, delete: del } = useVariantsStore.getState()
    const id = createFromCurrent('Test')

    if (id) {
      del(id)
      expect(useVariantsStore.getState().items).toHaveLength(0)
    }
  })

  it('should create variant with linked job', () => {
    const { createFromCurrent } = useVariantsStore.getState()
    const id = createFromCurrent('Test', { linkedJobId: 'job-123' })

    if (id) {
      const variant = useVariantsStore.getState().items.find((v) => v.meta.id === id)
      expect(variant?.meta.linkedJobId).toBe('job-123')
    }
  })

  it('should add history entry', () => {
    const { createFromCurrent, addHistory } = useVariantsStore.getState()
    const id = createFromCurrent('Test')

    if (id) {
      const initialHistoryLength = useVariantsStore.getState().items[0].history.length
      addHistory(id, 'test note')
      const newHistoryLength = useVariantsStore.getState().items[0].history.length
      expect(newHistoryLength).toBeGreaterThan(initialHistoryLength)
    }
  })
})
