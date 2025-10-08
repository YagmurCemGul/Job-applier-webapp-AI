/**
 * @fileoverview Multi-offer comparison matrix for Step 37
 * @module components/offer/ComparisonMatrix
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download } from 'lucide-react';
import { useOffers } from '@/stores/offers.store';
import type { ValuationInputs, TotalCompResult } from '@/types/offer.types';
import { compareOffers } from '@/services/offer/compMath.service';
import { WhatIfPanel } from './WhatIfPanel';
import { exportOfferToPDF, generateOfferHTML } from '@/services/offer/docsExport.service';
import { toast } from 'sonner';

interface ComparisonMatrixProps {
  offerIds: string[];
  onClose: () => void;
}

export function ComparisonMatrix({ offerIds, onClose }: ComparisonMatrixProps) {
  const { t } = useTranslation();
  const { items } = useOffers();

  const offers = items.filter(o => offerIds.includes(o.id));

  const [inputs, setInputs] = useState<ValuationInputs>({
    horizonYears: 1,
    taxRatePct: 30,
    cocAdjustPct: 0,
    fxBase: 'USD'
  });

  const [results, setResults] = useState<Map<string, TotalCompResult>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculate();
  }, [offers, inputs]);

  const calculate = async () => {
    setLoading(true);
    try {
      const compResults = await compareOffers(offers, inputs);
      setResults(compResults);
    } catch (error) {
      console.error('Comparison failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRank = (offerId: string): number => {
    const sorted = Array.from(results.entries())
      .sort((a, b) => b[1].normalized - a[1].normalized);
    return sorted.findIndex(([id]) => id === offerId) + 1;
  };

  const handleExport = async () => {
    try {
      const html = generateComparisonHTML();
      await exportOfferToPDF(html, 'Offer_Comparison.pdf');
      toast.success('Exported comparison to PDF');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const generateComparisonHTML = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Offer Comparison</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 1200px; margin: 40px auto; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: bold; }
          .disclaimer { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Offer Comparison</h1>
        <div class="disclaimer">
          <strong>Disclaimer:</strong> Estimates only — not financial or tax advice.
        </div>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              ${offers.map(o => `<th>${o.company}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Role</td>
              ${offers.map(o => `<td>${o.role}</td>`).join('')}
            </tr>
            <tr>
              <td>Base</td>
              ${offers.map(o => {
                const r = results.get(o.id);
                return `<td>${r ? r.base.toLocaleString() : 'N/A'} ${o.currency}</td>`;
              }).join('')}
            </tr>
            <tr>
              <td>Total (${inputs.horizonYears}Y)</td>
              ${offers.map(o => {
                const r = results.get(o.id);
                return `<td><strong>${r ? r.normalized.toLocaleString() : 'N/A'} ${inputs.fxBase}</strong></td>`;
              }).join('')}
            </tr>
            <tr>
              <td>Rank</td>
              ${offers.map(o => `<td>#${getRank(o.id)}</td>`).join('')}
            </tr>
          </tbody>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          Generated on ${new Date().toLocaleDateString()}
        </p>
      </body>
      </html>
    `;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{t('offer.comparison.title')}</h1>
            <p className="text-muted-foreground mt-1">
              Comparing {offers.length} offers over {inputs.horizonYears} year{inputs.horizonYears > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* What-If Panel */}
        <div className="lg:col-span-1">
          <WhatIfPanel inputs={inputs} onChange={setInputs} />
        </div>

        {/* Comparison Table */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Comparison Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Calculating...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Metric</TableHead>
                        {offers.map(offer => (
                          <TableHead key={offer.id}>
                            <div>
                              <div className="font-semibold">{offer.company}</div>
                              <div className="text-xs text-muted-foreground">{offer.role}</div>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Rank</TableCell>
                        {offers.map(offer => (
                          <TableCell key={offer.id}>
                            <Badge variant={getRank(offer.id) === 1 ? 'default' : 'outline'}>
                              #{getRank(offer.id)}
                            </Badge>
                          </TableCell>
                        ))}
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Location</TableCell>
                        {offers.map(offer => (
                          <TableCell key={offer.id}>
                            {offer.location ?? 'Not specified'}
                          </TableCell>
                        ))}
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Remote</TableCell>
                        {offers.map(offer => (
                          <TableCell key={offer.id}>
                            {t(`offer.remote.${offer.remote ?? 'on_site'}`)}
                          </TableCell>
                        ))}
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Base</TableCell>
                        {offers.map(offer => {
                          const result = results.get(offer.id);
                          return (
                            <TableCell key={offer.id}>
                              {result ? formatCurrency(result.base, result.currency) : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Bonus</TableCell>
                        {offers.map(offer => {
                          const result = results.get(offer.id);
                          return (
                            <TableCell key={offer.id}>
                              {result ? formatCurrency(result.bonus, result.currency) : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Equity (annualized)</TableCell>
                        {offers.map(offer => {
                          const result = results.get(offer.id);
                          return (
                            <TableCell key={offer.id}>
                              {result ? formatCurrency(result.equity, result.currency) : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">Benefits</TableCell>
                        {offers.map(offer => {
                          const result = results.get(offer.id);
                          return (
                            <TableCell key={offer.id}>
                              {result ? formatCurrency(result.benefits.annualValue, result.currency) : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      <TableRow className="bg-muted/50">
                        <TableCell className="font-bold">Gross Total</TableCell>
                        {offers.map(offer => {
                          const result = results.get(offer.id);
                          return (
                            <TableCell key={offer.id} className="font-semibold">
                              {result ? formatCurrency(result.gross, result.currency) : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      <TableRow>
                        <TableCell className="font-medium">After Tax</TableCell>
                        {offers.map(offer => {
                          const result = results.get(offer.id);
                          return (
                            <TableCell key={offer.id}>
                              {result ? formatCurrency(result.postTax, result.currency) : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>

                      <TableRow className="bg-green-50">
                        <TableCell className="font-bold">Normalized ({inputs.fxBase})</TableCell>
                        {offers.map(offer => {
                          const result = results.get(offer.id);
                          return (
                            <TableCell key={offer.id} className="font-bold text-green-700">
                              {result ? formatCurrency(result.normalized, inputs.fxBase ?? 'USD') : 'N/A'}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
