import type { FetchJobUrlResult } from '@/types/ats.types'

/**
 * Fetch job posting from URL
 * Server-aware fetch proxy with CORS handling
 */
export async function fetchJobUrl(url: string): Promise<FetchJobUrlResult> {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (!res.ok) return { ok: false, status: res.status, error: res.statusText }
    const html = await res.text()
    const text = extractTextFromHtml(html)
    return { ok: true, text }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'fetch error' }
  }
}

/**
 * Extract readable text from HTML
 * Tries to use meta tags first, then strips HTML tags
 */
function extractTextFromHtml(html: string): string {
  // Try OpenGraph description first
  const og = html.match(
    /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i
  )?.[1]
  if (og) return og

  // Try meta description
  const meta = html.match(
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i
  )?.[1]
  if (meta) return meta

  // Fallback: strip scripts, styles, and tags
  const noScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
  const text = noScripts
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text
}
