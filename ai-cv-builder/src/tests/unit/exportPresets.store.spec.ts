import { describe, it, expect, beforeEach } from 'vitest'
import { useExportPresetsStore } from '@/stores/exportPresets.store'

describe('exportPresets.store', () => {
  beforeEach(() => {
    // Reset store before each test
    useExportPresetsStore.setState({ presets: [] })
  })

  it('creates a new preset', () => {
    const { upsert, presets } = useExportPresetsStore.getState()
    
    const id = upsert({
      name: 'Default EN',
      namingTemplate: 'CV_{FirstName}_{LastName}',
      formats: ['pdf'],
      locale: 'en',
    })

    expect(id).toBeDefined()
    const updated = useExportPresetsStore.getState().presets
    expect(updated).toHaveLength(1)
    expect(updated[0].name).toBe('Default EN')
  })

  it('updates an existing preset', () => {
    const { upsert } = useExportPresetsStore.getState()
    
    const id = upsert({
      name: 'Original',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf'],
    })

    upsert({
      id,
      name: 'Updated',
      namingTemplate: 'CV_{FirstName}_{LastName}',
      formats: ['pdf', 'docx'],
    })

    const { presets } = useExportPresetsStore.getState()
    expect(presets).toHaveLength(1)
    expect(presets[0].name).toBe('Updated')
    expect(presets[0].formats).toContain('docx')
  })

  it('removes a preset', () => {
    const { upsert, remove } = useExportPresetsStore.getState()
    
    const id = upsert({
      name: 'To Remove',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf'],
    })

    remove(id)

    const { presets } = useExportPresetsStore.getState()
    expect(presets).toHaveLength(0)
  })

  it('gets preset by ID', () => {
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

  it('sets default locale to en', () => {
    const { upsert } = useExportPresetsStore.getState()
    
    const id = upsert({
      name: 'Test',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf'],
    })

    const { presets } = useExportPresetsStore.getState()
    expect(presets[0].locale).toBe('en')
  })

  it('handles multiple formats', () => {
    const { upsert } = useExportPresetsStore.getState()
    
    upsert({
      name: 'Multi-format',
      namingTemplate: 'CV_{FirstName}',
      formats: ['pdf', 'docx', 'gdoc'],
    })

    const { presets } = useExportPresetsStore.getState()
    expect(presets[0].formats).toHaveLength(3)
  })
})
