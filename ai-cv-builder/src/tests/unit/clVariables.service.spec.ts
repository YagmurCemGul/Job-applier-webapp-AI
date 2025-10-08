/**
 * Cover Letter Variables Service Tests - Step 30
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  buildVariables,
  toPlain,
  escapeHtml,
} from '@/services/coverletter/clVariables.service'

describe('clVariables.service', () => {
  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const dirty = '<p>Hello</p><script>alert("xss")</script>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('<script>')
      expect(clean).toContain('Hello')
    })

    it('should remove iframe tags', () => {
      const dirty = '<p>Content</p><iframe src="evil"></iframe>'
      const clean = sanitizeHtml(dirty)
      expect(clean).not.toContain('<iframe>')
    })

    it('should preserve safe HTML', () => {
      const safe = '<p>Hello <strong>World</strong></p>'
      const result = sanitizeHtml(safe)
      expect(result).toContain('Hello')
      expect(result).toContain('World')
    })
  })

  describe('buildVariables', () => {
    it('should build variables from CV and job', () => {
      const cv = {
        id: '1',
        personalInfo: {
          firstName: 'John',
          middleName: '',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234',
          phoneCountryCode: '+1',
          location: { city: 'NYC' },
        },
        skills: [
          { id: '1', name: 'JavaScript', category: 'Technical', level: 'Advanced' },
          { id: '2', name: 'React', category: 'Framework', level: 'Expert' },
        ],
        experience: [],
        education: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const job = {
        title: 'Frontend Developer',
        company: 'Acme Inc',
        recruiterName: 'Jane Smith',
      }

      const vars = buildVariables({ cv, job })

      expect(vars.Role).toBe('Frontend Developer')
      expect(vars.Company).toBe('Acme Inc')
      expect(vars.RecruiterName).toBe('Jane Smith')
      expect(vars.Skills).toContain('JavaScript')
      expect(vars.Skills).toContain('React')
    })

    it('should use defaults when job is not provided', () => {
      const cv = {
        id: '1',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234',
          phoneCountryCode: '+1',
          location: {},
        },
        skills: [],
        experience: [],
        education: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const vars = buildVariables({ cv })

      expect(vars.Role).toBe('')
      expect(vars.Company).toBe('')
      expect(vars.RecruiterName).toBe('Hiring Manager')
    })
  })

  describe('toPlain', () => {
    it('should convert HTML to plain text', () => {
      const html = '<p>Hello World</p><p>Second paragraph</p>'
      const plain = toPlain(html)
      expect(plain).toContain('Hello World')
      expect(plain).toContain('Second paragraph')
      expect(plain).not.toContain('<p>')
    })

    it('should handle br tags as newlines', () => {
      const html = 'Line 1<br>Line 2<br/>Line 3'
      const plain = toPlain(html)
      expect(plain).toContain('Line 1\n')
      expect(plain).toContain('Line 2\n')
    })

    it('should trim whitespace', () => {
      const html = '  <p>  Text  </p>  '
      const plain = toPlain(html)
      expect(plain.trim()).toBe('Text')
    })
  })

  describe('escapeHtml', () => {
    it('should escape special characters', () => {
      const text = '<script>alert("xss")</script>'
      const escaped = escapeHtml(text)
      expect(escaped).toContain('&lt;')
      expect(escaped).toContain('&gt;')
      expect(escaped).not.toContain('<script>')
    })

    it('should escape quotes', () => {
      const text = `He said "hello" and 'goodbye'`
      const escaped = escapeHtml(text)
      expect(escaped).toContain('&quot;')
      expect(escaped).toContain('&#039;')
    })

    it('should escape ampersands', () => {
      const text = 'A & B'
      const escaped = escapeHtml(text)
      expect(escaped).toContain('&amp;')
    })
  })
})
