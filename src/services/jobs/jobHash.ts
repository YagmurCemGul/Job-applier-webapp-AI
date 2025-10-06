import { normalizeText } from '@/services/ats/textUtils'

/**
 * Generate a stable hash for job posting deduplication
 * Based on normalized text content and URL
 */
export function jobStableHash(rawText: string, url?: string): string {
  const s = `${normalizeText(rawText)}|${url ?? ''}`
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return String(h >>> 0)
}
