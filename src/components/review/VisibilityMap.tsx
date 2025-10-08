/**
 * @fileoverview Visibility map showing stakeholder coverage gaps
 * Displays influence/interest grid with actionable suggestions
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Calendar } from 'lucide-react';
import { computeVisibilityGaps } from '@/services/review/visibilityMap.service';
import { Button } from '@/components/ui/button';

interface VisibilityMapProps {
  planId?: string;
  onSchedule1on1?: (email: string) => void;
}

/**
 * Show influence/interest grid with gaps from computeVisibilityGaps
 * Button to create 1:1 series (Step 38 integration)
 */
export function VisibilityMap({ planId, onSchedule1on1 }: VisibilityMapProps) {
  const { t } = useTranslation();
  const gaps = useMemo(() => computeVisibilityGaps(planId), [planId]);
  
  if (gaps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('review.visibility.noGaps', 'No visibility gaps detected. Great coverage!')}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <AlertCircle className="w-5 h-5" aria-hidden="true" />
        <h3 className="font-semibold">
          {t('review.visibility.gapsFound', { count: gaps.length, defaultValue: `${gaps.length} visibility gaps found` })}
        </h3>
      </div>
      
      <div className="space-y-3">
        {gaps.map((gap, idx) => (
          <div
            key={idx}
            className="border rounded-md p-4 bg-card flex items-start justify-between gap-4"
          >
            <div className="flex-1">
              <p className="font-medium">{gap.name}</p>
              <p className="text-sm text-muted-foreground">{gap.email}</p>
              <p className="text-sm mt-2 text-amber-700 dark:text-amber-300">
                💡 {gap.suggestion}
              </p>
            </div>
            
            {onSchedule1on1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSchedule1on1(gap.email)}
                aria-label={`Schedule 1:1 with ${gap.name}`}
              >
                <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                {t('review.visibility.schedule', 'Schedule')}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
