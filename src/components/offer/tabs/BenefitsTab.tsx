/**
 * @fileoverview Benefits tab for Step 37
 * @module components/offer/tabs/BenefitsTab
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Offer, Benefits } from '@/types/offer.types';
import { useOffers } from '@/stores/offers.store';

interface BenefitsTabProps {
  offer: Offer;
}

export function BenefitsTab({ offer }: BenefitsTabProps) {
  const { t } = useTranslation();
  const { update } = useOffers();

  const [benefits, setBenefits] = useState<Benefits>(offer.benefits ?? {});
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (field: keyof Benefits, value: any) => {
    setBenefits({ ...benefits, [field]: value });
    setIsDirty(true);
  };

  const handleSave = () => {
    update(offer.id, { benefits });
    setIsDirty(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('offer.benefits.package')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pto">{t('offer.benefits.ptoDays')}</Label>
              <Input
                id="pto"
                type="number"
                value={benefits.ptoDays ?? ''}
                onChange={(e) => handleChange('ptoDays', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="health">{t('offer.benefits.healthMonthly')}</Label>
              <Input
                id="health"
                type="number"
                value={benefits.healthMonthlyEmployer ?? ''}
                onChange={(e) => handleChange('healthMonthlyEmployer', Number(e.target.value))}
                placeholder="Monthly employer contribution"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirement">{t('offer.benefits.retirementMatch')}</Label>
              <Input
                id="retirement"
                type="number"
                value={benefits.retirementMatchPct ?? ''}
                onChange={(e) => handleChange('retirementMatchPct', Number(e.target.value))}
                placeholder="% of salary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stipend">{t('offer.benefits.stipendAnnual')}</Label>
              <Input
                id="stipend"
                type="number"
                value={benefits.stipendAnnual ?? ''}
                onChange={(e) => handleChange('stipendAnnual', Number(e.target.value))}
                placeholder="Learning/WFH/etc"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signing">{t('offer.benefits.signingBonus')}</Label>
              <Input
                id="signing"
                type="number"
                value={benefits.signingBonus ?? ''}
                onChange={(e) => handleChange('signingBonus', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relocation">{t('offer.benefits.relocation')}</Label>
              <Input
                id="relocation"
                type="number"
                value={benefits.relocation ?? ''}
                onChange={(e) => handleChange('relocation', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="visa"
              checked={benefits.visaSupport ?? false}
              onCheckedChange={(checked) => handleChange('visaSupport', checked)}
            />
            <Label htmlFor="visa" className="cursor-pointer">
              {t('offer.benefits.visaSupport')}
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={benefits.notes ?? ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              placeholder="Additional benefits details..."
            />
          </div>

          {isDirty && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setBenefits(offer.benefits ?? {});
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
