import { describe, it, expect, beforeEach } from 'vitest'
import { useCLUIStore } from '@/store/clUIStore'

describe('clUIStore', () => {
  beforeEach(() => {
    // Reset store
    useCLUIStore.setState({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      showPreview: true,
      kwAssistOpen: true,
    })
  })

  it('should initialize with defaults', () => {
    const state = useCLUIStore.getState()
    expect(state.tone).toBe('formal')
    expect(state.length).toBe('medium')
    expect(state.lang).toBe('en')
    expect(state.templateId).toBe('cl-01')
    expect(state.showPreview).toBe(true)
    expect(state.kwAssistOpen).toBe(true)
  })

  it('should set tone', () => {
    const { setTone } = useCLUIStore.getState()
    setTone('friendly')
    expect(useCLUIStore.getState().tone).toBe('friendly')
  })

  it('should set length', () => {
    const { setLength } = useCLUIStore.getState()
    setLength('short')
    expect(useCLUIStore.getState().length).toBe('short')
  })

  it('should set language', () => {
    const { setLang } = useCLUIStore.getState()
    setLang('tr')
    expect(useCLUIStore.getState().lang).toBe('tr')
  })

  it('should set template', () => {
    const { setTemplate } = useCLUIStore.getState()
    setTemplate('cl-05')
    expect(useCLUIStore.getState().templateId).toBe('cl-05')
  })

  it('should toggle preview', () => {
    const { togglePreview } = useCLUIStore.getState()
    togglePreview()
    expect(useCLUIStore.getState().showPreview).toBe(false)
    togglePreview()
    expect(useCLUIStore.getState().showPreview).toBe(true)
  })

  it('should toggle keyword assist', () => {
    const { toggleKwAssist } = useCLUIStore.getState()
    toggleKwAssist()
    expect(useCLUIStore.getState().kwAssistOpen).toBe(false)
    toggleKwAssist()
    expect(useCLUIStore.getState().kwAssistOpen).toBe(true)
  })
})
