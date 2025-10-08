/**
 * Alerts Service
 * Step 32 - Evaluates saved searches for new job matches
 */

import { useJobSearchesStore } from '@/stores/jobSearches.store';
import { useJobsStore } from '@/stores/jobs.store';
import { search } from './searchIndex.service';
import type { JobNormalized } from '@/types/jobs.types';
import type { SavedSearch } from '@/types/searches.types';

/**
 * Evaluate all active alerts and return matches
 */
export function evaluateAlerts(): Array<{ searchId: string; hits: string[] }> {
  const out: Array<{ searchId: string; hits: string[] }> = [];
  
  for (const s of useJobSearchesStore.getState().searches) {
    if (!s.alerts.enabled) continue;
    
    const ids = search(s.query);
    const jobs = useJobsStore.getState().items.filter(j => ids.includes(j.id));
    const filtered = jobs.filter(j => passFilters(j, s));
    
    if (filtered.length) {
      out.push({ searchId: s.id, hits: filtered.map(j => j.id) });
    }
  }
  
  return out;
}

/**
 * Check if job passes search filters
 */
function passFilters(j: JobNormalized, s: SavedSearch): boolean {
  // Location filter
  if (s.filters.location && !`${j.location}`.toLowerCase().includes(s.filters.location.toLowerCase())) {
    return false;
  }
  
  // Remote filter
  if (s.filters.remote === true && !j.remote) {
    return false;
  }
  
  // Company filter
  if (s.filters.company?.length && !s.filters.company.includes(j.company)) {
    return false;
  }
  
  // Posted within days filter
  if (s.filters.postedWithinDays) {
    const days = (Date.now() - new Date(j.postedAt ?? j.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (days > s.filters.postedWithinDays) {
      return false;
    }
  }
  
  // Required keywords
  if (s.filters.requireKeywords?.length) {
    const keywordSet = new Set(j.keywords ?? []);
    for (const k of s.filters.requireKeywords) {
      if (!keywordSet.has(k.toLowerCase())) {
        return false;
      }
    }
  }
  
  // Excluded keywords
  if (s.filters.excludeKeywords?.length) {
    const keywordSet = new Set(j.keywords ?? []);
    for (const k of s.filters.excludeKeywords) {
      if (keywordSet.has(k.toLowerCase())) {
        return false;
      }
    }
  }
  
  return true;
}
