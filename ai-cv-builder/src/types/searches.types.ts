/**
 * Saved Search & Alerts Types
 * Step 32 - Job discovery
 */

/**
 * Saved search with filters and alert configuration
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: string;                         // free text
  filters: {
    location?: string;
    remote?: boolean;
    minSalary?: number;
    currency?: string;
    employment?: string[];
    seniority?: string[];
    company?: string[];
    postedWithinDays?: number;
    requireKeywords?: string[];
    excludeKeywords?: string[];
  };
  alerts: { enabled: boolean; intervalMin: number }; // 15, 60, 1440...
  createdAt: string;
  updatedAt: string;
}
