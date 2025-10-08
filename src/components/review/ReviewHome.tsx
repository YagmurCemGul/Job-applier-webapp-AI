/**
 * @fileoverview Review home dashboard
 * Shows cycle overview with KPIs and quick actions
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, MessageSquare, FileText, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviews } from '@/stores/review.store';
import { useFeedback } from '@/stores/feedback.store';
import type { ReviewCycle } from '@/types/review.types';

interface ReviewHomeProps {
  cycle: ReviewCycle;
  onNavigate: (tab: string) => void;
}

/**
 * Cycle selector + status; KPIs (impact entries count, feedback response rate,
 * self-review completeness, calibration readiness); actions (Start Cycle,
 * Request Feedback, Compose Self-Review, Build Promo Packet)
 */
export function ReviewHome({ cycle, onNavigate }: ReviewHomeProps) {
  const { t } = useTranslation();
  const { impactsByCycle, selfByCycle } = useReviews();
  const { byCycle } = useFeedback();
  
  const impacts = impactsByCycle(cycle.id);
  const self = selfByCycle(cycle.id);
  const { requests, responses } = byCycle(cycle.id);
  
  const kpis = useMemo(() => {
    const responseRate = requests.length > 0
      ? Math.round((responses.length / requests.length) * 100)
      : 0;
    
    const completeness = self
      ? Math.round(
          ((self.overview ? 1 : 0) +
            (self.highlights.length > 0 ? 1 : 0) +
            (self.growthAreas.length > 0 ? 1 : 0) +
            (self.nextObjectives.length > 0 ? 1 : 0)) /
            4 *
            100
        )
      : 0;
    
    const readiness = impacts.length > 0 && responses.length > 0 && self ? 100 : 50;
    
    return {
      impacts: impacts.length,
      responseRate,
      completeness,
      readiness,
    };
  }, [impacts, requests, responses, self]);
  
  const stageColors = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    collecting: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    synthesizing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    calibration: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    finalized: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    archived: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{cycle.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${stageColors[cycle.stage]}`}>
              {cycle.stage.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-sm text-muted-foreground">
              {new Date(cycle.startISO).toLocaleDateString()} - {new Date(cycle.endISO).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            <h3 className="font-semibold text-sm">{t('review.kpis.impacts', 'Impacts')}</h3>
          </div>
          <p className="text-3xl font-bold">{kpis.impacts}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('review.kpis.impactsDesc', 'Evidence items')}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
            <h3 className="font-semibold text-sm">{t('review.kpis.responses', 'Response Rate')}</h3>
          </div>
          <p className="text-3xl font-bold">{kpis.responseRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {responses.length}/{requests.length} {t('review.kpis.responsesDesc', 'responses')}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" aria-hidden="true" />
            <h3 className="font-semibold text-sm">{t('review.kpis.completeness', 'Self-Review')}</h3>
          </div>
          <p className="text-3xl font-bold">{kpis.completeness}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('review.kpis.completenessDesc', 'Complete')}
          </p>
        </div>
        
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <h3 className="font-semibold text-sm">{t('review.kpis.readiness', 'Calibration')}</h3>
          </div>
          <p className="text-3xl font-bold">{kpis.readiness}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('review.kpis.readinessDesc', 'Ready')}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => onNavigate('impact')}
          className="h-auto py-4 flex flex-col items-start"
        >
          <TrendingUp className="w-5 h-5 mb-2" aria-hidden="true" />
          <span className="font-semibold">{t('review.manageImpact', 'Manage Impact')}</span>
          <span className="text-xs text-muted-foreground">
            {t('review.manageImpactDesc', 'Track and tag your contributions')}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onNavigate('feedback')}
          className="h-auto py-4 flex flex-col items-start"
        >
          <MessageSquare className="w-5 h-5 mb-2" aria-hidden="true" />
          <span className="font-semibold">{t('review.collectFeedback', 'Collect Feedback')}</span>
          <span className="text-xs text-muted-foreground">
            {t('review.collectFeedbackDesc', 'Request and review 360 feedback')}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onNavigate('self-review')}
          className="h-auto py-4 flex flex-col items-start"
        >
          <FileText className="w-5 h-5 mb-2" aria-hidden="true" />
          <span className="font-semibold">{t('review.writeSelfReview', 'Write Self-Review')}</span>
          <span className="text-xs text-muted-foreground">
            {t('review.writeSelfReviewDesc', 'AI-assisted STAR review')}
          </span>
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onNavigate('promotion')}
          className="h-auto py-4 flex flex-col items-start"
        >
          <Award className="w-5 h-5 mb-2" aria-hidden="true" />
          <span className="font-semibold">{t('review.buildPromotion', 'Build Promotion Case')}</span>
          <span className="text-xs text-muted-foreground">
            {t('review.buildPromotionDesc', 'Assemble packet with evidence')}
          </span>
        </Button>
      </div>
      
      {cycle.deadlines.length > 0 && (
        <div className="border rounded-md p-4 bg-card">
          <h3 className="font-semibold mb-3">{t('review.upcomingDeadlines', 'Upcoming Deadlines')}</h3>
          <div className="space-y-2">
            {cycle.deadlines
              .sort((a, b) => new Date(a.atISO).getTime() - new Date(b.atISO).getTime())
              .slice(0, 5)
              .map(d => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="text-muted-foreground">
                    {new Date(d.atISO).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
