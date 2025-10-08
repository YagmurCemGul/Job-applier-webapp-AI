/**
 * @fileoverview Offer creation dialog for Step 37
 * @module components/offer/OfferCreateDialog
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Offer, CurrencyCode, RemotePolicy } from '@/types/offer.types';
import { useOffers } from '@/stores/offers.store';
import { parseOfferFromText } from '@/services/offer/importers.service';

interface OfferCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId?: string;
}

export function OfferCreateDialog({ open, onOpenChange, applicationId }: OfferCreateDialogProps) {
  const { t } = useTranslation();
  const { upsert } = useOffers();

  const [importText, setImportText] = useState('');
  const [formData, setFormData] = useState<Partial<Offer>>({
    company: '',
    role: '',
    level: '',
    location: '',
    remote: 'hybrid',
    currency: 'USD',
    baseAnnual: 0,
    bonusTargetPct: 0,
    stage: 'draft',
    applicationId
  });

  const handleImport = () => {
    const parsed = parseOfferFromText(importText);
    setFormData(prev => ({ ...prev, ...parsed }));
  };

  const handleSave = () => {
    const offer: Offer = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      company: formData.company ?? '',
      role: formData.role ?? '',
      level: formData.level,
      location: formData.location,
      remote: formData.remote ?? 'hybrid',
      currency: formData.currency ?? 'USD',
      baseAnnual: formData.baseAnnual ?? 0,
      bonusTargetPct: formData.bonusTargetPct,
      benefits: formData.benefits,
      equity: formData.equity,
      stage: formData.stage ?? 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      applicationId: formData.applicationId,
      deadlines: []
    };

    upsert(offer);
    onOpenChange(false);
    
    // Reset form
    setFormData({
      company: '',
      role: '',
      level: '',
      location: '',
      remote: 'hybrid',
      currency: 'USD',
      baseAnnual: 0,
      bonusTargetPct: 0,
      stage: 'draft',
      applicationId
    });
    setImportText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('offer.addOffer')}</DialogTitle>
          <DialogDescription>
            {t('offer.estimates')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="import">{t('offer.import.title')}</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-text">{t('offer.import.placeholder')}</Label>
              <Textarea
                id="import-text"
                placeholder={t('offer.import.placeholder')}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleImport} variant="outline">
              {t('offer.import.parse')}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">{t('offer.fields.company')} *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t('offer.fields.role')} *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">{t('offer.fields.level')}</Label>
                <Input
                  id="level"
                  value={formData.level ?? ''}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">{t('offer.fields.location')}</Label>
                <Input
                  id="location"
                  value={formData.location ?? ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remote">{t('offer.fields.remote')}</Label>
                <Select
                  value={formData.remote}
                  onValueChange={(value) => setFormData({ ...formData, remote: value as RemotePolicy })}
                >
                  <SelectTrigger id="remote">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on_site">{t('offer.remote.on_site')}</SelectItem>
                    <SelectItem value="hybrid">{t('offer.remote.hybrid')}</SelectItem>
                    <SelectItem value="remote">{t('offer.remote.remote')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t('offer.fields.currency')}</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value as CurrencyCode })}
                >
                  <SelectTrigger id="currency">
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

              <div className="space-y-2">
                <Label htmlFor="base">{t('offer.fields.baseAnnual')} *</Label>
                <Input
                  id="base"
                  type="number"
                  value={formData.baseAnnual}
                  onChange={(e) => setFormData({ ...formData, baseAnnual: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus">{t('offer.fields.bonusTargetPct')}</Label>
                <Input
                  id="bonus"
                  type="number"
                  value={formData.bonusTargetPct ?? 0}
                  onChange={(e) => setFormData({ ...formData, bonusTargetPct: Number(e.target.value) })}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('offer.actions.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!formData.company || !formData.role}>
            {t('offer.actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
