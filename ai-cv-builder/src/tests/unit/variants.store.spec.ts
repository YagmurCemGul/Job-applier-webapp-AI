import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useVariantsStore } from '@/stores/variants.store'

// Mock the CV data store
vi.mock('@/stores/cvData.store', () => ({
  useCVDataStore: {
    getState: () => ({
      currentCV: {
        id: '1',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-0100',
          phoneCountryCode: '+1',
          location: {},
        },
        summary: 'Developer',
        experience: [],
        education: [],
        skills: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      updatePersonalInfo: vi.fn(),
      updateSummary: vi.fn(),
    }),
  },
}))

describe('variants.store', () => {
  beforeEach(() => {
    // Reset store before each test
    useVariantsStore.setState({ items: [], activeId: undefined })
  })

  it('creates a variant from current CV', () => {
    const { createFromCurrent, items } = useVariantsStore.getState()
    const id = createFromCurrent('Test Variant')

    expect(id).toBeDefined()
    expect(items).toHaveLength(1)
    expect(items[0].meta.name).toBe('Test Variant')
  })

  it('creates a variant with linked job', () => {
    const { createFromCurrent, items } = useVariantsStore.getState()
    const id = createFromCurrent('Backend Variant', { linkedJobId: 'job123' })

    expect(items[0].meta.linkedJobId).toBe('job123')
  })

  it('renames a variant', () => {
    const { createFromCurrent, rename, items } = useVariantsStore.getState()
    const id = createFromCurrent('Old Name')!

    rename(id, 'New Name')

    const updated = useVariantsStore.getState().items
    expect(updated[0].meta.name).toBe('New Name')
  })

  it('selects a variant', () => {
    const { createFromCurrent, select } = useVariantsStore.getState()
    const id = createFromCurrent('Variant 1')!

    select(id)

    const { activeId } = useVariantsStore.getState()
    expect(activeId).toBe(id)
  })

  it('deletes a variant', () => {
    const { createFromCurrent, delete: deleteVariant } = useVariantsStore.getState()
    const id = createFromCurrent('To Delete')!

    deleteVariant(id)

    const { items } = useVariantsStore.getState()
    expect(items).toHaveLength(0)
  })

  it('adds history snapshot', () => {
    const { createFromCurrent, addHistory, items } = useVariantsStore.getState()
    const id = createFromCurrent('Variant')!

    addHistory(id, 'Snapshot 1')

    const updated = useVariantsStore.getState().items
    expect(updated[0].history.length).toBeGreaterThan(1)
  })

  it('maintains variant history', () => {
    const { createFromCurrent, items } = useVariantsStore.getState()
    createFromCurrent('Variant')

    const variant = items[0]
    expect(variant.history).toHaveLength(1)
    expect(variant.history[0].note).toBe('init')
  })
})
