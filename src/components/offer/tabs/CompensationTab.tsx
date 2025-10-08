/**
 * @fileoverview Compensation calculator tab for Step 37
 * @module components/offer/tabs/CompensationTab
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { AlertCircle } from 'lucide-react';
import type { Offer, ValuationInputs, CurrencyCode, TotalCompResult } from '@/types/offer.types';
import { totalComp } from '@/services/offer/compMath.service';

interface CompensationTabProps {
  offer: Offer;
}

export function CompensationTab({ offer }: CompensationTabProps) {
  const { t } = useTranslation();

  const [inputs, setInputs] = useState<ValuationInputs>({
    horizonYears: 1,
    taxRatePct: 30,
    cocAdjustPct: 0,
    fxBase: offer.currency
  });

  const [results, setResults] = useState<Record<1 | 2 | 4, TotalCompResult | null>>({
    1: null,
    2: null,
    4: null
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateAll();
  }, [offer, inputs.taxRatePct, inputs.cocAdjustPct, inputs.fxBase]);

  const calculateAll = async () => {
    setLoading(true);
    try {
      const [result1, result2, result4] = await Promise.all([
        totalComp(offer, { ...inputs, horizonYears: 1 }),
        totalComp(offer, { ...inputs, horizonYears: 2 }),
        totalComp(offer, { ...inputs, horizonYears: 4 })
      ]);

      setResults({ 1: result1, 2: result2, 4: result4 });
    } catch (error) {
      console.error('Failed to calculate compensation:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`;
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t('offer.estimates')}</AlertDescription>
      </Alert>

      {/* Calculator Controls */}
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.compensation.calculator')}</CardTitle>
          <CardDescription>Adjust assumptions to see impact on total compensation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>{t('offer.compensation.taxRate')}: {inputs.taxRatePct}%</Label>
            <Slider
              value={[inputs.taxRatePct ?? 30]}
              onValueChange={([v]) => setInputs({ ...inputs, taxRatePct: v })}
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('offer.compensation.colAdjust')}: {inputs.cocAdjustPct}%</Label>
            <Slider
              value={[inputs.cocAdjustPct ?? 0]}
              onValueChange={([v]) => setInputs({ ...inputs, cocAdjustPct: v })}
              min={-50}
              max={50}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('offer.compensation.fxBase')}</Label>
            <Select
              value={inputs.fxBase}
              onValueChange={(v) => setInputs({ ...inputs, fxBase: v as CurrencyCode })}
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

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([1, 2, 4] as const).map((years) => {
          const result = results[years];
          return (
            <Card key={years}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {t(`offer.compensation.years${years}`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !result ? (
                  <div className="text-sm text-muted-foreground">Calculating...</div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Base</div>
                      <div className="font-medium">{formatCurrency(result.base, result.currency)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Bonus</div>
                      <div className="font-medium">{formatCurrency(result.bonus, result.currency)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Equity</div>
                      <div className="font-medium">{formatCurrency(result.equity, result.currency)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Benefits</div>
                      <div className="font-medium">{formatCurrency(result.benefits.annualValue, result.currency)}</div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">Gross Total</div>
                      <div className="text-lg font-bold">{formatCurrency(result.gross, result.currency)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">After Tax</div>
                      <div className="font-semibold text-green-600">{formatCurrency(result.postTax, result.currency)}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
