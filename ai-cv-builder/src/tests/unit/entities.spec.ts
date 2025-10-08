/**
 * Step 27: Unit tests for entity extraction
 */

import { describe, it, expect } from 'vitest'
import { extractEntities } from '@/services/jobs/parsing/entities'

describe('extractEntities', () => {
  it('should extract title from labeled field', () => {
    const text = 'Title: Senior Software Engineer\n\nDescription...'
    const result = extractEntities(text, {}, 'en')
    expect(result.title?.value).toBe('Senior Software Engineer')
    expect(result.title?.confidence).toBeGreaterThan(0.5)
  })

  it('should extract company name', () => {
    const text = 'Company: TechCorp Inc.\n\nWe are looking...'
    const result = extractEntities(text, {}, 'en')
    expect(result.company?.value).toBe('TechCorp Inc.')
  })

  it('should extract location', () => {
    const text = 'Location: San Francisco, CA\n\nRemote available'
    const result = extractEntities(text, {}, 'en')
    expect(result.location?.value).toBe('San Francisco, CA')
  })

  it('should extract email', () => {
    const text = 'Contact us at careers@techcorp.com for more info'
    const result = extractEntities(text, {}, 'en')
    expect(result.recruiter?.value?.email).toBe('careers@techcorp.com')
  })

  it('should extract recruiter name', () => {
    const text = 'HR Contact: Jane Smith\nEmail: jane@company.com'
    const result = extractEntities(text, {}, 'en')
    expect(result.recruiter?.value?.name).toBe('Jane Smith')
  })

  it('should use first line heuristic for title if no label', () => {
    const text = 'Senior Frontend Developer\n\nWe are looking for...'
    const result = extractEntities(text, {}, 'en')
    expect(result.title?.value).toBe('Senior Frontend Developer')
    expect(result.title?.confidence).toBeGreaterThan(0)
  })

  it('should detect location from common city names', () => {
    const text = 'Work from Istanbul, hybrid model available'
    const result = extractEntities(text, {}, 'en')
    expect(result.location?.value).toMatch(/istanbul/i)
  })
})
