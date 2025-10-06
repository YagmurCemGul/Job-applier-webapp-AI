import { describe, it, expect, beforeEach } from 'vitest'
import { useATSUIStore } from '@/store/atsUIStore'

describe('atsUIStore', () => {
  beforeEach(() => {
    // Reset store
    useATSUIStore.setState({
      highlights: 'both',
      showLegend: true,
      kwSearch: '',
      selectedKw: undefined,
    })
  })

  it('should initialize with default values', () => {
    const state = useATSUIStore.getState()

    expect(state.highlights).toBe('both')
    expect(state.showLegend).toBe(true)
    expect(state.kwSearch).toBe('')
    expect(state.selectedKw).toBeUndefined()
  })

  it('should set highlights mode', () => {
    const { setHighlights } = useATSUIStore.getState()

    setHighlights('job')
    expect(useATSUIStore.getState().highlights).toBe('job')

    setHighlights('off')
    expect(useATSUIStore.getState().highlights).toBe('off')
  })

  it('should toggle legend', () => {
    const { toggleLegend } = useATSUIStore.getState()

    toggleLegend()
    expect(useATSUIStore.getState().showLegend).toBe(false)

    toggleLegend()
    expect(useATSUIStore.getState().showLegend).toBe(true)
  })

  it('should set keyword search', () => {
    const { setKwSearch } = useATSUIStore.getState()

    setKwSearch('typescript')
    expect(useATSUIStore.getState().kwSearch).toBe('typescript')
  })

  it('should set selected keyword', () => {
    const { setSelectedKw } = useATSUIStore.getState()

    setSelectedKw('react')
    expect(useATSUIStore.getState().selectedKw).toBe('react')

    setSelectedKw(undefined)
    expect(useATSUIStore.getState().selectedKw).toBeUndefined()
  })
})
