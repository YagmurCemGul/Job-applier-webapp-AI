import { describe, it, expect } from 'vitest'
import { dedupe } from '@/services/jobs/dedupe.service'
import type { JobNormalized } from '@/types/jobs.types'

describe('dedupe.service', () => {
  it('should remove duplicates with same fingerprint', () => {
    const jobs: JobNormalized[] = [
      {
        id: 'job_1',
        sourceId: 'src-1',
        title: 'Engineer',
        company: 'Acme',
        location: 'SF',
        fingerprint: 'fp1',
        descriptionText: 'Short',
        url: 'https://example.com/1',
        source: { name: 'test', kind: 'api', domain: 'test.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: 'job_2',
        sourceId: 'src-2',
        title: 'Engineer',
        company: 'Acme',
        location: 'SF',
        fingerprint: 'fp1',
        descriptionText: 'Much longer and more detailed description',
        salary: { min: 100000, max: 150000, period: 'year', currency: 'USD' },
        url: 'https://example.com/2',
        source: { name: 'test', kind: 'api', domain: 'test.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ]

    const result = dedupe(jobs)
    expect(result).toHaveLength(1)
    // Should keep the richer one (job_2 with salary and longer description)
    expect(result[0].sourceId).toBe('src-2')
  })

  it('should keep all jobs with different fingerprints', () => {
    const jobs: JobNormalized[] = [
      {
        id: 'job_1',
        sourceId: 'src-1',
        title: 'Engineer',
        company: 'Acme',
        location: 'SF',
        fingerprint: 'fp1',
        descriptionText: 'Job 1',
        url: 'https://example.com/1',
        source: { name: 'test', kind: 'api', domain: 'test.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: 'job_2',
        sourceId: 'src-2',
        title: 'Designer',
        company: 'Acme',
        location: 'SF',
        fingerprint: 'fp2',
        descriptionText: 'Job 2',
        url: 'https://example.com/2',
        source: { name: 'test', kind: 'api', domain: 'test.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ]

    const result = dedupe(jobs)
    expect(result).toHaveLength(2)
  })

  it('should prefer job with salary', () => {
    const jobs: JobNormalized[] = [
      {
        id: 'job_1',
        sourceId: 'src-1',
        title: 'Engineer',
        company: 'Acme',
        location: 'SF',
        fingerprint: 'fp1',
        descriptionText: 'Job',
        url: 'https://example.com/1',
        source: { name: 'test', kind: 'api', domain: 'test.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
      {
        id: 'job_2',
        sourceId: 'src-2',
        title: 'Engineer',
        company: 'Acme',
        location: 'SF',
        fingerprint: 'fp1',
        descriptionText: 'Job',
        salary: { min: 100000, max: 150000, period: 'year' },
        url: 'https://example.com/2',
        source: { name: 'test', kind: 'api', domain: 'test.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ]

    const result = dedupe(jobs)
    expect(result).toHaveLength(1)
    expect(result[0].salary).toBeDefined()
  })
})
