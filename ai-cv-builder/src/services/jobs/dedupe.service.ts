/**
 * Deduplication Service
 * Step 32 - Removes duplicate job postings
 */

import type { JobNormalized } from '@/types/jobs.types';

/**
 * Deduplicate jobs by fingerprint, keeping richer entries
 */
export function dedupe(list: JobNormalized[]): JobNormalized[] {
  const seen = new Map<string, JobNormalized>();
  
  for (const j of list) {
    const prev = seen.get(j.fingerprint);
    if (!prev) {
      seen.set(j.fingerprint, j);
      continue;
    }
    
    // Prefer richer entry (has more data)
    const score = richness(j);
    const prevScore = richness(prev);
    seen.set(j.fingerprint, score >= prevScore ? j : prev);
  }
  
  return Array.from(seen.values());
}

/**
 * Calculate richness score for a job posting
 */
function richness(j: JobNormalized): number {
  return (
    (j.salary ? 1 : 0) + 
    (j.postedAt ? 1 : 0) + 
    (j.descriptionText?.length ?? 0) / 500 + 
    (j.keywords?.length ?? 0) / 10
  );
}
