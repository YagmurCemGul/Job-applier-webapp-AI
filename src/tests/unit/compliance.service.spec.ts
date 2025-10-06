import { describe, it, expect } from 'vitest'
import { compliance } from '@/services/jobs/compliance.service'
import type { SourceConfig } from '@/types/jobs.types'

describe('compliance.service', () => {
  describe('canFetch', () => {
    it('should allow API sources', () => {
      const source: SourceConfig = {
        key: 'test.api',
        enabled: true,
        kind: 'api',
        domain: 'test.com',
      }
      const result = compliance.canFetch(source)
      expect(result.ok).toBe(true)
    })

    it('should allow RSS sources', () => {
      const source: SourceConfig = {
        key: 'test.rss',
        enabled: true,
        kind: 'rss',
        domain: 'test.com',
      }
      const result = compliance.canFetch(source)
      expect(result.ok).toBe(true)
    })

    it('should block HTML sources without legalMode', () => {
      const source: SourceConfig = {
        key: 'test.html',
        enabled: true,
        kind: 'html',
        domain: 'test.com',
        legalMode: false,
      }
      const result = compliance.canFetch(source)
      expect(result.ok).toBe(false)
      expect(result.reason).toBe('legalModeOff')
    })

    it('should allow HTML sources with legalMode', () => {
      const source: SourceConfig = {
        key: 'test.html',
        enabled: true,
        kind: 'html',
        domain: 'test.com',
        legalMode: true,
      }
      const result = compliance.canFetch(source)
      expect(result.ok).toBe(true)
    })
  })

  describe('robotsAllows', () => {
    it('should default to allow on fetch error', async () => {
      const result = await compliance.robotsAllows('nonexistent-domain-12345.com', '/jobs')
      expect(result).toBe(true)
    })
  })
})
