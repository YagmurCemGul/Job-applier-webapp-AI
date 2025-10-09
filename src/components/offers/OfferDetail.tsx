/**
 * @fileoverview Offer detail component for Step 44
 * @module components/offers/OfferDetail
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useOffers } from '@/stores/offers.store.step44';

interface OfferDetailProps {
  offerId: string;
  onClose: () => void;
}

/**
 * Detailed offer view with edit capabilities
 */
export function OfferDetail({ offerId, onClose }: OfferDetailProps) {
  const { t } = useTranslation();
  const { byId, upsert } = useOffers();
  const offer = byId(offerId);
  
  const [base, setBase] = useState(offer?.baseAnnual || 0);
  const [bonusPct, setBonusPct] = useState(offer?.bonusTargetPct || 0);
  const [signOn, setSignOn] = useState(offer?.signOnYr1 || 0);

  if (!offer) return null;

  const handleSave = () => {
    upsert({
      ...offer,
      baseAnnual: base,
      bonusTargetPct: bonusPct,
      signOnYr1: signOn
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onClose}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{offer.company} — {offer.role}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base">{t('offer.base', 'Base Salary')}</Label>
            <Input
              id="base"
              type="number"
              value={base}
              onChange={(e) => setBase(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonus">{t('offer.bonusTarget', 'Bonus Target %')}</Label>
            <Input
              id="bonus"
              type="number"
              value={bonusPct}
              onChange={(e) => setBonusPct(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signOn">{t('offer.signOn', 'Sign-On Bonus')}</Label>
            <Input
              id="signOn"
              type="number"
              value={signOn}
              onChange={(e) => setSignOn(Number(e.target.value))}
            />
          </div>

          {offer.equity && (
            <div className="p-4 border rounded-md">
              <h4 className="font-semibold mb-2">Equity</h4>
              <div className="text-sm space-y-1">
                <div>Type: {offer.equity.kind.toUpperCase()}</div>
                <div>Shares: {offer.equity.grantShares || offer.equity.grantValue || 0}</div>
                <div>Vesting: {offer.equity.vestYears} years</div>
                <div>Cliff: {offer.equity.cliffMonths} months</div>
              </div>
            </div>
          )}

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
