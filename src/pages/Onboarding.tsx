/**
 * @fileoverview Onboarding page with tabbed navigation.
 * @module pages/Onboarding
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useOnboarding } from '@/stores/onboarding.store';
import { useOneOnOnes } from '@/stores/oneonones.store';
import { useOKRs } from '@/stores/okrs.store';
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
import { exportBinderPDF } from '@/services/export/binderExport.pdf.service';
import { exportBinderDoc } from '@/services/export/binderExport.docs.service';
import { sendWeeklyEmail } from '@/services/onboarding/weeklyReport.service';
import { scheduleOneOnOne } from '@/services/onboarding/oneonone.service';
import type { ChecklistItem, PlanTask, EvidenceItem, Stakeholder } from '@/types/onboarding.types';
import type { OneOnOneSeries, OneOnOneEntry } from '@/types/oneonone.types';
import type { Objective } from '@/types/okr.types';

/**
 * Onboarding - main onboarding suite page.
 */
export function Onboarding() {
  const { t } = useTranslation();
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [consentMining, setConsentMining] = useState(false);

  const { plans, update, addTask, setTask, addEvidence, addStakeholder } =
    useOnboarding();
  const { series, entries, upsertSeries, upsertEntry, byPlan } = useOneOnOnes();
  const { items: okrs, upsert: upsertOKR, update: updateOKR, byPlan: okrsByPlan } = useOKRs();

  const plan = plans.find((p) => p.id === planId);

  if (!plan) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{t('onboarding.noPlan')}</h1>
          <p className="text-slate-600">
            The onboarding plan was not found or has been deleted.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleNavigate = (section: string) => {
    setActiveTab(section);
  };

  const handleCreate1on1 = (email: string, name: string) => {
    const newSeries: OneOnOneSeries = {
      id: crypto.randomUUID(),
      planId: plan.id,
      counterpartEmail: email,
      counterpartName: name,
      cadence: 'weekly',
      weekday: 1, // Monday
      timeHHMM: '10:00',
      durationMin: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertSeries(newSeries);
    setActiveTab('oneonones');
  };

  const handleSendWeekly = async (
    html: string,
    recipients: string[],
    subject: string
  ) => {
    // In production, get bearer token from auth store
    console.log('Send weekly report:', { html, recipients, subject });
    // await sendWeeklyEmail(bearer, from, recipients, subject, html);
  };

  const handleExportPDF = async () => {
    await exportBinderPDF(plan.evidence);
  };

  const handleExportDocs = async () => {
    await exportBinderDoc(plan.evidence);
  };

  const handleAddChecklist = (item: ChecklistItem) => {
    update(plan.id, { checklists: [item, ...plan.checklists] });
  };

  const handleToggleChecklist = (id: string, done: boolean) => {
    update(plan.id, {
      checklists: plan.checklists.map((c) =>
        c.id === id ? { ...c, done } : c
      ),
    });
  };

  const planOKRs = okrsByPlan(plan.id);
  const { series: planSeries, entries: planEntries } = byPlan(plan.id);

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {t('onboarding.home')}
            </h1>
            <p className="text-slate-600 mt-1">
              {plan.company} — {plan.role}
            </p>
          </div>
        </div>

        <ConsentMiningBanner
          enabled={consentMining}
          onToggle={setConsentMining}
          onDismiss={() => {}}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            <TabsTrigger value="home">{t('onboarding.home')}</TabsTrigger>
            <TabsTrigger value="plan">{t('onboarding.plan')}</TabsTrigger>
            <TabsTrigger value="stakeholders">
              {t('onboarding.stakeholders')}
            </TabsTrigger>
            <TabsTrigger value="oneonones">
              {t('onboarding.oneonones')}
            </TabsTrigger>
            <TabsTrigger value="okrs">{t('onboarding.okrs')}</TabsTrigger>
            <TabsTrigger value="reports">{t('onboarding.reports')}</TabsTrigger>
            <TabsTrigger value="evidence">
              {t('onboarding.evidence')}
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              {t('onboarding.dashboard')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="mt-6">
            <OnboardingHome plan={plan} onNavigate={handleNavigate} />
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <PlanBuilder
              plan={plan}
              onUpdate={(patch) => update(plan.id, patch)}
              onAddTask={(task) => addTask(plan.id, task)}
              onUpdateTask={(taskId, patch) => setTask(plan.id, taskId, patch)}
            />
          </TabsContent>

          <TabsContent value="stakeholders" className="mt-6">
            <StakeholderMap
              stakeholders={plan.stakeholders}
              onAdd={(s) => addStakeholder(plan.id, s)}
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
                if (entry) {
                  upsertEntry({ ...entry, ...patch, updatedAt: new Date().toISOString() });
                }
              }}
            />
          </TabsContent>

          <TabsContent value="okrs" className="mt-6">
            <OKRPlanner
              objectives={planOKRs}
              onAdd={upsertOKR}
              onUpdate={updateOKR}
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <WeeklyReportComposer
              plan={plan}
              okrs={planOKRs}
              onSend={handleSendWeekly}
            />
          </TabsContent>

          <TabsContent value="evidence" className="mt-6">
            <EvidenceBinder
              evidence={plan.evidence}
              onAdd={(e) => addEvidence(plan.id, e)}
              onExportPDF={handleExportPDF}
              onExportDocs={handleExportDocs}
            />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-6">
            <ProgressDashboard plan={plan} okrs={planOKRs} />
          </TabsContent>
        </Tabs>

        {/* Additional sections */}
        <div className="border-t pt-6">
          <Tabs defaultValue="checklists">
            <TabsList>
              <TabsTrigger value="checklists">
                {t('onboarding.checklists')}
              </TabsTrigger>
              <TabsTrigger value="learning">
                {t('onboarding.learning')}
              </TabsTrigger>
              <TabsTrigger value="risks">
                {t('onboarding.riskRegister')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklists" className="mt-6">
              <Checklists
                checklists={plan.checklists}
                onAdd={handleAddChecklist}
                onToggle={handleToggleChecklist}
              />
            </TabsContent>

            <TabsContent value="learning" className="mt-6">
              <LearningRoadmap />
            </TabsContent>

            <TabsContent value="risks" className="mt-6">
              <RiskRegister />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
