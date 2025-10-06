import { describe, it, expect } from 'vitest'
import { exportATSJson, exportKeywordsCsv } from '@/services/ats/export.service'
import type { ATSAnalysisResult, ATSKeywordMeta } from '@/types/ats.types'

describe('export.service', () => {
  describe('exportATSJson', () => {
    it('should export analysis result as JSON blob', () => {
      const result: ATSAnalysisResult = {
        id: 'test-123',
        jobHash: 'hash-456',
        score: 85,
        suggestions: [],
        matchedKeywords: ['typescript', 'react'],
        missingKeywords: ['vue'],
        createdAt: new Date('2025-01-01'),
      }

      const blob = exportATSJson(result)

      expect(blob.type).toBe('application/json')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should produce valid JSON', async () => {
      const result: ATSAnalysisResult = {
        id: 'test',
        jobHash: 'hash',
        score: 90,
        suggestions: [],
        matchedKeywords: [],
        missingKeywords: [],
        createdAt: new Date(),
      }

      const blob = exportATSJson(result)
      const text = await blob.text()
      const parsed = JSON.parse(text)

      expect(parsed.id).toBe('test')
      expect(parsed.score).toBe(90)
    })
  })

  describe('exportKeywordsCsv', () => {
    it('should export keywords as CSV blob', () => {
      const meta: ATSKeywordMeta[] = [
        { term: 'typescript', importance: 0.9, inTitle: true, inReq: true },
        { term: 'react', importance: 0.7, inReq: true },
      ]

      const blob = exportKeywordsCsv(meta, ['typescript'], ['react'])

      expect(blob.type).toContain('csv')
      expect(blob.size).toBeGreaterThan(0)
    })

    it('should include CSV header', async () => {
      const meta: ATSKeywordMeta[] = [
        { term: 'test', importance: 0.5 },
      ]

      const blob = exportKeywordsCsv(meta, [], ['test'])
      const text = await blob.text()

      expect(text).toContain('term,importance,status,inTitle,inReq,inQual,inResp')
    })

    it('should include keyword rows', async () => {
      const meta: ATSKeywordMeta[] = [
        { term: 'typescript', importance: 0.9, inTitle: true, inReq: true },
      ]

      const blob = exportKeywordsCsv(meta, ['typescript'], [])
      const text = await blob.text()

      expect(text).toContain('typescript')
      expect(text).toContain('0.90')
      expect(text).toContain('matched')
      expect(text).toContain('yes')
    })

    it('should handle missing status', async () => {
      const meta: ATSKeywordMeta[] = [
        { term: 'react', importance: 0.7 },
      ]

      const blob = exportKeywordsCsv(meta, [], ['react'])
      const text = await blob.text()

      expect(text).toContain('react')
      expect(text).toContain('missing')
    })

    it('should escape CSV special characters', async () => {
      const meta: ATSKeywordMeta[] = [
        { term: 'comma,test', importance: 0.5 },
      ]

      const blob = exportKeywordsCsv(meta, [], [])
      const text = await blob.text()

      expect(text).toContain('"comma,test"')
    })
  })
})
