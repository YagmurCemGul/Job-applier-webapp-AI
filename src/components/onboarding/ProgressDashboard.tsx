/**
 * @fileoverview Progress dashboard with KPIs and charts.
 * @module components/onboarding/ProgressDashboard
 */

import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { OnboardingPlan } from '@/types/onboarding.types';
import type { Objective } from '@/types/okr.types';
import { objectiveProgress } from '@/services/onboarding/okr.service';

interface Props {
  plan: OnboardingPlan;
  okrs: Objective[];
}

/**
 * ProgressDashboard - visualize onboarding progress KPIs.
 */
export function ProgressDashboard({ plan, okrs }: Props) {
  const { t } = useTranslation();

  const tasksDone = plan.tasks.filter((t) => t.status === 'done').length;
  const tasksTotal = plan.tasks.length;
  const tasksPct = tasksTotal ? (tasksDone / tasksTotal) * 100 : 0;

  const okrAvg =
    okrs.length > 0
      ? (okrs.reduce((sum, o) => sum + objectiveProgress(o), 0) / okrs.length) * 100
      : 0;

  const nextDeadline = plan.tasks
    .filter((t) => t.dueISO && t.status !== 'done')
    .sort((a, b) => (a.dueISO! < b.dueISO! ? -1 : 1))[0];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('onboarding.dashboard')}
        </h2>
        <p className="text-slate-600 mt-1">Track your onboarding progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('onboarding.tasksCompleted')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasksDone} / {tasksTotal}
            </div>
            <Progress value={tasksPct} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('onboarding.okrProgress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{okrAvg.toFixed(0)}%</div>
            <Progress value={okrAvg} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('onboarding.evidence')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.evidence.length}</div>
            <p className="text-xs text-slate-600 mt-1">Items collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {t('onboarding.nextDeadline')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextDeadline ? (
              <>
                <div className="text-lg font-bold truncate">
                  {nextDeadline.title}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {new Date(nextDeadline.dueISO!).toLocaleDateString()}
                </p>
              </>
            ) : (
              <div className="text-sm text-slate-500">No upcoming deadlines</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Milestones</CardTitle>
          <CardDescription>30/60/90 day targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plan.milestones.map((m) => {
              const tasks = plan.tasks.filter((t) => t.milestoneId === m.id);
              const done = tasks.filter((t) => t.status === 'done').length;
              const pct = tasks.length ? (done / tasks.length) * 100 : 0;
              return (
                <div key={m.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.title}</span>
                    <span className="text-sm text-slate-600">
                      {done} / {tasks.length} tasks
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  {m.summary && (
                    <p className="text-xs text-slate-600">{m.summary}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
