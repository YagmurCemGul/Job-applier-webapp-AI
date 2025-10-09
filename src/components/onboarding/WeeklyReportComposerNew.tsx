/**
 * @fileoverview Weekly Report Composer component (Step 45)
 * @module components/onboarding/WeeklyReportComposerNew
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sparkles, Mail, FileText } from 'lucide-react';
import { composeWeekly } from '@/services/onboarding/weeklyReport.service';
import { exportHTMLToGoogleDoc } from '@/services/export/googleDocs.service';
import type { Plan, SmartGoal } from '@/types/onboarding.types';

interface Props {
  plan?: Plan;
  onReportCreated: (html: string) => void;
}

/**
 * Weekly Report Composer - AI-assisted status updates
 */
export function WeeklyReportComposerNew({ plan, onReportCreated }: Props) {
  const { t } = useTranslation();
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [risks, setRisks] = useState('');
  const [asks, setAsks] = useState('');
  const [nextWeek, setNextWeek] = useState('');
  const [html, setHtml] = useState('');
  const [composing, setComposing] = useState(false);
  
  const handleToggleGoal = (id: string) => {
    const next = new Set(selectedGoals);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedGoals(next);
  };
  
  const handleCompose = async () => {
    setComposing(true);
    try {
      const goals = (plan?.goals ?? []).filter(g => selectedGoals.has(g.id));
      const report = await composeWeekly(goals, {
        risks: risks.split('\n').filter(Boolean),
        asks: asks.split('\n').filter(Boolean),
        next: nextWeek.split('\n').filter(Boolean)
      });
      setHtml(report.html || '');
      onReportCreated(report.html || '');
    } catch (err) {
      console.error('Failed to compose report:', err);
    } finally {
      setComposing(false);
    }
  };
  
  const handleSendEmail = () => {
    // In production, open email composer dialog
    alert('Email sending is configured in production with Gmail API');
  };
  
  const handleExportDoc = async () => {
    if (!html) return;
    try {
      const doc = await exportHTMLToGoogleDoc(html, 'Weekly Status Report');
      alert(`Exported to Google Doc: ${doc.url}`);
    } catch (err) {
      console.error('Failed to export doc:', err);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('onboard.reports')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Select goals */}
          <div>
            <h4 className="text-sm font-medium mb-2">Select Goals to Include</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {(plan?.goals ?? []).map(goal => (
                <div key={goal.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`goal-${goal.id}`}
                    checked={selectedGoals.has(goal.id)}
                    onCheckedChange={() => handleToggleGoal(goal.id)}
                  />
                  <Label htmlFor={`goal-${goal.id}`} className="text-sm">
                    {goal.title} ({goal.milestone.toUpperCase()})
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional sections */}
          <div className="space-y-3">
            <div>
              <Label>Risks (one per line)</Label>
              <Textarea
                value={risks}
                onChange={(e) => setRisks(e.target.value)}
                placeholder="Enter risks..."
                rows={3}
              />
            </div>
            <div>
              <Label>Asks (one per line)</Label>
              <Textarea
                value={asks}
                onChange={(e) => setAsks(e.target.value)}
                placeholder="Enter asks..."
                rows={3}
              />
            </div>
            <div>
              <Label>Next Week (one per line)</Label>
              <Textarea
                value={nextWeek}
                onChange={(e) => setNextWeek(e.target.value)}
                placeholder="Enter next week plans..."
                rows={3}
              />
            </div>
          </div>
          
          <Button onClick={handleCompose} disabled={composing} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            {composing ? 'Composing...' : 'Suggest with AI'}
          </Button>
          
          {/* Preview */}
          {html && (
            <div className="border-t pt-4 space-y-3">
              <h4 className="font-medium">Preview</h4>
              <div
                className="prose prose-sm max-w-none border rounded p-4 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <div className="flex gap-2">
                <Button onClick={handleSendEmail} variant="outline" className="flex-1">
                  <Mail className="mr-2 h-4 w-4" />
                  {t('onboard.sendEmail')}
                </Button>
                <Button onClick={handleExportDoc} variant="outline" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Save to Docs
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
