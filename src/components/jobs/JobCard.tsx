import type { JobNormalized } from '@/types/jobs.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVariantsStore } from '@/store/variantsStore'
import { useEffect, useState } from 'react'
import { useJobsStore } from '@/store/jobsStore'
import { useATSStore } from '@/store/atsStore'
import { Send } from 'lucide-react'
import ApplyDialog from '@/components/applications/ApplyDialog'

export default function JobCard({ job }: { job: JobNormalized }) {
  const { activeId } = useVariantsStore()
  const { updateScore } = useJobsStore()
  const { result } = useATSStore()
  const missing = new Set(result?.missingKeywords ?? [])
  const [applyOpen, setApplyOpen] = useState(false)

  useEffect(() => {
    // Simple match score: title/company overlap with active variant summary/skills
    async function run() {
      try {
        const { useCVDataStore } = await import('@/store/cvDataStore')
        const cv = useCVDataStore.getState().currentCV
        if (!cv) return

        const hay = `${job.title} ${job.company} ${job.descriptionText}`.toLowerCase()
        const needles = (cv.skills ?? []).map((s: any) => (s.name ? s.name.toLowerCase() : ''))
        const hit = needles.filter((n: string) => hay.includes(n)).length
        const score = Math.min(1, hit / Math.max(3, needles.length || 1))
        updateScore(job.id, score)
      } catch {
        // Ignore errors
      }
    }
    run()
  }, [activeId, job.id, updateScore])

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-2 p-3">
        <div className="font-medium">{job.title}</div>
        <div className="text-xs text-muted-foreground">
          {job.company} • {job.location} {job.remote ? '• Remote' : ''}
        </div>
        {job.score !== undefined && <div className="text-xs">Match: {(job.score * 100) | 0}%</div>}
        <div className="line-clamp-3 text-xs">{job.descriptionText}</div>
        {!!missing.size && (
          <div className="flex flex-wrap gap-1">
            {[...missing].slice(0, 6).map((k) => (
              <span key={k} className="rounded-full border px-1 py-0.5 text-[10px]">
                {k}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={job.url} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={() => setApplyOpen(true)}>
            <Send className="mr-1 h-3 w-3" />
            Quick Apply
          </Button>
          <Button size="sm" variant="outline">
            Save
          </Button>
        </div>

        <ApplyDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          initialJobUrl={job.url}
          initialCompany={job.company}
          initialRole={job.title}
        />
      </CardContent>
    </Card>
  )
}
