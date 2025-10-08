/**
 * Cover Letter UI Store Tests - Step 30
 */

import { describe, it, expect } from 'vitest'
import { useCLUIStore } from '@/stores/cl.ui.store'

describe('cl.ui.store', () => {
  it('should have default values', () => {
    const store = useCLUIStore.getState()
    expect(store.tone).toBe('formal')
    expect(store.length).toBe('medium')
    expect(store.lang).toBe('en')
    expect(store.templateId).toBe('cl-01')
    expect(store.showPreview).toBe(true)
    expect(store.kwAssistOpen).toBe(true)
  })

  it('should set tone', () => {
    const store = useCLUIStore.getState()
    store.setTone('friendly')
    expect(store.tone).toBe('friendly')
  })

  it('should set length', () => {
    const store = useCLUIStore.getState()
    store.setLength('long')
    expect(store.length).toBe('long')
  })

  it('should set language', () => {
    const store = useCLUIStore.getState()
    store.setLang('tr')
    expect(store.lang).toBe('tr')
  })

  it('should set template', () => {
    const store = useCLUIStore.getState()
    store.setTemplate('cl-05')
    expect(store.templateId).toBe('cl-05')
  })

  it('should toggle preview', () => {
    const store = useCLUIStore.getState()
    const initial = store.showPreview
    store.togglePreview()
    expect(store.showPreview).toBe(!initial)
  })

  it('should toggle keyword assist', () => {
    const store = useCLUIStore.getState()
    const initial = store.kwAssistOpen
    store.toggleKwAssist()
    expect(store.kwAssistOpen).toBe(!initial)
  })
})
