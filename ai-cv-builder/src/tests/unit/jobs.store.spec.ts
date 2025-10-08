/**
 * Jobs Store Unit Tests
 * Step 32 - Tests for jobs store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useJobsStore } from '@/stores/jobs.store';
import type { JobNormalized, FetchLog } from '@/types/jobs.types';

describe('jobs.store', () => {
  beforeEach(() => {
    useJobsStore.setState({ items: [], logs: [], selectedId: undefined });
  });

  const createJob = (id: string): JobNormalized => ({
    id,
    sourceId: id,
    title: 'Test Job',
    company: 'Test Corp',
    location: 'NYC',
    descriptionText: 'Test',
    url: 'https://example.com',
    source: { name: 'test', kind: 'rss', domain: 'example.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fingerprint: id,
  });

  describe('upsertMany', () => {
    it('should add new jobs', () => {
      const jobs = [createJob('1'), createJob('2')];
      useJobsStore.getState().upsertMany(jobs);
      expect(useJobsStore.getState().items).toHaveLength(2);
    });

    it('should update existing jobs', () => {
      const job1 = createJob('1');
      useJobsStore.getState().upsertMany([job1]);
      
      const updated = { ...job1, title: 'Updated Title' };
      useJobsStore.getState().upsertMany([updated]);
      
      expect(useJobsStore.getState().items).toHaveLength(1);
      expect(useJobsStore.getState().items[0].title).toBe('Updated Title');
    });

    it('should sort by posted date', () => {
      const job1 = createJob('1');
      job1.postedAt = '2024-01-01T00:00:00Z';
      const job2 = createJob('2');
      job2.postedAt = '2024-02-01T00:00:00Z';
      
      useJobsStore.getState().upsertMany([job1, job2]);
      
      expect(useJobsStore.getState().items[0].id).toBe('2');
    });
  });

  describe('select', () => {
    it('should set selected job', () => {
      useJobsStore.getState().select('123');
      expect(useJobsStore.getState().selectedId).toBe('123');
    });
  });

  describe('addLog', () => {
    it('should add fetch log', () => {
      const log: FetchLog = {
        id: 'log1',
        source: 'test',
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        ok: true,
        created: 5,
        updated: 2,
        skipped: 1,
      };
      useJobsStore.getState().addLog(log);
      expect(useJobsStore.getState().logs).toHaveLength(1);
    });

    it('should limit logs to 200', () => {
      const logs = Array(250).fill(null).map((_, i) => ({
        id: `log${i}`,
        source: 'test',
        startedAt: new Date().toISOString(),
        ok: true,
        created: 0,
        updated: 0,
        skipped: 0,
      }));
      
      logs.forEach(log => useJobsStore.getState().addLog(log));
      expect(useJobsStore.getState().logs).toHaveLength(200);
    });
  });

  describe('updateScore', () => {
    it('should update job score', () => {
      const job = createJob('1');
      useJobsStore.getState().upsertMany([job]);
      useJobsStore.getState().updateScore('1', 0.85);
      
      expect(useJobsStore.getState().items[0].score).toBe(0.85);
    });
  });

  describe('removeBySource', () => {
    it('should remove jobs from specific source', () => {
      const job1 = createJob('1');
      job1.source.name = 'source1';
      const job2 = createJob('2');
      job2.source.name = 'source2';
      
      useJobsStore.getState().upsertMany([job1, job2]);
      useJobsStore.getState().removeBySource('source1');
      
      expect(useJobsStore.getState().items).toHaveLength(1);
      expect(useJobsStore.getState().items[0].id).toBe('2');
    });
  });
});
