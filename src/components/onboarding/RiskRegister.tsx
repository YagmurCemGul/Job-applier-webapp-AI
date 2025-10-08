/**
 * @fileoverview Risk register placeholder component.
 * @module components/onboarding/RiskRegister
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

/**
 * RiskRegister - placeholder for risk tracking.
 */
export function RiskRegister() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {t('onboarding.riskRegister')}
        </h2>
        <p className="text-slate-600 mt-1">Track and mitigate risks</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-slate-500">
            Risk register feature coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
