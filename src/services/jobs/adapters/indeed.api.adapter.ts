import type { SourceConfig, JobRaw } from '@/types/jobs.types'

/**
 * Indeed API adapter (stub)
 * 
 * To implement:
 * - Use Indeed Publisher API (https://www.indeed.com/publisher)
 * - Requires API key
 * - Follow Indeed TOS
 * 
 * For now, returns empty array unless configured
 */
export async function fetchIndeedAPI(source: SourceConfig): Promise<JobRaw[]> {
  // Stub: Requires Indeed Publisher API key
  
  return []
}
