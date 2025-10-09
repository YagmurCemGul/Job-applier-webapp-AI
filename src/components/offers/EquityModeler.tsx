/**
 * @fileoverview Equity modeling component for Step 44
 * @module components/offers/EquityModeler
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { scheduleVesting } from '@/services/equity/vesting.service';
import { valuationDetail } from '@/services/equity/valuation.service';
import type { VestingSchedule } from '@/types/offer.types.step44';

/**
 * Equity vesting and valuation modeler
 */
export function EquityModeler() {
  const { t } = useTranslation();
  
  const [shares, setShares] = useState(1000);
  const [price, setPrice] = useState(50);
  const [growthPct, setGrowthPct] = useState(10);
  const [years, setYears] = useState(4);
  const [cliffMonths, setCliffMonths] = useState(12);
  const [schedule, setSchedule] = useState<VestingSchedule>('monthly');
  const [volatilityPct, setVolatilityPct] = useState(20);

  const vesting = useMemo(() => {
    return scheduleVesting({
      kind: 'rsu',
      totalShares: shares,
      years,
      cliffMonths,
      schedule
    });
  }, [shares, years, cliffMonths, schedule]);

  const valuation = useMemo(() => {
    return valuationDetail(vesting, {
      currentPrice: price,
      growthRatePct: growthPct,
      volatilityPct
    });
  }, [vesting, price, growthPct, volatilityPct]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.equity', 'Equity Modeler')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              <Label>Growth Rate (%)</Label>
              <Input
                type="number"
                value={growthPct}
                onChange={(e) => setGrowthPct(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Vesting Years</Label>
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cliff (months)</Label>
              <Input
                type="number"
                value={cliffMonths}
                onChange={(e) => setCliffMonths(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select value={schedule} onValueChange={(v) => setSchedule(v as VestingSchedule)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semiannual">Semi-annual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Volatility (%)</Label>
              <Input
                type="number"
                value={volatilityPct}
                onChange={(e) => setVolatilityPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-md">
            <div>
              <div className="text-sm text-muted-foreground">Total Gross</div>
              <div className="text-lg font-semibold">${valuation.totalGross.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Low Band</div>
              <div className="text-lg">${valuation.lowBand?.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">High Band</div>
              <div className="text-lg">${valuation.highBand?.toLocaleString()}</div>
            </div>
          </div>

          <div className="max-h-[300px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Cliff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {valuation.events.map((event, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{event.monthIndex}</TableCell>
                    <TableCell>{event.shares.toFixed(2)}</TableCell>
                    <TableCell>${event.amount.toLocaleString()}</TableCell>
                    <TableCell>{event.cliff ? '✓' : ''}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
