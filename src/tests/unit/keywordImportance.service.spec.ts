import { describe, it, expect } from 'vitest'
import { buildKeywordMeta } from '@/services/ats/keywordImportance.service'
import type { ParsedJob } from '@/types/ats.types'

describe('keywordImportance.service', () => {
  it('should calculate base importance from frequency', () => {
    const job: ParsedJob = {
      sections: {
        requirements: ['TypeScript TypeScript TypeScript', 'React'],
        raw: 'test',
      },
      keywords: [],
      lang: 'en',
    }

    const meta = buildKeywordMeta(job, ['typescript'], ['react'])

    const tsMeta = meta.find((m) => m.term === 'typescript')
    const reactMeta = meta.find((m) => m.term === 'react')

    expect(tsMeta).toBeDefined()
    expect(reactMeta).toBeDefined()
    expect(tsMeta!.importance).toBeGreaterThan(reactMeta!.importance)
  })

  it('should add bonus for title presence', () => {
    const job: ParsedJob = {
      title: 'Senior TypeScript Engineer',
      sections: { raw: 'test' },
      keywords: [],
      lang: 'en',
    }

    const meta = buildKeywordMeta(job, ['typescript'], [])
    const tsMeta = meta.find((m) => m.term === 'typescript')

    expect(tsMeta?.inTitle).toBe(true)
    expect(tsMeta?.importance).toBeGreaterThanOrEqual(0.2)
  })

  it('should add bonus for requirements', () => {
    const job: ParsedJob = {
      sections: {
        requirements: ['Must have TypeScript'],
        raw: 'test',
      },
      keywords: [],
      lang: 'en',
    }

    const meta = buildKeywordMeta(job, ['typescript'], [])
    const tsMeta = meta.find((m) => m.term === 'typescript')

    expect(tsMeta?.inReq).toBe(true)
    expect(tsMeta?.importance).toBeGreaterThanOrEqual(0.15)
  })

  it('should cap importance at 1.0', () => {
    const job: ParsedJob = {
      title: 'TypeScript TypeScript TypeScript',
      sections: {
        requirements: ['TypeScript TypeScript TypeScript'],
        responsibilities: ['TypeScript TypeScript TypeScript'],
        qualifications: ['TypeScript TypeScript TypeScript'],
        raw: 'TypeScript',
      },
      keywords: [],
      lang: 'en',
    }

    const meta = buildKeywordMeta(job, ['typescript'], [])
    const tsMeta = meta.find((m) => m.term === 'typescript')

    expect(tsMeta?.importance).toBeLessThanOrEqual(1.0)
  })

  it('should sort by importance descending', () => {
    const job: ParsedJob = {
      title: 'Senior Engineer',
      sections: {
        requirements: ['TypeScript', 'React React React'],
        raw: 'test',
      },
      keywords: [],
      lang: 'en',
    }

    const meta = buildKeywordMeta(job, ['typescript', 'react', 'senior'], [])

    for (let i = 0; i < meta.length - 1; i++) {
      expect(meta[i].importance).toBeGreaterThanOrEqual(meta[i + 1].importance)
    }
  })
})
