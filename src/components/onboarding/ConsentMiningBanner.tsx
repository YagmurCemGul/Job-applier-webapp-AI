/**
 * @fileoverview Consent banner for calendar/email mining.
 * @module components/onboarding/ConsentMiningBanner
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onDismiss?: () => void;
}

/**
 * ConsentMiningBanner - displays consent and privacy info for calendar/email access.
 */
export function ConsentMiningBanner({ enabled, onToggle, onDismiss }: Props) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) return null;

  return (
    <Alert
      className="relative border-blue-200 bg-blue-50"
      role="status"
      aria-live="polite"
    >
      <AlertDescription className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-sm text-slate-700">
            {t('onboarding.consentMining')}
          </p>
          <div className="flex items-center gap-2">
            <Switch
              id="consent-toggle"
              checked={enabled}
              onCheckedChange={onToggle}
              aria-label={t('onboarding.consentToggle')}
            />
            <Label htmlFor="consent-toggle" className="text-sm font-normal">
              {t('onboarding.consentToggle')}
            </Label>
          </div>
          {enabled && (
            <p className="text-xs text-slate-600">
              {t('onboarding.consentWarning')}
            </p>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
