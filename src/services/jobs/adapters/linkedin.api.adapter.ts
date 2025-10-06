import type { SourceConfig, JobRaw } from '@/types/jobs.types'

/**
 * LinkedIn API adapter (stub)
 *
 * To implement:
 * - Use official LinkedIn API with proper OAuth
 * - Respect rate limits
 * - Follow TOS
 *
 * For now, returns empty array unless configured
 */
export async function fetchLinkedInAPI(source: SourceConfig): Promise<JobRaw[]> {
  // Stub: Requires official API setup
  // Example: Use LinkedIn Jobs API endpoint
  // https://docs.microsoft.com/linkedin/talent/job-postings

  return []
}
