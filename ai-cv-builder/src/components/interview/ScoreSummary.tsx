/**
 * Score Summary Component
 * Aggregates and displays scorecard results with export options
 */

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { Interview } from '@/types/interview.types';
import type { ScorecardTemplate, ScoreSubmission } from '@/types/scorecard.types';
import { exportScoreSummaryPDF, downloadPDF } from '@/services/export/scoreSummary.pdf.service';
import { exportScoreSummaryDocs } from '@/services/export/scoreSummary.docs.service';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';

interface Props {
  interview: Interview;
  template: ScorecardTemplate;
  submissions: ScoreSubmission[];
}

export default function ScoreSummary({ interview, template, submissions }: Props) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  const aggregates = useMemo(() => {
    if (submissions.length === 0) {
      return {
        overall: 0,
        dimensions: [],
        recommendations: {},
      };
    }

    // Calculate dimension averages and variance
    const dimensions = template.dimensions.map(dim => {
      const scores = submissions
        .map(s => s.ratings.find(r => r.dimensionId === dim.id)?.score)
        .filter((s): s is number => s !== undefined);

      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance =
        scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;

      return {
        dimensionId: dim.id,
        name: dim.name,
        average,
        variance,
        weight: dim.weight || 1,
      };
    });

    // Calculate weighted overall average
    const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
    const overall =
      dimensions.reduce((sum, d) => sum + d.average * d.weight, 0) / totalWeight;

    // Count recommendations
    const recommendations = submissions.reduce((acc, s) => {
      acc[s.recommendation] = (acc[s.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { overall, dimensions, recommendations };
  }, [submissions, template]);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const blob = await exportScoreSummaryPDF({
        interview,
        template,
        submissions,
        aggregates,
      });
      downloadPDF(
        blob,
        `interview-score-${interview.candidateName.replace(/\s+/g, '-')}.pdf`
      );
      toast({ title: 'PDF exported successfully' });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Could not export PDF',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportDocs = async () => {
    setExporting(true);
    try {
      const { url } = await exportScoreSummaryDocs(
        {
          interview,
          template,
          submissions,
          aggregates,
        },
        'default'
      );
      window.open(url, '_blank');
      toast({ title: 'Google Doc created' });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'Could not create Google Doc',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No score submissions yet
      </div>
    );
  }

  const getRecommendationColor = (rec: string) => {
    if (rec.includes('strong_yes')) return 'bg-green-500';
    if (rec.includes('yes')) return 'bg-blue-500';
    if (rec === 'lean_yes') return 'bg-yellow-500';
    if (rec === 'no') return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-3">Overall Score</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{aggregates.overall.toFixed(2)}</div>
          <div className="flex-1">
            <Progress value={aggregates.overall * 20} className="h-2" />
          </div>
          <div className="text-sm text-muted-foreground">/ 5.00</div>
        </div>
      </Card>

      {/* Dimension Breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold">Dimension Scores</h3>
        {aggregates.dimensions.map(dim => (
          <Card key={dim.dimensionId} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium">{dim.name}</span>
                {dim.weight !== 1 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Weight: {dim.weight}x)
                  </span>
                )}
              </div>
              <div className="text-lg font-semibold">{dim.average.toFixed(2)}</div>
            </div>
            <Progress value={dim.average * 20} className="h-1" />
            <div className="mt-1 text-xs text-muted-foreground">
              Variance: {dim.variance.toFixed(2)}
              {dim.variance > 1 && ' (High disagreement)'}
            </div>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Recommendations</h3>
        <div className="space-y-2">
          {Object.entries(aggregates.recommendations).map(([rec, count]) => (
            <div key={rec} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getRecommendationColor(rec)}`} />
                <span className="capitalize">{rec.replace(/_/g, ' ')}</span>
              </div>
              <Badge variant="secondary">{count}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Individual Submissions */}
      <div className="space-y-3">
        <h3 className="font-semibold">Individual Submissions</h3>
        {submissions.map(sub => (
          <Card key={sub.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">{sub.panelistId}</div>
              <Badge>{sub.recommendation.replace(/_/g, ' ')}</Badge>
            </div>
            {sub.overall && (
              <div className="text-sm text-muted-foreground mb-2">
                Overall: {sub.overall}/5
              </div>
            )}
            <div className="grid gap-1 text-xs">
              {sub.ratings.map(r => {
                const dimName = template.dimensions.find(d => d.id === r.dimensionId)?.name;
                return (
                  <div key={r.dimensionId} className="flex items-center justify-between">
                    <span>{dimName}:</span>
                    <span className="font-medium">{r.score}/5</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Export Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          variant="outline"
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
        <Button
          onClick={handleExportDocs}
          disabled={exporting}
          variant="outline"
          className="gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to Google Docs
        </Button>
      </div>
    </div>
  );
}
