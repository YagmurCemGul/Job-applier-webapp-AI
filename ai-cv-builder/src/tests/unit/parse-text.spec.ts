/**
 * Step 27: Unit tests for text parser
 */

import { describe, it, expect } from 'vitest'
import { parseJobText } from '@/services/jobs/parsing/parse-text'

describe('parseJobText', () => {
  it('should parse job title from labeled field', async () => {
    const text = 'Title: Senior Software Engineer\n\nWe are looking for...'
    const result = await parseJobText(text)
    expect(result.title).toBe('Senior Software Engineer')
    expect(result._conf?.title?.confidence).toBeGreaterThan(0.5)
  })

  it('should parse company name', async () => {
    const text = 'Company: TechCorp Inc.\n\nWe are hiring...'
    const result = await parseJobText(text)
    expect(result.company).toBe('TechCorp Inc.')
  })

  it('should parse location', async () => {
    const text = 'Location: Istanbul, Turkey\n\nRemote position...'
    const result = await parseJobText(text)
    expect(result.location).toBe('Istanbul, Turkey')
  })

  it('should detect remote work type', async () => {
    const text = 'This is a remote position. Work from home.'
    const result = await parseJobText(text)
    expect(result.remoteType).toBe('remote')
  })

  it('should detect hybrid work type', async () => {
    const text = 'Hybrid work model - 3 days in office, 2 days remote.'
    const result = await parseJobText(text)
    expect(result.remoteType).toBe('hybrid')
  })

  it('should parse salary range', async () => {
    const text = 'Salary: $80,000 - $120,000 per year'
    const result = await parseJobText(text)
    expect(result.salary?.min).toBe(80000)
    expect(result.salary?.max).toBe(120000)
    expect(result.salary?.currency).toBe('USD')
    expect(result.salary?.period).toBe('y')
  })

  it('should split sections', async () => {
    const text = `
      Summary:
      We are looking for a great developer.

      Requirements:
      - 5+ years of experience
      - Strong JavaScript skills

      Benefits:
      - Health insurance
      - Remote work
    `
    const result = await parseJobText(text)
    expect(result.sections.summary).toContain('great developer')
    expect(result.sections.requirements).toHaveLength(2)
    expect(result.sections.benefits).toHaveLength(2)
  })

  it('should detect language as English', async () => {
    const text = 'We are looking for a software engineer'
    const result = await parseJobText(text)
    expect(result.lang).toBe('en')
  })

  it('should detect language as Turkish', async () => {
    const text = 'Yazılım mühendisi arıyoruz. İstanbul lokasyonunda.'
    const result = await parseJobText(text)
    expect(result.lang).toBe('tr')
  })

  it('should extract keywords', async () => {
    const text = `
      Requirements:
      - React and TypeScript
      - Node.js experience
      - AWS knowledge
    `
    const result = await parseJobText(text)
    expect(result.keywords).toContain('react')
    expect(result.keywords.length).toBeGreaterThan(0)
  })

  it('should infer employment type', async () => {
    const text = 'Full-time position with benefits'
    const result = await parseJobText(text)
    expect(result.employmentType).toBe('full_time')
  })

  it('should infer seniority level', async () => {
    const text = 'Senior Software Engineer position'
    const result = await parseJobText(text)
    expect(result.seniority).toBe('senior')
  })

  it('should parse recruiter email', async () => {
    const text = 'Contact us at jobs@techcorp.com'
    const result = await parseJobText(text)
    expect(result.recruiter?.email).toBe('jobs@techcorp.com')
  })
})
