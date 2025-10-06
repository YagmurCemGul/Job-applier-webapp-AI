import { describe, it, expect } from 'vitest'
import { parseJobText } from '@/services/jobs/parsing/parse-text'

describe('parse-text', () => {
  it('should parse job with title and company', async () => {
    const text = `Title: Senior Software Engineer
Company: TechCorp Inc

Requirements:
- TypeScript experience
- React knowledge`

    const result = await parseJobText(text)

    expect(result.title).toBe('Senior Software Engineer')
    expect(result.company).toBe('TechCorp Inc')
    expect(result.lang).toBe('en')
  })

  it('should detect Turkish language', async () => {
    const text = `Pozisyon: Yazılım Mühendisi
Şirket: TeknoŞirket

Gereksinimler:
- TypeScript deneyimi
- React bilgisi`

    const result = await parseJobText(text)

    expect(result.lang).toBe('tr')
    expect(result.company).toBe('TeknoŞirket')
  })

  it('should extract sections', async () => {
    const text = `Job Description

Responsibilities:
- Design systems
- Code reviews

Requirements:
- 5+ years experience
- Strong TypeScript`

    const result = await parseJobText(text)

    expect(result.sections.responsibilities).toHaveLength(2)
    expect(result.sections.requirements).toHaveLength(2)
    expect(result.sections.responsibilities?.[0]).toContain('Design')
  })

  it('should infer employment type and seniority', async () => {
    const text = 'Senior Full-time Software Engineer position'

    const result = await parseJobText(text)

    expect(result.employmentType).toBe('full_time')
    expect(result.seniority).toBe('senior')
  })

  it('should parse salary', async () => {
    const text = 'Salary: $120,000 - $180,000 per year'

    const result = await parseJobText(text)

    expect(result.salary?.min).toBe(120000)
    expect(result.salary?.max).toBe(180000)
    expect(result.salary?.currency).toBe('USD')
    expect(result.salary?.period).toBe('y')
  })

  it('should extract keywords', async () => {
    const text = `Requirements:
- TypeScript and React experience
- Node.js knowledge
- AWS cloud skills`

    const result = await parseJobText(text)

    expect(result.keywords).toContain('typescript')
    expect(result.keywords).toContain('react')
    expect(result.keywords).toContain('node')
    expect(result.keywords).toContain('aws')
  })

  it('should have confidence scores', async () => {
    const text = 'Title: Engineer\nCompany: Corp'

    const result = await parseJobText(text)

    expect(result._conf).toBeDefined()
    expect(result._conf?.overall).toBeGreaterThanOrEqual(0)
    expect(result._conf?.overall).toBeLessThanOrEqual(1)
  })
})
