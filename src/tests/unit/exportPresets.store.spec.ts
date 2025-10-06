import { describe, it, expect, beforeEach } from 'vitest'
import { useExportPresetsStore } from '@/store/exportPresetsStore'

describe('exportPresetsStore', () => {
  beforeEach(() => {
    // Reset store
    useExportPresetsStore.setState({
      presets: [],
    })
  })

  it('should initialize with empty presets', () => {
    const state = useExportPresetsStore.getState()
    expect(state.presets).toEqual([])
  })

  it('should upsert a new preset', () => {
    const { upsert } = useExportPresetsStore.getState()

    const id = upsert({
      name: 'Default EN',
      namingTemplate: 'CV_{FirstName}_{LastName}',
      formats: ['pdf'],
      locale: 'en',
    })

    expect(id).toBeDefined()
    const state = useExportPresetsStore.getState()
    expect(state.presets).toHaveLength(1)
    expect(state.presets[0].name).toBe('Default EN')
  })

  it('should update existing preset', () => {
    const { upsert } = useExportPresetsStore.getState()

    const id = upsert({
      name: 'Test',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf'],
    })

    upsert({
      id,
      name: 'Updated Test',
      namingTemplate: 'CV_{FirstName}_{LastName}',
      formats: ['pdf', 'docx'],
    })

    const state = useExportPresetsStore.getState()
    expect(state.presets).toHaveLength(1)
    expect(state.presets[0].name).toBe('Updated Test')
    expect(state.presets[0].formats).toContain('docx')
  })

  it('should remove preset', () => {
    const { upsert, remove } = useExportPresetsStore.getState()

    const id = upsert({
      name: 'Test',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf'],
    })

    remove(id)
    expect(useExportPresetsStore.getState().presets).toHaveLength(0)
  })

  it('should get preset by id', () => {
    const { upsert, getById } = useExportPresetsStore.getState()

    const id = upsert({
      name: 'Test',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf'],
    })

    const preset = getById(id)
    expect(preset).toBeDefined()
    expect(preset?.name).toBe('Test')
  })

  it('should handle multiple formats', () => {
    const { upsert } = useExportPresetsStore.getState()

    upsert({
      name: 'Multi',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf', 'docx', 'gdoc'],
    })

    const state = useExportPresetsStore.getState()
    expect(state.presets[0].formats).toHaveLength(3)
    expect(state.presets[0].formats).toContain('pdf')
    expect(state.presets[0].formats).toContain('docx')
    expect(state.presets[0].formats).toContain('gdoc')
  })

  it('should set default locale to en', () => {
    const { upsert } = useExportPresetsStore.getState()

    upsert({
      name: 'Test',
      namingTemplate: 'CV',
      formats: ['pdf'],
    })

    const state = useExportPresetsStore.getState()
    expect(state.presets[0].locale).toBe('en')
  })
})
