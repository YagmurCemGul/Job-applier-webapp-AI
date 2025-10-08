/**
 * @fileoverview Offers page component for Step 37
 * @module components/offer/OffersPage
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, GitCompare } from 'lucide-react';
import { useOffers } from '@/stores/offers.store';
import { OfferCreateDialog } from './OfferCreateDialog';
import { OfferCard } from './OfferCard';
import { OfferDetail } from './OfferDetail';
import { ComparisonMatrix } from './ComparisonMatrix';
import type { OfferStage } from '@/types/offer.types';

export function OffersPage() {
  const { t } = useTranslation();
  const { items } = useOffers();

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<OfferStage | 'all'>('all');
  const [remoteFilter, setRemoteFilter] = useState<string>('all');

  // Filtering
  const filteredOffers = items.filter(offer => {
    const matchesSearch = !searchQuery || 
      offer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || offer.stage === stageFilter;
    const matchesRemote = remoteFilter === 'all' || offer.remote === remoteFilter;

    return matchesSearch && matchesStage && matchesRemote;
  });

  const handleToggleSelect = (offerId: string) => {
    const newSelected = new Set(selectedForCompare);
    if (newSelected.has(offerId)) {
      newSelected.delete(offerId);
    } else {
      newSelected.add(offerId);
    }
    setSelectedForCompare(newSelected);
  };

  if (selectedOfferId && !compareMode) {
    return (
      <OfferDetail
        offerId={selectedOfferId}
        onClose={() => setSelectedOfferId(null)}
      />
    );
  }

  if (compareMode && selectedForCompare.size > 0) {
    return (
      <ComparisonMatrix
        offerIds={Array.from(selectedForCompare)}
        onClose={() => {
          setCompareMode(false);
          setSelectedForCompare(new Set());
        }}
      />
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('offer.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('offer.estimates')}</p>
        </div>
        <div className="flex gap-2">
          {compareMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setCompareMode(false);
                  setSelectedForCompare(new Set());
                }}
              >
                {t('offer.actions.cancel')}
              </Button>
              <Button
                onClick={() => setCompareMode(true)}
                disabled={selectedForCompare.size < 2}
              >
                <GitCompare className="mr-2 h-4 w-4" />
                {t('offer.compareSelected')} ({selectedForCompare.size})
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setCompareMode(true)}>
                <GitCompare className="mr-2 h-4 w-4" />
                {t('offer.compare')}
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t('offer.addOffer')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="draft">{t('offer.stages.draft')}</SelectItem>
            <SelectItem value="received">{t('offer.stages.received')}</SelectItem>
            <SelectItem value="negotiating">{t('offer.stages.negotiating')}</SelectItem>
            <SelectItem value="accepted">{t('offer.stages.accepted')}</SelectItem>
            <SelectItem value="declined">{t('offer.stages.declined')}</SelectItem>
            <SelectItem value="expired">{t('offer.stages.expired')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={remoteFilter} onValueChange={setRemoteFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Remote" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Policies</SelectItem>
            <SelectItem value="on_site">{t('offer.remote.on_site')}</SelectItem>
            <SelectItem value="hybrid">{t('offer.remote.hybrid')}</SelectItem>
            <SelectItem value="remote">{t('offer.remote.remote')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Offers Grid */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">{t('offer.noOffers')}</h3>
          <p className="text-muted-foreground mt-2">{t('offer.noOffersDesc')}</p>
          <Button onClick={() => setCreateOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            {t('offer.addOffer')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              onClick={() => !compareMode && setSelectedOfferId(offer.id)}
              onSelect={compareMode ? handleToggleSelect : undefined}
              selected={selectedForCompare.has(offer.id)}
            />
          ))}
        </div>
      )}

      <OfferCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
