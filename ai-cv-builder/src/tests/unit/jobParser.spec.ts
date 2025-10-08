import { describe, it, expect } from 'vitest'
import { parseJobText } from '@/services/ats/jobParser'

describe('jobParser', () => {
  describe('parseJobText', () => {
    it('should parse basic job information', () => {
      const jobText = `
Title: Senior Software Engineer
Company: Tech Corp
Location: San Francisco, CA
Remote

About the Role:
We are looking for an experienced software engineer.

Responsibilities:
- Build scalable systems
- Lead technical projects
- Mentor junior developers

Requirements:
- 5+ years of experience
- Strong knowledge of React, TypeScript, Node.js
- Experience with AWS and Docker
      `.trim()

      const result = parseJobText(jobText)

      expect(result.title).toBe('Senior Software Engineer')
      expect(result.company).toBe('Tech Corp')
      expect(result.location).toBe('San Francisco, CA')
      expect(result.remoteType).toBe('remote')
      expect(result.lang).toBe('en')
    })

    it('should extract keywords from job description', () => {
      const jobText = `
Requirements:
- React and TypeScript experience
- Node.js and Python
- AWS, Docker, Kubernetes
      `.trim()

      const result = parseJobText(jobText)

      expect(result.keywords).toContain('react')
      expect(result.keywords).toContain('typescript')
      expect(result.keywords).toContain('node')
      expect(result.keywords).toContain('python')
    })

    it('should parse Turkish job postings', () => {
      const jobText = `
Pozisyon: Kıdemli Yazılım Geliştirici
Şirket: Teknoloji Şirketi
Konum: İstanbul
Uzaktan çalışma imkanı

Görevler:
- Ölçeklenebilir sistemler geliştirme
- Takım yönetimi

Gereksinimler:
- React, TypeScript deneyimi
- AWS bilgisi
      `.trim()

      const result = parseJobText(jobText)

      expect(result.title).toBe('Kıdemli Yazılım Geliştirici')
      expect(result.company).toBe('Teknoloji Şirketi')
      expect(result.lang).toBe('tr')
    })

    it('should extract salary information', () => {
      const jobText = `
Salary: $120,000 - $150,000 per year
      `.trim()

      const result = parseJobText(jobText)

      expect(result.salary).toBeDefined()
      expect(result.salary?.min).toBe(120000)
      expect(result.salary?.max).toBe(150000)
      expect(result.salary?.currency).toBe('$')
    })

    it('should split sections correctly', () => {
      const jobText = `
Summary:
This is an amazing opportunity.

Responsibilities:
- Task 1
- Task 2

Requirements:
- Requirement 1
- Requirement 2

Benefits:
- Benefit 1
- Benefit 2
      `.trim()

      const result = parseJobText(jobText)

      expect(result.sections.summary).toContain('amazing opportunity')
      expect(result.sections.responsibilities).toHaveLength(2)
      expect(result.sections.requirements).toHaveLength(2)
      expect(result.sections.benefits).toHaveLength(2)
    })

    it('should detect remote type correctly', () => {
      expect(parseJobText('Work from home').remoteType).toBe('remote')
      expect(parseJobText('Hybrid work model').remoteType).toBe('hybrid')
      expect(parseJobText('Office based').remoteType).toBe('onsite')
      expect(parseJobText('Uzaktan çalışma').remoteType).toBe('remote')
    })
  })
})
