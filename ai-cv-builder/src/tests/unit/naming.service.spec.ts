import { describe, it, expect } from 'vitest'
import { renderFilename } from '@/services/variants/naming.service'

describe('naming.service', () => {
  it('replaces tokens with values', () => {
    const result = renderFilename('CV_{FirstName}_{LastName}', {
      FirstName: 'John',
      LastName: 'Doe',
      Date: '2024-01-01',
    })

    expect(result).toBe('CV_John_Doe')
  })

  it('handles missing tokens gracefully', () => {
    const result = renderFilename('CV_{FirstName}_{LastName}_{Company}', {
      FirstName: 'John',
      Date: '2024-01-01',
    })

    expect(result).toBe('CV_John__')
  })

  it('sanitizes illegal filename characters', () => {
    const result = renderFilename('CV_{Company}', {
      Company: 'Acme/Corp*Ltd',
      Date: '2024-01-01',
    })

    expect(result).toBe('CV_Acme-Corp-Ltd')
  })

  it('collapses multiple spaces and dashes', () => {
    const result = renderFilename('CV_{FirstName}  {LastName}', {
      FirstName: 'John',
      LastName: 'Doe',
      Date: '2024-01-01',
    })

    expect(result).toContain('John')
    expect(result).toContain('Doe')
  })

  it('handles all token types', () => {
    const result = renderFilename(
      '{FirstName}_{MiddleName}_{LastName}_{Role}_{Company}_{Date}_{JobId}_{VariantName}_{Locale}',
      {
        FirstName: 'John',
        MiddleName: 'Q',
        LastName: 'Doe',
        Role: 'Backend',
        Company: 'Acme',
        Date: '2024-01-01',
        JobId: 'job123',
        VariantName: 'v1',
        Locale: 'en',
      }
    )

    expect(result).toBe('John_Q_Doe_Backend_Acme_2024-01-01_job123_v1_en')
  })

  it('trims whitespace', () => {
    const result = renderFilename('  CV_{FirstName}  ', {
      FirstName: 'John',
      Date: '2024-01-01',
    })

    expect(result).toBe('CV_John')
  })
})
