/**
 * @fileoverview Offer comparison table component for Step 44
 * @module components/offers/OfferCompareTable
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOffers } from '@/stores/offers.store.step44';
import { compareOffer } from '@/services/offers/comparison.service';
import type { ComparisonHorizon } from '@/types/offer.types.step44';

/**
 * Multi-offer comparison with NPV and horizon controls
 */
export function OfferCompareTable() {
  const { t } = useTranslation();
  const { items } = useOffers();
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [horizon, setHorizon] = useState<ComparisonHorizon>({
    years: 4,
    discountRatePct: 3,
    growthRatePct: 10,
    taxRatePct: 30
  });
  const [targetCurrency, setTargetCurrency] = useState('USD');

  const comparisonRows = useMemo(() => {
    const selected = items.filter(o => selectedIds.has(o.id));
    return selected.map(o => compareOffer(o, horizon, targetCurrency));
  }, [items, selectedIds, horizon, targetCurrency]);

  const sortedRows = useMemo(() => {
    return [...comparisonRows].sort((a, b) => b.npv - a.npv);
  }, [comparisonRows]);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.compare', 'Compare Offers')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Discount Rate (%)</Label>
              <Input
                type="number"
                value={horizon.discountRatePct}
                onChange={(e) => setHorizon({ ...horizon, discountRatePct: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Growth Rate (%)</Label>
              <Input
                type="number"
                value={horizon.growthRatePct}
                onChange={(e) => setHorizon({ ...horizon, growthRatePct: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                value={horizon.taxRatePct}
                onChange={(e) => setHorizon({ ...horizon, taxRatePct: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Currency</Label>
              <Input
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Offers to Compare</Label>
            <div className="space-y-2">
              {items.map((offer) => (
                <div key={offer.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={offer.id}
                    checked={selectedIds.has(offer.id)}
                    onCheckedChange={() => toggleSelect(offer.id)}
                  />
                  <Label htmlFor={offer.id} className="cursor-pointer">
                    {offer.company} — {offer.role}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {sortedRows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>{t('offer.y1', 'Year 1')}</TableHead>
                  <TableHead>{t('offer.y2', 'Year 2')}</TableHead>
                  <TableHead>{t('offer.y4', 'Year 4')}</TableHead>
                  <TableHead>{t('offer.npv', 'NPV')}</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row) => (
                  <TableRow key={row.offerId}>
                    <TableCell className="font-medium">{row.company}</TableCell>
                    <TableCell>{row.currency} {row.y1Total.toLocaleString()}</TableCell>
                    <TableCell>{row.currency} {row.y2Total.toLocaleString()}</TableCell>
                    <TableCell>{row.currency} {row.y4Total.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">{row.currency} {row.npv.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.riskNote}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
