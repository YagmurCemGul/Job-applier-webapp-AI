import { describe, it, expect } from 'vitest'
import { makeTranscript } from '@/services/interview/transcription.service'

describe('transcript.chunk', () => {
  it('should create transcript with segments', () => {
    const segments = [
      {
        id: '1',
        atMs: 0,
        durMs: 2000,
        speaker: 'Interviewer' as const,
        text: 'Tell me about yourself',
      },
      {
        id: '2',
        atMs: 2000,
        durMs: 5000,
        speaker: 'Candidate' as const,
        text: "I'm a software engineer with 5 years of experience",
      },
    ]

    const transcript = makeTranscript('int1', 'en', segments)

    expect(transcript.interviewId).toBe('int1')
    expect(transcript.language).toBe('en')
    expect(transcript.segments).toHaveLength(2)
    expect(transcript.segments[0].speaker).toBe('Interviewer')
    expect(transcript.segments[1].speaker).toBe('Candidate')
  })

  it('should support Turkish language', () => {
    const segments = [
      {
        id: '1',
        atMs: 0,
        durMs: 2000,
        speaker: 'Interviewer' as const,
        text: 'Kendinizden bahsedin',
      },
    ]

    const transcript = makeTranscript('int1', 'tr', segments)

    expect(transcript.language).toBe('tr')
  })

  it('should generate unique IDs', () => {
    const transcript1 = makeTranscript('int1', 'en', [])
    const transcript2 = makeTranscript('int1', 'en', [])

    expect(transcript1.id).not.toBe(transcript2.id)
  })
})
