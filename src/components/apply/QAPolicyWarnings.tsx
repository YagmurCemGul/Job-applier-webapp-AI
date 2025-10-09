/**
 * @fileoverview Q&A Policy Warnings component
 * @module components/apply/QAPolicyWarnings
 */

import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield } from 'lucide-react';
import type { Screener } from '@/types/apply.types';

interface Props {
  screeners: Screener[];
}

export function QAPolicyWarnings({ screeners }: Props) {
  const { t } = useTranslation();
  
  const flaggedScreeners = screeners.filter(s => s.flags && s.flags.length > 0);
  
  if (flaggedScreeners.length === 0) return null;
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-900">{t('apply.policyWarnings')}</h3>
          <div className="space-y-2 mt-2">
            {flaggedScreeners.map((s) => (
              <div key={s.id} className="text-sm">
                <div className="font-medium">{s.prompt}</div>
                <div className="flex gap-1 mt-1">
                  {s.flags?.map(flag => (
                    <Badge key={flag} variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
