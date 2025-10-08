import { describe, it, expect } from 'vitest'
import { exportATSJson, exportKeywordsCsv } from '@/services/ats/export.service'
import type { ATSAnalysisResult, ATSKeywordMeta } from '@/types/ats.types'

describe('export.service', () => {
  const mockResult: ATSAnalysisResult = {
    id: 'test-123',
    jobHash: 'hash-456',
    score: 75,
    suggestions: [],
    matchedKeywords: ['React', 'TypeScript'],
    missingKeywords: ['Node.js'],
    createdAt: new Date('2025-01-01'),
    keywordMeta: [
      {
        term: 'React',
        importance: 0.85,
        inTitle: true,
        inReq: true,
        inQual: false,
        inResp: true,
      },
      {
        term: 'TypeScript',
        importance: 0.65,
        inTitle: false,
        inReq: true,
        inQual: true,
        inResp: false,
      },
      {
        term: 'Node.js',
        importance: 0.45,
        inTitle: false,
        inReq: true,
        inQual: false,
        inResp: false,
      },
    ],
  }

  describe('exportATSJson', () => {
    it('should create a JSON blob', () => {
      const blob = exportATSJson(mockResult)
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/json')
    })

    it('should contain valid JSON', async () => {
      const blob = exportATSJson(mockResult)
      const text = await blob.text()
      const parsed = JSON.parse(text)
      
      expect(parsed.id).toBe(mockResult.id)
      expect(parsed.score).toBe(mockResult.score)
      expect(parsed.matchedKeywords).toEqual(mockResult.matchedKeywords)
    })

    it('should format JSON with indentation', async () => {
      const blob = exportATSJson(mockResult)
      const text = await blob.text()
      
      expect(text).toContain('\n')
      expect(text).toContain('  ')
    })
  })

  describe('exportKeywordsCsv', () => {
    it('should create a CSV blob', () => {
      const blob = exportKeywordsCsv(
        mockResult.keywordMeta!,
        mockResult.matchedKeywords,
        mockResult.missingKeywords
      )
      
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('text/csv;charset=utf-8;')
    })

    it('should include CSV headers', async () => {
      const blob = exportKeywordsCsv(
        mockResult.keywordMeta!,
        mockResult.matchedKeywords,
        mockResult.missingKeywords
      )
      const text = await blob.text()
      const lines = text.split('\n')
      
      expect(lines[0]).toBe('term,importance,status,inTitle,inReq,inQual,inResp')
    })

    it('should include correct row count', async () => {
      const blob = exportKeywordsCsv(
        mockResult.keywordMeta!,
        mockResult.matchedKeywords,
        mockResult.missingKeywords
      )
      const text = await blob.text()
      const lines = text.split('\n').filter(Boolean)
      
      // 1 header + 3 keywords
      expect(lines).toHaveLength(4)
    })

    it('should mark keywords as matched or missing', async () => {
      const blob = exportKeywordsCsv(
        mockResult.keywordMeta!,
        mockResult.matchedKeywords,
        mockResult.missingKeywords
      )
      const text = await blob.text()
      
      expect(text).toContain('React,0.85,matched')
      expect(text).toContain('TypeScript,0.65,matched')
      expect(text).toContain('Node.js,0.45,missing')
    })

    it('should format boolean fields as yes/no', async () => {
      const blob = exportKeywordsCsv(
        mockResult.keywordMeta!,
        mockResult.matchedKeywords,
        mockResult.missingKeywords
      )
      const text = await blob.text()
      
      const reactLine = text.split('\n').find(l => l.startsWith('React'))
      expect(reactLine).toContain('yes,yes,no,yes')
    })

    it('should escape CSV values with commas', async () => {
      const metaWithComma: ATSKeywordMeta[] = [
        {
          term: 'React, Vue',
          importance: 0.5,
          inTitle: false,
          inReq: false,
          inQual: false,
          inResp: false,
        },
      ]
      
      const blob = exportKeywordsCsv(metaWithComma, [], ['React, Vue'])
      const text = await blob.text()
      
      expect(text).toContain('"React, Vue"')
    })

    it('should handle empty metadata', async () => {
      const blob = exportKeywordsCsv([], [], [])
      const text = await blob.text()
      const lines = text.split('\n').filter(Boolean)
      
      // Just the header
      expect(lines).toHaveLength(1)
    })
  })
})
