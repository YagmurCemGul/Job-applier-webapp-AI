export interface SavedSearch {
  id: string
  name: string
  query: string
  filters: {
    location?: string
    remote?: boolean
    minSalary?: number
    currency?: string
    employment?: string[]
    seniority?: string[]
    company?: string[]
    postedWithinDays?: number
    requireKeywords?: string[]
    excludeKeywords?: string[]
  }
  alerts: { enabled: boolean; intervalMin: number }
  createdAt: string
  updatedAt: string
}
