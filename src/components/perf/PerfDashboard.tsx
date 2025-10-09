/**
 * Performance Dashboard Component
 * 
 * Displays KPIs and quick actions for performance review cycle.
 */

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerf } from '@/stores/perf.store';
import {
  MessageSquare,
  Link2,
  Calendar,
  FileText,
  Download,
  TrendingUp,
} from 'lucide-react';

interface PerfDashboardProps {
  onRequestFeedback: () => void;
  onLinkEvidence: () => void;
  onOpenCycle: () => void;
  onWriteNarrative: () => void;
  onExportPacket: () => void;
}

/**
 * Performance Review Dashboard with KPIs and quick actions.
 */
export function PerfDashboard({
  onRequestFeedback,
  onLinkEvidence,
  onOpenCycle,
  onWriteNarrative,
  onExportPacket,
}: PerfDashboardProps) {
  const { t } = useTranslation();
  const { responses, graph, calibrations, gaps } = usePerf();

  const latestCalib = calibrations[0];
  const latestGap = gaps[0];
  const responsesCount = responses.length;
  const evidenceCount = graph.length;
  const avgScore = latestCalib?.overall ?? 0;
  const promoReady = latestGap?.ready ?? false;

  return (
    <div className="space-y-6">
      {/* Privacy Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
        <p className="text-sm text-amber-900 dark:text-amber-100">
          🔒 {t('perf.private')}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Received</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responsesCount}</div>
            <p className="text-xs text-muted-foreground">responses collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evidence Linked</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evidenceCount}</div>
            <p className="text-xs text-muted-foreground">artifacts this cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rubric Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">out of 4.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotion Readiness</CardTitle>
            <Badge variant={promoReady ? 'default' : 'secondary'}>
              {promoReady ? '✅ Ready' : '⚠️ Gaps'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestGap?.level ?? 'N/A'}</div>
            <p className="text-xs text-muted-foreground">target level</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            onClick={onRequestFeedback}
            variant="outline"
            className="gap-2"
            accessKey="r"
          >
            <MessageSquare className="h-4 w-4" />
            Request 360 <kbd className="ml-1 rounded bg-muted px-1 text-xs">R</kbd>
          </Button>
          <Button
            onClick={onLinkEvidence}
            variant="outline"
            className="gap-2"
            accessKey="g"
          >
            <Link2 className="h-4 w-4" />
            Link Evidence <kbd className="ml-1 rounded bg-muted px-1 text-xs">G</kbd>
          </Button>
          <Button
            onClick={onOpenCycle}
            variant="outline"
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Open Cycle
          </Button>
          <Button
            onClick={onWriteNarrative}
            variant="outline"
            className="gap-2"
            accessKey="n"
          >
            <FileText className="h-4 w-4" />
            Write Narrative <kbd className="ml-1 rounded bg-muted px-1 text-xs">N</kbd>
          </Button>
          <Button
            onClick={onExportPacket}
            variant="default"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t('perf.exportPacket')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
