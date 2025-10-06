import { describe, it, expect } from 'vitest'
import { mapLever } from '@/services/apply/forms/lever.mapper'

describe('lever.mapper', () => {
  it('should map to Lever platform', () => {
    const result = mapLever({
      jobUrl: 'https://jobs.lever.co/company/job-id',
      cvFile: 'resume.pdf'
    })

    expect(result.platform).toBe('lever')
    expect(result.jobUrl).toBe('https://jobs.lever.co/company/job-id')
    expect(result.files).toHaveLength(1)
  })

  it('should include both CV and cover letter', () => {
    const result = mapLever({
      jobUrl: 'https://jobs.lever.co/company/job-id',
      cvFile: 'resume.pdf',
      clFile: 'cover.pdf'
    })

    expect(result.files).toHaveLength(2)
    expect(result.files[0].name).toBe('resume.pdf')
    expect(result.files[1].name).toBe('cover_letter.pdf')
  })
})
