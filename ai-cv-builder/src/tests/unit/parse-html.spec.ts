/**
 * Step 27: Unit tests for HTML parser
 */

import { describe, it, expect } from 'vitest'
import { parseJobHtml } from '@/services/jobs/parsing/parse-html'
import { extractJsonLd, extractMeta } from '@/services/jobs/parsing/readability'

describe('parseJobHtml', () => {
  it('should extract title from JSON-LD', async () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "JobPosting",
            "title": "Frontend Developer",
            "hiringOrganization": { "name": "TechCorp" }
          }
          </script>
        </head>
        <body>Some content</body>
      </html>
    `
    const result = await parseJobHtml(html, { url: 'https://example.com' })
    expect(result.title).toBe('Frontend Developer')
    expect(result.company).toBe('TechCorp')
    expect(result._conf?.title?.confidence).toBeGreaterThan(0.8)
  })

  it('should extract title from OG meta tags', async () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Backend Engineer" />
          <meta property="og:site_name" content="StartupCo" />
        </head>
        <body>Job description</body>
      </html>
    `
    const result = await parseJobHtml(html, { url: 'https://example.com' })
    expect(result.title).toBe('Backend Engineer')
    expect(result.company).toBe('StartupCo')
  })

  it('should prioritize JSON-LD over meta tags', async () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Wrong Title" />
          <script type="application/ld+json">
          {
            "@type": "JobPosting",
            "title": "Correct Title"
          }
          </script>
        </head>
        <body>Content</body>
      </html>
    `
    const result = await parseJobHtml(html)
    expect(result.title).toBe('Correct Title')
  })

  it('should strip scripts and styles from body', async () => {
    const html = `
      <html>
        <body>
          <script>alert('test')</script>
          <style>.test { color: red; }</style>
          <p>We are hiring a developer</p>
        </body>
      </html>
    `
    const result = await parseJobHtml(html)
    expect(result.sections.raw).not.toContain('<script>')
    expect(result.sections.raw).not.toContain('<style>')
    expect(result.sections.raw).toContain('hiring')
  })
})

describe('extractJsonLd', () => {
  it('should extract JobPosting schema', () => {
    const html = `
      <script type="application/ld+json">
      {
        "@type": "JobPosting",
        "title": "Software Engineer",
        "datePosted": "2024-01-15",
        "validThrough": "2024-02-15"
      }
      </script>
    `
    const result = extractJsonLd(html)
    expect(result.title).toBe('Software Engineer')
    expect(result.datePosted).toBe('2024-01-15')
  })

  it('should handle array of JSON-LD objects', () => {
    const html = `
      <script type="application/ld+json">
      [
        { "@type": "Organization", "name": "Test" },
        { "@type": "JobPosting", "title": "Developer" }
      ]
      </script>
    `
    const result = extractJsonLd(html)
    expect(result.title).toBe('Developer')
  })

  it('should return empty object for invalid JSON', () => {
    const html = '<script type="application/ld+json">invalid json</script>'
    const result = extractJsonLd(html)
    expect(result).toEqual({})
  })
})

describe('extractMeta', () => {
  it('should extract OG title and description', () => {
    const html = `
      <meta property="og:title" content="Job Title" />
      <meta property="og:description" content="Job Description" />
    `
    const result = extractMeta(html)
    expect(result.ogTitle).toBe('Job Title')
    expect(result.ogDescription).toBe('Job Description')
  })

  it('should extract page title', () => {
    const html = '<title>Software Engineer - TechCorp</title>'
    const result = extractMeta(html)
    expect(result.title).toBe('Software Engineer - TechCorp')
  })
})
