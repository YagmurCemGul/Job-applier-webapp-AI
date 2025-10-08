/**
 * @fileoverview Offer detail view for Step 37
 * @module components/offer/OfferDetail
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, X } from 'lucide-react';
import { useOffers } from '@/stores/offers.store';
import type { OfferStage, TotalCompResult } from '@/types/offer.types';
import { totalComp } from '@/services/offer/compMath.service';

// Tabs
import { OfferOverviewTab } from './tabs/OfferOverviewTab';
import { CompensationTab } from './tabs/CompensationTab';
import { BenefitsTab } from './tabs/BenefitsTab';
import { EquityTab } from './tabs/EquityTab';
import { DeadlinesTab } from './tabs/DeadlinesTab';
import { NegotiationTab } from './tabs/NegotiationTab';
import { DocsTab } from './tabs/DocsTab';

interface OfferDetailProps {
  offerId: string;
  onClose: () => void;
}

export function OfferDetail({ offerId, onClose }: OfferDetailProps) {
  const { t } = useTranslation();
  const { getById, setStage } = useOffers();

  const offer = getById(offerId);
  const [totalComp1Y, setTotalComp1Y] = useState<TotalCompResult | null>(null);

  useEffect(() => {
    if (offer) {
      totalComp(offer, { horizonYears: 1, taxRatePct: 30, cocAdjustPct: 0, fxBase: offer.currency })
        .then(setTotalComp1Y)
        .catch(console.error);
    }
  }, [offer]);

  if (!offer) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Offer not found</h2>
          <Button onClick={onClose} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const stageColors: Record<OfferStage, string> = {
    draft: 'bg-gray-500',
    received: 'bg-blue-500',
    negotiating: 'bg-yellow-500',
    accepted: 'bg-green-500',
    declined: 'bg-red-500',
    expired: 'bg-gray-400'
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{offer.company}</h1>
            <p className="text-xl text-muted-foreground mt-1">{offer.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={offer.stage} onValueChange={(v) => setStage(offer.id, v as OfferStage)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{t('offer.stages.draft')}</SelectItem>
              <SelectItem value="received">{t('offer.stages.received')}</SelectItem>
              <SelectItem value="negotiating">{t('offer.stages.negotiating')}</SelectItem>
              <SelectItem value="accepted">{t('offer.stages.accepted')}</SelectItem>
              <SelectItem value="declined">{t('offer.stages.declined')}</SelectItem>
              <SelectItem value="expired">{t('offer.stages.expired')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStage(offer.id, 'accepted')}
              disabled={offer.stage === 'accepted'}
            >
              <Check className="mr-2 h-4 w-4" />
              {t('offer.actions.markAccepted')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStage(offer.id, 'declined')}
              disabled={offer.stage === 'declined'}
            >
              <X className="mr-2 h-4 w-4" />
              {t('offer.actions.markDeclined')}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">{t('offer.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="compensation">{t('offer.tabs.compensation')}</TabsTrigger>
          <TabsTrigger value="benefits">{t('offer.tabs.benefits')}</TabsTrigger>
          <TabsTrigger value="equity">{t('offer.tabs.equity')}</TabsTrigger>
          <TabsTrigger value="deadlines">{t('offer.tabs.deadlines')}</TabsTrigger>
          <TabsTrigger value="negotiation">{t('offer.tabs.negotiation')}</TabsTrigger>
          <TabsTrigger value="docs">{t('offer.tabs.docs')}</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <OfferOverviewTab offer={offer} totalComp={totalComp1Y ?? undefined} />
          </TabsContent>

          <TabsContent value="compensation">
            <CompensationTab offer={offer} />
          </TabsContent>

          <TabsContent value="benefits">
            <BenefitsTab offer={offer} />
          </TabsContent>

          <TabsContent value="equity">
            <EquityTab offer={offer} />
          </TabsContent>

          <TabsContent value="deadlines">
            <DeadlinesTab offer={offer} />
          </TabsContent>

          <TabsContent value="negotiation">
            <NegotiationTab offer={offer} />
          </TabsContent>

          <TabsContent value="docs">
            <DocsTab offer={offer} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
