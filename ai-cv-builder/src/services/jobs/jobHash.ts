import { normalizeText } from '@/services/ats/textUtils'

/**
 * Generate stable hash for job posting dedupe
 * Based on normalized raw text + URL (if available)
 * 
 * Uses simple 32-bit hash for lightweight dedupe
 * Collision rate is acceptable for this use case
 */
export function jobStableHash(rawText: string, url?: string): string {
  const combined = `${normalizeText(rawText)}|${url ?? ''}`
  let hash = 0
  
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) | 0
  }
  
  // Return as unsigned 32-bit integer string
  return String(hash >>> 0)
}
