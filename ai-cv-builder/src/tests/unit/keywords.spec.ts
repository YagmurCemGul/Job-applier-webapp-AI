/**
 * Step 27: Unit tests for keyword extraction
 */

import { describe, it, expect } from 'vitest'
import { extractKeywords } from '@/services/jobs/parsing/keywords'

describe('extractKeywords', () => {
  it('should extract keywords from requirements', () => {
    const sections = {
      requirements: ['React experience', 'TypeScript knowledge', 'Node.js skills'],
      raw: '',
    }
    const result = extractKeywords('', sections, 'en')
    expect(result).toContain('react')
    expect(result).toContain('typescript')
    expect(result).toContain('node')
  })

  it('should filter stopwords', () => {
    const sections = {
      requirements: ['and', 'the', 'React', 'is', 'great'],
      raw: '',
    }
    const result = extractKeywords('', sections, 'en')
    expect(result).toContain('react')
    expect(result).toContain('great')
    expect(result).not.toContain('and')
    expect(result).not.toContain('the')
    expect(result).not.toContain('is')
  })

  it('should expand skill aliases', () => {
    const sections = {
      requirements: ['ReactJS experience', 'Node.js backend'],
      raw: '',
    }
    const result = extractKeywords('', sections, 'en')
    expect(result).toContain('react') // Canonical form
  })

  it('should include role keywords', () => {
    const raw = 'We are looking for a Product Manager with frontend experience'
    const sections = { raw }
    const result = extractKeywords(raw, sections, 'en')
    expect(result).toContain('product manager')
    expect(result).toContain('frontend')
  })

  it('should handle Turkish stopwords', () => {
    const sections = {
      requirements: ['ve', 'React', 'ile', 'çalışma', 'için'],
      raw: '',
    }
    const result = extractKeywords('', sections, 'tr')
    expect(result).toContain('react')
    expect(result).toContain('çalışma')
    expect(result).not.toContain('ve')
    expect(result).not.toContain('ile')
  })

  it('should cap keywords at 150', () => {
    const largeText = Array(200)
      .fill('keyword')
      .map((k, i) => `${k}${i}`)
      .join(' ')
    const sections = { requirements: [largeText], raw: '' }
    const result = extractKeywords('', sections, 'en')
    expect(result.length).toBeLessThanOrEqual(150)
  })

  it('should deduplicate keywords', () => {
    const sections = {
      requirements: ['React', 'react', 'REACT'],
      raw: '',
    }
    const result = extractKeywords('', sections, 'en')
    const reactCount = result.filter((k) => k.toLowerCase() === 'react').length
    expect(reactCount).toBe(1)
  })
})
