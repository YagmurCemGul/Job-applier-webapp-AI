/**
 * @fileoverview Interview Coach & Scheduler page for Step 43
 * @module pages/Interview
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InterviewDashboard } from '@/components/interview/InterviewDashboard';
import { Planner } from '@/components/interview/Planner';
import { QuestionBank } from '@/components/interview/QuestionBank';
import { StoryBuilder } from '@/components/interview/StoryBuilder';
import { MockRoom } from '@/components/interview/MockRoom';
import { TranscriptEditor } from '@/components/interview/TranscriptEditor';
import { RubricPanel } from '@/components/interview/RubricPanel';
import { FeedbackPanel } from '@/components/interview/FeedbackPanel';
import { Followups } from '@/components/interview/Followups';
import { TrackerBoard } from '@/components/interview/TrackerBoard';
import type { QuestionItem, SessionRun, StorySTAR, InterviewPlan } from '@/types/interview.types';
import { useInterview } from '@/stores/interview.store';

/**
 * Interview coaching and scheduling page with tabs
 */
export function Interview() {
  const { t } = useTranslation();
  const { updateRun } = useInterview();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionItem[]>([]);
  const [selectedStories, setSelectedStories] = useState<StorySTAR[]>([]);
  const [currentRun, setCurrentRun] = useState<SessionRun | null>(null);
  const [currentPlan, setCurrentPlan] = useState<InterviewPlan | null>(null);

  const handleStartMock = (questions: QuestionItem[]) => {
    setSelectedQuestions(questions);
    setActiveTab('mock');
  };

  const handleMockComplete = (run: SessionRun) => {
    setCurrentRun(run);
    setActiveTab('transcript');
  };

  const handleFeedbackReady = (feedbackHtml: string) => {
    if (currentRun) {
      updateRun(currentRun.id, { feedbackHtml });
      setCurrentRun({ ...currentRun, feedbackHtml });
      setActiveTab('feedback');
    }
  };

  const handleRubricSave = (score: any) => {
    if (currentRun) {
      updateRun(currentRun.id, { rubric: score });
      setCurrentRun({ ...currentRun, rubric: score });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('interview.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('interview.subtitle')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="dashboard">{t('interview.dashboard')}</TabsTrigger>
          <TabsTrigger value="planner">{t('interview.planner')}</TabsTrigger>
          <TabsTrigger value="questions">{t('interview.questions')}</TabsTrigger>
          <TabsTrigger value="stories">{t('interview.stories')}</TabsTrigger>
          <TabsTrigger value="mock">{t('interview.mock')}</TabsTrigger>
          <TabsTrigger value="transcript">{t('interview.transcript')}</TabsTrigger>
          <TabsTrigger value="rubric">{t('interview.rubric')}</TabsTrigger>
          <TabsTrigger value="feedback">{t('interview.feedback')}</TabsTrigger>
          <TabsTrigger value="followups">{t('interview.followups')}</TabsTrigger>
          <TabsTrigger value="tracker">{t('interview.tracker')}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <InterviewDashboard
            onPlanInterview={() => setActiveTab('planner')}
            onStartMock={() => setActiveTab('questions')}
            onReviewStories={() => setActiveTab('stories')}
            onOpenQuestions={() => setActiveTab('questions')}
          />
        </TabsContent>

        <TabsContent value="planner" className="mt-6">
          <Planner onSave={(plan) => {
            setCurrentPlan(plan);
            setActiveTab('dashboard');
          }} />
        </TabsContent>

        <TabsContent value="questions" className="mt-6">
          <QuestionBank onStartMock={handleStartMock} />
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          <StoryBuilder />
        </TabsContent>

        <TabsContent value="mock" className="mt-6">
          <MockRoom
            questions={selectedQuestions}
            stories={selectedStories}
            onComplete={handleMockComplete}
          />
        </TabsContent>

        <TabsContent value="transcript" className="mt-6">
          {currentRun?.transcript && (
            <TranscriptEditor
              transcript={currentRun.transcript}
              onChange={(transcript) => {
                if (currentRun) {
                  updateRun(currentRun.id, { transcript });
                  setCurrentRun({ ...currentRun, transcript });
                }
              }}
              onFeedbackReady={handleFeedbackReady}
            />
          )}
        </TabsContent>

        <TabsContent value="rubric" className="mt-6">
          <RubricPanel
            initialScore={currentRun?.rubric}
            onSave={handleRubricSave}
          />
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          {currentRun?.feedbackHtml && (
            <FeedbackPanel feedbackHtml={currentRun.feedbackHtml} />
          )}
        </TabsContent>

        <TabsContent value="followups" className="mt-6">
          <Followups plan={currentPlan || undefined} />
        </TabsContent>

        <TabsContent value="tracker" className="mt-6">
          <TrackerBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
