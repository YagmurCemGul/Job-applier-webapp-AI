import type { FetchJobUrlResult } from '@/types/job.types'

/**
 * Fetch job posting from URL
 * Note: CORS limitations may apply - consider server proxy for production
 */
export async function fetchJobUrl(url: string): Promise<FetchJobUrlResult> {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return { ok: false, status: res.status, error: res.statusText }
    const html = await res.text()
    const text = extractTextFromHtml(html)
    return { ok: true, text }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Fetch error' }
  }
}

function extractTextFromHtml(html: string) {
  // Try to extract OG description first
  const og = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i)?.[1]
  if (og) return og

  // Fallback: strip scripts/styles and tags
  const noScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
  const text = noScripts
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text
}
