/**
 * Performance Review & Promotion Readiness Page
 * 
 * Main page with tabs for all performance review features.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerfDashboard } from '@/components/perf/PerfDashboard';
import { FeedbackRequestWizard } from '@/components/perf/FeedbackRequestWizard';
import { FeedbackInbox } from '@/components/perf/FeedbackInbox';
import { EvidenceGraph } from '@/components/perf/EvidenceGraph';
import { ReviewCyclePlanner } from '@/components/perf/ReviewCyclePlanner';
import { CalibrationBoard } from '@/components/perf/CalibrationBoard';
import { RatingSimulator } from '@/components/perf/RatingSimulator';
import { PromotionReadiness } from '@/components/perf/PromotionReadiness';
import { NarrativeWriter } from '@/components/perf/NarrativeWriter';
import { ReviewPacketActions } from '@/components/perf/ReviewPacketActions';
import { seedFeedbackTemplates } from '@/services/perf/feedback360.service';
import { seedDefaultRubric } from '@/services/perf/rubricCatalog.service';
import {
  LayoutDashboard,
  MessageSquare,
  Link2,
  Calendar,
  Gauge,
  Settings,
  TrendingUp,
  FileText,
  Package,
} from 'lucide-react';

/**
 * Performance Review & Promotion Readiness page with comprehensive tools.
 */
export default function Performance() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFeedbackWizard, setShowFeedbackWizard] = useState(false);

  useEffect(() => {
    // Seed default data on mount
    seedFeedbackTemplates();
    seedDefaultRubric();
  }, []);

  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('perf.dashboard')}
        </h1>
        <p className="text-muted-foreground">
          Manage 360 feedback, evidence tracking, calibration, and promotion readiness.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.dashboard')}</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.feedback')}</span>
          </TabsTrigger>
          <TabsTrigger value="evidence" className="gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.evidence')}</span>
          </TabsTrigger>
          <TabsTrigger value="cycle" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.cycle')}</span>
          </TabsTrigger>
          <TabsTrigger value="calibration" className="gap-2">
            <Gauge className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.calibration')}</span>
          </TabsTrigger>
          <TabsTrigger value="simulator" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.simulator')}</span>
          </TabsTrigger>
          <TabsTrigger value="promotion" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.promotion')}</span>
          </TabsTrigger>
          <TabsTrigger value="narrative" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.narrative')}</span>
          </TabsTrigger>
          <TabsTrigger value="packet" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">{t('perf.packet')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <PerfDashboard
            onRequestFeedback={() => {
              setShowFeedbackWizard(true);
              setActiveTab('feedback');
            }}
            onLinkEvidence={() => setActiveTab('evidence')}
            onOpenCycle={() => setActiveTab('cycle')}
            onWriteNarrative={() => setActiveTab('narrative')}
            onExportPacket={() => setActiveTab('packet')}
          />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {showFeedbackWizard ? (
            <div className="space-y-4">
              <FeedbackRequestWizard
                onComplete={() => {
                  setShowFeedbackWizard(false);
                  setActiveTab('feedback');
                }}
              />
              <div className="text-center">
                <button
                  onClick={() => setShowFeedbackWizard(false)}
                  className="text-sm text-muted-foreground underline"
                >
                  View Inbox Instead
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFeedbackWizard(true)}
                  className="text-sm text-muted-foreground underline"
                >
                  Request New Feedback
                </button>
              </div>
              <FeedbackInbox />
            </div>
          )}
        </TabsContent>

        <TabsContent value="evidence">
          <EvidenceGraph />
        </TabsContent>

        <TabsContent value="cycle">
          <ReviewCyclePlanner />
        </TabsContent>

        <TabsContent value="calibration">
          <CalibrationBoard />
        </TabsContent>

        <TabsContent value="simulator">
          <RatingSimulator />
        </TabsContent>

        <TabsContent value="promotion">
          <PromotionReadiness />
        </TabsContent>

        <TabsContent value="narrative">
          <NarrativeWriter />
        </TabsContent>

        <TabsContent value="packet">
          <ReviewPacketActions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
