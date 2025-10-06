import { useJobSearchesStore } from '@/store/jobSearchesStore'
import { useJobsStore } from '@/store/jobsStore'
import { search } from './searchIndex.service'
import type { SavedSearch, JobNormalized } from '@/types'

/**
 * Evaluate alerts for all saved searches
 */
export function evaluateAlerts(): Array<{ searchId: string; hits: string[] }> {
  const out: Array<{ searchId: string; hits: string[] }> = []

  for (const s of useJobSearchesStore.getState().searches) {
    if (!s.alerts.enabled) continue

    const ids = search(s.query)
    const jobs = useJobsStore.getState().items.filter((j) => ids.includes(j.id))
    const filtered = jobs.filter((j) => passFilters(j, s))

    if (filtered.length) {
      out.push({ searchId: s.id, hits: filtered.map((j) => j.id) })
    }
  }

  return out
}

/**
 * Check if job passes search filters
 */
function passFilters(j: JobNormalized, s: SavedSearch): boolean {
  if (
    s.filters.location &&
    !`${j.location}`.toLowerCase().includes(s.filters.location.toLowerCase())
  ) {
    return false
  }

  if (s.filters.remote === true && !j.remote) {
    return false
  }

  if (s.filters.company?.length && !s.filters.company.includes(j.company)) {
    return false
  }

  if (s.filters.postedWithinDays) {
    const d =
      (Date.now() - new Date(j.postedAt ?? j.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
    if (d > s.filters.postedWithinDays) return false
  }

  if (s.filters.requireKeywords?.length) {
    const set = new Set(j.keywords ?? [])
    for (const k of s.filters.requireKeywords) {
      if (!set.has(k.toLowerCase())) return false
    }
  }

  if (s.filters.excludeKeywords?.length) {
    const set = new Set(j.keywords ?? [])
    for (const k of s.filters.excludeKeywords) {
      if (set.has(k.toLowerCase())) return false
    }
  }

  return true
}
