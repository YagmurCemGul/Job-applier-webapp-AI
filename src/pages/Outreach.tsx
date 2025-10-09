/**
 * @fileoverview Outreach CRM & Sequencer Page
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OutreachDashboard } from '@/components/outreach/OutreachDashboard';
import { ProspectTable } from '@/components/outreach/ProspectTable';
import { TemplateEditor } from '@/components/outreach/TemplateEditor';
import { SequenceBuilder } from '@/components/outreach/SequenceBuilder';
import { CampaignRunner } from '@/components/outreach/CampaignRunner';
import { ABTestLab } from '@/components/outreach/ABTestLab';
import { ReferralHub } from '@/components/outreach/ReferralHub';
import { SchedulerWidget } from '@/components/outreach/SchedulerWidget';
import { CompliancePanel } from '@/components/outreach/CompliancePanel';
import { seedTemplates } from '@/services/outreach/templates.service';
import { exportCampaignReport } from '@/services/outreach/exportReport.service';
import { useOutreach } from '@/stores/outreach.store';

/**
 * Outreach CRM & Sequencer page with tabbed interface.
 * 
 * Keyboard shortcuts:
 * - N: New prospect
 * - T: New template
 * - S: New sequence
 * - R: Run tick
 */
export function Outreach() {
  const { t } = useTranslation();
  const { campaigns } = useOutreach();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Seed default templates on mount
    seedTemplates();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      
      switch (e.key.toLowerCase()) {
        case 'n':
          setActiveTab('prospects');
          break;
        case 't':
          setActiveTab('templates');
          break;
        case 's':
          setActiveTab('sequences');
          break;
        case 'r':
          setActiveTab('campaigns');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImportCsv = () => {
    setActiveTab('prospects');
  };

  const handleNewSequence = () => {
    setActiveTab('sequences');
  };

  const handleRunTick = () => {
    setActiveTab('campaigns');
  };

  const handleExportReport = async () => {
    if (campaigns.length === 0) {
      alert('No campaigns to export');
      return;
    }
    const camp = campaigns[0];
    try {
      const exp = await exportCampaignReport(camp.id, 'pdf');
      alert(`Report exported: ${exp.url}`);
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('outreach.dashboard')}</h1>
        <p className="text-muted-foreground">
          Networking CRM & Outreach Sequencer — consent-first, compliant, trackable
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard">{t('outreach.dashboard')}</TabsTrigger>
          <TabsTrigger value="prospects">{t('outreach.prospects')}</TabsTrigger>
          <TabsTrigger value="templates">{t('outreach.templates')}</TabsTrigger>
          <TabsTrigger value="sequences">{t('outreach.sequences')}</TabsTrigger>
          <TabsTrigger value="campaigns">{t('outreach.campaigns')}</TabsTrigger>
          <TabsTrigger value="abtests">{t('outreach.abtests')}</TabsTrigger>
          <TabsTrigger value="referrals">{t('outreach.referrals')}</TabsTrigger>
          <TabsTrigger value="scheduler">{t('outreach.scheduler')}</TabsTrigger>
          <TabsTrigger value="compliance">{t('outreach.compliance')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <OutreachDashboard
            onImportCsv={handleImportCsv}
            onNewSequence={handleNewSequence}
            onRunTick={handleRunTick}
            onExportReport={handleExportReport}
          />
        </TabsContent>

        <TabsContent value="prospects">
          <ProspectTable />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateEditor />
        </TabsContent>

        <TabsContent value="sequences">
          <SequenceBuilder />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignRunner />
        </TabsContent>

        <TabsContent value="abtests">
          <ABTestLab />
        </TabsContent>

        <TabsContent value="referrals">
          <ReferralHub />
        </TabsContent>

        <TabsContent value="scheduler">
          <SchedulerWidget />
        </TabsContent>

        <TabsContent value="compliance">
          <CompliancePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
