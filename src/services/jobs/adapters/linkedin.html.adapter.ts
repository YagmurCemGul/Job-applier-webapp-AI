import type { SourceConfig, JobRaw } from '@/types/jobs.types'

/**
 * LinkedIn HTML adapter (stub)
 * 
 * REQUIRES legalMode=true and user-provided content
 * This is for testing or when user has explicit rights to fetch
 */
export async function fetchLinkedInHTML(
  source: SourceConfig
): Promise<JobRaw[]> {
  if (!source.legalMode) {
    throw new Error('legalMode required for html adapter')
  }

  const html = source.params?.html // test/fixture injection
  if (!html) return []

  // Extremely conservative parser: extract anchors with "/jobs/view/"
  const matches = Array.from(
    html.matchAll(/<a[^>]+href="([^"]*\/jobs\/view\/[^"]+)"[^>]*>(.*?)<\/a>/gi)
  )

  return matches.map((m, i) => ({
    id: `${m[1]}#${i}`,
    url: m[1],
    source: { name: 'linkedin.html', kind: 'html', domain: 'linkedin.com' },
    title: strip(m[2]),
    fetchedAt: new Date().toISOString(),
    description: ''
  }))
}

function strip(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim()
}
