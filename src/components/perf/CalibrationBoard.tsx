/**
 * Calibration Board Component
 * 
 * Displays rubric heatmap and outlier detection for review cycles.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePerf } from '@/stores/perf.store';
import { calibrate } from '@/services/perf/calibration.service';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import type { RubricKey } from '@/types/perf.types';

/**
 * Calibration board with rubric heatmap and outlier detection.
 */
export function CalibrationBoard() {
  const { t } = useTranslation();
  const { cycles, calibrations } = usePerf();
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const selectedCalib = calibrations.find((c) => c.cycleId === selectedCycleId);

  const handleRecompute = () => {
    if (!selectedCycleId) return;
    calibrate(selectedCycleId);
  };

  const handleSaveNotes = () => {
    if (!selectedCalib) return;
    usePerf.getState().upsertCalib({ ...selectedCalib, notes });
  };

  const getScoreColor = (score: number) => {
    if (score >= 3.5) return 'bg-green-500';
    if (score >= 2.5) return 'bg-yellow-500';
    if (score >= 1.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Calibration</h2>
        <div className="flex gap-2">
          <select
            value={selectedCycleId || ''}
            onChange={(e) => setSelectedCycleId(e.target.value || null)}
            className="rounded-md border px-3 py-1 text-sm"
          >
            <option value="">Select Cycle</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <Button onClick={handleRecompute} size="sm" disabled={!selectedCycleId}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('perf.recompute')}
          </Button>
        </div>
      </div>

      {selectedCalib && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rubric Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                {(Object.keys(selectedCalib.aggScores) as RubricKey[]).map((key) => {
                  const score = selectedCalib.aggScores[key];
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold capitalize">{key}</span>
                        <Badge variant="outline">{score.toFixed(2)}</Badge>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${getScoreColor(score)}`}
                          style={{ width: `${(score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <p className="text-lg font-semibold">
                  Overall: <Badge variant="default">{selectedCalib.overall.toFixed(2)}</Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          {selectedCalib.outliers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Outliers Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedCalib.outliers.map((out, i) => (
                    <div key={i} className="flex items-center gap-3 rounded border p-2">
                      <Badge variant="outline">{out.reviewer.slice(0, 8)}...</Badge>
                      <span className="text-sm">{out.key}</span>
                      <Badge variant={out.delta > 0 ? 'default' : 'destructive'}>
                        {out.delta > 0 ? '+' : ''}
                        {out.delta}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add calibration notes..."
                rows={4}
              />
              <Button onClick={handleSaveNotes} size="sm">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedCalib && selectedCycleId && (
        <p className="text-center text-sm text-muted-foreground">
          No calibration data yet. Click "Recompute" to generate.
        </p>
      )}
    </div>
  );
}
