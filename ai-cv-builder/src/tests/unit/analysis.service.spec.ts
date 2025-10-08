import { describe, it, expect } from 'vitest'
import { analyzeCVAgainstJob } from '@/services/ats/analysis.service'
import type { CVData } from '@/types/cvData.types'
import type { ParsedJob } from '@/types/ats.types'

describe('analysis.service', () => {
  const createMockCV = (overrides?: Partial<CVData>): CVData => ({
    id: '1',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      phoneCountryCode: '+1',
      location: {},
    },
    summary: 'Experienced software engineer with React and Node.js',
    experience: [
      {
        id: '1',
        title: 'Senior Developer',
        company: 'Tech Co',
        employmentType: 'Full-time',
        location: 'SF',
        startDate: new Date('2020-01-01'),
        currentlyWorking: true,
        description: 'Built scalable applications using React and TypeScript',
        skills: ['React', 'TypeScript'],
      },
    ],
    education: [
      {
        id: '1',
        school: 'University',
        degree: 'BS',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2019-01-01'),
        currentlyStudying: false,
      },
    ],
    skills: [
      { id: '1', name: 'React', category: 'Technical', level: 'Expert' },
      { id: '2', name: 'TypeScript', category: 'Technical', level: 'Advanced' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  const createMockJob = (overrides?: Partial<ParsedJob>): ParsedJob => ({
    title: 'Senior Engineer',
    company: 'Company',
    keywords: ['react', 'typescript', 'node', 'aws'],
    sections: {
      requirements: ['React experience', 'TypeScript', 'Node.js'],
      raw: 'Job description',
    },
    lang: 'en',
    ...overrides,
  })

  describe('analyzeCVAgainstJob', () => {
    it('should return ATS analysis with score', () => {
      const cv = createMockCV()
      const job = createMockJob()

      const result = analyzeCVAgainstJob(cv, job)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.suggestions).toBeDefined()
      expect(Array.isArray(result.suggestions)).toBe(true)
    })

    it('should match keywords correctly', () => {
      const cv = createMockCV({
        summary: 'Expert in React, TypeScript, and Node.js',
      })
      const job = createMockJob({
        keywords: ['react', 'typescript', 'node'],
      })

      const result = analyzeCVAgainstJob(cv, job)

      expect(result.matchedKeywords).toContain('react')
      expect(result.matchedKeywords).toContain('typescript')
      expect(result.matchedKeywords).toContain('node')
      expect(result.missingKeywords).not.toContain('react')
    })

    it('should identify missing keywords', () => {
      const cv = createMockCV({
        summary: 'I know React',
      })
      const job = createMockJob({
        keywords: ['react', 'python', 'aws'],
      })

      const result = analyzeCVAgainstJob(cv, job)

      expect(result.missingKeywords).toContain('python')
      expect(result.missingKeywords).toContain('aws')
    })

    it('should suggest adding missing keywords', () => {
      const cv = createMockCV()
      const job = createMockJob({
        keywords: ['python', 'django'],
      })

      const result = analyzeCVAgainstJob(cv, job)

      const keywordSuggestions = result.suggestions.filter(
        (s) => s.category === 'Keywords'
      )
      expect(keywordSuggestions.length).toBeGreaterThan(0)
      expect(keywordSuggestions.some((s) => s.title.includes('python'))).toBe(true)
    })

    it('should flag missing summary as critical', () => {
      const cv = createMockCV({ summary: '' })
      const job = createMockJob()

      const result = analyzeCVAgainstJob(cv, job)

      const summarySuggestion = result.suggestions.find(
        (s) => s.category === 'Sections' && s.title.includes('Summary')
      )
      expect(summarySuggestion).toBeDefined()
      expect(summarySuggestion?.severity).toBe('high')
    })

    it('should flag missing contact info', () => {
      const cv = createMockCV({
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: '',
          phone: '',
          phoneCountryCode: '+1',
          location: {},
        },
      })
      const job = createMockJob()

      const result = analyzeCVAgainstJob(cv, job)

      const contactSuggestion = result.suggestions.find(
        (s) => s.category === 'Contact'
      )
      expect(contactSuggestion).toBeDefined()
    })

    it('should flag missing experience as critical', () => {
      const cv = createMockCV({ experience: [] })
      const job = createMockJob()

      const result = analyzeCVAgainstJob(cv, job)

      const expSuggestion = result.suggestions.find(
        (s) => s.category === 'Experience'
      )
      expect(expSuggestion).toBeDefined()
      expect(expSuggestion?.severity).toBe('critical')
    })

    it('should calculate score deterministically', () => {
      const cv = createMockCV()
      const job = createMockJob()

      const result1 = analyzeCVAgainstJob(cv, job)
      const result2 = analyzeCVAgainstJob(cv, job)

      expect(result1.score).toBe(result2.score)
    })

    it('should have higher score with more matched keywords', () => {
      const job = createMockJob({ keywords: ['react', 'node', 'aws'] })

      const cv1 = createMockCV({ summary: 'I know React' })
      const cv2 = createMockCV({ summary: 'I know React, Node, and AWS' })

      const result1 = analyzeCVAgainstJob(cv1, job)
      const result2 = analyzeCVAgainstJob(cv2, job)

      expect(result2.score).toBeGreaterThan(result1.score)
    })

    it('should create actionable suggestions with targets', () => {
      const cv = createMockCV()
      const job = createMockJob()

      const result = analyzeCVAgainstJob(cv, job)

      const keywordSuggestions = result.suggestions.filter(
        (s) => s.category === 'Keywords'
      )
      keywordSuggestions.forEach((s) => {
        expect(s.target).toBeDefined()
        expect(s.action).toBeDefined()
        expect(s.applied).toBe(false)
      })
    })
  })
})
