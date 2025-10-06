import type { SourceConfig, JobRaw } from '@/types/jobs.types'

/**
 * Glassdoor API adapter (stub)
 * 
 * To implement:
 * - Use Glassdoor API if available
 * - Requires API key and partnership
 * - Follow Glassdoor TOS
 * 
 * For now, returns empty array unless configured
 */
export async function fetchGlassdoorAPI(
  source: SourceConfig
): Promise<JobRaw[]> {
  // Stub: Requires Glassdoor API partnership
  
  return []
}
