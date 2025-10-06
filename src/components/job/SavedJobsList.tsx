import { useEffect, useMemo, useState } from 'react'
import { useJobsStore } from '@/store/jobsStore'
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
import type { JobPosting } from '@/types/jobPosting.types'

/**
 * List of saved jobs with search, filters, and quick actions
 */
export default function SavedJobsList() {
  const { items, filter, setFilter, refresh, loading } = useJobsStore()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<JobPosting | null>(null)

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useMemo(() => {
    return items.filter((j) => {
      if (filter.favorite && !j.favorite) return false
      if (filter.status && filter.status !== 'all' && j.status !== filter.status) return false
      if (filter.site && j.source?.site !== filter.site) return false
      if (filter.q) {
        const q = filter.q.toLowerCase()
        const blob =
          `${j.title} ${j.company} ${j.location ?? ''} ${j.source?.site ?? ''} ${j.tags?.join(' ') ?? ''}`.toLowerCase()
        if (!blob.includes(q)) return false
      }
      return true
    })
  }, [items, filter])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="w-72"
          placeholder="Search title, company, tags…"
          onChange={(e) => setFilter({ q: e.target.value })}
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
          onBlur={(e) => setFilter({ site: e.target.value || undefined })}
        />

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filter.favorite}
            onChange={(e) => setFilter({ favorite: e.target.checked ? true : undefined })}
          />
          Favorites
        </label>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading...</div>}

      <div className="space-y-2">
        {filtered.map((j) => (
          <SavedJobRow
            key={j.id}
            j={j}
            onOpen={(jj) => {
              setCurrent(jj)
              setOpen(true)
            }}
          />
        ))}
        {!filtered.length && !loading && (
          <div className="text-sm text-muted-foreground">No saved jobs match filters.</div>
        )}
      </div>

      <JobDetailDrawer open={open} onOpenChange={setOpen} job={current} />
    </div>
  )
}
