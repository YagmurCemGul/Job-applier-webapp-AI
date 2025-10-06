import { describe, it, expect, beforeEach } from 'vitest'
import { useCoverLetterStore } from '@/store/coverLetterStore'

describe('coverLetterStore', () => {
  beforeEach(() => {
    // Reset store
    useCoverLetterStore.setState({
      items: [],
      activeId: undefined,
      loading: false,
      error: undefined,
    })
  })

  it('should initialize with empty items', () => {
    const state = useCoverLetterStore.getState()
    expect(state.items).toEqual([])
    expect(state.activeId).toBeUndefined()
  })

  it('should create cover letter', () => {
    const { create } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test CL',
      content: '<p>Hello</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    expect(id).toBeDefined()
    const state = useCoverLetterStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].meta.name).toBe('Test CL')
    expect(state.activeId).toBe(id)
  })

  it('should update content', () => {
    const { create, updateContent } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test CL',
      content: '<p>Initial</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    updateContent(id, '<p>Updated</p>', 'edit')

    const state = useCoverLetterStore.getState()
    const doc = state.items.find((d) => d.meta.id === id)
    expect(doc?.content).toContain('Updated')
    expect(doc?.history).toHaveLength(2)
  })

  it('should select cover letter', () => {
    const { create, select } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test',
      content: '<p>Test</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    select(id)
    expect(useCoverLetterStore.getState().activeId).toBe(id)

    select(undefined)
    expect(useCoverLetterStore.getState().activeId).toBeUndefined()
  })

  it('should remove cover letter', () => {
    const { create, remove } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test',
      content: '<p>Test</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    remove(id)
    expect(useCoverLetterStore.getState().items).toHaveLength(0)
  })

  it('should duplicate cover letter', () => {
    const { create, duplicate } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test',
      content: '<p>Test</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    const newId = duplicate(id)
    expect(newId).toBeDefined()
    const state = useCoverLetterStore.getState()
    expect(state.items).toHaveLength(2)
    expect(state.items[0].meta.name).toContain('(Copy)')
  })

  it('should toggle favorite', () => {
    const { create, toggleFavorite } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test',
      content: '<p>Test</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    toggleFavorite(id)
    let doc = useCoverLetterStore.getState().items.find((d) => d.meta.id === id)
    expect(doc?.meta.favorite).toBe(true)

    toggleFavorite(id)
    doc = useCoverLetterStore.getState().items.find((d) => d.meta.id === id)
    expect(doc?.meta.favorite).toBe(false)
  })

  it('should upsert variables', () => {
    const { create, upsertVars } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test',
      content: '<p>Test</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      variables: { Company: 'Corp' },
    })

    upsertVars(id, { Role: 'Engineer' })
    const doc = useCoverLetterStore.getState().items.find((d) => d.meta.id === id)
    expect(doc?.variables.Company).toBe('Corp')
    expect(doc?.variables.Role).toBe('Engineer')
  })

  it('should sanitize HTML on create', () => {
    const { create } = useCoverLetterStore.getState()
    const id = create({
      name: 'Test',
      content: '<p>Hello</p><script>alert(1)</script>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    const doc = useCoverLetterStore.getState().items.find((d) => d.meta.id === id)
    expect(doc?.content).not.toContain('<script>')
  })
})
