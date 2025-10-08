/**
 * @fileoverview Onboarding page - First 90 Days Success Kit.
 * @module pages/Onboarding
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OnboardingHome } from '@/components/onboarding/OnboardingHome';
import { PlanBuilder } from '@/components/onboarding/PlanBuilder';
import { StakeholderMap } from '@/components/onboarding/StakeholderMap';
import { OneOnOneAgenda } from '@/components/onboarding/OneOnOneAgenda';
import { OKRPlanner } from '@/components/onboarding/OKRPlanner';
import { WeeklyReportComposer } from '@/components/onboarding/WeeklyReportComposer';
import { EvidenceBinder } from '@/components/onboarding/EvidenceBinder';
import { ProgressDashboard } from '@/components/onboarding/ProgressDashboard';
import { Checklists } from '@/components/onboarding/Checklists';
import { LearningRoadmap } from '@/components/onboarding/LearningRoadmap';
import { RiskRegister } from '@/components/onboarding/RiskRegister';
import { ConsentMiningBanner } from '@/components/onboarding/ConsentMiningBanner';
import { useOnboarding } from '@/stores/onboarding.store';
import { useOneOnOnes } from '@/stores/oneonones.store';
import { useOKRs } from '@/stores/okrs.store';
import type { PlanTask, EvidenceItem, Stakeholder, ChecklistItem } from '@/types/onboarding.types';
import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types';
import type { Objective } from '@/types/okr.types';
import { sendWeeklyEmail } from '@/services/onboarding/weeklyReport.service';
import { exportBinderPDF } from '@/services/export/binderExport.pdf.service';
import { exportBinderDoc } from '@/services/export/binderExport.docs.service';
import { getBearer } from '@/services/integrations/google.oauth.service';
import { useGoogleOAuth } from '@/stores/google.oauth.store';
import { InfoIcon } from 'lucide-react';

/**
 * Onboarding page - complete first 90 days success kit.
 */
