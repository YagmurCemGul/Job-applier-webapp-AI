import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { JobPosting } from '@/types/jobPosting.types'
import type { ParsedJob } from '@/types/ats.types'
import { jobStableHash } from '@/services/jobs/jobHash'

// Mock the local storage implementation
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// @ts-ignore
global.localStorage = mockLocalStorage

// Import service after mocking localStorage
import {
  saveJobPostingLocal,
  getJobPostingLocal,
  listJobPostingsLocal,
  deleteJobPostingLocal,
} from '@/services/jobs/jobPostings.local'

describe('jobPostings.service', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  const createMockParsedJob = (): ParsedJob => ({
    title: 'Senior Developer',
    company: 'Test Corp',
    location: 'Remote',
    remoteType: 'remote',
    sections: {
      raw: 'Senior Developer at Test Corp. Remote position.',
      requirements: ['5+ years experience', 'React, TypeScript'],
    },
    keywords: ['react', 'typescript', 'senior'],
    lang: 'en',
  })

  const createMockJobPosting = (overrides?: Partial<JobPosting>): JobPosting => {
    const rawText = 'Senior Developer at Test Corp. Remote position with React and TypeScript.'
    const parsed = createMockParsedJob()
    const hash = jobStableHash(rawText)

    return {
      id: 'job-123',
      hash,
      title: 'Senior Developer',
      company: 'Test Corp',
      location: 'Remote',
      remoteType: 'remote',
      rawText,
      parsed,
      status: 'saved',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      ...overrides,
    }
  }

  describe('saveJobPostingLocal', () => {
    it('should save a job posting to localStorage', async () => {
      const job = createMockJobPosting()
      const result = await saveJobPostingLocal(job)

      expect(result.ok).toBe(true)
      expect(result.id).toBe(job.id)

      const saved = await getJobPostingLocal(job.id)
      expect(saved).toBeDefined()
      expect(saved?.title).toBe(job.title)
    })

    it('should update existing job posting', async () => {
      const job = createMockJobPosting()
      await saveJobPostingLocal(job)

      const updated = { ...job, title: 'Lead Developer', updatedAt: new Date('2025-01-02') }
      const result = await saveJobPostingLocal(updated)

      expect(result.ok).toBe(true)

      const saved = await getJobPostingLocal(job.id)
      expect(saved?.title).toBe('Lead Developer')
    })

    it('should preserve date objects after save/load cycle', async () => {
      const job = createMockJobPosting({
        createdAt: new Date('2025-01-01T10:00:00Z'),
        updatedAt: new Date('2025-01-02T15:30:00Z'),
      })

      await saveJobPostingLocal(job)
      const loaded = await getJobPostingLocal(job.id)

      expect(loaded?.createdAt).toBeInstanceOf(Date)
      expect(loaded?.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('listJobPostingsLocal', () => {
    it('should list all job postings ordered by updatedAt desc', async () => {
      const job1 = createMockJobPosting({
        id: 'job-1',
        title: 'Job 1',
        updatedAt: new Date('2025-01-01'),
      })
      const job2 = createMockJobPosting({
        id: 'job-2',
        title: 'Job 2',
        updatedAt: new Date('2025-01-03'),
      })
      const job3 = createMockJobPosting({
        id: 'job-3',
        title: 'Job 3',
        updatedAt: new Date('2025-01-02'),
      })

      await saveJobPostingLocal(job1)
      await saveJobPostingLocal(job2)
      await saveJobPostingLocal(job3)

      const result = await listJobPostingsLocal()

      expect(result.ok).toBe(true)
      expect(result.items).toHaveLength(3)
      expect(result.items![0].title).toBe('Job 2') // Most recent
      expect(result.items![1].title).toBe('Job 3')
      expect(result.items![2].title).toBe('Job 1')
    })

    it('should respect limit parameter', async () => {
      for (let i = 1; i <= 5; i++) {
        await saveJobPostingLocal(
          createMockJobPosting({
            id: `job-${i}`,
            title: `Job ${i}`,
          })
        )
      }

      const result = await listJobPostingsLocal(3)

      expect(result.ok).toBe(true)
      expect(result.items).toHaveLength(3)
    })

    it('should return empty array when no jobs exist', async () => {
      const result = await listJobPostingsLocal()

      expect(result.ok).toBe(true)
      expect(result.items).toHaveLength(0)
    })
  })

  describe('deleteJobPostingLocal', () => {
    it('should delete a job posting', async () => {
      const job = createMockJobPosting()
      await saveJobPostingLocal(job)

      const deleteResult = await deleteJobPostingLocal(job.id)
      expect(deleteResult.ok).toBe(true)

      const saved = await getJobPostingLocal(job.id)
      expect(saved).toBeUndefined()
    })

    it('should not fail when deleting non-existent job', async () => {
      const result = await deleteJobPostingLocal('non-existent-id')
      expect(result.ok).toBe(true)
    })
  })

  describe('jobStableHash', () => {
    it('should generate same hash for same text', () => {
      const text = 'Senior Developer at Test Corp'
      const hash1 = jobStableHash(text)
      const hash2 = jobStableHash(text)

      expect(hash1).toBe(hash2)
    })

    it('should generate different hash for different text', () => {
      const hash1 = jobStableHash('Job A')
      const hash2 = jobStableHash('Job B')

      expect(hash1).not.toBe(hash2)
    })

    it('should include URL in hash calculation', () => {
      const text = 'Senior Developer'
      const hash1 = jobStableHash(text, 'https://example.com/job1')
      const hash2 = jobStableHash(text, 'https://example.com/job2')

      expect(hash1).not.toBe(hash2)
    })

    it('should normalize text before hashing', () => {
      const hash1 = jobStableHash('  Senior Developer  ')
      const hash2 = jobStableHash('senior developer')

      expect(hash1).toBe(hash2)
    })
  })
})
