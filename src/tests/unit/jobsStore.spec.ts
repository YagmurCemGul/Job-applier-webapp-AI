import { describe, it, expect, beforeEach } from 'vitest'
import { useJobsStore } from '@/store/jobsStore'
import type { JobNormalized, FetchLog } from '@/types/jobs.types'

describe('jobsStore', () => {
  beforeEach(() => {
    useJobsStore.setState({ items: [], logs: [], selectedId: undefined })
  })

  it('should upsert jobs', () => {
    const job: JobNormalized = {
      id: 'job_1',
      sourceId: 'src-1',
      title: 'Engineer',
      company: 'Acme',
      location: 'SF',
      fingerprint: 'fp1',
      descriptionText: 'Test job',
      url: 'https://example.com/1',
      source: { name: 'test', kind: 'api', domain: 'test.com' },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }

    useJobsStore.getState().upsertMany([job])
    expect(useJobsStore.getState().items).toHaveLength(1)
    expect(useJobsStore.getState().items[0].id).toBe('job_1')
  })

  it('should update existing job', () => {
    const job1: JobNormalized = {
      id: 'job_1',
      sourceId: 'src-1',
      title: 'Engineer',
      company: 'Acme',
      location: 'SF',
      fingerprint: 'fp1',
      descriptionText: 'Test job',
      url: 'https://example.com/1',
      source: { name: 'test', kind: 'api', domain: 'test.com' },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }

    const job2: JobNormalized = {
      ...job1,
      title: 'Senior Engineer'
    }

    useJobsStore.getState().upsertMany([job1])
    useJobsStore.getState().upsertMany([job2])

    expect(useJobsStore.getState().items).toHaveLength(1)
    expect(useJobsStore.getState().items[0].title).toBe('Senior Engineer')
  })

  it('should select job', () => {
    useJobsStore.getState().select('job_1')
    expect(useJobsStore.getState().selectedId).toBe('job_1')
  })

  it('should add log', () => {
    const log: FetchLog = {
      id: 'log_1',
      source: 'test',
      startedAt: '2025-01-01T00:00:00Z',
      finishedAt: '2025-01-01T00:01:00Z',
      ok: true,
      created: 5,
      updated: 2,
      skipped: 0
    }

    useJobsStore.getState().addLog(log)
    expect(useJobsStore.getState().logs).toHaveLength(1)
    expect(useJobsStore.getState().logs[0].id).toBe('log_1')
  })

  it('should update score', () => {
    const job: JobNormalized = {
      id: 'job_1',
      sourceId: 'src-1',
      title: 'Engineer',
      company: 'Acme',
      location: 'SF',
      fingerprint: 'fp1',
      descriptionText: 'Test job',
      url: 'https://example.com/1',
      source: { name: 'test', kind: 'api', domain: 'test.com' },
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }

    useJobsStore.getState().upsertMany([job])
    useJobsStore.getState().updateScore('job_1', 0.85)

    expect(useJobsStore.getState().items[0].score).toBe(0.85)
  })

  it('should remove jobs by source', () => {
    const jobs: JobNormalized[] = [
      {
        id: 'job_1',
        sourceId: 'src-1',
        title: 'Engineer',
        company: 'Acme',
        location: 'SF',
        fingerprint: 'fp1',
        descriptionText: 'Test',
        url: 'https://example.com/1',
        source: { name: 'source-a', kind: 'api', domain: 'a.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      },
      {
        id: 'job_2',
        sourceId: 'src-2',
        title: 'Developer',
        company: 'Tech',
        location: 'NY',
        fingerprint: 'fp2',
        descriptionText: 'Test',
        url: 'https://example.com/2',
        source: { name: 'source-b', kind: 'api', domain: 'b.com' },
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01'
      }
    ]

    useJobsStore.getState().upsertMany(jobs)
    useJobsStore.getState().removeBySource('source-a')

    expect(useJobsStore.getState().items).toHaveLength(1)
    expect(useJobsStore.getState().items[0].id).toBe('job_2')
  })
})
