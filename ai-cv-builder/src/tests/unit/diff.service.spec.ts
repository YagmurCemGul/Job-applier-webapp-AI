import { describe, it, expect } from 'vitest'
import { computeDiff } from '@/services/variants/diff.service'
import type { CVData } from '@/types/cvData.types'

describe('diff.service', () => {
  const createMockCV = (overrides?: Partial<CVData>): CVData => ({
    id: '1',
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0100',
      phoneCountryCode: '+1',
      location: { city: 'New York', country: 'USA' },
    },
    summary: 'Experienced developer',
    experience: [
      {
        id: '1',
        title: 'Developer',
        company: 'Acme',
        employmentType: 'Full-time',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2021-01-01'),
        currentlyWorking: false,
        description: 'Worked on web apps',
        skills: ['React', 'Node.js'],
      },
    ],
    education: [
      {
        id: '1',
        school: 'MIT',
        degree: 'BS',
        fieldOfStudy: 'CS',
        startDate: new Date('2016-01-01'),
        endDate: new Date('2020-01-01'),
        currentlyStudying: false,
        description: 'Computer Science degree',
      },
    ],
    skills: [
      { id: '1', name: 'JavaScript', category: 'Technical', level: 'Expert' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  })

  it('detects unchanged content', () => {
    const cv1 = createMockCV()
    const cv2 = createMockCV()
    const diff = computeDiff(cv1, cv2)

    expect(diff.summary?.change).toBe('unchanged')
    expect(diff.contact?.change).toBe('unchanged')
  })

  it('detects modified summary', () => {
    const cv1 = createMockCV({ summary: 'Old summary' })
    const cv2 = createMockCV({ summary: 'New summary' })
    const diff = computeDiff(cv1, cv2)

    expect(diff.summary?.change).toBe('modified')
    expect(diff.summary?.before).toBe('Old summary')
    expect(diff.summary?.after).toBe('New summary')
  })

  it('detects added summary', () => {
    const cv1 = createMockCV({ summary: undefined })
    const cv2 = createMockCV({ summary: 'New summary' })
    const diff = computeDiff(cv1, cv2)

    expect(diff.summary?.change).toBe('added')
  })

  it('detects removed summary', () => {
    const cv1 = createMockCV({ summary: 'Old summary' })
    const cv2 = createMockCV({ summary: undefined })
    const diff = computeDiff(cv1, cv2)

    expect(diff.summary?.change).toBe('removed')
  })

  it('detects skills changes', () => {
    const cv1 = createMockCV({
      skills: [{ id: '1', name: 'JavaScript', category: 'Technical', level: 'Expert' }],
    })
    const cv2 = createMockCV({
      skills: [
        { id: '1', name: 'JavaScript', category: 'Technical', level: 'Expert' },
        { id: '2', name: 'TypeScript', category: 'Technical', level: 'Advanced' },
      ],
    })
    const diff = computeDiff(cv1, cv2)

    expect(diff.skills?.change).toBe('modified')
  })

  it('provides inline word-level diff', () => {
    const cv1 = createMockCV({ summary: 'I am a developer' })
    const cv2 = createMockCV({ summary: 'I am a senior developer' })
    const diff = computeDiff(cv1, cv2)

    expect(diff.summary?.inline).toBeDefined()
    expect(diff.summary?.inline?.some((seg) => seg.change === 'added')).toBe(true)
  })

  it('handles experience array changes', () => {
    const cv1 = createMockCV()
    const cv2 = createMockCV({
      experience: [
        ...cv1.experience,
        {
          id: '2',
          title: 'Senior Developer',
          company: 'Acme',
          employmentType: 'Full-time',
          startDate: new Date('2021-01-01'),
          currentlyWorking: true,
          description: 'Lead developer',
          skills: ['React', 'TypeScript'],
        },
      ],
    })
    const diff = computeDiff(cv1, cv2)

    expect(diff.experience).toBeDefined()
    expect(diff.experience?.length).toBeGreaterThan(1)
  })
})
