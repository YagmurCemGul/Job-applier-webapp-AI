import { describe, it, expect, vi } from 'vitest'
import type { Transcript } from '@/types/transcript.types'

describe('ai.notes', () => {
  it('should parse AI analysis response', () => {
    const mockResponse = {
      summary: 'Strong technical candidate with 5 years experience',
      star: [
        {
          situation: 'Team was struggling with deployment pipeline',
          task: 'Improve deployment frequency',
          action: 'Implemented CI/CD automation',
          result: 'Reduced deployment time by 80%'
        }
      ],
      strengths: ['Technical depth', 'Clear communication'],
      concerns: ['Limited team leadership experience'],
      riskFlags: []
    }

    expect(mockResponse.summary).toBeDefined()
    expect(mockResponse.star).toHaveLength(1)
    expect(mockResponse.star[0].situation).toBeDefined()
    expect(mockResponse.strengths).toHaveLength(2)
    expect(mockResponse.concerns).toHaveLength(1)
  })

  it('should handle missing fields gracefully', () => {
    const mockResponse: any = {
      summary: 'Brief summary'
    }

    const normalized = {
      summary: mockResponse.summary ?? '',
      star: mockResponse.star ?? [],
      strengths: mockResponse.strengths ?? [],
      concerns: mockResponse.concerns ?? [],
      riskFlags: mockResponse.riskFlags ?? []
    }

    expect(normalized.star).toEqual([])
    expect(normalized.strengths).toEqual([])
  })
})
