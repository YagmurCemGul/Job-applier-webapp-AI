/**
 * @fileoverview Scenario simulator component for Step 44
 * @module components/offers/ScenarioSimulator
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { runScenarios } from '@/services/equity/scenarios.service';

/**
 * Scenario simulator with low/base/high projections
 */
export function ScenarioSimulator() {
  const { t } = useTranslation();
  
  const [shares, setShares] = useState(1000);
  const [price, setPrice] = useState(50);
  const [growthBase, setGrowthBase] = useState(10);
  const [growthLow, setGrowthLow] = useState(0);
  const [growthHigh, setGrowthHigh] = useState(20);
  const [years, setYears] = useState(4);
  const [volatility, setVolatility] = useState(20);

  const scenarios = useMemo(() => {
    return runScenarios({
      shares,
      price,
      growthBasePct: growthBase,
      growthLowPct: growthLow,
      growthHighPct: growthHigh,
      years,
      cliffMonths: 12,
      schedule: 'monthly',
      volatilityPct: volatility
    });
  }, [shares, price, growthBase, growthLow, growthHigh, years, volatility]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.scenarios', 'Scenario Simulator')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Shares</Label>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Price ($)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Base Growth (%)</Label>
              <Input
                type="number"
                value={growthBase}
                onChange={(e) => setGrowthBase(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Low Growth (%)</Label>
              <Input
                type="number"
                value={growthLow}
                onChange={(e) => setGrowthLow(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>High Growth (%)</Label>
              <Input
                type="number"
                value={growthHigh}
                onChange={(e) => setGrowthHigh(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Years</Label>
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Volatility (%)</Label>
              <Input
                type="number"
                value={volatility}
                onChange={(e) => setVolatility(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-red-50 dark:bg-red-950">
              <CardHeader>
                <CardTitle className="text-sm">Low Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${scenarios.low.totalGross.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Range: ${scenarios.low.lowBand?.toLocaleString()} - ${scenarios.low.highBand?.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <CardTitle className="text-sm">Base Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${scenarios.base.totalGross.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Range: ${scenarios.base.lowBand?.toLocaleString()} - ${scenarios.base.highBand?.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950">
              <CardHeader>
                <CardTitle className="text-sm">High Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${scenarios.high.totalGross.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Range: ${scenarios.high.lowBand?.toLocaleString()} - ${scenarios.high.highBand?.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
