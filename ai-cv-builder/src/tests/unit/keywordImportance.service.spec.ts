import { describe, it, expect } from 'vitest'
import { buildKeywordMeta } from '@/services/ats/keywordImportance.service'
import type { ParsedJob } from '@/types/ats.types'

describe('keywordImportance.service', () => {
  const mockJob: ParsedJob = {
    title: 'Senior React Developer',
    company: 'Tech Corp',
    sections: {
      raw: 'Senior React Developer position. Must have React, TypeScript, and Node.js experience. React skills are essential.',
      requirements: ['React', 'TypeScript', 'Node.js'],
      qualifications: ['5+ years experience', 'React expertise'],
      responsibilities: ['Build React applications', 'Lead development'],
    },
    keywords: ['React', 'TypeScript', 'Node.js', 'JavaScript'],
    lang: 'en',
  }

  describe('buildKeywordMeta', () => {
    it('should build metadata for matched and missing keywords', () => {
      const matched = ['React', 'TypeScript']
      const missing = ['Node.js', 'JavaScript']

      const meta = buildKeywordMeta(mockJob, matched, missing)

      expect(meta).toHaveLength(4)
      expect(meta.map(m => m.term)).toContain('React')
      expect(meta.map(m => m.term)).toContain('TypeScript')
      expect(meta.map(m => m.term)).toContain('Node.js')
      expect(meta.map(m => m.term)).toContain('JavaScript')
    })

    it('should calculate importance based on frequency', () => {
      const matched = ['React']
      const missing: string[] = []

      const meta = buildKeywordMeta(mockJob, matched, missing)
      const reactMeta = meta.find(m => m.term === 'React')

      expect(reactMeta).toBeDefined()
      // React appears 4 times in raw text (title + 3 in content)
      // Base from frequency: min(0.5, 4 * 0.1) = 0.4
      expect(reactMeta!.importance).toBeGreaterThan(0)
    })

    it('should boost importance for title presence', () => {
      const matched = ['React', 'TypeScript']
      const missing: string[] = []

      const meta = buildKeywordMeta(mockJob, matched, missing)
      const reactMeta = meta.find(m => m.term === 'React')
      const tsMeta = meta.find(m => m.term === 'TypeScript')

      expect(reactMeta!.inTitle).toBe(true)
      expect(tsMeta!.inTitle).toBe(false)
      expect(reactMeta!.importance).toBeGreaterThan(tsMeta!.importance)
    })

    it('should boost importance for requirements presence', () => {
      const matched = ['React', 'TypeScript', 'Node.js']
      const missing: string[] = []

      const meta = buildKeywordMeta(mockJob, matched, missing)
      
      meta.forEach(m => {
        if (['React', 'TypeScript', 'Node.js'].includes(m.term)) {
          expect(m.inReq).toBe(true)
        }
      })
    })

    it('should cap importance at 1.0', () => {
      const matched = ['React']
      const missing: string[] = []

      const meta = buildKeywordMeta(mockJob, matched, missing)
      
      meta.forEach(m => {
        expect(m.importance).toBeLessThanOrEqual(1.0)
        expect(m.importance).toBeGreaterThanOrEqual(0)
      })
    })

    it('should round importance to 2 decimals', () => {
      const matched = ['React', 'TypeScript']
      const missing: string[] = []

      const meta = buildKeywordMeta(mockJob, matched, missing)
      
      meta.forEach(m => {
        const decimal = m.importance.toString().split('.')[1]
        if (decimal) {
          expect(decimal.length).toBeLessThanOrEqual(2)
        }
      })
    })

    it('should set section flags correctly', () => {
      const matched = ['React', 'TypeScript']
      const missing: string[] = []

      const meta = buildKeywordMeta(mockJob, matched, missing)
      const reactMeta = meta.find(m => m.term === 'React')

      expect(reactMeta!.inTitle).toBe(true)
      expect(reactMeta!.inReq).toBe(true)
      expect(reactMeta!.inQual).toBe(true)
      expect(reactMeta!.inResp).toBe(true)
    })
  })
})
