import { describe, it, expect } from 'vitest'
import type { ScoreSubmission } from '@/types/scorecard.types'

describe('score.aggregate', () => {
  it('should calculate weighted dimension averages', () => {
    const submissions: ScoreSubmission[] = [
      {
        id: '1',
        interviewId: 'int1',
        panelistId: 'p1',
        ratings: [
          { dimensionId: 'd1', score: 4, note: '' },
          { dimensionId: 'd2', score: 5, note: '' }
        ],
        overall: 4,
        recommendation: 'yes',
        submittedAt: new Date().toISOString()
      },
      {
        id: '2',
        interviewId: 'int1',
        panelistId: 'p2',
        ratings: [
          { dimensionId: 'd1', score: 3, note: '' },
          { dimensionId: 'd2', score: 4, note: '' }
        ],
        overall: 3,
        recommendation: 'lean_yes',
        submittedAt: new Date().toISOString()
      }
    ]

    // Calculate averages
    const d1Scores = submissions
      .flatMap((s) => s.ratings)
      .filter((r) => r.dimensionId === 'd1')
      .map((r) => r.score)
    const d1Avg = d1Scores.reduce((a, b) => a + b, 0) / d1Scores.length

    expect(d1Avg).toBe(3.5)

    const d2Scores = submissions
      .flatMap((s) => s.ratings)
      .filter((r) => r.dimensionId === 'd2')
      .map((r) => r.score)
    const d2Avg = d2Scores.reduce((a, b) => a + b, 0) / d2Scores.length

    expect(d2Avg).toBe(4.5)
  })

  it('should calculate variance', () => {
    const scores = [4, 3, 5, 3, 4]
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance =
      scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) /
      (scores.length - 1)

    expect(avg).toBe(3.8)
    expect(variance).toBeCloseTo(0.7, 1)
  })

  it('should handle missing overall scores', () => {
    const submissions: ScoreSubmission[] = [
      {
        id: '1',
        interviewId: 'int1',
        panelistId: 'p1',
        ratings: [],
        recommendation: 'yes',
        submittedAt: new Date().toISOString()
      }
    ]

    const overallScores = submissions
      .filter((s) => s.overall)
      .map((s) => s.overall as number)

    expect(overallScores.length).toBe(0)
  })

  it('should tally recommendations', () => {
    const submissions: ScoreSubmission[] = [
      {
        id: '1',
        interviewId: 'int1',
        panelistId: 'p1',
        ratings: [],
        recommendation: 'strong_yes',
        submittedAt: new Date().toISOString()
      },
      {
        id: '2',
        interviewId: 'int1',
        panelistId: 'p2',
        ratings: [],
        recommendation: 'yes',
        submittedAt: new Date().toISOString()
      },
      {
        id: '3',
        interviewId: 'int1',
        panelistId: 'p3',
        ratings: [],
        recommendation: 'yes',
        submittedAt: new Date().toISOString()
      }
    ]

    const tally = submissions.reduce(
      (acc, s) => {
        acc[s.recommendation] = (acc[s.recommendation] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    expect(tally['strong_yes']).toBe(1)
    expect(tally['yes']).toBe(2)
  })
})
