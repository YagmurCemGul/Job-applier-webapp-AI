/**
 * @fileoverview Reviews page - main hub for performance reviews and promotions
 * Tabs: Overview, Impact, Feedback, Self-Review, Calibration, Promotion, Visibility
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReviews } from '@/stores/review.store';
import { ConfidentialBanner } from '@/components/review/ConfidentialBanner';
import { ReviewHome } from '@/components/review/ReviewHome';
import { CycleSetupDialog } from '@/components/review/CycleSetupDialog';
import { ImpactTracker } from '@/components/review/ImpactTracker';
import { FeedbackRequestWizard } from '@/components/review/FeedbackRequestWizard';
import { FeedbackInbox } from '@/components/review/FeedbackInbox';
import { SelfReviewComposer } from '@/components/review/SelfReviewComposer';
import { CalibrationPrepBoard } from '@/components/review/CalibrationPrepBoard';
import { PromotionCaseBuilder } from '@/components/review/PromotionCaseBuilder';
import { VisibilityMap } from '@/components/review/VisibilityMap';
import { ReviewerReminderDialog } from '@/components/review/ReviewerReminderDialog';
import { useFeedback } from '@/stores/feedback.store';
import type { ReviewCycle } from '@/types/review.types';

/**
 * Main review hub with tabs: Overview, Impact, Feedback, Self-Review,
 * Calibration, Promotion, Visibility, Settings
 */
export function Reviews() {
  const { t } = useTranslation();
  const { cycles, upsertCycle } = useReviews();
  const { byCycle } = useFeedback();
  
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(
    cycles.length > 0 ? cycles[0].id : null
  );
  const [activeTab, setActiveTab] = useState('overview');
  const [showCycleDialog, setShowCycleDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  
  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  
  const handleSaveCycle = async (cycle: ReviewCycle, createReminders: boolean) => {
    upsertCycle(cycle);
    setSelectedCycleId(cycle.id);
    setShowCycleDialog(false);
    
    // In production, schedule calendar reminders via Step 35
    // if (createReminders) {
    //   for (const deadline of cycle.deadlines) {
    //     await scheduleCycleDeadline({...deadline});
    //   }
    // }
  };
  
  const handleSendReminders = async (requestIds: string[]) => {
    // In production, send via Gmail
    console.log('Sending reminders to:', requestIds);
  };
  
  if (cycles.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">{t('review.title', 'Performance Reviews')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('review.noCycles', 'No review cycles yet. Start your first cycle to begin tracking impact and collecting feedback.')}
          </p>
          <Button onClick={() => setShowCycleDialog(true)}>
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('review.startCycle', 'Start Review Cycle')}
          </Button>
        </div>
        
        <CycleSetupDialog
          open={showCycleDialog}
          onClose={() => setShowCycleDialog(false)}
          onSave={handleSaveCycle}
        />
      </div>
    );
  }
  
  if (!selectedCycle) {
    return null;
  }
  
  const { requests } = byCycle(selectedCycle.id);
  const pendingRequests = requests.filter(r => r.status === 'sent' && !r.respondedAt);
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('review.title', 'Performance Reviews')}</h1>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCycleId ?? ''} onValueChange={setSelectedCycleId}>
            <SelectTrigger className="w-64" aria-label={t('review.selectCycle', 'Select review cycle')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cycles.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setShowCycleDialog(true)}>
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            {t('review.newCycle', 'New Cycle')}
          </Button>
        </div>
      </div>
      
      <ConfidentialBanner retentionDays={selectedCycle.retentionDays} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">{t('review.overview', 'Overview')}</TabsTrigger>
          <TabsTrigger value="impact">{t('review.impact', 'Impact')}</TabsTrigger>
          <TabsTrigger value="feedback">{t('review.feedback', 'Feedback')}</TabsTrigger>
          <TabsTrigger value="self-review">{t('review.selfReview', 'Self-Review')}</TabsTrigger>
          <TabsTrigger value="calibration">{t('review.calibration', 'Calibration')}</TabsTrigger>
          <TabsTrigger value="promotion">{t('review.promotion', 'Promotion')}</TabsTrigger>
          <TabsTrigger value="visibility">{t('review.visibility', 'Visibility')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <ReviewHome cycle={selectedCycle} onNavigate={setActiveTab} />
        </TabsContent>
        
        <TabsContent value="impact" className="mt-6">
          <ImpactTracker cycleId={selectedCycle.id} />
        </TabsContent>
        
        <TabsContent value="feedback" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">{t('review.requestFeedback', 'Request Feedback')}</h3>
              <FeedbackRequestWizard
                cycleId={selectedCycle.id}
                planId={selectedCycle.planId}
              />
              
              {pendingRequests.length > 0 && (
                <Button
                  variant="outline"
                  className="mt-4 w-full"
                  onClick={() => setShowReminderDialog(true)}
                >
                  {t('review.sendReminders', `Send Reminders (${pendingRequests.length})`)}
                </Button>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">{t('review.feedbackInbox', 'Feedback Inbox')}</h3>
              <FeedbackInbox cycleId={selectedCycle.id} />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="self-review" className="mt-6">
          <SelfReviewComposer cycleId={selectedCycle.id} />
        </TabsContent>
        
        <TabsContent value="calibration" className="mt-6">
          <CalibrationPrepBoard cycleId={selectedCycle.id} />
        </TabsContent>
        
        <TabsContent value="promotion" className="mt-6">
          <PromotionCaseBuilder cycleId={selectedCycle.id} />
        </TabsContent>
        
        <TabsContent value="visibility" className="mt-6">
          <VisibilityMap planId={selectedCycle.planId} />
        </TabsContent>
      </Tabs>
      
      <CycleSetupDialog
        open={showCycleDialog}
        onClose={() => setShowCycleDialog(false)}
        onSave={handleSaveCycle}
      />
      
      <ReviewerReminderDialog
        open={showReminderDialog}
        onClose={() => setShowReminderDialog(false)}
        pendingRequests={pendingRequests}
        onSendReminders={handleSendReminders}
      />
    </div>
  );
}

export default Reviews;
