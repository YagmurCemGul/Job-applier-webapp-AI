import type { JobNormalized } from '@/types/jobs.types'

/**
 * Deduplicate jobs based on fingerprint
 * Keeps the richer version when duplicates found
 */
export function dedupe(list: JobNormalized[]): JobNormalized[] {
  const seen = new Map<string, JobNormalized>()

  for (const j of list) {
    const prev = seen.get(j.fingerprint)
    if (!prev) {
      seen.set(j.fingerprint, j)
      continue
    }

    // Prefer richer one (has salary/postedAt/description)
    const score = richness(j)
    const pscore = richness(prev)
    seen.set(j.fingerprint, score >= pscore ? j : prev)
  }

  return Array.from(seen.values())
}

/**
 * Calculate richness score for a job
 */
function richness(j: JobNormalized): number {
  return (
    (j.salary ? 1 : 0) +
    (j.postedAt ? 1 : 0) +
    (j.descriptionText?.length ?? 0) / 500 +
    (j.keywords?.length ?? 0) / 10
  )
}
