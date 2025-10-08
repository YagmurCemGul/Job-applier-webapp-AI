/**
 * Upsert Service
 * Step 32 - Manages job insertion/update in store
 */

import { useJobsStore } from '@/stores/jobs.store';
import type { JobNormalized } from '@/types/jobs.types';

/**
 * Upsert jobs to store and return statistics
 */
export function upsertJobs(list: JobNormalized[]): { created: number; updated: number; skipped: number } {
  const before = useJobsStore.getState().items.length;
  useJobsStore.getState().upsertMany(list);
  const after = useJobsStore.getState().items.length;
  
  const created = Math.max(0, after - before);
  const updated = list.length - created;
  
  return { created, updated, skipped: 0 };
}
