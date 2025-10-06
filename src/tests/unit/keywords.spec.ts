import { describe, it, expect } from 'vitest'
import { extractKeywords } from '@/services/jobs/parsing/keywords'

describe('keywords', () => {
  it('should extract keywords from sections', () => {
    const sections = {
      requirements: ['TypeScript experience', 'React knowledge'],
      qualifications: ['Node.js skills'],
      responsibilities: [],
    }

    const result = extractKeywords('', sections, 'en')

    expect(result).toContain('typescript')
    expect(result).toContain('react')
    expect(result).toContain('node')
  })

  it('should filter stopwords', () => {
    const sections = {
      requirements: ['and or the a an to'],
    }

    const result = extractKeywords('', sections, 'en')

    expect(result).not.toContain('and')
    expect(result).not.toContain('or')
    expect(result).not.toContain('the')
  })

  it('should expand skill aliases', () => {
    const sections = {
      requirements: ['ReactJS experience', 'NodeJS skills'],
    }

    const result = extractKeywords('', sections, 'en')

    expect(result).toContain('react')
    expect(result).toContain('node')
  })

  it('should extract role keywords', () => {
    const sections = {
      summary: 'We are looking for a Product Manager',
    }

    const result = extractKeywords('Product Manager needed', sections, 'en')

    expect(result).toContain('product manager')
  })

  it('should limit to 150 keywords', () => {
    const longText = Array.from({ length: 200 }, (_, i) => `keyword${i}`).join(' ')
    const sections = { requirements: [longText] }

    const result = extractKeywords('', sections, 'en')

    expect(result.length).toBeLessThanOrEqual(150)
  })
})
