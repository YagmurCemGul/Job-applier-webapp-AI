import { describe, it, expect, beforeEach } from 'vitest'
import { rebuildIndex, search, addToIndex } from '@/services/jobs/searchIndex.service'
import type { JobNormalized } from '@/types/jobs.types'

describe('searchIndex.service', () => {
  const mockJobs: JobNormalized[] = [
    {
      id: 'job_1',
      sourceId: 'src-1',
      title: 'JavaScript Developer',
      company: 'Acme Inc',
      location: 'San Francisco',
      fingerprint: 'fp1',
      descriptionText: 'Looking for a JavaScript developer with React experience',
      url: 'https://example.com/1',
      source: { name: 'test', kind: 'api', domain: 'test.com' },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: 'job_2',
      sourceId: 'src-2',
      title: 'Python Engineer',
      company: 'Tech Corp',
      location: 'New York',
      fingerprint: 'fp2',
      descriptionText: 'Python developer needed for backend work with Django',
      url: 'https://example.com/2',
      source: { name: 'test', kind: 'api', domain: 'test.com' },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }
  ]

  beforeEach(async () => {
    await rebuildIndex(mockJobs)
  })

  it('should find jobs by keyword', () => {
    const results = search('JavaScript')
    expect(results).toContain('job_1')
    expect(results).not.toContain('job_2')
  })

  it('should find jobs by company', () => {
    const results = search('Acme')
    expect(results).toContain('job_1')
  })

  it('should find jobs by location', () => {
    const results = search('York')
    expect(results).toContain('job_2')
  })

  it('should return empty for no matches', () => {
    const results = search('Nonexistent')
    expect(results).toHaveLength(0)
  })

  it('should support multi-word search', () => {
    const results = search('Python Django')
    expect(results).toContain('job_2')
  })

  it('should add new job to index', () => {
    const newJob: JobNormalized = {
      id: 'job_3',
      sourceId: 'src-3',
      title: 'TypeScript Developer',
      company: 'StartUp',
      location: 'Remote',
      fingerprint: 'fp3',
      descriptionText: 'TypeScript expert needed',
      url: 'https://example.com/3',
      source: { name: 'test', kind: 'api', domain: 'test.com' },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }

    addToIndex(newJob)
    const results = search('TypeScript')
    expect(results).toContain('job_3')
  })
})
