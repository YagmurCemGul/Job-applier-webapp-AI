import { describe, it, expect } from 'vitest'
import { sanitizeHtml, buildVariables, toPlain } from '@/services/coverletter/clVariables.service'
import type { CVData } from '@/types/cvData.types'

describe('clVariables.service', () => {
  const mockCV: CVData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@test.com',
      phone: '+1234567890',
      location: 'San Francisco',
      firstName: 'John',
      lastName: 'Doe',
    },
    summary: 'Senior Software Engineer',
    skills: [
      { id: '1', name: 'TypeScript', level: 4 },
      { id: '2', name: 'React', level: 5 },
    ],
    experience: [],
    education: [],
    projects: [],
  }

  describe('sanitizeHtml', () => {
    it('should preserve allowed tags', () => {
      const html = '<p>Hello <strong>world</strong></p>'
      const result = sanitizeHtml(html)
      expect(result).toContain('<p>')
      expect(result).toContain('<strong>')
    })

    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script>'
      const result = sanitizeHtml(html)
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('should remove dangerous attributes', () => {
      const html = '<p onclick="alert(1)">Hello</p>'
      const result = sanitizeHtml(html)
      expect(result).not.toContain('onclick')
    })
  })

  describe('buildVariables', () => {
    it('should extract basic variables from CV', () => {
      const vars = buildVariables({ cv: mockCV })

      expect(vars.YourName).toBe('John Doe')
      expect(vars.Skills).toContain('TypeScript')
      expect(vars.Skills).toContain('React')
    })

    it('should include job information', () => {
      const vars = buildVariables({
        cv: mockCV,
        job: { title: 'Backend Engineer', company: 'TechCorp', recruiterName: 'Jane Smith' },
      })

      expect(vars.Role).toBe('Backend Engineer')
      expect(vars.Company).toBe('TechCorp')
      expect(vars.RecruiterName).toBe('Jane Smith')
    })

    it('should use default recruiter name', () => {
      const vars = buildVariables({ cv: mockCV })
      expect(vars.RecruiterName).toBe('Hiring Manager')
    })

    it('should handle extra variables', () => {
      const vars = buildVariables({
        cv: mockCV,
        extra: { CustomField: 'Custom Value' },
      })

      expect(vars.CustomField).toBe('Custom Value')
    })

    it('should derive skills text', () => {
      const vars = buildVariables({ cv: mockCV })
      expect(vars.Skills).toContain('Key strengths include')
    })
  })

  describe('toPlain', () => {
    it('should convert HTML to plain text', () => {
      const html = '<p>Hello <strong>world</strong></p>'
      const plain = toPlain(html)
      expect(plain).toContain('Hello world')
      expect(plain).not.toContain('<p>')
      expect(plain).not.toContain('<strong>')
    })

    it('should handle br tags', () => {
      const html = 'Line 1<br>Line 2'
      const plain = toPlain(html)
      expect(plain).toContain('\n')
    })

    it('should handle paragraphs', () => {
      const html = '<p>Para 1</p><p>Para 2</p>'
      const plain = toPlain(html)
      expect(plain.split('\n\n').length).toBeGreaterThan(1)
    })

    it('should trim whitespace', () => {
      const html = '   <p>  Hello  </p>   '
      const plain = toPlain(html)
      expect(plain).toBe('Hello')
    })
  })
})
