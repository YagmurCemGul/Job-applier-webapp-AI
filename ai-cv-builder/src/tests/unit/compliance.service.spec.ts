/**
 * Compliance Service Unit Tests
 * Step 32 - Tests for legal/ethical compliance checks
 */

import { describe, it, expect } from 'vitest';
import { compliance } from '@/services/jobs/compliance.service';
import type { SourceConfig } from '@/types/jobs.types';

describe('compliance.service', () => {
  describe('canFetch', () => {
    it('should allow API sources', () => {
      const source: SourceConfig = {
        key: 'test.api',
        enabled: true,
        kind: 'api',
        domain: 'example.com',
      };
      const result = compliance.canFetch(source);
      expect(result.ok).toBe(true);
    });

    it('should allow RSS sources', () => {
      const source: SourceConfig = {
        key: 'test.rss',
        enabled: true,
        kind: 'rss',
        domain: 'example.com',
      };
      const result = compliance.canFetch(source);
      expect(result.ok).toBe(true);
    });

    it('should block HTML sources without legal mode', () => {
      const source: SourceConfig = {
        key: 'test.html',
        enabled: true,
        kind: 'html',
        domain: 'example.com',
        legalMode: false,
      };
      const result = compliance.canFetch(source);
      expect(result.ok).toBe(false);
      expect(result.reason).toBe('legalModeOff');
    });

    it('should allow HTML sources with legal mode', () => {
      const source: SourceConfig = {
        key: 'test.html',
        enabled: true,
        kind: 'html',
        domain: 'example.com',
        legalMode: true,
      };
      const result = compliance.canFetch(source);
      expect(result.ok).toBe(true);
    });
  });

  describe('robotsAllows', () => {
    it('should allow by default on fetch error', async () => {
      const result = await compliance.robotsAllows('nonexistent.example', '/path');
      expect(result).toBe(true);
    });
  });
});
