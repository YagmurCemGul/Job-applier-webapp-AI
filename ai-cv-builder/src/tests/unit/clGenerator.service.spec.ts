/**
 * Cover Letter Generator Service Tests - Step 30
 */

import { describe, it, expect } from 'vitest'
import { generateCoverLetter } from '@/services/coverletter/clGenerator.service'

describe('clGenerator.service', () => {
  const mockCV = {
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
      { id: '1', name: 'TypeScript', category: 'Technical', level: 'Advanced' },
      { id: '2', name: 'React', category: 'Framework', level: 'Expert' },
    ],
    experience: [],
    education: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('should generate cover letter with fallback generator', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: {
        title: 'Senior Developer',
        company: 'TechCorp',
        recruiterName: 'Alice',
      },
    })

    expect(result).toBeDefined()
    expect(result.html).toBeTruthy()
    expect(result.html).toContain('<p>')
    expect(result.html).toContain('TechCorp')
    expect(result.html).toContain('Senior Developer')
  })

  it('should inject keywords from job', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: {
        title: 'Developer',
        company: 'Acme',
        keywords: ['Python', 'Docker', 'AWS'],
      },
    })

    expect(result.html).toMatch(/Python|Docker|AWS/i)
  })

  it('should adjust for Turkish language', async () => {
    const result = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'tr',
      templateId: 'cl-01',
      cv: mockCV,
      job: {
        title: 'Yazılım Geliştirici',
        company: 'Şirket',
        recruiterName: 'Ahmet',
      },
    })

    expect(result.html).toMatch(/Sayın|Saygılarımla/i)
  })

  it('should apply tone variations', async () => {
    const formal = await generateCoverLetter({
      tone: 'formal',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: { title: 'Dev', company: 'Co' },
    })

    const friendly = await generateCoverLetter({
      tone: 'friendly',
      length: 'medium',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
      job: { title: 'Dev', company: 'Co' },
    })

    expect(formal.html).not.toBe(friendly.html)
  })

  it('should apply length variations', async () => {
    const short = await generateCoverLetter({
      tone: 'formal',
      length: 'short',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
    })

    const long = await generateCoverLetter({
      tone: 'formal',
      length: 'long',
      lang: 'en',
      templateId: 'cl-01',
      cv: mockCV,
    })

    expect(long.html.length).toBeGreaterThan(short.html.length)
  })
})
