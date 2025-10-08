/**
 * Auto-Apply Engine
 * Orchestrates the complete auto-apply workflow:
 * compliance → mapping → throttling → submission → logging
 */

import type { ApplyPayload, ApplyLogEntry } from '@/types/apply.types';
import { useApplicationsStore } from '@/stores/applications.store';
import { applyCompliance } from './compliance.service';
import { applyThrottle } from './throttle.service';
import { sendBusMessage } from './messageBus.service';

type Mapper = (args: any) => ApplyPayload;

const MAPPERS: Record<string, () => Promise<Mapper>> = {
  greenhouse: async () => (await import('./forms/greenhouse.mapper')).mapGreenhouse,
  lever: async () => (await import('./forms/lever.mapper')).mapLever,
  workday: async () => (await import('./forms/workday.mapper')).mapWorkday,
  indeed: async () => (await import('./forms/indeed.mapper')).mapIndeed,
  linkedin: async () => (await import('./forms/linkedin.mapper')).mapLinkedIn
};

/**
 * Execute auto-apply workflow
 */
export async function autoApply(opts: {
  platform: keyof typeof MAPPERS;
  jobUrl: string;
  company?: string;
  role?: string;
  mapperArgs: any;
  optIn: boolean;
}) {
  // Step 1: Compliance check
  const compliance = applyCompliance.check(opts.optIn);
  if (!compliance.ok) {
    throw new Error('Auto-apply requires explicit opt-in.');
  }

  // Step 2: Rate limiting
  await applyThrottle(opts.platform);

  // Step 3: Map to normalized payload
  const map = await MAPPERS[opts.platform]();
  const payload = map(opts.mapperArgs);

  // Step 4: Create application record
  const appId = ensureApplicationRecord(opts, payload);

  // Step 5: Send to extension (future) via message bus
  sendBusMessage({ type: 'APPLY_START', payload });

  // Step 6: Submission STUB (simulate success for now)
  await new Promise(r => setTimeout(r, 500));
  log(appId, 'info', `Submitted (stub) to ${opts.platform}`, { jobUrl: opts.jobUrl });

  // Step 7: Update timestamps
  const { update } = useApplicationsStore.getState();
  update(appId, { appliedAt: new Date().toISOString() });

  return appId;
}

/**
 * Create or update application record
 */
function ensureApplicationRecord(opts: any, payload: ApplyPayload) {
  const st = useApplicationsStore.getState();
  const id = st.create({
    jobUrl: opts.jobUrl,
    platform: opts.platform,
    company: opts.company ?? '',
    role: opts.role ?? '',
    stage: 'applied',
    files: payload.files ?? [],
    appliedAt: new Date().toISOString()
  });
  return id;
}

/**
 * Add log entry to application
 */
function log(
  appId: string,
  level: ApplyLogEntry['level'],
  message: string,
  meta?: Record<string, any>
) {
  useApplicationsStore.getState().addLog(appId, {
    id: crypto?.randomUUID?.() ?? String(Date.now()),
    at: new Date().toISOString(),
    level,
    message,
    meta
  });
}
