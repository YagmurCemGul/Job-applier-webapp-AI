import type { JobPosting } from '@/types/jobPosting.types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useATSStore } from '@/store/atsStore'
import { useJobsStore } from '@/store/jobsStore'
import { useCVDataStore } from '@/store/cvDataStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface JobDetailDrawerProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  job?: JobPosting | null
}

/**
 * Detail view drawer/dialog for a saved job posting
 */
export default function JobDetailDrawer({ open, onOpenChange, job }: JobDetailDrawerProps) {
  const { setJobText, parseJob, analyze, isAnalyzing } = useATSStore()
  const { duplicate } = useJobsStore()
  const { currentCV } = useCVDataStore()

  if (!job) return null

  const handleAnalyze = async () => {
    if (!currentCV) return
    setJobText(job.rawText)
    await parseJob()
    await analyze(currentCV)
    onOpenChange(false)
  }

  const handleDuplicate = async () => {
    await duplicate(job.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {job.title} • {job.company}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {job.location && <Badge variant="outline">{job.location}</Badge>}
            {job.remoteType !== 'unknown' && <Badge variant="outline">{job.remoteType}</Badge>}
            {job.employmentType && <Badge variant="outline">{job.employmentType}</Badge>}
            {job.seniority && <Badge variant="outline">{job.seniority}</Badge>}
            {job.source?.site && <Badge variant="outline">{job.source.site}</Badge>}
          </div>

          {job.salary && (job.salary.min || job.salary.max) && (
            <div className="text-sm">
              <strong>Salary:</strong>{' '}
              {job.salary.min && `${job.salary.currency || ''} ${job.salary.min}`}
              {job.salary.min && job.salary.max && ' - '}
              {job.salary.max && `${job.salary.currency || ''} ${job.salary.max}`}
              {job.salary.period && ` / ${job.salary.period}`}
            </div>
          )}

          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {job.notes && (
            <div className="rounded-md bg-muted p-3">
              <strong className="text-sm">Notes:</strong>
              <p className="mt-1 text-sm">{job.notes}</p>
            </div>
          )}

          <div>
            <strong className="text-sm">Raw Text:</strong>
            <ScrollArea className="mt-2 h-64 rounded-md border p-3">
              <pre className="whitespace-pre-wrap text-sm">{job.rawText}</pre>
            </ScrollArea>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={!currentCV || isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Analyze with current CV'}
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              Duplicate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
