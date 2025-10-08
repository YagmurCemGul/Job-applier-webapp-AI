/**
 * HTML Adapters Integration Tests
 * Step 32 - Tests for HTML job scraping stubs
 */

import { describe, it, expect } from 'vitest';
import { fetchLinkedInHTML } from '@/services/jobs/adapters/linkedin.html.adapter';
import { fetchIndeedHTML } from '@/services/jobs/adapters/indeed.html.adapter';
import type { SourceConfig } from '@/types/jobs.types';

describe('html.adapters', () => {
  describe('linkedin.html.adapter', () => {
    it('should throw without legal mode', async () => {
      const source: SourceConfig = {
        key: 'linkedin.html',
        enabled: true,
        kind: 'html',
        domain: 'linkedin.com',
        legalMode: false,
      };

      await expect(fetchLinkedInHTML(source)).rejects.toThrow('legalMode required');
    });

    it('should parse fixture HTML with legal mode', async () => {
      const mockHTML = `
        <div>
          <a href="https://linkedin.com/jobs/view/123">Senior Engineer</a>
          <a href="https://linkedin.com/jobs/view/456">Product Manager</a>
        </div>
      `;

      const source: SourceConfig = {
        key: 'linkedin.html',
        enabled: true,
        kind: 'html',
        domain: 'linkedin.com',
        legalMode: true,
        params: { html: mockHTML },
      };

      const jobs = await fetchLinkedInHTML(source);
      
      expect(jobs).toHaveLength(2);
      expect(jobs[0].title).toBe('Senior Engineer');
      expect(jobs[1].title).toBe('Product Manager');
    });
  });

  describe('indeed.html.adapter', () => {
    it('should throw without legal mode', async () => {
      const source: SourceConfig = {
        key: 'indeed.html',
        enabled: true,
        kind: 'html',
        domain: 'indeed.com',
        legalMode: false,
      };

      await expect(fetchIndeedHTML(source)).rejects.toThrow('legalMode required');
    });

    it('should parse fixture HTML with legal mode', async () => {
      const mockHTML = `
        <div>
          <a href="/viewjob?jk=123">Software Engineer</a>
          <a href="/viewjob?jk=456">Data Analyst</a>
        </div>
      `;

      const source: SourceConfig = {
        key: 'indeed.html',
        enabled: true,
        kind: 'html',
        domain: 'indeed.com',
        legalMode: true,
        params: { html: mockHTML },
      };

      const jobs = await fetchIndeedHTML(source);
      
      expect(jobs).toHaveLength(2);
      expect(jobs[0].title).toBe('Software Engineer');
    });
  });
});
