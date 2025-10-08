/**
 * Step 27: Unit tests for normalization utilities
 */

import { describe, it, expect } from 'vitest'
import { normalizeText, detectLang, finalizeParsedJob } from '@/services/jobs/parsing/normalize'
import type { ParsedJob } from '@/types/ats.types'

describe('normalizeText', () => {
  it('should remove diacritics', () => {
    const text = 'café résumé naïve'
    const result = normalizeText(text)
    expect(result).toBe('cafe resume naive')
  })

  it('should collapse multiple spaces', () => {
    const text = 'Hello    world   test'
    const result = normalizeText(text)
    expect(result).toBe('Hello world test')
  })

  it('should trim leading/trailing whitespace', () => {
    const text = '   test   '
    const result = normalizeText(text)
    expect(result).toBe('test')
  })
})

describe('detectLang', () => {
  it('should detect English', () => {
    const text = 'We are looking for a software engineer'
    expect(detectLang(text)).toBe('en')
  })

  it('should detect Turkish', () => {
    const text = 'Yazılım mühendisi arıyoruz. İstanbul.'
    expect(detectLang(text)).toBe('tr')
  })

  it('should return unknown for non-text', () => {
    const text = '12345 @#$%'
    expect(detectLang(text)).toBe('unknown')
  })
})

describe('finalizeParsedJob', () => {
  it('should compute overall confidence from field confidences', () => {
    const pj: ParsedJob = {
      title: 'Test',
      sections: { raw: '' },
      keywords: [],
      lang: 'en',
      _conf: {
        title: { value: 'Test', confidence: 0.8 },
        company: { value: 'Corp', confidence: 0.9 },
        location: { value: 'NYC', confidence: 0.7 },
        overall: 0,
      },
    }

    const result = finalizeParsedJob(pj)
    expect(result._conf?.overall).toBeCloseTo(0.8, 1)
  })

  it('should clamp overall confidence to [0, 1]', () => {
    const pj: ParsedJob = {
      sections: { raw: '' },
      keywords: [],
      lang: 'en',
      _conf: {
        title: { value: '', confidence: 2.0 }, // Invalid high value
        overall: 0,
      },
    }

    const result = finalizeParsedJob(pj)
    expect(result._conf?.overall).toBeLessThanOrEqual(1)
    expect(result._conf?.overall).toBeGreaterThanOrEqual(0)
  })
})
