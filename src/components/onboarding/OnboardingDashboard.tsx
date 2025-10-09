/**
 * @fileoverview Onboarding Dashboard component (Step 45)
 * @module components/onboarding/OnboardingDashboard
 */

import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, FileText, Users, TrendingUp } from 'lucide-react';
import type { Plan, ChecklistItem, CadenceEvent } from '@/types/onboarding.types';

interface Props {
  plan?: Plan;
  checklist: ChecklistItem[];
  cadences: CadenceEvent[];
  onGeneratePlan: () => void;
  onOpenChecklist: () => void;
  onScheduleCadences: () => void;
  onComposeWeekly: () => void;
}

/**
 * Onboarding Dashboard - KPIs and quick actions
 */
export function OnboardingDashboard({ plan, checklist, cadences, onGeneratePlan, onOpenChecklist, onScheduleCadences, onComposeWeekly }: Props) {
  const { t } = useTranslation();
  
  const daysToStart = plan?.startISO ? Math.ceil((new Date(plan.startISO).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const goalsDueThisWeek = (plan?.goals ?? []).filter(g => {
    if (!g.dueISO) return false;
    const due = new Date(g.dueISO);
    const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return due <= weekFromNow;
  }).length;
  
  const checklistComplete = checklist.length > 0 ? Math.round((checklist.filter(c => c.done).length / checklist.length) * 100) : 0;
  const upcomingCadences = cadences.filter(c => new Date(c.startISO) > new Date()).slice(0, 3);
  
  return (
    <div className="space-y-6">
      {/* Educational banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4" role="alert">
        <p className="text-sm text-amber-800">{t('onboard.educational')}</p>
      </div>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Days to Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysToStart}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Goals Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalsDueThisWeek}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Checklist Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{checklistComplete}%</div>
              <Progress value={checklistComplete} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Cadences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCadences.length}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button onClick={onGeneratePlan} className="w-full" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              {t('onboard.generatePlan')}
            </Button>
            <Button onClick={onOpenChecklist} className="w-full" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              {t('onboard.checklist')}
            </Button>
            <Button onClick={onScheduleCadences} className="w-full" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              {t('onboard.cadences')}
            </Button>
            <Button onClick={onComposeWeekly} className="w-full" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              {t('onboard.reports')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
