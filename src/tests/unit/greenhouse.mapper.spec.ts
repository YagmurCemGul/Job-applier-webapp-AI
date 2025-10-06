import { describe, it, expect } from 'vitest'
import { mapGreenhouse } from '@/services/apply/forms/greenhouse.mapper'

describe('greenhouse.mapper', () => {
  it('should map CV file to payload', () => {
    const result = mapGreenhouse({
      jobUrl: 'https://greenhouse.com/jobs/123',
      cvFile: 'cv.pdf',
    })

    expect(result.platform).toBe('greenhouse')
    expect(result.jobUrl).toBe('https://greenhouse.com/jobs/123')
    expect(result.files).toHaveLength(1)
    expect(result.files[0].type).toBe('cv')
  })

  it('should include cover letter when provided', () => {
    const result = mapGreenhouse({
      jobUrl: 'https://greenhouse.com/jobs/123',
      cvFile: 'cv.pdf',
      clFile: 'cl.pdf',
    })

    expect(result.files).toHaveLength(2)
    expect(result.files[1].type).toBe('coverLetter')
  })

  it('should include answers when provided', () => {
    const result = mapGreenhouse({
      jobUrl: 'https://greenhouse.com/jobs/123',
      cvFile: 'cv.pdf',
      answers: { question1: 'answer1', question2: 'answer2' },
    })

    expect(result.answers).toEqual({
      question1: 'answer1',
      question2: 'answer2',
    })
  })
})
