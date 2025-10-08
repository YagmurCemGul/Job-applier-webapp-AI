import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import type { JobPosting } from '@/types/jobPosting.types'
import { Button } from '@/components/ui/button'
import { useATSStore } from '@/stores/ats.store'
import { useJobsStore } from '@/stores/jobs.store'
import { useCVDataStore } from '@/stores/cvData.store'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink } from 'lucide-react'

interface JobDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: JobPosting | null
}

/**
 * Job detail drawer with full information and actions
 */
export default function JobDetailDrawer({ open, onOpenChange, job }: JobDetailDrawerProps) {
  const { setJobText, parseJob, analyze } = useATSStore()
  const { duplicate } = useJobsStore()
  const { currentCV } = useCVDataStore()

  if (!job) return null

  const handleAnalyze = async () => {
    setJobText(job.rawText)
    await parseJob()
    if (currentCV) {
      await analyze(currentCV)
    }
    onOpenChange(false)
  }

  const handleDuplicate = async () => {
    const newId = await duplicate(job.id)
    if (newId) {
      onOpenChange(false)
    }
  }

  const formatSalary = () => {
    if (!job.salary) return null
    const parts = []
    if (job.salary.min) parts.push(`${job.salary.min}`)
    if (job.salary.max) parts.push(`${job.salary.max}`)
    const range = parts.join(' - ')
    const currency = job.salary.currency ?? ''
    const period = job.salary.period
      ? ` / ${job.salary.period === 'y' ? 'year' : job.salary.period === 'm' ? 'month' : job.salary.period === 'd' ? 'day' : 'hour'}`
      : ''
    return `${range} ${currency}${period}`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{job.title}</SheetTitle>
          <SheetDescription className="text-base">{job.company}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Metadata */}
          <div className="space-y-3">
            {job.location && (
              <div className="text-sm">
                <span className="font-medium">Location:</span>{' '}
                <span className="text-muted-foreground">{job.location}</span>
              </div>
            )}

            {job.remoteType !== 'unknown' && (
              <div className="text-sm">
                <span className="font-medium">Remote Type:</span>{' '}
                <Badge variant="outline" className="ml-2">
                  {job.remoteType}
                </Badge>
              </div>
            )}

            {job.employmentType && (
              <div className="text-sm">
                <span className="font-medium">Employment:</span>{' '}
                <Badge variant="outline" className="ml-2">
                  {job.employmentType.replace('_', ' ')}
                </Badge>
              </div>
            )}

            {job.seniority && job.seniority !== 'na' && (
              <div className="text-sm">
                <span className="font-medium">Seniority:</span>{' '}
                <Badge variant="outline" className="ml-2">
                  {job.seniority}
                </Badge>
              </div>
            )}

            {formatSalary() && (
              <div className="text-sm">
                <span className="font-medium">Salary:</span>{' '}
                <span className="text-muted-foreground">{formatSalary()}</span>
              </div>
            )}

            {job.source?.url && (
              <div className="text-sm">
                <span className="font-medium">Source:</span>{' '}
                <a
                  href={job.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {job.source.site ?? 'View'}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {job.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.notes}</p>
            </div>
          )}

          {/* Raw text */}
          <div>
            <h4 className="font-medium mb-2">Job Description</h4>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-96 overflow-y-auto border rounded-md p-3 bg-muted/30">
              {job.rawText}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleAnalyze} className="flex-1">
              Analyze with current CV
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
