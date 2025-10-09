/**
 * @fileoverview Interview tracker board for Step 43
 * @module components/interview/TrackerBoard
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building, User, ExternalLink } from 'lucide-react';
import { useInterview } from '@/stores/interview.store';
import { formatInTimezone } from '@/services/integrations/timezone.service';

interface TrackerBoardProps {
  onUpdatePipeline?: (planId: string) => void;
  onUpdateApplication?: (planId: string) => void;
}

export function TrackerBoard({ onUpdatePipeline, onUpdateApplication }: TrackerBoardProps) {
  const { t } = useTranslation();
  const { plans, runs } = useInterview();

  const upcomingPlans = plans
    .filter(p => Date.parse(p.startISO) > Date.now())
    .sort((a, b) => Date.parse(a.startISO) - Date.parse(b.startISO));

  const pastPlans = plans
    .filter(p => Date.parse(p.startISO) <= Date.now())
    .sort((a, b) => Date.parse(b.startISO) - Date.parse(a.startISO));

  const getKindColor = (kind: string) => {
    const colors: Record<string, string> = {
      behavioral: 'bg-blue-500',
      system_design: 'bg-purple-500',
      coding: 'bg-green-500',
      product: 'bg-orange-500',
      design: 'bg-pink-500',
      analytics: 'bg-yellow-500',
      managerial: 'bg-red-500'
    };
    return colors[kind] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('interview.upcomingInterviews')}</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingPlans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('interview.noUpcoming')}</p>
          ) : (
            <div className="space-y-3">
              {upcomingPlans.map(plan => (
                <div key={plan.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{plan.company || t('interview.unknown')}</span>
                        <Badge className={getKindColor(plan.kind)}>{plan.kind}</Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {plan.role && <div>{plan.role}</div>}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatInTimezone(plan.startISO, plan.tz)}
                        </div>
                        {plan.interviewer && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {plan.interviewer}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {plan.pipelineItemId && (
                        <Button
                          onClick={() => onUpdatePipeline?.(plan.id)}
                          variant="outline"
                          size="sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('interview.pastInterviews')}</CardTitle>
        </CardHeader>
        <CardContent>
          {pastPlans.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('interview.noPast')}</p>
          ) : (
            <div className="space-y-3">
              {pastPlans.slice(0, 10).map(plan => {
                const run = runs.find(r => r.planId === plan.id);
                return (
                  <div key={plan.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{plan.company || t('interview.unknown')}</span>
                          <Badge className={getKindColor(plan.kind)}>{plan.kind}</Badge>
                          {run?.rubric && (
                            <Badge variant="outline">
                              {t('interview.score')}: {run.rubric.total.toFixed(1)}/4.0
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {formatInTimezone(plan.startISO, plan.tz)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
