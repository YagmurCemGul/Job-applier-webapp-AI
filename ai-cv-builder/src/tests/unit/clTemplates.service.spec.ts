/**
 * Cover Letter Templates Service Tests - Step 30
 */

import { describe, it, expect } from 'vitest'
import { CL_TEMPLATES, getTemplateById } from '@/services/coverletter/clTemplates.service'

describe('clTemplates.service', () => {
  it('should have exactly 15 templates', () => {
    expect(CL_TEMPLATES).toHaveLength(15)
  })

  it('should have unique IDs for all templates', () => {
    const ids = CL_TEMPLATES.map((t) => t.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(CL_TEMPLATES.length)
  })

  it('should have all required placeholders in templates', () => {
    const requiredPlaceholders = [
      '{{RecruiterName}}',
      '{{YourName}}',
      '{{Role}}',
      '{{Company}}',
    ]

    CL_TEMPLATES.forEach((tpl) => {
      requiredPlaceholders.forEach((placeholder) => {
        expect(tpl.body).toContain(placeholder)
      })
    })
  })

  it('should get template by ID', () => {
    const template = getTemplateById('cl-01')
    expect(template).toBeDefined()
    expect(template.id).toBe('cl-01')
    expect(template.name).toBe('Classic Professional')
  })

  it('should return first template for invalid ID', () => {
    const template = getTemplateById('invalid-id')
    expect(template).toBe(CL_TEMPLATES[0])
  })

  it('should have non-empty names and bodies', () => {
    CL_TEMPLATES.forEach((tpl) => {
      expect(tpl.name).toBeTruthy()
      expect(tpl.body).toBeTruthy()
      expect(tpl.body.length).toBeGreaterThan(50)
    })
  })
})
