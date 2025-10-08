/**
 * Kanban Board
 * Visual application pipeline across stages
 */

import { useApplicationsStore } from '@/stores/applications.store';
import KanbanColumn from './KanbanColumn';

const COLS = [
  { id: 'applied', name: 'Applied' },
  { id: 'viewed', name: 'Viewed' },
  { id: 'interview', name: 'Interview' },
  { id: 'offer', name: 'Offer' },
  { id: 'rejected', name: 'Rejected' },
  { id: 'hold', name: 'On-Hold' }
] as const;

export default function KanbanBoard() {
  const { items } = useApplicationsStore();

  return (
    <div className="grid md:grid-cols-3 xl:grid-cols-6 gap-3">
      {COLS.map(c => (
        <KanbanColumn
          key={c.id}
          title={c.name}
          stage={c.id}
          items={items.filter(i => i.stage === c.id)}
        />
      ))}
    </div>
  );
}
