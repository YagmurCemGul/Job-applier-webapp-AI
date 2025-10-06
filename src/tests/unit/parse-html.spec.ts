import { describe, it, expect } from 'vitest'
import { parseJobHtml } from '@/services/jobs/parsing/parse-html'

describe('parse-html', () => {
  it('should extract title from JSON-LD', async () => {
    const html = `<html>
<head>
  <script type="application/ld+json">
  {
    "@type": "JobPosting",
    "title": "Senior Engineer",
    "hiringOrganization": { "name": "TechCorp" }
  }
  </script>
</head>
<body>Some other text</body>
</html>`

    const result = await parseJobHtml(html, { url: 'https://example.com' })

    expect(result.title).toBe('Senior Engineer')
    expect(result.company).toBe('TechCorp')
  })

  it('should fallback to meta tags', async () => {
    const html = `<html>
<head>
  <meta property="og:title" content="Software Engineer Position" />
  <meta property="og:site_name" content="JobBoard Inc" />
</head>
<body>Job details</body>
</html>`

    const result = await parseJobHtml(html, { url: 'https://example.com' })

    expect(result.title).toBe('Software Engineer Position')
    expect(result.company).toBe('JobBoard Inc')
  })

  it('should extract text from body', async () => {
    const html = `<html>
<body>
  <h1>Product Manager</h1>
  <p>We are hiring</p>
  <section>
    <h2>Requirements</h2>
    <ul>
      <li>TypeScript</li>
      <li>React</li>
    </ul>
  </section>
</body>
</html>`

    const result = await parseJobHtml(html)

    expect(result.keywords).toContain('typescript')
    expect(result.keywords).toContain('react')
  })

  it('should set source type to url', async () => {
    const html = '<html><body>Job</body></html>'

    const result = await parseJobHtml(html, { url: 'https://linkedin.com', site: 'linkedin' })

    expect(result.source?.type).toBe('url')
    expect(result.source?.url).toBe('https://linkedin.com')
    expect(result.source?.site).toBe('linkedin')
  })
})
