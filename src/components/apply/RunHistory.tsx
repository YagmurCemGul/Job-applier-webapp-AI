/**
 * @fileoverview Run History component
 * @module components/apply/RunHistory
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApply } from '@/stores/apply.store';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { ApplyRun } from '@/types/apply.types';

export function RunHistory() {
  const { t } = useTranslation();
  const { runs, postings } = useApply();
  
  const stageIcons = {
    intake: <Clock className="h-4 w-4" />,
    qa: <Clock className="h-4 w-4" />,
    variants: <Clock className="h-4 w-4" />,
    mapping: <Clock className="h-4 w-4" />,
    autofill: <Clock className="h-4 w-4" />,
    review: <AlertCircle className="h-4 w-4" />,
    submitted: <CheckCircle className="h-4 w-4" />,
    failed: <XCircle className="h-4 w-4" />
  };
  
  const stageColors = {
    intake: 'bg-gray-500',
    qa: 'bg-blue-500',
    variants: 'bg-blue-500',
    mapping: 'bg-blue-500',
    autofill: 'bg-yellow-500',
    review: 'bg-yellow-500',
    submitted: 'bg-green-500',
    failed: 'bg-red-500'
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('apply.history')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {runs.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('apply.noHistory')}</p>
          )}
          {runs.map((run) => {
            const posting = postings.find(p => p.id === run.postingId);
            return (
              <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">
                    {posting?.company || 'Unknown'} — {posting?.role || 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(run.createdAt).toLocaleDateString()} • {run.audit.length} events
                  </div>
                </div>
                <Badge className={stageColors[run.stage]}>
                  {stageIcons[run.stage]}
                  <span className="ml-1">{t(`apply.stages.${run.stage}`)}</span>
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
