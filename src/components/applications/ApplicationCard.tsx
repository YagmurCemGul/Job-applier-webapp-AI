import type { Application } from '@/types/applications.types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApplicationsStore } from '@/store/applicationsStore'

export default function ApplicationCard({ app }: { app: Application }) {
  const { setStage, select } = useApplicationsStore()

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-2 p-3">
        <div className="line-clamp-1 font-medium">{app.role}</div>
        <div className="text-xs text-muted-foreground">{app.company}</div>
        {typeof app.score === 'number' && (
          <div className="text-xs">Match: {(app.score * 100) | 0}%</div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={app.jobUrl} target="_blank" rel="noreferrer">
              Open
            </a>
          </Button>
          <Button size="sm" variant="outline" onClick={() => select(app.id)}>
            Details
          </Button>
          <select
            className="rounded-md border px-1 text-xs"
            value={app.stage}
            onChange={(e) => setStage(app.id, e.target.value as any)}
          >
            <option value="applied">Applied</option>
            <option value="viewed">Viewed</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="hold">On-Hold</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
