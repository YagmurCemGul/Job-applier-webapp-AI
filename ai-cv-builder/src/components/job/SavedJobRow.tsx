import type { JobPosting } from '@/types/jobPosting.types'
import { Button } from '@/components/ui/button'
import { Star, Trash2 } from 'lucide-react'
import { useJobsStore } from '@/stores/jobs.store'
import { useATSStore } from '@/stores/ats.store'
import { useCVDataStore } from '@/stores/cvData.store'

interface SavedJobRowProps {
  job: JobPosting
  onOpen: (job: JobPosting) => void
}

/**
 * Single saved job row with quick actions
 */
export default function SavedJobRow({ job, onOpen }: SavedJobRowProps) {
  const { toggleFavorite, remove } = useJobsStore()
  const { setJobText, parseJob, analyze } = useATSStore()
  const { currentCV } = useCVDataStore()

  const handleAnalyze = async () => {
    setJobText(job.rawText)
    await parseJob()
    if (currentCV) {
      await analyze(currentCV)
    }
  }

  return (
    <div 
      data-job-row 
      className="flex items-center justify-between p-3 rounded-md border bg-background hover:bg-accent/50 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">
          {job.title}{' '}
          <span className="text-muted-foreground font-normal">• {job.company}</span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {job.source?.site ?? '—'}
          {job.location && ` • ${job.location}`}
          {job.remoteType !== 'unknown' && ` • ${job.remoteType}`}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label={job.favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={() => toggleFavorite(job.id)}
        >
          <Star
            className={`h-4 w-4 ${job.favorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
          />
        </Button>

        <Button variant="outline" size="sm" onClick={handleAnalyze}>
          Analyze
        </Button>

        <Button variant="outline" size="sm" onClick={() => onOpen(job)}>
          Open
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete job"
          onClick={() => remove(job.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
