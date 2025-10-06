import type { Application, AppStage } from '@/types/applications.types'
import ApplicationCard from './ApplicationCard'

export default function KanbanColumn({
  title,
  stage,
  items,
}: {
  title: string
  stage: AppStage
  items: Application[]
}) {
  return (
    <div className="rounded-md border bg-background p-2">
      <div className="mb-2 text-sm font-semibold">
        {title} <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      <div className="space-y-2">
        {items.map((i) => (
          <ApplicationCard key={i.id} app={i} />
        ))}
        {!items.length && <div className="text-xs text-muted-foreground">—</div>}
      </div>
    </div>
  )
}
