import { describe, it, expect } from 'vitest'
import { highlightText, escapeRegex, splitAndHighlightJob } from '@/services/ats/highlights.service'

describe('highlights.service', () => {
  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      expect(escapeRegex('c++')).toBe('c\\+\\+')
      expect(escapeRegex('.net')).toBe('\\.net')
      expect(escapeRegex('$100')).toBe('\\$100')
    })
  })

  describe('highlightText', () => {
    it('should highlight terms with mark tags', () => {
      const result = highlightText('I love TypeScript and React', ['typescript', 'react'])

      expect(result).toContain('<mark')
      expect(result).toContain('TypeScript')
      expect(result).toContain('React')
    })

    it('should be case-insensitive', () => {
      const result = highlightText('I love typescript', ['TypeScript'])

      expect(result).toContain('<mark')
      expect(result).toContain('typescript')
    })

    it('should respect word boundaries', () => {
      const result = highlightText('reaction and react', ['react'])

      expect(result).toContain('<mark')
      // Should only match 'react', not 'reaction'
      const matches = result.match(/<mark/g)
      expect(matches?.length).toBe(1)
    })

    it('should avoid nested marks', () => {
      const result = highlightText('TypeScript TypeScript', ['typescript'])

      const matches = result.match(/<mark/g)
      const closingMatches = result.match(/<\/mark>/g)

      expect(matches?.length).toBe(closingMatches?.length)
      expect(result).not.toContain('<mark><mark')
    })

    it('should escape HTML in input', () => {
      const result = highlightText('<script>alert("xss")</script> react', ['react'])

      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;script&gt;')
      expect(result).toContain('<mark')
    })

    it('should handle empty terms array', () => {
      const input = 'Hello world'
      const result = highlightText(input, [])

      expect(result).not.toContain('<mark')
      expect(result).toContain('Hello world')
    })

    it('should add aria-label to marks', () => {
      const result = highlightText('I love TypeScript', ['typescript'])

      expect(result).toContain('aria-label="keyword:')
    })
  })

  describe('splitAndHighlightJob', () => {
    it('should return highlighted HTML', () => {
      const result = splitAndHighlightJob('TypeScript and React developer', ['typescript', 'react'])

      expect(result.html).toContain('<mark')
      expect(result.html).toContain('class="bg-blue-100')
    })
  })
})
