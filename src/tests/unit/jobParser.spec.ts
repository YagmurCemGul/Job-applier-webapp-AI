import { describe, it, expect } from 'vitest'
import { parseJobText } from '@/services/ats/jobParser'

describe('jobParser', () => {
  describe('parseJobText - English', () => {
    it('should parse English job posting', () => {
      const sampleEn = `Senior Software Engineer
Company: TechCorp
Location: San Francisco, CA (Remote)

Requirements:
- 5+ years TypeScript experience
- React and Node.js proficiency
- AWS knowledge`

      const result = parseJobText(sampleEn)

      expect(result.lang).toBe('en')
      expect(result.title).toContain('Senior Software Engineer')
      expect(result.company).toBe('TechCorp')
      expect(result.location).toContain('San Francisco')
      expect(result.remoteType).toBe('remote')
      expect(result.keywords).toContain('typescript')
      expect(result.keywords).toContain('react')
    })

    it('should detect onsite type', () => {
      const text = 'Position: Developer\nLocation: Onsite office work required'
      const result = parseJobText(text)
      expect(result.remoteType).toBe('onsite')
    })

    it('should parse salary range', () => {
      const text = 'Salary: $120,000 - $180,000'
      const result = parseJobText(text)
      expect(result.salary?.min).toBe(120000)
      expect(result.salary?.max).toBe(180000)
      expect(result.salary?.currency).toBe('$')
    })
  })

  describe('parseJobText - Turkish', () => {
    it('should parse Turkish job posting', () => {
      const sampleTr = `Kıdemli Yazılım Mühendisi
Şirket: TeknoŞirket
Konum: İstanbul (Uzaktan)

Gereksinimler:
- 5+ yıl TypeScript deneyimi
- React ve Node.js yetkinliği`

      const result = parseJobText(sampleTr)

      expect(result.lang).toBe('tr')
      expect(result.company).toBe('TeknoŞirket')
      expect(result.remoteType).toBe('remote')
      expect(result.keywords).toContain('typescript')
      expect(result.keywords).toContain('react')
    })

    it('should detect Turkish based on special characters', () => {
      const text = 'Pozisyon: Yazılım Mühendisi\nŞirket bilgileri ve gereksinimler'
      const result = parseJobText(text)
      expect(result.lang).toBe('tr')
    })
  })

  describe('section extraction', () => {
    it('should extract responsibilities', () => {
      const text = `Responsibilities:
- Design scalable applications
- Conduct code reviews
- Mentor team members`

      const result = parseJobText(text)
      expect(result.sections.responsibilities).toHaveLength(3)
      expect(result.sections.responsibilities?.[0]).toContain('Design')
    })

    it('should extract requirements', () => {
      const text = `Requirements:
- 5+ years experience
- Strong TypeScript skills`

      const result = parseJobText(text)
      expect(result.sections.requirements).toHaveLength(2)
    })
  })

  describe('keyword extraction', () => {
    it('should deduplicate keywords', () => {
      const text = 'React React TypeScript typescript AWS aws'
      const result = parseJobText(text)
      const normalized = result.keywords.map((k) => k.toLowerCase())
      expect(normalized.filter((k) => k === 'react')).toHaveLength(1)
      expect(normalized.filter((k) => k === 'typescript')).toHaveLength(1)
      expect(normalized.filter((k) => k === 'aws')).toHaveLength(1)
    })

    it('should extract keywords from multiple sections', () => {
      const text = `Requirements:
- TypeScript proficiency
- React experience

Qualifications:
- Node.js knowledge
- AWS expertise`

      const result = parseJobText(text)
      expect(result.keywords).toContain('typescript')
      expect(result.keywords).toContain('react')
      expect(result.keywords).toContain('node')
      expect(result.keywords).toContain('aws')
    })
  })
})
