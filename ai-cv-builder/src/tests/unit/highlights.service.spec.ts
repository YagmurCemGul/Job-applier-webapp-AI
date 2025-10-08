import { describe, it, expect } from 'vitest'
import { escapeRegex, highlightText, splitAndHighlightJob } from '@/services/ats/highlights.service'

describe('highlights.service', () => {
  describe('escapeRegex', () => {
    it('should escape special regex characters', () => {
      expect(escapeRegex('a.b')).toBe('a\\.b')
      expect(escapeRegex('a*b')).toBe('a\\*b')
      expect(escapeRegex('a+b')).toBe('a\\+b')
      expect(escapeRegex('a?b')).toBe('a\\?b')
      expect(escapeRegex('a^b')).toBe('a\\^b')
      expect(escapeRegex('a$b')).toBe('a\\$b')
      expect(escapeRegex('a{b')).toBe('a\\{b')
      expect(escapeRegex('a}b')).toBe('a\\}b')
      expect(escapeRegex('a(b')).toBe('a\\(b')
      expect(escapeRegex('a)b')).toBe('a\\)b')
      expect(escapeRegex('a|b')).toBe('a\\|b')
      expect(escapeRegex('a[b')).toBe('a\\[b')
      expect(escapeRegex('a]b')).toBe('a\\]b')
      expect(escapeRegex('a\\b')).toBe('a\\\\b')
    })
  })

  describe('highlightText', () => {
    it('should highlight single term', () => {
      const result = highlightText('Hello React world', ['React'])
      expect(result).toContain('<mark')
      expect(result).toContain('React')
      expect(result).toContain('</mark>')
    })

    it('should be case-insensitive', () => {
      const result = highlightText('Hello REACT world', ['react'])
      expect(result).toContain('<mark')
      expect(result).toContain('REACT')
    })

    it('should respect word boundaries', () => {
      const result = highlightText('React and reactive', ['React'])
      expect(result.match(/<mark/g)?.length).toBe(1)
      expect(result).toContain('>React<')
      expect(result).not.toContain('>reactive<')
    })

    it('should highlight multiple terms', () => {
      const result = highlightText('React and TypeScript', ['React', 'TypeScript'])
      expect(result.match(/<mark/g)?.length).toBe(2)
    })

    it('should not create nested marks', () => {
      const result = highlightText('React developer', ['React', 'React developer'])
      expect(result).not.toMatch(/<mark[^>]*>.*<mark/)
    })

    it('should escape HTML to prevent XSS', () => {
      const result = highlightText('<script>alert("xss")</script>', ['script'])
      expect(result).not.toContain('<script>')
      expect(result).toContain('&lt;script&gt;')
    })

    it('should handle empty input', () => {
      const result = highlightText('', ['React'])
      expect(result).toBe('')
    })

    it('should handle no terms', () => {
      const result = highlightText('Hello world', [])
      expect(result).toBe('Hello world')
    })

    it('should include aria-label for accessibility', () => {
      const result = highlightText('Hello React', ['React'])
      expect(result).toContain('aria-label="keyword:')
    })

    it('should handle unicode word boundaries', () => {
      const result = highlightText('TypeScript ve React', ['React'])
      expect(result).toContain('<mark')
    })

    it('should apply custom attributes', () => {
      const result = highlightText('Hello React', ['React'], (term) => ({
        class: 'custom-class',
      }))
      expect(result).toContain('class="custom-class"')
    })
  })

  describe('splitAndHighlightJob', () => {
    it('should highlight job text with default styles', () => {
      const result = splitAndHighlightJob('React developer position', ['React'])
      expect(result.html).toContain('<mark')
      expect(result.html).toContain('React')
      expect(result.html).toContain('bg-blue-100')
    })

    it('should handle empty text', () => {
      const result = splitAndHighlightJob('', ['React'])
      expect(result.html).toBe('')
    })
  })
})
