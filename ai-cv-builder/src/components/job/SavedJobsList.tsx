import { useEffect, useMemo, useState } from 'react'
import { useJobsStore } from '@/stores/jobs.store'
import SavedJobRow from './SavedJobRow'
import JobDetailDrawer from './JobDetailDrawer'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { JobPosting } from '@/types/jobPosting.types'

/**
 * Saved jobs list with search, filters, and quick actions
 */
export default function SavedJobsList() {
  const { items, filter, setFilter, refresh, loading } = useJobsStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)

  // Load jobs on mount
  useEffect(() => {
    refresh()
  }, [refresh])

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    return items.filter((job) => {
      // Favorite filter
      if (filter.favorite && !job.favorite) return false

      // Status filter
      if (filter.status && filter.status !== 'all' && job.status !== filter.status) {
        return false
      }

      // Site filter
      if (filter.site && job.source?.site !== filter.site) {
        return false
      }

      // Search filter
      if (filter.q) {
        const query = filter.q.toLowerCase()
        const searchText = [
          job.title,
          job.company,
          job.location,
          job.source?.site,
          ...(job.tags ?? []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!searchText.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [items, filter])

  const handleOpenJob = (job: JobPosting) => {
    setSelectedJob(job)
    setDrawerOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          className="w-72"
          placeholder="Search title, company, tags…"
          value={filter.q ?? ''}
          onChange={(e) => setFilter({ q: e.target.value || undefined })}
        />

        <Select
          value={filter.status ?? 'all'}
          onValueChange={(v) => setFilter({ status: v as any })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="saved">Saved</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Input
          className="w-40"
          placeholder="Site (linkedin…)"
          value={filter.site ?? ''}
          onBlur={(e) => setFilter({ site: e.target.value || undefined })}
          onChange={(e) => setFilter({ site: e.target.value || undefined })}
        />

        <div className="flex items-center gap-2">
          <Checkbox
            id="favorites-filter"
            checked={filter.favorite ?? false}
            onCheckedChange={(checked) => setFilter({ favorite: checked as boolean })}
          />
          <Label htmlFor="favorites-filter" className="text-sm cursor-pointer">
            Favorites only
          </Label>
        </div>
      </div>

      {/* Job list */}
      <div className="space-y-2">
        {loading && (
          <div className="text-sm text-muted-foreground text-center py-8">
            Loading jobs...
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">
            {items.length === 0
              ? 'No saved jobs yet. Start by parsing a job posting.'
              : 'No jobs match your filters.'}
          </div>
        )}

        {!loading &&
          filteredJobs.map((job) => (
            <SavedJobRow key={job.id} job={job} onOpen={handleOpenJob} />
          ))}
      </div>

      {/* Detail drawer */}
      <JobDetailDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        job={selectedJob}
      />
    </div>
  )
}
