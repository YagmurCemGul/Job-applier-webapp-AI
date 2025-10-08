/**
 * Glassdoor API Adapter
 * Step 32 - Stub for Glassdoor API integration
 * 
 * Note: This is a stub. Glassdoor does not have a public job search API.
 * Consider using:
 * 1. RSS feeds if available for specific companies
 * 2. Partner integrations
 * 3. User-provided HTML with explicit legal mode consent
 */

import type { SourceConfig, JobRaw } from '@/types/jobs.types';

/**
 * Fetch jobs from Glassdoor API
 * Currently returns empty - no public API available
 */
export async function fetchGlassdoorAPI(source: SourceConfig): Promise<JobRaw[]> {
  // Stub: Glassdoor does not provide a public job search API
  console.warn('Glassdoor API not available - consider using RSS or legal-mode HTML');
  return [];
}
