import type { SourceConfig, JobRaw, JobNormalized, FetchLog } from '@/types/jobs.types'
import { compliance } from '../compliance.service'
import { normalizeJobs } from '../normalize.service'
import { dedupe } from '../dedupe.service'
import { upsertJobs } from '../upsert.service'
import { useJobsStore } from '@/store/jobsStore'
import * as rss from './rss.adapter'
import * as liApi from './linkedin.api.adapter'
import * as inApi from './indeed.api.adapter'
import * as gdApi from './glassdoor.api.adapter'
import * as liHtml from './linkedin.html.adapter'
import * as inHtml from './indeed.html.adapter'
import * as gdHtml from './glassdoor.html.adapter'
import * as knHtml from './kariyernet.html.adapter'

/**
 * Run all enabled adapters
 */
export async function runAllAdaptersOnce(sources: SourceConfig[]) {
  for (const s of sources) {
    await runOne(s)
  }
}

/**
 * Run a single adapter
 */
export async function runOne(source: SourceConfig) {
  const startedAt = new Date().toISOString()
  let created = 0
  let updated = 0
  let skipped = 0
  let ok = true
  let message = ''

  try {
    const c = compliance.canFetch(source)
    if (!c.ok) {
      throw new Error(`Compliance gate blocked: ${c.reason}`)
    }

    const raws: JobRaw[] = await fetchRaw(source)
    const norm: JobNormalized[] = normalizeJobs(raws)
    const unique = dedupe(norm)
    const stats = upsertJobs(unique)

    created = stats.created
    updated = stats.updated
    skipped = stats.skipped
  } catch (e: any) {
    ok = false
    message = e?.message ?? String(e)
  } finally {
    const log: FetchLog = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `log_${Date.now()}`,
      source: source.key,
      startedAt,
      finishedAt: new Date().toISOString(),
      ok,
      message,
      created,
      updated,
      skipped
    }
    useJobsStore.getState().addLog(log)
  }
}

/**
 * Route to appropriate adapter
 */
async function fetchRaw(s: SourceConfig): Promise<JobRaw[]> {
  switch (s.key) {
    case 'rss.generic':
      return rss.fetchRSS(s)
    case 'linkedin.api':
      return liApi.fetchLinkedInAPI(s)
    case 'indeed.api':
      return inApi.fetchIndeedAPI(s)
    case 'glassdoor.api':
      return gdApi.fetchGlassdoorAPI(s)
    case 'linkedin.html':
      return liHtml.fetchLinkedInHTML(s)
    case 'indeed.html':
      return inHtml.fetchIndeedHTML(s)
    case 'glassdoor.html':
      return gdHtml.fetchGlassdoorHTML(s)
    case 'kariyernet.html':
      return knHtml.fetchKariyerNetHTML(s)
    default:
      return []
  }
}
