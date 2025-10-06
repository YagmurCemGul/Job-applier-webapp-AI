import { describe, it, expect } from 'vitest'
import { renderFilename } from '@/services/variants/naming.service'
import type { RenderContext } from '@/types/export.types'

describe('naming.service', () => {
  it('should replace tokens with context values', () => {
    const ctx: RenderContext = {
      FirstName: 'John',
      LastName: 'Doe',
      Role: 'Backend Engineer',
      Company: 'TechCorp',
      Date: '2025-10-06',
    }

    const result = renderFilename('CV_{FirstName}_{LastName}_{Role}', ctx)

    expect(result).toBe('CV_John_Doe_Backend-Engineer')
  })

  it('should strip illegal filename characters', () => {
    const ctx: RenderContext = {
      FirstName: 'John',
      Company: 'Tech/Corp:Ltd',
      Date: '2025-10-06',
    }

    const result = renderFilename('CV_{FirstName}_{Company}', ctx)

    expect(result).not.toContain('/')
    expect(result).not.toContain(':')
    expect(result).toContain('-')
  })

  it('should handle missing context values', () => {
    const ctx: RenderContext = {
      FirstName: 'John',
      Date: '2025-10-06',
    }

    const result = renderFilename('CV_{FirstName}_{LastName}_{Company}', ctx)

    expect(result).toContain('John')
    expect(result).not.toContain('undefined')
  })

  it('should collapse multiple spaces and dashes', () => {
    const ctx: RenderContext = {
      FirstName: 'John',
      LastName: 'Doe',
      Date: '2025-10-06',
    }

    const result = renderFilename('CV  {FirstName}   {LastName}', ctx)

    expect(result).not.toMatch(/\s{2,}/)
  })

  it('should handle all tokens', () => {
    const ctx: RenderContext = {
      FirstName: 'John',
      MiddleName: 'M',
      LastName: 'Doe',
      Role: 'Engineer',
      Company: 'Corp',
      Date: '2025-10-06',
      JobId: 'job-123',
      VariantName: 'Variant1',
      Locale: 'en',
    }

    const result = renderFilename(
      '{FirstName}_{MiddleName}_{LastName}_{Role}_{Company}_{Date}_{JobId}_{VariantName}_{Locale}',
      ctx
    )

    expect(result).toContain('John')
    expect(result).toContain('M')
    expect(result).toContain('Doe')
    expect(result).toContain('Engineer')
    expect(result).toContain('Corp')
    expect(result).toContain('2025-10-06')
    expect(result).toContain('job-123')
    expect(result).toContain('Variant1')
    expect(result).toContain('en')
  })

  it('should trim whitespace', () => {
    const ctx: RenderContext = {
      FirstName: ' John ',
      LastName: ' Doe ',
      Date: '2025-10-06',
    }

    const result = renderFilename('  CV_{FirstName}_{LastName}  ', ctx)

    expect(result).not.toMatch(/^\s/)
    expect(result).not.toMatch(/\s$/)
  })
})
