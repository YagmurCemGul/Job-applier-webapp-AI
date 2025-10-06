import { useApplicationsStore } from '@/store/applicationsStore'
import KanbanColumn from './KanbanColumn'

const COLS = [
  { id: 'applied', name: 'Applied' },
  { id: 'viewed', name: 'Viewed' },
  { id: 'interview', name: 'Interview' },
  { id: 'offer', name: 'Offer' },
  { id: 'rejected', name: 'Rejected' },
  { id: 'hold', name: 'On-Hold' },
] as const

export default function KanbanBoard() {
  const { items } = useApplicationsStore()

  return (
    <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
      {COLS.map((c) => (
        <KanbanColumn
          key={c.id}
          title={c.name}
          stage={c.id as any}
          items={items.filter((i) => i.stage === c.id)}
        />
      ))}
    </div>
  )
}
