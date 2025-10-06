import type { ApplyPayload, ApplyLogEntry } from '@/types/apply.types'
import { useApplicationsStore } from '@/store/applicationsStore'
import { applyCompliance } from './compliance.service'
import { applyThrottle } from './throttle.service'
import { sendToExtension } from './messageBus.service'

type Mapper = (args: any) => ApplyPayload

const MAPPERS: Record<string, () => Promise<Mapper>> = {
  greenhouse: async () => (await import('./forms/greenhouse.mapper')).mapGreenhouse,
  lever: async () => (await import('./forms/lever.mapper')).mapLever,
  workday: async () => (await import('./forms/workday.mapper')).mapWorkday,
  indeed: async () => (await import('./forms/indeed.mapper')).mapIndeed,
  linkedin: async () => (await import('./forms/linkedin.mapper')).mapLinkedIn,
}

/**
 * Auto-apply orchestrator
 * Compliance → prepare payload → throttle → submit (stub) → logs & application creation
 */
export async function autoApply(opts: {
  platform: keyof typeof MAPPERS
  jobUrl: string
  company?: string
  role?: string
  mapperArgs: any
  optIn: boolean
}): Promise<string> {
  const compliance = applyCompliance.check(opts.optIn)
  if (!compliance.ok) {
    throw new Error('Auto-apply requires explicit opt-in.')
  }

  await applyThrottle(opts.platform)

  const map = await MAPPERS[opts.platform]()
  const payload = map(opts.mapperArgs)
  const appId = ensureApplicationRecord(opts, payload)

  try {
    // Send to extension with HMAC key
    // Note: In production, HMAC key should be stored securely
    const hmacKey = import.meta.env.VITE_EXTENSION_HMAC_KEY || ''

    const result = await sendToExtension('APPLY_START', payload, hmacKey)

    if (result.type === 'APPLY_RESULT') {
      if (result.payload.ok) {
        log(appId, 'info', result.payload.message || `Submitted to ${opts.platform}`, {
          jobUrl: opts.jobUrl,
          submitted: result.payload.submitted,
        })

        // Update stage & timestamps
        const { update } = useApplicationsStore.getState()
        update(appId, {
          appliedAt: new Date().toISOString(),
          stage: result.payload.submitted ? 'applied' : 'hold',
        })
      } else {
        log(appId, 'error', result.payload.message || 'Submission failed', {
          jobUrl: opts.jobUrl,
        })
      }
    }

    return appId
  } catch (error: any) {
    // Extension not installed or error - fallback to stub
    log(appId, 'warn', `Extension not available: ${error.message}. Using stub.`, {
      jobUrl: opts.jobUrl,
    })

    // Stub fallback
    await new Promise((r) => setTimeout(r, 500))
    log(appId, 'info', `Submitted (stub) to ${opts.platform}`, {
      jobUrl: opts.jobUrl,
    })

    const { update } = useApplicationsStore.getState()
    update(appId, { appliedAt: new Date().toISOString() })

    return appId
  }
}

function ensureApplicationRecord(opts: any, payload: ApplyPayload): string {
  const st = useApplicationsStore.getState()
  const id = st.create({
    jobUrl: opts.jobUrl,
    platform: opts.platform,
    company: opts.company ?? '',
    role: opts.role ?? '',
    stage: 'applied',
    files: payload.files ?? [],
    appliedAt: new Date().toISOString(),
  })
  return id
}

function log(
  appId: string,
  level: ApplyLogEntry['level'],
  message: string,
  meta?: Record<string, any>
): void {
  useApplicationsStore.getState().addLog(appId, {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    at: new Date().toISOString(),
    level,
    message,
    meta,
  })
}
