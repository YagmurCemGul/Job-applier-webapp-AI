/**
 * @fileoverview Interview dashboard with KPIs and quick actions for Step 43
 * @module components/interview/InterviewDashboard
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, PlayCircle, BookOpen, MessageSquare, TrendingUp } from 'lucide-react';
import { useInterview } from '@/stores/interview.store';

interface InterviewDashboardProps {
  onPlanInterview: () => void;
  onStartMock: () => void;
  onReviewStories: () => void;
  onOpenQuestions: () => void;
}

/**
 * Dashboard showing interview coaching KPIs and quick actions
 */
export function InterviewDashboard({
  onPlanInterview,
  onStartMock,
  onReviewStories,
  onOpenQuestions
}: InterviewDashboardProps) {
  const { t } = useTranslation();
  const { plans, runs, stories, followups } = useInterview();

  // Calculate KPIs
  const upcomingInterviews = plans.filter(
    p => Date.parse(p.startISO) > Date.now()
  ).length;

  const completedMocks = runs.filter(r => r.endedAt).length;

  const avgRubricScore = runs.length > 0
    ? runs
        .filter(r => r.rubric)
        .reduce((sum, r) => sum + (r.rubric?.total || 0), 0) /
      runs.filter(r => r.rubric).length
    : 0;

  const followupsDue = followups.filter(
    f => !f.sentId && f.scheduledISO && Date.parse(f.scheduledISO) < Date.now()
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              {t('interview.upcomingInterviews')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcomingInterviews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('interview.scheduled')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-green-500" />
              {t('interview.completedMocks')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedMocks}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('interview.practiceRuns')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              {t('interview.avgScore')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {avgRubricScore > 0 ? avgRubricScore.toFixed(1) : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('interview.outOf4')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-orange-500" />
              {t('interview.followupsDue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{followupsDue}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('interview.pending')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('interview.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={onPlanInterview}
              className="w-full"
              variant="default"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {t('interview.planInterview')}
            </Button>

            <Button
              onClick={onStartMock}
              className="w-full"
              variant="default"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              {t('interview.startMock')}
            </Button>

            <Button
              onClick={onReviewStories}
              className="w-full"
              variant="outline"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {t('interview.reviewStories')}
            </Button>

            <Button
              onClick={onOpenQuestions}
              className="w-full"
              variant="outline"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              {t('interview.openQuestionBank')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {stories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('interview.recentStories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stories.slice(0, 3).map(story => (
                <div
                  key={story.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium">{story.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {story.tags.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
