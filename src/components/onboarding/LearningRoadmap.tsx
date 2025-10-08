/**
 * @fileoverview Learning roadmap placeholder component.
 * @module components/onboarding/LearningRoadmap
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

/**
 * LearningRoadmap - placeholder for learning path tracking.
 */
export function LearningRoadmap() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('onboarding.learning')}
        </h2>
        <p className="text-slate-600 mt-1">Track learning goals and resources</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-500">
            Learning roadmap feature coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
