/**
 * @fileoverview What-If analysis panel for Step 37
 * @module components/offer/WhatIfPanel
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings } from 'lucide-react';
import type { ValuationInputs, CurrencyCode } from '@/types/offer.types';

interface WhatIfPanelProps {
  inputs: ValuationInputs;
  onChange: (inputs: ValuationInputs) => void;
}

export function WhatIfPanel({ inputs, onChange }: WhatIfPanelProps) {
  const { t } = useTranslation();

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-4 w-4" />
          {t('offer.comparison.whatIf')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription className="text-xs">
            {t('offer.estimates')}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label>{t('offer.compensation.horizon')}</Label>
          <Select
            value={String(inputs.horizonYears)}
            onValueChange={(v) => onChange({ ...inputs, horizonYears: Number(v) as 1 | 2 | 4 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{t('offer.compensation.years1')}</SelectItem>
              <SelectItem value="2">{t('offer.compensation.years2')}</SelectItem>
              <SelectItem value="4">{t('offer.compensation.years4')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>
            {t('offer.compensation.taxRate')}: {inputs.taxRatePct ?? 30}%
          </Label>
          <Slider
            value={[inputs.taxRatePct ?? 30]}
            onValueChange={([v]) => onChange({ ...inputs, taxRatePct: v })}
            min={0}
            max={50}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Effective tax rate varies by jurisdiction
          </p>
        </div>

        <div className="space-y-2">
          <Label>
            {t('offer.compensation.colAdjust')}: {inputs.cocAdjustPct ?? 0}%
          </Label>
          <Slider
            value={[inputs.cocAdjustPct ?? 0]}
            onValueChange={([v]) => onChange({ ...inputs, cocAdjustPct: v })}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Adjust for cost of living differences
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t('offer.compensation.fxBase')}</Label>
          <Select
            value={inputs.fxBase ?? 'USD'}
            onValueChange={(v) => onChange({ ...inputs, fxBase: v as CurrencyCode })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="TRY">TRY</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
              <SelectItem value="CNY">CNY</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
              <SelectItem value="BRL">BRL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
