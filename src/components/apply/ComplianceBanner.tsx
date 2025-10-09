/**
 * @fileoverview Compliance Banner component
 * @module components/apply/ComplianceBanner
 */

import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

export function ComplianceBanner() {
  const { t } = useTranslation();
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-900">{t('apply.complianceTitle')}</h3>
          <p className="text-sm text-yellow-700 mt-1">{t('apply.compliance')}</p>
        </div>
      </div>
    </div>
  );
}
