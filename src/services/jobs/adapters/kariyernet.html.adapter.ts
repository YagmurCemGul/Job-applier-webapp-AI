import type { SourceConfig, JobRaw } from '@/types/jobs.types'

/**
 * Kariyer.net HTML adapter (stub)
 *
 * REQUIRES legalMode=true and user-provided content
 * Turkish job board
 */
export async function fetchKariyerNetHTML(source: SourceConfig): Promise<JobRaw[]> {
  if (!source.legalMode) {
    throw new Error('legalMode required for html adapter')
  }

  const html = source.params?.html
  if (!html) return []

  // Conservative parser: extract job links
  const matches = Array.from(html.matchAll(/<a[^>]+href="([^"]*\/ilan\/[^"]+)"[^>]*>(.*?)<\/a>/gi))

  return matches.map((m, i) => ({
    id: `${m[1]}#${i}`,
    url: m[1],
    source: { name: 'kariyernet.html', kind: 'html', domain: 'kariyer.net' },
    title: strip(m[2]),
    fetchedAt: new Date().toISOString(),
    description: '',
  }))
}

function strip(s: string): string {
  return s.replace(/<[^>]+>/g, '').trim()
}
