/**
 * @fileoverview Plan builder for creating and modifying 30/60/90 plans.
 * @module components/onboarding/PlanBuilder
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus } from 'lucide-react';
import type { OnboardingPlan, PlanTask, TaskStatus } from '@/types/onboarding.types';
import { seedTasks, personalizeTasksWithAI } from '@/services/onboarding/planBuilder.service';

interface Props {
  plan: OnboardingPlan;
  onUpdate: (patch: Partial<OnboardingPlan>) => void;
  onAddTask: (task: PlanTask) => void;
  onUpdateTask: (taskId: string, patch: Partial<PlanTask>) => void;
}

/**
 * PlanBuilder - create and modify onboarding plans.
 */
export function PlanBuilder({ plan, onUpdate, onAddTask, onUpdateTask }: Props) {
  const { t } = useTranslation();
  const [personalizing, setPersonalizing] = useState(false);

  const handleSeedPlan = () => {
    const tasks = seedTasks(plan.role);
    tasks.forEach((task) => onAddTask(task));
  };

  const handlePersonalize = async () => {
    setPersonalizing(true);
    try {
      const enhanced = await personalizeTasksWithAI(plan.tasks, {
        role: plan.role,
        company: plan.company,
      });
      const newTasks = enhanced.filter(
        (t) => !plan.tasks.find((pt) => pt.id === t.id)
      );
      newTasks.forEach((task) => onAddTask(task));
    } finally {
      setPersonalizing(false);
    }
  };

  const statusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('onboarding.plan')}</h2>
        <p className="text-slate-600 mt-1">
          {plan.company} — {plan.role}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">{t('onboarding.role')}</Label>
          <Input
            id="role"
            value={plan.role}
            onChange={(e) => onUpdate({ role: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">{t('onboarding.company')}</Label>
          <Input
            id="company"
            value={plan.company}
            onChange={(e) => onUpdate({ company: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">{t('onboarding.startDate')}</Label>
          <Input
            id="startDate"
            type="date"
            value={plan.startDateISO?.split('T')[0] || ''}
            onChange={(e) =>
              onUpdate({ startDateISO: e.target.value ? new Date(e.target.value).toISOString() : undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retention">{t('onboarding.retention')}</Label>
          <Select
            value={String(plan.retentionDays)}
            onValueChange={(v) => onUpdate({ retentionDays: Number(v) as any })}
          >
            <SelectTrigger id="retention">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="60">60</SelectItem>
              <SelectItem value="90">90</SelectItem>
              <SelectItem value="180">180</SelectItem>
              <SelectItem value="365">365</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSeedPlan} variant="outline">
          {t('onboarding.seedPlan')}
        </Button>
        <Button
          onClick={handlePersonalize}
          disabled={personalizing}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {personalizing ? 'Personalizing...' : t('onboarding.aiPersonalize')}
        </Button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t('onboarding.tasks')}</h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t('onboarding.addTask')}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('onboarding.title')}</TableHead>
                <TableHead>{t('onboarding.status')}</TableHead>
                <TableHead>{t('onboarding.dueDate')}</TableHead>
                <TableHead>{t('onboarding.tags')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500">
                    No tasks yet. Click "Seed Plan" to get started.
                  </TableCell>
                </TableRow>
              ) : (
                plan.tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge className={statusColor(task.status)}>
                        {t(`onboarding.${task.status.replace('_', '')}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.dueISO
                        ? new Date(task.dueISO).toLocaleDateString()
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {task.tags?.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
