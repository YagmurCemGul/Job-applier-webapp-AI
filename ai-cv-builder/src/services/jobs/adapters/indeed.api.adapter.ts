/**
 * Indeed API Adapter
 * Step 32 - Stub for Indeed Publisher API integration
 * 
 * Note: This is a stub. To use Indeed's Publisher API:
 * 1. Apply for Indeed Publisher program
 * 2. Obtain Publisher ID
 * 3. Use documented search endpoints
 * 4. Comply with Indeed's terms of service
 * 
 * Documentation: https://opensource.indeedeng.io/api-documentation/
 */

import type { SourceConfig, JobRaw } from '@/types/jobs.types';

/**
 * Fetch jobs from Indeed API
 * Currently returns empty - requires Publisher ID
 */
export async function fetchIndeedAPI(source: SourceConfig): Promise<JobRaw[]> {
  // Stub: Replace with actual Indeed API implementation
  // Example endpoint: http://api.indeed.com/ads/apisearch
  
  const publisherId = source.params?.publisherId;
  if (!publisherId) {
    console.warn('Indeed Publisher ID not configured');
    return [];
  }
  
  // TODO: Implement actual Indeed API calls
  // For now, return empty array
  return [];
}
