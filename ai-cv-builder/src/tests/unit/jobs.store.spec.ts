import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useJobsStore } from '@/stores/jobs.store'
import type { JobPosting } from '@/types/jobPosting.types'
import type { ParsedJob } from '@/types/ats.types'

// Mock the service layer
vi.mock('@/services/jobs/jobPostings.service', () => ({
  saveJobPosting: vi.fn(async (doc: JobPosting) => ({ ok: true, id: doc.id })),
  getJobPosting: vi.fn(async (id: string) => undefined),
  listJobPostings: vi.fn(async () => ({ ok: true, items: [] })),
  deleteJobPosting: vi.fn(async () => ({ ok: true })),
}))

// Mock localStorage
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

// Mock crypto.randomUUID
// @ts-ignore
global.crypto = {
  randomUUID: () => `test-uuid-${Math.random().toString(36).slice(2)}`,
}

describe('jobs.store', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    useJobsStore.setState({
      items: [],
      filter: { status: 'all' },
      loading: false,
      error: undefined,
      selectedId: undefined,
    })
  })

  const createMockParsedJob = (): ParsedJob => ({
    title: 'Senior Developer',
    company: 'Test Corp',
    location: 'Remote',
    remoteType: 'remote',
    sections: {
      raw: 'Senior Developer at Test Corp. Remote position.',
    },
    keywords: ['react', 'typescript'],
    lang: 'en',
  })

  describe('setFilter', () => {
    it('should update filter state', () => {
      const store = useJobsStore.getState()

      store.setFilter({ q: 'react' })
      expect(useJobsStore.getState().filter.q).toBe('react')

      store.setFilter({ favorite: true })
      expect(useJobsStore.getState().filter.favorite).toBe(true)
      expect(useJobsStore.getState().filter.q).toBe('react') // Previous filter preserved
    })

    it('should merge filters without overwriting', () => {
      const store = useJobsStore.getState()

      store.setFilter({ q: 'developer', status: 'saved' })
      expect(useJobsStore.getState().filter).toEqual({
        q: 'developer',
        status: 'saved',
      })

      store.setFilter({ favorite: true })
      expect(useJobsStore.getState().filter).toEqual({
        q: 'developer',
        status: 'saved',
        favorite: true,
      })
    })
  })

  describe('select', () => {
    it('should set selected job ID', () => {
      const store = useJobsStore.getState()

      store.select('job-123')
      expect(useJobsStore.getState().selectedId).toBe('job-123')

      store.select(undefined)
      expect(useJobsStore.getState().selectedId).toBeUndefined()
    })
  })

  describe('upsertFromForm', () => {
    it('should create new job posting', async () => {
      const store = useJobsStore.getState()
      const parsed = createMockParsedJob()

      const input = {
        title: 'Senior Developer',
        company: 'Test Corp',
        location: 'Remote',
        remoteType: 'remote' as const,
        rawText: 'Job description text',
        parsed,
      }

      const id = await store.upsertFromForm(input)

      expect(id).toBeDefined()
      expect(useJobsStore.getState().items).toHaveLength(1)
      expect(useJobsStore.getState().items[0].title).toBe('Senior Developer')
    })

    it('should update existing job posting', async () => {
      const store = useJobsStore.getState()
      const parsed = createMockParsedJob()

      const input = {
        id: 'job-123',
        title: 'Senior Developer',
        company: 'Test Corp',
        location: 'Remote',
        remoteType: 'remote' as const,
        rawText: 'Job description',
        parsed,
      }

      await store.upsertFromForm(input)

      const updated = { ...input, title: 'Lead Developer' }
      await store.upsertFromForm(updated)

      expect(useJobsStore.getState().items).toHaveLength(1)
      expect(useJobsStore.getState().items[0].title).toBe('Lead Developer')
    })

    it('should dedupe based on hash and URL', async () => {
      const store = useJobsStore.getState()
      const parsed = createMockParsedJob()

      const input1 = {
        title: 'Developer',
        company: 'Test',
        remoteType: 'remote' as const,
        rawText: 'Same job description',
        parsed,
        source: { url: 'https://example.com/job1' },
      }

      const id1 = await store.upsertFromForm(input1)

      // Same text and URL should reuse ID
      const input2 = {
        ...input1,
        title: 'Updated Developer', // Different title
      }

      const id2 = await store.upsertFromForm(input2)

      expect(id2).toBe(id1) // Should reuse existing ID
      expect(useJobsStore.getState().items).toHaveLength(1)
    })
  })

  describe('remove', () => {
    it('should delete job posting', async () => {
      const store = useJobsStore.getState()
      const parsed = createMockParsedJob()

      const id = await store.upsertFromForm({
        title: 'Developer',
        company: 'Test',
        remoteType: 'remote' as const,
        rawText: 'Description',
        parsed,
      })

      await store.remove(id!)

      expect(useJobsStore.getState().items).toHaveLength(0)
    })

    it('should clear selectedId if deleted job was selected', async () => {
      const store = useJobsStore.getState()
      const parsed = createMockParsedJob()

      const id = await store.upsertFromForm({
        title: 'Developer',
        company: 'Test',
        remoteType: 'remote' as const,
        rawText: 'Description',
        parsed,
      })

      store.select(id)
      expect(useJobsStore.getState().selectedId).toBe(id)

      await store.remove(id!)
      expect(useJobsStore.getState().selectedId).toBeUndefined()
    })
  })

  describe('toggleFavorite', () => {
    it('should toggle favorite status', async () => {
      const store = useJobsStore.getState()
      const parsed = createMockParsedJob()

      const id = await store.upsertFromForm({
        title: 'Developer',
        company: 'Test',
        remoteType: 'remote' as const,
        rawText: 'Description',
        parsed,
        favorite: false,
      })

      await store.toggleFavorite(id!)
      expect(useJobsStore.getState().items[0].favorite).toBe(true)

      await store.toggleFavorite(id!)
      expect(useJobsStore.getState().items[0].favorite).toBe(false)
    })
  })

  describe('duplicate', () => {
    it('should create a copy of job posting', async () => {
      const store = useJobsStore.getState()

      // Mock getJobPosting to return a job
      const { getJobPosting } = await import('@/services/jobs/jobPostings.service')
      vi.mocked(getJobPosting).mockResolvedValueOnce({
        id: 'original-id',
        hash: 'hash123',
        title: 'Developer',
        company: 'Test',
        location: 'Remote',
        remoteType: 'remote',
        rawText: 'Description',
        parsed: createMockParsedJob(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const newId = await store.duplicate('original-id')

      expect(newId).toBeDefined()
      expect(newId).not.toBe('original-id')
      expect(useJobsStore.getState().items).toHaveLength(1)
      expect(useJobsStore.getState().items[0].title).toContain('(Copy)')
    })
  })
})
