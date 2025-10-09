/**
 * Promotion Readiness Component
 * 
 * Assesses promotion readiness with gap analysis and action planning.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePerf } from '@/stores/perf.store';
import { analyzeGaps } from '@/services/perf/promotion.service';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { RubricKey } from '@/types/perf.types';

/**
 * Promotion readiness assessment with gap analysis.
 */
export function PromotionReadiness() {
  const { t } = useTranslation();
  const { expectations, calibrations, gaps } = usePerf();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const latestCalib = calibrations[0];
  const latestGap = gaps.find((g) => g.level === selectedLevel);

  const handleAnalyze = () => {
    if (!selectedLevel || !latestCalib) return;
    const gap = analyzeGaps(selectedLevel, latestCalib.aggScores, expectations);
    usePerf.getState().upsertGap(gap);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Promotion Readiness</h2>
        <div className="flex gap-2">
          <select
            value={selectedLevel || ''}
            onChange={(e) => setSelectedLevel(e.target.value || null)}
            className="rounded-md border px-3 py-1 text-sm"
          >
            <option value="">Select Target Level</option>
            {expectations.map((e) => (
              <option key={e.id} value={e.level}>
                {e.level}
              </option>
            ))}
          </select>
          <Button onClick={handleAnalyze} size="sm" disabled={!selectedLevel}>
            Analyze
          </Button>
        </div>
      </div>

      {selectedLevel && !latestGap && (
        <p className="text-sm text-muted-foreground">
          Click "Analyze" to compute gap analysis for {selectedLevel}.
        </p>
      )}

      {latestGap && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Readiness Status</span>
                {latestGap.ready ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Gaps Found
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestGap.gaps.map((gap) => {
                  const isMet = gap.current >= gap.target;
                  return (
                    <div key={gap.key} className="rounded border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-semibold capitalize">{gap.key}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{gap.current.toFixed(2)}</Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{gap.target.toFixed(2)}</Badge>
                          {isMet ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                      </div>
                      {gap.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-semibold text-muted-foreground">Actions:</p>
                          <ul className="list-inside list-disc space-y-1 text-sm">
                            {gap.actions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expected Behaviors for {latestGap.level}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expectations
                  .find((e) => e.level === latestGap.level)
                  ?.behaviors.map((b) => (
                    <div key={b.key} className="rounded border p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize">{b.key}</span>
                        <Badge variant="outline">Bar: {b.bar}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{b.descriptor}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
