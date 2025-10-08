/**
 * Search Index Service Unit Tests
 * Step 32 - Tests for job search indexing
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { rebuildIndex, addToIndex, search } from '@/services/jobs/searchIndex.service';
import type { JobNormalized } from '@/types/jobs.types';

describe('searchIndex.service', () => {
  const createJob = (id: string, title: string, company: string, description: string): JobNormalized => ({
    id,
    sourceId: id,
    title,
    company,
    location: 'NYC',
    descriptionText: description,
    url: 'https://example.com',
    source: { name: 'test', kind: 'rss', domain: 'example.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fingerprint: id,
  });

  beforeEach(async () => {
    const jobs = [
      createJob('1', 'Senior React Developer', 'Facebook', 'React TypeScript JavaScript'),
      createJob('2', 'Backend Engineer', 'Google', 'Node.js Python Java'),
      createJob('3', 'Full Stack Developer', 'Amazon', 'React Node.js AWS'),
    ];
    await rebuildIndex(jobs);
  });

  describe('search', () => {
    it('should find jobs by keyword', () => {
      const results = search('React');
      expect(results).toContain('1');
      expect(results).toContain('3');
    });

    it('should perform AND search with multiple keywords', () => {
      const results = search('React Node');
      expect(results).toContain('3');
    });

    it('should return empty for no matches', () => {
      const results = search('Rust');
      expect(results).toHaveLength(0);
    });

    it('should be case insensitive', () => {
      const results = search('react');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('addToIndex', () => {
    it('should add new job to index', () => {
      const newJob = createJob('4', 'DevOps Engineer', 'Netflix', 'Kubernetes Docker');
      addToIndex(newJob);
      const results = search('Kubernetes');
      expect(results).toContain('4');
    });
  });
});
