/**
 * Deduplication Service Unit Tests
 * Step 32 - Tests for job deduplication
 */

import { describe, it, expect } from 'vitest';
import { dedupe } from '@/services/jobs/dedupe.service';
import type { JobNormalized } from '@/types/jobs.types';

describe('dedupe.service', () => {
  const createJob = (overrides: Partial<JobNormalized> = {}): JobNormalized => ({
    id: 'job_123',
    sourceId: 'src_123',
    title: 'Engineer',
    company: 'ACME',
    location: 'NYC',
    descriptionText: 'Test job',
    url: 'https://example.com',
    source: { name: 'test', kind: 'rss', domain: 'example.com' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fingerprint: 'fp_123',
    ...overrides,
  });

  it('should remove exact duplicates', () => {
    const job1 = createJob({ fingerprint: 'fp_1' });
    const job2 = createJob({ fingerprint: 'fp_1' });
    const result = dedupe([job1, job2]);
    expect(result).toHaveLength(1);
  });

  it('should keep jobs with different fingerprints', () => {
    const job1 = createJob({ fingerprint: 'fp_1' });
    const job2 = createJob({ fingerprint: 'fp_2' });
    const result = dedupe([job1, job2]);
    expect(result).toHaveLength(2);
  });

  it('should prefer richer job data', () => {
    const job1 = createJob({ 
      fingerprint: 'fp_1',
      salary: undefined,
      postedAt: undefined,
      descriptionText: 'Short'
    });
    const job2 = createJob({ 
      fingerprint: 'fp_1',
      salary: { min: 100000, max: 150000, period: 'year' },
      postedAt: new Date().toISOString(),
      descriptionText: 'Much longer description with more details'
    });
    const result = dedupe([job1, job2]);
    expect(result).toHaveLength(1);
    expect(result[0].salary).toBeDefined();
  });

  it('should handle empty list', () => {
    const result = dedupe([]);
    expect(result).toHaveLength(0);
  });

  it('should preserve all unique jobs', () => {
    const jobs = Array(10).fill(null).map((_, i) => 
      createJob({ fingerprint: `fp_${i}` })
    );
    const result = dedupe(jobs);
    expect(result).toHaveLength(10);
  });
});
