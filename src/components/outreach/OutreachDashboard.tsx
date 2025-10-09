/**
 * @fileoverview Outreach Dashboard Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOutreach } from '@/stores/outreach.store';
import {
  Users,
  Send,
  TrendingUp,
  AlertCircle,
  Upload,
  PlayCircle,
  FileText,
} from 'lucide-react';

interface OutreachDashboardProps {
  onImportCsv: () => void;
  onNewSequence: () => void;
  onRunTick: () => void;
  onExportReport: () => void;
}

/**
 * Outreach Dashboard with KPIs and quick actions.
 */
export function OutreachDashboard({
  onImportCsv,
  onNewSequence,
  onRunTick,
  onExportReport,
}: OutreachDashboardProps) {
  const { t } = useTranslation();
  const { prospects, campaigns, logs } = useOutreach();

  const activeProspects = prospects.filter(p => p.status !== 'unsubscribed' && p.status !== 'do_not_contact').length;
  const sentToday = logs.filter(l => {
    const today = new Date().toISOString().split('T')[0];
    return l.sentAt.split('T')[0] === today;
  }).length;
  
  const totalReplies = logs.filter(l => l.replied).length;
  const totalSent = logs.filter(l => l.status === 'sent').length;
  const replyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';
  
  const bounces = logs.filter(l => l.status === 'bounced').length;

  return (
    <div className="space-y-6">
      {/* Compliance Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          🛡️ {t('outreach.consent')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProspects}</div>
            <p className="text-xs text-muted-foreground">contactable</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentToday}</div>
            <p className="text-xs text-muted-foreground">emails delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{replyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalReplies}/{totalSent} replies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounces</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bounces}</div>
            <p className="text-xs text-muted-foreground">delivery failures</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={onImportCsv} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {t('outreach.importCsv')}
          </Button>
          <Button onClick={onNewSequence} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            New Sequence
          </Button>
          <Button onClick={onRunTick} variant="default">
            <PlayCircle className="mr-2 h-4 w-4" />
            {t('outreach.runTick')}
          </Button>
          <Button onClick={onExportReport} variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            {t('outreach.exportReport')}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns yet. Create a sequence and run a campaign.</p>
          ) : (
            <div className="space-y-2">
              {campaigns.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.metrics.sent || 0} sent • {c.metrics.replies || 0} replies
                    </p>
                  </div>
                  <Badge variant={c.status === 'running' ? 'default' : 'secondary'}>
                    {c.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
