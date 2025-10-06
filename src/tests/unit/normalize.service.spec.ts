import { describe, it, expect } from 'vitest'
import {
  normalizeJobs,
  extractSalary,
  classify,
  detectRemote,
  extractKeywords,
  fingerprint,
} from '@/services/jobs/normalize.service'
import type { JobRaw } from '@/types/jobs.types'

describe('normalize.service', () => {
  describe('extractSalary', () => {
    it('should extract salary range', () => {
      const text = '$80,000 - $120,000 per year'
      const salary = extractSalary(text)
      expect(salary).toBeDefined()
      expect(salary?.currency).toBe('USD')
      expect(salary?.min).toBe(80000)
      expect(salary?.max).toBe(120000)
    })

    it('should handle K notation', () => {
      const text = '$80K - $120K'
      const salary = extractSalary(text)
      expect(salary?.min).toBe(80000)
      expect(salary?.max).toBe(120000)
    })

    it('should return undefined for no salary', () => {
      const text = 'Great opportunity'
      const salary = extractSalary(text)
      expect(salary).toBeUndefined()
    })
  })

  describe('classify', () => {
    it('should detect junior level', () => {
      const { seniority } = classify('Junior Software Engineer')
      expect(seniority).toBe('junior')
    })

    it('should detect senior level', () => {
      const { seniority } = classify('Senior Developer')
      expect(seniority).toBe('senior')
    })

    it('should detect full-time employment', () => {
      const { employment } = classify('Full-time position')
      expect(employment).toBe('full-time')
    })

    it('should detect contract employment', () => {
      const { employment } = classify('Contract role')
      expect(employment).toBe('contract')
    })
  })

  describe('detectRemote', () => {
    it('should detect remote jobs', () => {
      expect(detectRemote('Remote work')).toBe(true)
      expect(detectRemote('Hybrid model')).toBe(true)
      expect(detectRemote('Work from home')).toBe(true)
    })

    it('should not detect on-site jobs', () => {
      expect(detectRemote('On-site only')).toBe(false)
    })
  })

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'JavaScript React Node.js TypeScript'
      const keywords = extractKeywords(text)
      expect(keywords).toContain('javascript')
      expect(keywords).toContain('react')
      expect(keywords).toContain('node.js')
    })

    it('should limit to 30 keywords', () => {
      const text = Array(100).fill('keyword').join(' ')
      const keywords = extractKeywords(text)
      expect(keywords.length).toBeLessThanOrEqual(30)
    })
  })

  describe('fingerprint', () => {
    it('should generate stable fingerprint', () => {
      const fp1 = fingerprint(
        'Software Engineer',
        'Acme Inc',
        'San Francisco',
        'https://example.com/job1'
      )
      const fp2 = fingerprint(
        'Software Engineer',
        'Acme Inc',
        'San Francisco',
        'https://example.com/job1'
      )
      expect(fp1).toBe(fp2)
    })

    it('should generate different fingerprints for different jobs', () => {
      const fp1 = fingerprint(
        'Software Engineer',
        'Acme Inc',
        'San Francisco',
        'https://example.com/job1'
      )
      const fp2 = fingerprint(
        'Data Scientist',
        'Acme Inc',
        'San Francisco',
        'https://example.com/job2'
      )
      expect(fp1).not.toBe(fp2)
    })

    it('should ignore query parameters', () => {
      const fp1 = fingerprint('Engineer', 'Acme', 'SF', 'https://example.com/job?id=1')
      const fp2 = fingerprint('Engineer', 'Acme', 'SF', 'https://example.com/job?id=2')
      expect(fp1).toBe(fp2)
    })
  })

  describe('normalizeJobs', () => {
    it('should normalize raw jobs', () => {
      const raw: JobRaw = {
        id: 'test-1',
        url: 'https://example.com/job1',
        source: { name: 'test', kind: 'api', domain: 'example.com' },
        title: 'Senior Software Engineer',
        company: 'Acme Inc',
        location: 'San Francisco, CA',
        description:
          'Great opportunity for a senior developer. Remote work available. $120K-$150K per year.',
        fetchedAt: new Date().toISOString(),
      }

      const normalized = normalizeJobs([raw])
      expect(normalized).toHaveLength(1)
      expect(normalized[0].title).toBe('Senior Software Engineer')
      expect(normalized[0].seniority).toBe('senior')
      expect(normalized[0].remote).toBe(true)
      expect(normalized[0].salary?.min).toBe(120000)
      expect(normalized[0].fingerprint).toBeDefined()
    })
  })
})
