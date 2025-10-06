import { describe, it, expect } from 'vitest'
import { extractEntities } from '@/services/jobs/parsing/entities'

describe('entities', () => {
  it('should extract title from explicit pattern', () => {
    const result = extractEntities('Title: Senior Engineer', {}, 'en')

    expect(result.title?.value).toBe('Senior Engineer')
    expect(result.title?.confidence).toBe(0.8)
  })

  it('should extract title from first line', () => {
    const result = extractEntities('Software Engineer\n\nWe are hiring', {}, 'en')

    expect(result.title?.value).toContain('Software Engineer')
    expect(result.title?.confidence).toBeGreaterThan(0)
  })

  it('should extract company', () => {
    const result = extractEntities('Company: TechCorp Inc', {}, 'en')

    expect(result.company?.value).toBe('TechCorp Inc')
    expect(result.company?.confidence).toBe(0.8)
  })

  it('should extract location', () => {
    const result = extractEntities('Location: San Francisco, CA', {}, 'en')

    expect(result.location?.value).toBe('San Francisco, CA')
    expect(result.location?.confidence).toBe(0.7)
  })

  it('should extract recruiter email', () => {
    const text = 'Contact: jane@techcorp.com'
    const result = extractEntities(text, {}, 'en')

    expect(result.recruiter?.value?.email).toBe('jane@techcorp.com')
    expect(result.recruiter?.confidence).toBe(0.8)
  })
})
