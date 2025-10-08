/**
 * Normalization Service Unit Tests
 * Step 32 - Tests for job normalization and extraction
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeJobs,
  toText,
  extractSalary,
  classify,
  detectRemote,
  extractKeywords,
  fingerprint,
} from '@/services/jobs/normalize.service';
import type { JobRaw } from '@/types/jobs.types';

describe('normalize.service', () => {
  describe('toText', () => {
    it('should convert HTML to plain text', () => {
      const html = '<p>Hello</p><br/><div>World</div>';
      expect(toText(html)).toBe('Hello\n\nWorld');
    });

    it('should preserve spacing', () => {
      const html = 'Multiple   spaces';
      expect(toText(html)).toBe('Multiple spaces');
    });
  });

  describe('extractSalary', () => {
    it('should extract USD salary range', () => {
      const text = 'Salary: $80,000 - $120,000 per year';
      const salary = extractSalary(text);
      expect(salary?.currency).toBe('USD');
      expect(salary?.min).toBe(80000);
      expect(salary?.max).toBe(120000);
    });

    it('should extract TRY salary range', () => {
      const text = 'Maaş: ₺50.000 - ₺80.000';
      const salary = extractSalary(text);
      expect(salary?.currency).toBe('TRY');
    });

    it('should handle K notation', () => {
      const text = '$80K - $120K';
      const salary = extractSalary(text);
      expect(salary?.min).toBe(80000);
      expect(salary?.max).toBe(120000);
    });

    it('should return undefined for no salary', () => {
      const text = 'No salary mentioned';
      expect(extractSalary(text)).toBeUndefined();
    });
  });

  describe('classify', () => {
    it('should detect senior seniority', () => {
      const text = 'Senior Software Engineer';
      const result = classify(text);
      expect(result.seniority).toBe('senior');
    });

    it('should detect full-time employment', () => {
      const text = 'Full-time position available';
      const result = classify(text);
      expect(result.employment).toBe('full-time');
    });

    it('should detect internship', () => {
      const text = 'Intern position';
      const result = classify(text);
      expect(result.seniority).toBe('intern');
      expect(result.employment).toBe('internship');
    });
  });

  describe('detectRemote', () => {
    it('should detect remote work', () => {
      expect(detectRemote('Remote position')).toBe(true);
      expect(detectRemote('Hybrid work')).toBe(true);
      expect(detectRemote('Work from home')).toBe(true);
      expect(detectRemote('Office only')).toBe(false);
    });
  });

  describe('extractKeywords', () => {
    it('should extract top keywords', () => {
      const text = 'JavaScript JavaScript React React React Node';
      const keywords = extractKeywords(text);
      expect(keywords).toContain('react');
      expect(keywords).toContain('javascript');
    });

    it('should limit to 30 keywords', () => {
      const text = Array(100).fill('keyword').join(' ');
      const keywords = extractKeywords(text);
      expect(keywords.length).toBeLessThanOrEqual(30);
    });
  });

  describe('fingerprint', () => {
    it('should generate consistent fingerprints', () => {
      const fp1 = fingerprint('Engineer', 'ACME', 'NYC', 'https://example.com/job/123');
      const fp2 = fingerprint('Engineer', 'ACME', 'NYC', 'https://example.com/job/123');
      expect(fp1).toBe(fp2);
    });

    it('should ignore query params in URL', () => {
      const fp1 = fingerprint('Engineer', 'ACME', 'NYC', 'https://example.com/job/123');
      const fp2 = fingerprint('Engineer', 'ACME', 'NYC', 'https://example.com/job/123?ref=source');
      expect(fp1).toBe(fp2);
    });

    it('should be case insensitive', () => {
      const fp1 = fingerprint('Engineer', 'ACME', 'NYC', 'https://example.com');
      const fp2 = fingerprint('engineer', 'acme', 'nyc', 'https://example.com');
      expect(fp1).toBe(fp2);
    });
  });

  describe('normalizeJobs', () => {
    it('should normalize raw job data', () => {
      const raw: JobRaw = {
        id: 'test-1',
        url: 'https://example.com/job',
        source: { name: 'test', kind: 'rss', domain: 'example.com' },
        title: 'Senior Engineer',
        company: 'ACME Corp',
        location: 'New York',
        description: 'Remote position. $100K - $150K',
        fetchedAt: new Date().toISOString(),
      };

      const normalized = normalizeJobs([raw]);
      expect(normalized).toHaveLength(1);
      expect(normalized[0].title).toBe('Senior Engineer');
      expect(normalized[0].company).toBe('ACME Corp');
      expect(normalized[0].remote).toBe(true);
      expect(normalized[0].seniority).toBe('senior');
      expect(normalized[0].salary?.min).toBe(100000);
    });
  });
});
