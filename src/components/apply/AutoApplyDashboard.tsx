/**
 * @fileoverview Auto-Apply Dashboard component
 * @module components/apply/AutoApplyDashboard
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApply } from '@/stores/apply.store';
import { FileText, CheckCircle, Clock, Send } from 'lucide-react';

export function AutoApplyDashboard() {
  const { t } = useTranslation();
  const { postings, runs } = useApply();
  
  const readyPostings = postings.filter(p => p.questions.length > 0).length;
  const pendingReviews = runs.filter(r => r.stage === 'review').length;
  const submittedThisWeek = runs.filter(r => {
    const weekAgo = Date.now() - 7*86400000;
    return r.stage === 'submitted' && new Date(r.createdAt).getTime() > weekAgo;
  }).length;
  const avgCoverage = runs.length > 0
    ? Math.round(runs.reduce((sum, r) => sum + r.coverage.keywordMatchPct, 0) / runs.length)
    : 0;
  
  const stats = [
    { label: t('apply.stats.ready'), value: readyPostings, icon: FileText, color: 'text-blue-600' },
    { label: t('apply.stats.coverage'), value: `${avgCoverage}%`, icon: CheckCircle, color: 'text-green-600' },
    { label: t('apply.stats.pending'), value: pendingReviews, icon: Clock, color: 'text-yellow-600' },
    { label: t('apply.stats.submitted'), value: submittedThisWeek, icon: Send, color: 'text-purple-600' }
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('apply.dashboard')}</h1>
        <p className="text-muted-foreground mt-2">{t('apply.dashboardDesc')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button variant="outline" className="w-full">
          <FileText className="mr-2 h-4 w-4" />
          {t('apply.intake')}
        </Button>
        <Button variant="outline" className="w-full">
          {t('apply.qa')}
        </Button>
        <Button variant="outline" className="w-full">
          {t('apply.autofill')}
        </Button>
        <Button variant="outline" className="w-full">
          {t('apply.history')}
        </Button>
      </div>
    </div>
  );
}
