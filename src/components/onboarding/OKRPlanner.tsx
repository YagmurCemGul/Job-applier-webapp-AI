/**
 * @fileoverview OKR planner with objectives and key results.
 * @module components/onboarding/OKRPlanner
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import type { Objective, KeyResult } from '@/types/okr.types';
import { objectiveProgress } from '@/services/onboarding/okr.service';

interface Props {
  objectives: Objective[];
  onAdd: (o: Objective) => void;
  onUpdate: (id: string, patch: Partial<Objective>) => void;
}

/**
 * OKRPlanner - define and track objectives and key results.
 */
export function OKRPlanner({ objectives, onAdd, onUpdate }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Objective | null>(null);

  const confidenceColor = (c: number) => {
    if (c >= 4) return 'bg-green-100 text-green-800';
    if (c >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t('onboarding.okrs')}
          </h2>
          <p className="text-slate-600 mt-1">
            {objectives.length} objective{objectives.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
          {t('onboarding.addObjective')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {objectives.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="pt-6">
              <p className="text-center text-slate-500">
                No objectives yet. Add one to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          objectives.map((obj) => {
            const progress = objectiveProgress(obj);
            return (
              <Card
                key={obj.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelected(obj)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg flex-1">{obj.title}</CardTitle>
                    <Badge className={confidenceColor(obj.confidence)}>
                      {obj.confidence}/5
                    </Badge>
                  </div>
                  <CardDescription>{obj.owner}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-medium">
                      {(progress * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress * 100} className="h-2" />
                  <p className="text-xs text-slate-500">
                    {obj.krs.length} key result{obj.krs.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{selected.title}</CardTitle>
            <CardDescription>Key Results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected.krs.map((kr) => {
              const pct = kr.target
                ? Math.min(100, (kr.current / kr.target) * 100)
                : 0;
              return (
                <div key={kr.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium flex-1">{kr.label}</span>
                    <span className="text-sm text-slate-600 shrink-0">
                      {kr.current} / {kr.target} {kr.unit || ''}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
            {selected.krs.length === 0 && (
              <p className="text-sm text-slate-500">No key results yet.</p>
            )}
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
              {t('onboarding.addKeyResult')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
