/**
 * @fileoverview Network & Referral Engine main page
 * @module pages/Network
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactsPage } from '@/components/network/ContactsPage';
import { SmartLists } from '@/components/network/SmartLists';
import { WarmIntroGraph } from '@/components/network/WarmIntroGraph';
import { ReferralAskWizard } from '@/components/network/ReferralAskWizard';
import { OutreachSequencer } from '@/components/network/OutreachSequencer';
import { TemplatesLibrary } from '@/components/network/TemplatesLibrary';
import { PipelineBoard } from '@/components/network/PipelineBoard';
import { EventsBoard } from '@/components/network/EventsBoard';
import { AnalyticsPanel } from '@/components/network/AnalyticsPanel';
import { SMTPComplianceBanner } from '@/components/network/SMTPComplianceBanner';

/**
 * Network page - CRM, warm intros, outreach sequences, recruiter pipeline, events
 */
export function Network() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('contacts');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('network.title', 'Networking & Referrals')}</h1>
          <p className="text-muted-foreground">
            {t('network.subtitle', 'Build connections, request introductions, manage outreach')}
          </p>
        </div>
      </div>

      <SMTPComplianceBanner />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contacts">{t('network.contacts')}</TabsTrigger>
          <TabsTrigger value="graph">{t('network.graph')}</TabsTrigger>
          <TabsTrigger value="outreach">{t('network.outreach')}</TabsTrigger>
          <TabsTrigger value="templates">{t('network.templates')}</TabsTrigger>
          <TabsTrigger value="pipeline">{t('network.pipeline')}</TabsTrigger>
          <TabsTrigger value="events">{t('network.events')}</TabsTrigger>
          <TabsTrigger value="analytics">{t('network.analytics')}</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <SmartLists />
          <ContactsPage />
        </TabsContent>

        <TabsContent value="graph">
          <WarmIntroGraph />
        </TabsContent>

        <TabsContent value="outreach" className="space-y-4">
          <OutreachSequencer />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesLibrary />
        </TabsContent>

        <TabsContent value="pipeline">
          <PipelineBoard />
        </TabsContent>

        <TabsContent value="events">
          <EventsBoard />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
