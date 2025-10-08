/**
 * Kanban Column
 * Single column in the application pipeline
 */

import type { Application, AppStage } from '@/types/applications.types';
import ApplicationCard from './ApplicationCard';

interface KanbanColumnProps {
  title: string;
  stage: AppStage;
  items: Application[];
}

export default function KanbanColumn({ title, stage, items }: KanbanColumnProps) {
  return (
    <div className="border rounded-md p-2 bg-background">
      <div className="text-sm font-semibold mb-2">
        {title}{' '}
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      <div className="space-y-2">
        {items.map(i => (
          <ApplicationCard key={i.id} app={i} />
        ))}
        {!items.length && (
          <div className="text-xs text-muted-foreground">—</div>
        )}
      </div>
    </div>
  );
}
