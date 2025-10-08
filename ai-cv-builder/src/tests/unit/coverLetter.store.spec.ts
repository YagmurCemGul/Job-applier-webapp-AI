/**
 * Cover Letter Store Tests - Step 30
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCoverLetterStore } from '@/stores/coverLetter.store'

describe('coverLetter.store', () => {
  beforeEach(() => {
    // Reset store state
    const store = useCoverLetterStore.getState()
    store.items.forEach((item) => store.remove(item.meta.id))
  })

  it('should create a new cover letter', () => {
    const store = useCoverLetterStore.getState()
    const id = store.create({
      name: 'Test CL',
      content: '<p>Test content</p>',
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
    })

    expect(id).toBeTruthy()
    expect(store.items).toHaveLength(1)
    expect(store.items[0].meta.name).toBe('Test CL')
    expect(store.activeId).toBe(id)
  })

  it('should update cover letter content', () => {
    const store = useCoverLetterStore.getState()
    const id = store.create({
      name: 'Test',
      content: '<p>Original</p>',
    })

    store.updateContent(id, '<p>Updated</p>', 'edit')

    const doc = store.items.find((d) => d.meta.id === id)
    expect(doc?.content).toContain('Updated')
    expect(doc?.history.length).toBeGreaterThan(1)
  })

  it('should maintain history (max 25 entries)', () => {
    const store = useCoverLetterStore.getState()
    const id = store.create({ name: 'Test', content: '<p>Start</p>' })

    // Add 30 updates
    for (let i = 0; i < 30; i++) {
      store.updateContent(id, `<p>Update ${i}</p>`, `v${i}`)
    }

    const doc = store.items.find((d) => d.meta.id === id)
    expect(doc?.history.length).toBeLessThanOrEqual(25)
  })

  it('should duplicate cover letter', () => {
    const store = useCoverLetterStore.getState()
    const id = store.create({
      name: 'Original',
      content: '<p>Content</p>',
    })

    const dupId = store.duplicate(id)

    expect(dupId).toBeTruthy()
    expect(store.items).toHaveLength(2)
    const dup = store.items.find((d) => d.meta.id === dupId)
    expect(dup?.meta.name).toContain('Copy')
  })

  it('should toggle favorite status', () => {
    const store = useCoverLetterStore.getState()
    const id = store.create({ name: 'Test', content: '<p>Test</p>' })

    const initial = store.items.find((d) => d.meta.id === id)
    expect(initial?.meta.favorite).toBeFalsy()

    store.toggleFavorite(id)
    const toggled = store.items.find((d) => d.meta.id === id)
    expect(toggled?.meta.favorite).toBeTruthy()
  })

  it('should remove cover letter', () => {
    const store = useCoverLetterStore.getState()
    const id = store.create({ name: 'Test', content: '<p>Test</p>' })

    expect(store.items).toHaveLength(1)
    store.remove(id)
    expect(store.items).toHaveLength(0)
    expect(store.activeId).toBeUndefined()
  })

  it('should upsert variables', () => {
    const store = useCoverLetterStore.getState()
    const id = store.create({ name: 'Test', content: '<p>Test</p>' })

    store.upsertVars(id, { Company: 'Acme', Role: 'Dev' })

    const doc = store.items.find((d) => d.meta.id === id)
    expect(doc?.variables.Company).toBe('Acme')
    expect(doc?.variables.Role).toBe('Dev')
  })
})
