/**
 * @fileoverview Equity tab for Step 37
 * @module components/offer/tabs/EquityTab
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import type { Offer, EquityGrant, EquityType } from '@/types/offer.types';
import { useOffers } from '@/stores/offers.store';

interface EquityTabProps {
  offer: Offer;
}

export function EquityTab({ offer }: EquityTabProps) {
  const { t } = useTranslation();
  const { update } = useOffers();

  const [grants, setGrants] = useState<EquityGrant[]>(offer.equity ?? []);
  const [isDirty, setIsDirty] = useState(false);

  const addGrant = () => {
    const newGrant: EquityGrant = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      type: 'RSU',
      units: 0,
      vestSchedule: '4y_1y_cliff'
    };
    setGrants([...grants, newGrant]);
    setIsDirty(true);
  };

  const updateGrant = (id: string, updates: Partial<EquityGrant>) => {
    setGrants(grants.map(g => g.id === id ? { ...g, ...updates } : g));
    setIsDirty(true);
  };

  const removeGrant = (id: string) => {
    setGrants(grants.filter(g => g.id !== id));
    setIsDirty(true);
  };

  const handleSave = () => {
    update(offer.id, { equity: grants });
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('offer.equity.grants')}</CardTitle>
          <Button onClick={addGrant} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('offer.equity.addGrant')}
          </Button>
        </CardHeader>
        <CardContent>
          {grants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No equity grants yet. Click "Add Grant" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('offer.equity.type')}</TableHead>
                    <TableHead>{t('offer.equity.units')}</TableHead>
                    <TableHead>{t('offer.equity.strikePrice')}</TableHead>
                    <TableHead>{t('offer.equity.assumedPrice')}</TableHead>
                    <TableHead>{t('offer.equity.vestSchedule')}</TableHead>
                    <TableHead>{t('offer.equity.targetValue')}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell>
                        <Select
                          value={grant.type}
                          onValueChange={(v) => updateGrant(grant.id, { type: v as EquityType })}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RSU">RSU</SelectItem>
                            <SelectItem value="Options">Options</SelectItem>
                            <SelectItem value="PSU">PSU</SelectItem>
                            <SelectItem value="ESPP">ESPP</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={grant.units ?? ''}
                          onChange={(e) => updateGrant(grant.id, { units: Number(e.target.value) })}
                          className="w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        {grant.type === 'Options' && (
                          <Input
                            type="number"
                            value={grant.strikePrice ?? ''}
                            onChange={(e) => updateGrant(grant.id, { strikePrice: Number(e.target.value) })}
                            className="w-[100px]"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={grant.assumedSharePrice ?? ''}
                          onChange={(e) => updateGrant(grant.id, { assumedSharePrice: Number(e.target.value) })}
                          className="w-[100px]"
                          placeholder="50"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={grant.vestSchedule ?? '4y_1y_cliff'}
                          onValueChange={(v) => updateGrant(grant.id, { vestSchedule: v as any })}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4y_1y_cliff">4y, 1y cliff</SelectItem>
                            <SelectItem value="4y_no_cliff">4y, no cliff</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={grant.targetValue ?? ''}
                          onChange={(e) => updateGrant(grant.id, { targetValue: Number(e.target.value) })}
                          className="w-[120px]"
                          placeholder="If units unknown"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGrant(grant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {isDirty && (
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => {
                setGrants(offer.equity ?? []);
                setIsDirty(false);
              }}>
                {t('offer.actions.cancel')}
              </Button>
              <Button onClick={handleSave}>
                {t('offer.actions.save')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
