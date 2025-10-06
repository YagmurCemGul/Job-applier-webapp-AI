import type { JobPosting } from '@/types/jobPosting.types'
import { Button } from '@/components/ui/button'
import { Star, Trash2 } from 'lucide-react'
import { useJobsStore } from '@/store/jobsStore'
import { useATSStore } from '@/store/atsStore'
import { useCVDataStore } from '@/store/cvDataStore'

interface SavedJobRowProps {
  j: JobPosting
  onOpen: (j: JobPosting) => void
}

/**
 * Individual row in saved jobs list with quick actions
 */
export default function SavedJobRow({ j, onOpen }: SavedJobRowProps) {
  const { toggleFavorite, remove } = useJobsStore()
  const { setJobText, parseJob, analyze } = useATSStore()
  const { currentCV } = useCVDataStore()

  const handleAnalyze = async () => {
    if (!currentCV) return
    setJobText(j.rawText)
    await parseJob()
    await analyze(currentCV)
  }

  return (
    <div className="flex items-center justify-between rounded-md border bg-background p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {j.title} <span className="text-muted-foreground">• {j.company}</span>
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {j.source?.site ?? '—'} {j.location ? `• ${j.location}` : ''}
          {j.remoteType !== 'unknown' && ` • ${j.remoteType}`}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label={j.favorite ? 'Unfavorite' : 'Favorite'}
          onClick={() => toggleFavorite(j.id)}
        >
          <Star className={j.favorite ? 'fill-current text-yellow-500' : ''} />
        </Button>

        <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={!currentCV}>
          Analyze
        </Button>

        <Button variant="outline" size="sm" onClick={() => onOpen(j)}>
          Open
        </Button>

        <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => remove(j.id)}>
          <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    </div>
  )
}
