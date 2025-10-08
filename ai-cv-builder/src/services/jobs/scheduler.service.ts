/**
 * Scheduler Service
 * Step 32 - Periodic job fetching
 */

import { useJobSchedulerStore } from '@/stores/jobScheduler.store';
import { useJobSourcesStore } from '@/stores/jobSources.store';
import { runAllAdaptersOnce } from './adapters/runAll';

let timer: any = null;

/**
 * Start periodic job fetching
 */
export function startJobScheduler(): void {
  const { intervalMin } = useJobSchedulerStore.getState();
  stopJobScheduler();
  timer = setInterval(() => runTick(), intervalMin * 60 * 1000);
}

/**
 * Stop periodic job fetching
 */
export function stopJobScheduler(): void {
  if (timer) clearInterval(timer);
  timer = null;
}

/**
 * Run one fetch cycle
 */
async function runTick(): Promise<void> {
  const { sources } = useJobSourcesStore.getState();
  await runAllAdaptersOnce(sources.filter(s => s.enabled));
}
