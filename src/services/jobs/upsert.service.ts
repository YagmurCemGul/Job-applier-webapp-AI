import { useJobsStore } from '@/store/jobsStore'
import type { JobNormalized } from '@/types/jobs.types'

/**
 * Upsert jobs into store and return stats
 */
export function upsertJobs(list: JobNormalized[]): {
  created: number
  updated: number
  skipped: number
} {
  const before = useJobsStore.getState().items.length
  useJobsStore.getState().upsertMany(list)
  const after = useJobsStore.getState().items.length

  const created = Math.max(0, after - before)
  const updated = list.length - created

  return { created, updated, skipped: 0 }
}
