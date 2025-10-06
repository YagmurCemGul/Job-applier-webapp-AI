import { describe, it, expect } from 'vitest'
import { generateCoverLetter } from '@/services/coverletter/clGenerator.service'
import type { CVData } from '@/types/cvData.types'

describe('clGenerator.service', () => {
  const mockCV: CVData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@test.com',
      phone: '+1234567890',
      location: 'San Francisco',
      firstName: 'John',
      lastName: 'Doe',
    },
    summary: 'Senior Software Engineer with 5 years experience',
    skills: [
      { id: '1', name: 'TypeScript', level: 4 },
      { id: '2', name: 'React', level: 5 },
    ],
    experience: [],
    education: [],
    projects: [],
  }

  it('should generate cover letter with fallback', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: { title: 'Backend Engineer', company: 'TechCorp', recruiterName: 'Jane Smith' },
    })

    expect(result.html).toBeTruthy()
    expect(result.html).toContain('<p>')
  })

  it('should inject variables into template', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: { title: 'Backend Engineer', company: 'TechCorp' },
    })

    expect(result.html).toContain('TechCorp')
    expect(result.html).toContain('Backend Engineer')
  })

  it('should handle EN language', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: { title: 'Engineer', company: 'Corp' },
    })

    expect(result.html).toContain('Dear')
  })

  it('should handle TR language', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'tr',
      templateId: 'cl-01',
      cv: mockCV,
      job: { title: 'Engineer', company: 'Corp' },
    })

    expect(result.html).toContain('Merhaba')
  })

  it('should apply friendly tone', async () => {
    const result = await generateCoverLetter({
      tone: 'friendly',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
    })

    expect(result.html).toBeTruthy()
  })

  it('should apply enthusiastic tone', async () => {
    const result = await generateCoverLetter({
      tone: 'enthusiastic',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
    })

    expect(result.html).toContain('!')
  })

  it('should handle short length', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'short',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
    })

    const paragraphs = result.html.split('<p>').length - 1
    expect(paragraphs).toBeLessThanOrEqual(7)
  })

  it('should handle long length', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'long',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
    })

    expect(result.html).toContain('P.S.')
  })

  it('should inject missing keywords', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: { title: 'Engineer', company: 'Corp', keywords: ['Docker', 'Kubernetes'] },
    })

    expect(result.html).toContain('Docker')
  })
})
