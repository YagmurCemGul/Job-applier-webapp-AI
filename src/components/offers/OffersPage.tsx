/**
 * @fileoverview Offers page component for Step 44
 * @module components/offers/OffersPage
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OfferIntakeCard } from './OfferIntakeCard';
import { OfferCompareTable } from './OfferCompareTable';
import { EquityModeler } from './EquityModeler';
import { ScenarioSimulator } from './ScenarioSimulator';
import { BenchmarksPanel } from './BenchmarksPanel';
import { NegotiationPlaybook } from './NegotiationPlaybook';
import { CounterEmailWizard } from './CounterEmailWizard';
import { CallPlanner } from './CallPlanner';
import { DocsVault } from './DocsVault';
import { AnalyticsPanel } from './AnalyticsPanel';

/**
 * Main offers page with tabs for all features
 */
export function OffersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('offers');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('offer.title', 'Offers')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('offer.disclaimer', 'Educational estimate — not financial or legal advice.')}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="offers">{t('offer.addOffer', 'Offers')}</TabsTrigger>
          <TabsTrigger value="compare">{t('offer.compare', 'Compare')}</TabsTrigger>
          <TabsTrigger value="equity">{t('offer.equity', 'Equity')}</TabsTrigger>
          <TabsTrigger value="scenarios">{t('offer.scenarios', 'Scenarios')}</TabsTrigger>
          <TabsTrigger value="benchmarks">{t('offer.benchmarks', 'Benchmarks')}</TabsTrigger>
          <TabsTrigger value="negotiate">{t('offer.negotiate', 'Negotiate')}</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="calls">{t('offer.calls', 'Calls')}</TabsTrigger>
          <TabsTrigger value="docs">{t('offer.docs', 'Docs')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('offer.analytics', 'Analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          <OfferIntakeCard />
        </TabsContent>

        <TabsContent value="compare" className="space-y-4">
          <OfferCompareTable />
        </TabsContent>

        <TabsContent value="equity" className="space-y-4">
          <EquityModeler />
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <ScenarioSimulator />
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <BenchmarksPanel />
        </TabsContent>

        <TabsContent value="negotiate" className="space-y-4">
          <NegotiationPlaybook />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <CounterEmailWizard />
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <CallPlanner />
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <DocsVault />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
