/**
 * Evidence Graph Component
 * 
 * Bipartite graph linking SMART goals to evidence artifacts.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePerf } from '@/stores/perf.store';
import { linkEvidence, goalProgress } from '@/services/perf/evidenceGraph.service';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink, Plus } from 'lucide-react';
import type { EvidenceLink } from '@/types/perf.types';

/**
 * Visualizes and manages goal-to-evidence links.
 */
export function EvidenceGraph() {
  const { t } = useTranslation();
  const { graph } = usePerf();
  const [showForm, setShowForm] = useState(false);
  const [goalId, setGoalId] = useState('');
  const [source, setSource] = useState<EvidenceLink['source']>('evidence');
  const [refId, setRefId] = useState('');
  const [title, setTitle] = useState('');
  const [metricDelta, setMetricDelta] = useState<number | undefined>(undefined);
  const [url, setUrl] = useState('');

  const handleLink = () => {
    linkEvidence({ goalId, source, refId, title, metricDelta, url: url || undefined });
    setGoalId('');
    setRefId('');
    setTitle('');
    setMetricDelta(undefined);
    setUrl('');
    setShowForm(false);
  };

  // Group by goalId
  const byGoal = graph.reduce((acc, item) => {
    if (!acc[item.goalId]) acc[item.goalId] = [];
    acc[item.goalId].push(item);
    return acc;
  }, {} as Record<string, EvidenceLink[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Goal ↔ Evidence Links</h2>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Link Evidence
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Link Evidence to Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goalId">Goal ID</Label>
                <Input
                  id="goalId"
                  value={goalId}
                  onChange={(e) => setGoalId(e.target.value)}
                  placeholder="goal-uuid"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <select
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="evidence">Evidence</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="interview">Interview</option>
                  <option value="review">Review</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refId">Artifact ID</Label>
                <Input
                  id="refId"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  placeholder="artifact-uuid"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Reduced latency by 30%"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metricDelta">Metric Δ (optional)</Label>
                <Input
                  id="metricDelta"
                  type="number"
                  value={metricDelta ?? ''}
                  onChange={(e) => setMetricDelta(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="+25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (optional)</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <Button onClick={handleLink} disabled={!goalId || !refId || !title}>
              Link
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {Object.entries(byGoal).map(([gId, items]) => {
          const prog = goalProgress(gId);
          return (
            <Card key={gId}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>Goal: {gId.slice(0, 8)}...</span>
                  <Badge variant="outline">
                    {prog.delta >= 0 ? '+' : ''}
                    {prog.delta} Δ ({prog.count} items)
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-center gap-3 rounded border p-2">
                      <Badge variant="secondary">{it.source}</Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{it.title}</span>
                      {it.metricDelta !== undefined && (
                        <Badge variant="outline">
                          {it.metricDelta >= 0 ? '+' : ''}
                          {it.metricDelta}
                        </Badge>
                      )}
                      {it.url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(it.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {Object.keys(byGoal).length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No evidence links yet. Link artifacts to goals to track progress.
          </p>
        )}
      </div>
    </div>
  );
}
