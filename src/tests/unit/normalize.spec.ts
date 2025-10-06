import { describe, it, expect } from 'vitest'
import { normalizeText, detectLang, finalizeParsedJob } from '@/services/jobs/parsing/normalize'
import type { ParsedJob } from '@/types/ats.types'

describe('normalize', () => {
  describe('normalizeText', () => {
    it('should remove diacritics', () => {
      expect(normalizeText('Café')).toBe('cafe')
      expect(normalizeText('Müh endis')).toBe('muh endis')
    })

    it('should normalize whitespace', () => {
      expect(normalizeText('hello    world')).toBe('hello world')
      expect(normalizeText('  trim  me  ')).toBe('trim me')
    })
  })

  describe('detectLang', () => {
    it('should detect English', () => {
      expect(detectLang('Software Engineer position')).toBe('en')
    })

    it('should detect Turkish', () => {
      expect(detectLang('Yazılım Mühendisi')).toBe('tr')
      expect(detectLang('Şirket bilgileri')).toBe('tr')
    })

    it('should return unknown for ambiguous text', () => {
      expect(detectLang('123 456')).toBe('unknown')
    })
  })

  describe('finalizeParsedJob', () => {
    it('should compute overall confidence', () => {
      const pj: ParsedJob = {
        title: 'Engineer',
        company: 'Corp',
        sections: { raw: 'test' },
        keywords: [],
        lang: 'en',
        _conf: {
          title: { value: 'Engineer', confidence: 0.8 },
          company: { value: 'Corp', confidence: 0.9 },
          location: { value: 'SF', confidence: 0.6 },
          overall: 0,
        },
      }

      const result = finalizeParsedJob(pj)

      expect(result._conf?.overall).toBeGreaterThan(0)
      expect(result._conf?.overall).toBeLessThanOrEqual(1)
      // (0.8 + 0.9 + 0.6) / 3 = 0.766...
      expect(result._conf?.overall).toBeCloseTo(0.77, 1)
    })

    it('should handle missing confidences', () => {
      const pj: ParsedJob = {
        sections: { raw: 'test' },
        keywords: [],
        lang: 'unknown',
      }

      const result = finalizeParsedJob(pj)

      expect(result._conf?.overall).toBe(0.4) // Fallback
    })
  })
})
