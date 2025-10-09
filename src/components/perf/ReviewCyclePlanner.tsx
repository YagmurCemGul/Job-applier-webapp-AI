/**
 * Review Cycle Planner Component
 * 
 * Creates and manages review cycles with tasks and calendar integration.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { usePerf } from '@/stores/perf.store';
import { createCycle, scheduleCycleReminder } from '@/services/perf/reviewCycle.service';
import { Calendar, Send } from 'lucide-react';
import type { ReviewCycleKind } from '@/types/perf.types';

/**
 * Planner for creating and managing review cycles.
 */
export function ReviewCyclePlanner() {
  const { t } = useTranslation();
  const { cycles } = usePerf();
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<ReviewCycleKind>('mid_year');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tz, setTz] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleCreate = () => {
    const cycle = createCycle({
      kind,
      title: title || undefined,
      startISO: new Date(startDate).toISOString(),
      dueISO: new Date(dueDate).toISOString(),
      tz,
    });
    setShowForm(false);
  };

  const handleToggleTask = (cycleId: string, taskId: string) => {
    const cycle = cycles.find((c) => c.id === cycleId);
    if (!cycle) return;
    const updated = {
      ...cycle,
      tasks: cycle.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      ),
    };
    usePerf.getState().upsertCycle(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Review Cycles</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          Create Cycle
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Review Cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Kind</Label>
              <select
                id="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as ReviewCycleKind)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="mid_year">Mid-Year</option>
                <option value="year_end">Year-End</option>
                <option value="probation">Probation</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="H2 2025 Review"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={!startDate || !dueDate}>
              Create
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {cycles.map((cycle) => (
          <Card key={cycle.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>{cycle.title}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {cycle.kind}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Start: {new Date(cycle.startISO).toLocaleDateString()}</span>
                <span>Due: {new Date(cycle.dueISO).toLocaleDateString()}</span>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Tasks:</p>
                <div className="space-y-2">
                  {cycle.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <Checkbox
                        id={task.id}
                        checked={task.done}
                        onCheckedChange={() => handleToggleTask(cycle.id, task.id)}
                      />
                      <label htmlFor={task.id} className="flex-1 text-sm">
                        {task.title} <span className="text-muted-foreground">({task.owner})</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  {t('perf.createCalendar')}
                </Button>
                <Button variant="outline" size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  {t('perf.sendRequests')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