export default function Onboarding() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [consentMining, setConsentMining] = useState(false);
  const [learningItems, setLearningItems] = useState<any[]>([]);
  const [riskItems, setRiskItems] = useState<any[]>([]);

  const { plans, upsert, update, addTask, setTask, addEvidence, addStakeholder } = useOnboarding();
  const { series, entries, upsertSeries, upsertEntry, byPlan } = useOneOnOnes();
  const { items: okrs, upsert: upsertOKR, byPlan: okrsByPlan } = useOKRs();
  const { accounts } = useGoogleOAuth();

  // Get current plan (for demo, use first plan or create a default one)
  const currentPlan = plans[0] || {
    id: crypto.randomUUID(),
    applicationId: searchParams.get('appId') || '',
    role: 'Software Engineer',
    company: 'Company',
    stage: 'draft' as const,
    lang: 'en' as const,
    milestones: [],
    tasks: [],
    checklists: [],
    stakeholders: [],
    evidence: [],
    retentionDays: 90 as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Ensure plan exists in store
  useEffect(() => {
    if (!plans.find((p) => p.id === currentPlan.id)) {
      upsert(currentPlan);
    }
  }, []);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleNavigate = (section: string) => {
    setActiveTab(section);
    setSearchParams({ tab: section });
  };

  const handleUpdatePlan = (patch: Partial<typeof currentPlan>) => {
    update(currentPlan.id, patch);
  };

  const handleAddTask = (task: PlanTask) => {
    addTask(currentPlan.id, task);
  };

  const handleUpdateTask = (taskId: string, patch: Partial<PlanTask>) => {
    setTask(currentPlan.id, taskId, patch);
  };

  const handleAddStakeholder = (s: Stakeholder) => {
    addStakeholder(currentPlan.id, s);
  };

  const handleCreate1on1 = (email: string, name: string) => {
    const newSeries: OneOnOneSeries = {
      id: crypto.randomUUID(),
      planId: currentPlan.id,
      counterpartEmail: email,
      counterpartName: name,
      cadence: 'weekly',
      weekday: 1,
      timeHHMM: '10:00',
      durationMin: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertSeries(newSeries);
    handleNavigate('oneonones');
  };

  const handleAddEvidence = (e: EvidenceItem) => {
    addEvidence(currentPlan.id, e);
  };

  const handleExportPDF = async () => {
    try {
      await exportBinderPDF(currentPlan.evidence);
      alert('Evidence binder exported to PDF');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportDocs = async () => {
    try {
      await exportBinderDoc(currentPlan.evidence);
      alert('Evidence binder exported to Google Docs');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  const handleSendWeekly = async (html: string, recipients: string[], subject: string) => {
    const account = accounts[0];
    if (!account) {
      alert('No Google account connected. Please connect in Settings.');
      return;
    }
    try {
      const bearer = await getBearer(
        account.id,
        import.meta.env.VITE_OAUTH_PASSPHRASE,
        import.meta.env.VITE_GOOGLE_CLIENT_ID
      );
      await sendWeeklyEmail(bearer, account.email, recipients, subject, html);
      alert('Weekly report sent successfully!');
    } catch (err) {
      console.error('Send failed:', err);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleAddChecklist = (item: ChecklistItem) => {
    const updated = { ...currentPlan, checklists: [item, ...currentPlan.checklists] };
    update(currentPlan.id, { checklists: updated.checklists });
  };

  const handleToggleChecklist = (id: string, done: boolean) => {
    const updated = {
      ...currentPlan,
      checklists: currentPlan.checklists.map((c) => (c.id === id ? { ...c, done } : c)),
    };
    update(currentPlan.id, { checklists: updated.checklists });
  };

  const planSeries = byPlan(currentPlan.id).series;
  const planEntries = byPlan(currentPlan.id).entries;
  const planOKRs = okrsByPlan(currentPlan.id);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('onboarding.home')}
        </h1>
        <p className="text-slate-600 mt-2">
          Your first 90 days success kit — plan, track, and deliver impact.
        </p>
      </div>

      <ConsentMiningBanner
        enabled={consentMining}
        onToggle={setConsentMining}
        onDismiss={() => {}}
      />

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>{t('onboarding.estimates')}</AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={handleNavigate}>
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-11">
          <TabsTrigger value="home">{t('onboarding.home')}</TabsTrigger>
          <TabsTrigger value="plan">{t('onboarding.plan')}</TabsTrigger>
          <TabsTrigger value="stakeholders">{t('onboarding.stakeholders')}</TabsTrigger>
          <TabsTrigger value="oneonones">{t('onboarding.oneonones')}</TabsTrigger>
          <TabsTrigger value="okrs">{t('onboarding.okrs')}</TabsTrigger>
          <TabsTrigger value="reports">{t('onboarding.reports')}</TabsTrigger>
          <TabsTrigger value="evidence">{t('onboarding.evidence')}</TabsTrigger>
          <TabsTrigger value="dashboard">{t('onboarding.dashboard')}</TabsTrigger>
          <TabsTrigger value="checklists">{t('onboarding.checklists')}</TabsTrigger>
          <TabsTrigger value="learning">{t('onboarding.learning')}</TabsTrigger>
          <TabsTrigger value="risks">{t('onboarding.riskRegister')}</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="mt-6">
          <OnboardingHome plan={currentPlan} onNavigate={handleNavigate} />
        </TabsContent>

        <TabsContent value="plan" className="mt-6">
          <PlanBuilder
            plan={currentPlan}
            onUpdate={handleUpdatePlan}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
          />
        </TabsContent>

        <TabsContent value="stakeholders" className="mt-6">
          <StakeholderMap
            stakeholders={currentPlan.stakeholders}
            onAdd={handleAddStakeholder}
            onCreate1on1={handleCreate1on1}
          />
        </TabsContent>

        <TabsContent value="oneonones" className="mt-6">
          <OneOnOneAgenda
            series={planSeries}
            entries={planEntries}
            onCreateSeries={upsertSeries}
            onCreateEntry={upsertEntry}
            onUpdateEntry={(id, patch) => {
              const entry = planEntries.find((e) => e.id === id);
              if (entry) upsertEntry({ ...entry, ...patch });
            }}
          />
        </TabsContent>

        <TabsContent value="okrs" className="mt-6">
          <OKRPlanner objectives={planOKRs} onAdd={upsertOKR} onUpdate={(id, patch) => {
            const okr = planOKRs.find((o) => o.id === id);
            if (okr) upsertOKR({ ...okr, ...patch });
          }} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <WeeklyReportComposer
            plan={currentPlan}
            okrs={planOKRs}
            onSend={handleSendWeekly}
          />
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <EvidenceBinder
            evidence={currentPlan.evidence}
            onAdd={handleAddEvidence}
            onExportPDF={handleExportPDF}
            onExportDocs={handleExportDocs}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <ProgressDashboard plan={currentPlan} okrs={planOKRs} />
        </TabsContent>

        <TabsContent value="checklists" className="mt-6">
          <Checklists
            checklists={currentPlan.checklists}
            onAdd={handleAddChecklist}
            onToggle={handleToggleChecklist}
          />
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <LearningRoadmap
            items={learningItems}
            onAdd={(item) => setLearningItems([...learningItems, item])}
            onToggle={(id, done) =>
              setLearningItems(
                learningItems.map((i) => (i.id === id ? { ...i, done } : i))
              )
            }
          />
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <RiskRegister
            items={riskItems}
            onAdd={(item) => setRiskItems([...riskItems, item])}
            onToggle={(id, resolved) =>
              setRiskItems(
                riskItems.map((i) => (i.id === id ? { ...i, resolved } : i))
              )
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
