import { useJobSchedulerStore } from '@/store/jobSchedulerStore'
import { useJobSourcesStore } from '@/store/jobSourcesStore'
import { runAllAdaptersOnce } from './adapters/runAll'

let timer: any = null

/**
 * Start the job scheduler
 */
export function startJobScheduler() {
  const { intervalMin } = useJobSchedulerStore.getState()
  stopJobScheduler()
  timer = setInterval(() => runTick(), intervalMin * 60 * 1000)
}

/**
 * Stop the job scheduler
 */
export function stopJobScheduler() {
  if (timer) clearInterval(timer)
  timer = null
}

/**
 * Run a single scheduler tick
 */
async function runTick() {
  const { sources } = useJobSourcesStore.getState()
  await runAllAdaptersOnce(sources.filter((s) => s.enabled))
}
