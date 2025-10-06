import { describe, it, expect, beforeEach } from 'vitest'
import { useJobSearchesStore } from '@/store/jobSearchesStore'

describe('jobSearchesStore', () => {
  beforeEach(() => {
    useJobSearchesStore.setState({ searches: [] })
  })

  it('should upsert search', () => {
    const id = useJobSearchesStore.getState().upsert({
      name: 'My Search',
      query: 'JavaScript',
      filters: {},
      alerts: { enabled: true, intervalMin: 60 }
    })

    expect(useJobSearchesStore.getState().searches).toHaveLength(1)
    expect(id).toBeDefined()
  })

  it('should update existing search', () => {
    const id = useJobSearchesStore.getState().upsert({
      name: 'Search 1',
      query: 'Python',
      filters: {},
      alerts: { enabled: false, intervalMin: 60 }
    })

    useJobSearchesStore.getState().upsert({
      id,
      name: 'Updated Search',
      query: 'Python Django',
      filters: {},
      alerts: { enabled: true, intervalMin: 30 }
    })

    expect(useJobSearchesStore.getState().searches).toHaveLength(1)
    expect(useJobSearchesStore.getState().searches[0].name).toBe('Updated Search')
    expect(useJobSearchesStore.getState().searches[0].query).toBe('Python Django')
  })

  it('should remove search', () => {
    const id = useJobSearchesStore.getState().upsert({
      name: 'Test',
      query: 'Test',
      filters: {},
      alerts: { enabled: false, intervalMin: 60 }
    })

    useJobSearchesStore.getState().remove(id)
    expect(useJobSearchesStore.getState().searches).toHaveLength(0)
  })

  it('should get search by id', () => {
    const id = useJobSearchesStore.getState().upsert({
      name: 'Find Me',
      query: 'React',
      filters: {},
      alerts: { enabled: false, intervalMin: 60 }
    })

    const search = useJobSearchesStore.getState().getById(id)
    expect(search).toBeDefined()
    expect(search?.name).toBe('Find Me')
  })

  it('should return undefined for non-existent search', () => {
    const search = useJobSearchesStore.getState().getById('nonexistent')
    expect(search).toBeUndefined()
  })
})
