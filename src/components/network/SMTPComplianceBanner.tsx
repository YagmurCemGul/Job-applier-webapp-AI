/**
 * @fileoverview SMTP compliance and ethics banner
 * @module components/network/SMTPComplianceBanner
 */

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

export function SMTPComplianceBanner() {
  const { t } = useTranslation();
  
  return (
    <Alert role="status" aria-live="polite">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {t('network.compliance')}
      </AlertDescription>
    </Alert>
  );
}
