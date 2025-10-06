import type { SourceConfig, JobRaw } from '@/types/jobs.types'

/**
 * Glassdoor HTML adapter (stub)
 * 
 * REQUIRES legalMode=true and user-provided content
 */
export async function fetchGlassdoorHTML(
  source: SourceConfig
): Promise<JobRaw[]> {
  if (!source.legalMode) {
    throw new Error('legalMode required for html adapter')
  }

  const html = source.params?.html
  if (!html) return []

  // Conservative parser: extract job links
  const matches = Array.from(
    html.matchAll(/<a[^>]+href="([^"]*\/job-listing\/[^"]+)"[^>]*>(.*?)<\/a>/gi)
  )

  return matches.map((m, i) => ({
    id: `${m[1]}#${i}`,
    url: m[1],
    source: { name: 'glassdoor.html', kind: 'html', domain: 'glassdoor.com' },
    title: strip(m[2]),
    fetchedAt: new Date().toISOString(),
    description: ''
  }))
}

function strip(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim()
}
