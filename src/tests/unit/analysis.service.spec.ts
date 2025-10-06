import { describe, it, expect } from 'vitest'
import { analyzeCVAgainstJob } from '@/services/ats/analysis.service'
import type { CVData } from '@/types/cvData.types'
import type { ParsedJob } from '@/types/ats.types'

describe('analysis.service', () => {
  const mockCV: CVData = {
    id: 'cv-1',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      phoneCountryCode: '+1',
      location: {},
    },
    summary: 'Experienced software engineer with React and TypeScript skills.',
    experience: [
      {
        id: 'exp-1',
        title: 'Senior Developer',
        company: 'Tech Inc',
        location: 'San Francisco',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2023-01-01'),
        currentlyWorking: false,
        description: 'Built scalable applications using React, Node.js, and AWS.',
        employmentType: 'Full-time',
        locationType: 'Remote',
        skills: [],
      },
    ],
    education: [
      {
        id: 'edu-1',
        school: 'University of Tech',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startDate: new Date('2015-09-01'),
        endDate: new Date('2019-06-01'),
        currentlyStudying: false,
        grade: '3.8 GPA',
      },
    ],
    skills: [
      { id: 's1', name: 'TypeScript', level: 'Expert', category: 'Technical' },
      { id: 's2', name: 'React', level: 'Expert', category: 'Technical' },
      { id: 's3', name: 'Node.js', level: 'Advanced', category: 'Technical' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockJob: ParsedJob = {
    title: 'Senior Software Engineer',
    company: 'TechCorp',
    sections: {
      requirements: ['TypeScript', 'React', 'Python', 'Docker', 'Kubernetes'],
      raw: 'Senior Software Engineer at TechCorp. Requirements: TypeScript, React, Python, Docker, Kubernetes.',
    },
    keywords: ['typescript', 'react', 'python', 'docker', 'kubernetes', 'aws', 'agile'],
    lang: 'en',
  }

  describe('analyzeCVAgainstJob', () => {
    it('should return an analysis result', () => {
      const result = analyzeCVAgainstJob(mockCV, mockJob)

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.jobHash).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.suggestions).toBeInstanceOf(Array)
      expect(result.matchedKeywords).toBeInstanceOf(Array)
      expect(result.missingKeywords).toBeInstanceOf(Array)
      expect(result.createdAt).toBeInstanceOf(Date)
    })

    it('should identify matched and missing keywords', () => {
      const result = analyzeCVAgainstJob(mockCV, mockJob)

      expect(result.matchedKeywords).toContain('typescript')
      expect(result.matchedKeywords).toContain('react')
      expect(result.matchedKeywords).toContain('aws')

      expect(result.missingKeywords).toContain('python')
      expect(result.missingKeywords).toContain('docker')
      expect(result.missingKeywords).toContain('kubernetes')
    })

    it('should generate keyword suggestions for missing keywords', () => {
      const result = analyzeCVAgainstJob(mockCV, mockJob)

      const keywordSuggestions = result.suggestions.filter((s) => s.category === 'Keywords')
      expect(keywordSuggestions.length).toBeGreaterThan(0)

      const pythonSuggestion = keywordSuggestions.find((s) => s.title.includes('python'))
      expect(pythonSuggestion).toBeDefined()
      expect(pythonSuggestion?.severity).toBe('critical')
      expect(pythonSuggestion?.applied).toBe(false)
    })

    it('should not suggest adding existing keywords', () => {
      const result = analyzeCVAgainstJob(mockCV, mockJob)
      const keywordTitles = result.suggestions.map((s) => s.title.toLowerCase())

      expect(keywordTitles.some((t) => t.includes('typescript'))).toBe(false)
      expect(keywordTitles.some((t) => t.includes('react'))).toBe(false)
    })
  })

  describe('scoring', () => {
    it('should give higher scores for better keyword match', () => {
      const goodCV = {
        ...mockCV,
        summary: mockJob.keywords.join(' '),
      }
      const poorCV = {
        ...mockCV,
        summary: 'Some unrelated experience',
      }

      const goodResult = analyzeCVAgainstJob(goodCV, mockJob)
      const poorResult = analyzeCVAgainstJob(poorCV, mockJob)

      expect(goodResult.score).toBeGreaterThan(poorResult.score)
    })

    it('should penalize critical suggestions', () => {
      const emptyCV: CVData = {
        id: 'cv-2',
        personalInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          phoneCountryCode: '+1',
          location: {},
        },
        experience: [],
        education: [],
        skills: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = analyzeCVAgainstJob(emptyCV, mockJob)
      const criticalCount = result.suggestions.filter((s) => s.severity === 'critical').length

      expect(criticalCount).toBeGreaterThan(0)
      expect(result.score).toBeLessThan(50) // Should be penalized
    })

    it('should bound score between 0 and 100', () => {
      const result = analyzeCVAgainstJob(mockCV, mockJob)
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
    })
  })

  describe('suggestion generation', () => {
    it('should suggest adding experience if missing', () => {
      const cvNoExp: CVData = {
        ...mockCV,
        experience: [],
      }

      const result = analyzeCVAgainstJob(cvNoExp, mockJob)
      const expSuggestion = result.suggestions.find((s) => s.category === 'Experience')

      expect(expSuggestion).toBeDefined()
      expect(expSuggestion?.severity).toBe('critical')
    })

    it('should suggest adding education if missing', () => {
      const cvNoEdu: CVData = {
        ...mockCV,
        education: [],
      }

      const result = analyzeCVAgainstJob(cvNoEdu, mockJob)
      const eduSuggestion = result.suggestions.find((s) => s.category === 'Education')

      expect(eduSuggestion).toBeDefined()
      expect(eduSuggestion?.severity).toBe('high')
    })

    it('should suggest improving summary if too short', () => {
      const cvShortSummary: CVData = {
        ...mockCV,
        summary: 'Developer',
      }

      const result = analyzeCVAgainstJob(cvShortSummary, mockJob)
      const summarySuggestion = result.suggestions.find(
        (s) => s.category === 'Sections' && s.title.includes('Summary')
      )

      expect(summarySuggestion).toBeDefined()
    })

    it('should check contact information', () => {
      const cvNoContact: CVData = {
        ...mockCV,
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: '',
          phone: '',
          phoneCountryCode: '+1',
          location: {},
        },
      }

      const result = analyzeCVAgainstJob(cvNoContact, mockJob)
      const contactSuggestion = result.suggestions.find((s) => s.category === 'Contact')

      expect(contactSuggestion).toBeDefined()
      expect(contactSuggestion?.title).toContain('Missing contact')
    })

    it('should check resume length', () => {
      const longText = 'word '.repeat(1500)
      const cvLong: CVData = {
        ...mockCV,
        summary: longText,
      }

      const result = analyzeCVAgainstJob(cvLong, mockJob)
      const lengthSuggestion = result.suggestions.find(
        (s) => s.category === 'Length' && s.title.includes('too long')
      )

      expect(lengthSuggestion).toBeDefined()
    })
  })

  describe('determinism', () => {
    it('should produce consistent results for same inputs', () => {
      const r1 = analyzeCVAgainstJob(mockCV, mockJob)
      const r2 = analyzeCVAgainstJob(mockCV, mockJob)

      expect(r1.score).toBe(r2.score)
      expect(r1.matchedKeywords).toEqual(r2.matchedKeywords)
      expect(r1.missingKeywords).toEqual(r2.missingKeywords)
      expect(r1.suggestions.length).toBe(r2.suggestions.length)
    })
  })
})
