/**
 * @fileoverview Progress Tracker component (Step 45)
 * @module components/onboarding/ProgressTracker
 */

import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Plan } from '@/types/onboarding.types';

interface Props {
  plan?: Plan;
}

/**
 * Progress Tracker - visualize goal completion
 */
export function ProgressTracker({ plan }: Props) {
  const { t } = useTranslation();
  
  const goalsByMilestone = (milestone: 'd30' | 'd60' | 'd90') =>
    (plan?.goals ?? []).filter(g => g.milestone === milestone);
  
  const completedByMilestone = (milestone: 'd30' | 'd60' | 'd90') =>
    goalsByMilestone(milestone).filter(g => g.status === 'done').length;
  
  const progressByMilestone = (milestone: 'd30' | 'd60' | 'd90') => {
    const total = goalsByMilestone(milestone).length;
    return total > 0 ? Math.round((completedByMilestone(milestone) / total) * 100) : 0;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(['d30', 'd60', 'd90'] as const).map(milestone => {
          const total = goalsByMilestone(milestone).length;
          const completed = completedByMilestone(milestone);
          const progress = progressByMilestone(milestone);
          
          return (
            <div key={milestone} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{milestone.toUpperCase()} Day Goals</h4>
                <span className="text-sm text-muted-foreground">
                  {completed} / {total}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
