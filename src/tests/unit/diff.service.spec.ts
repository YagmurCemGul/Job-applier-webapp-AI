import { describe, it, expect } from 'vitest'
import { computeDiff } from '@/services/variants/diff.service'
import type { CVData } from '@/types/cvData.types'

describe('diff.service', () => {
  const baseCV: CVData = {
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com',
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
    experience: [
      {
        id: '1',
        position: 'Software Engineer',
        company: 'TechCorp',
        startDate: '2020-01-01',
        description: 'Built amazing products',
        current: true,
      },
    ],
    education: [
      {
        id: '1',
        degree: 'BS Computer Science',
        institution: 'University',
        graduationDate: '2018-06-01',
        description: 'Studied computer science',
      },
    ],
    projects: [],
  }

  it('should detect unchanged text', () => {
    const after = structuredClone(baseCV)
    const diff = computeDiff(baseCV, after)

    expect(diff.summary?.change).toBe('unchanged')
    expect(diff.contact?.change).toBe('unchanged')
  })

  it('should detect modified summary', () => {
    const after = structuredClone(baseCV)
    after.summary = 'Junior Software Engineer with 2 years experience'

    const diff = computeDiff(baseCV, after)

    expect(diff.summary?.change).toBe('modified')
    expect(diff.summary?.before).toContain('Senior')
    expect(diff.summary?.after).toContain('Junior')
  })

  it('should detect added text', () => {
    const after = structuredClone(baseCV)
    baseCV.summary = ''
    after.summary = 'New summary'

    const diff = computeDiff(baseCV, after)

    expect(diff.summary?.change).toBe('added')
  })

  it('should detect removed text', () => {
    const after = structuredClone(baseCV)
    after.summary = ''

    const diff = computeDiff(baseCV, after)

    expect(diff.summary?.change).toBe('removed')
  })

  it('should generate inline diff', () => {
    const after = structuredClone(baseCV)
    after.summary = 'Senior Backend Engineer with 5 years experience'

    const diff = computeDiff(baseCV, after)

    expect(diff.summary?.inline).toBeDefined()
    expect(diff.summary?.inline?.length).toBeGreaterThan(0)
  })

  it('should handle skills diff', () => {
    const after = structuredClone(baseCV)
    after.skills = [
      { id: '1', name: 'TypeScript', level: 4 },
      { id: '3', name: 'Vue', level: 3 },
    ]

    const diff = computeDiff(baseCV, after)

    expect(diff.skills?.change).toBe('modified')
  })

  it('should handle experience array diff', () => {
    const after = structuredClone(baseCV)
    after.experience[0].description = 'Built revolutionary products'

    const diff = computeDiff(baseCV, after)

    expect(diff.experience).toBeDefined()
    expect(diff.experience?.[0].change).toBe('modified')
  })

  it('should handle contact info changes', () => {
    const after = structuredClone(baseCV)
    after.personalInfo.email = 'newemail@example.com'

    const diff = computeDiff(baseCV, after)

    expect(diff.contact?.change).toBe('modified')
  })
})
