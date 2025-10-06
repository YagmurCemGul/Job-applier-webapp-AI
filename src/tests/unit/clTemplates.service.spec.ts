import { describe, it, expect } from 'vitest'
import { CL_TEMPLATES, getTemplateById } from '@/services/coverletter/clTemplates.service'

describe('clTemplates.service', () => {
  it('should have 15 templates', () => {
    expect(CL_TEMPLATES).toHaveLength(15)
  })

  it('should have unique ids', () => {
    const ids = CL_TEMPLATES.map((t) => t.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(CL_TEMPLATES.length)
  })

  it('should contain placeholders in templates', () => {
    const placeholders = [
      '{{Company}}',
      '{{Role}}',
      '{{RecruiterName}}',
      '{{YourName}}',
      '{{Skills}}',
    ]

    CL_TEMPLATES.forEach((tpl) => {
      const hasPlaceholders = placeholders.some((p) => tpl.body.includes(p))
      expect(hasPlaceholders).toBe(true)
    })
  })

  it('should get template by id', () => {
    const tpl = getTemplateById('cl-01')
    expect(tpl).toBeDefined()
    expect(tpl.id).toBe('cl-01')
    expect(tpl.name).toBe('Classic Professional')
  })

  it('should return first template for invalid id', () => {
    const tpl = getTemplateById('invalid-id')
    expect(tpl).toBeDefined()
    expect(tpl.id).toBe('cl-01')
  })

  it('should have valid names for all templates', () => {
    CL_TEMPLATES.forEach((tpl) => {
      expect(tpl.name).toBeTruthy()
      expect(tpl.name.length).toBeGreaterThan(0)
    })
  })
})
