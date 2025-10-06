import { describe, it, expect } from 'vitest'
import { mapWorkday } from '@/services/apply/forms/workday.mapper'

describe('workday.mapper', () => {
  it('should map to Workday platform', () => {
    const result = mapWorkday({
      jobUrl: 'https://workday.com/careers/job',
      cvFile: 'cv.pdf'
    })

    expect(result.platform).toBe('workday')
    expect(result.files).toHaveLength(1)
  })

  it('should include workdayLocale in extra', () => {
    const result = mapWorkday({
      jobUrl: 'https://workday.com/careers/job',
      cvFile: 'cv.pdf'
    })

    expect(result.extra).toEqual({
      workdayLocale: 'en-US'
    })
  })

  it('should include answers', () => {
    const result = mapWorkday({
      jobUrl: 'https://workday.com/careers/job',
      cvFile: 'cv.pdf',
      answers: { eligibility: 'yes' }
    })

    expect(result.answers).toEqual({ eligibility: 'yes' })
  })
})
