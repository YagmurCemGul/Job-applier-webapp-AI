/**
 * Rating Simulator Component
 * 
 * Interactive simulator for modeling performance ratings with what-if analysis.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePerf } from '@/stores/perf.store';
import { simulateRating } from '@/services/perf/ratingSim.service';
import { Play, Save } from 'lucide-react';
import type { RubricKey } from '@/types/perf.types';

/**
 * Interactive rating simulator with sensitivity controls.
 */
export function RatingSimulator() {
  const { t } = useTranslation();
  const { rubrics } = usePerf();
  const [selectedRubricId, setSelectedRubricId] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<RubricKey, number>>({
    clarity: 2.5,
    structure: 2.5,
    impact: 2.5,
    ownership: 2.5,
    collaboration: 2.5,
    craft: 2.5,
  });
  const [evidenceBoost, setEvidenceBoost] = useState(0);
  const [sensitivity, setSensitivity] = useState(0);
  const [result, setResult] = useState<{ overall: number; perKey: Record<RubricKey, number> } | null>(
    null
  );

  const selectedRubric = rubrics.find((r) => r.id === selectedRubricId);

  const handleSimulate = () => {
    if (!selectedRubric) return;
    const res = simulateRating(selectedRubric, {
      perKey: scores,
      scenario: { evidenceBoostPct: evidenceBoost, sensitivity },
    });
    setResult(res);
  };

  const handleSaveScenario = () => {
    if (!selectedRubric || !result) return;
    const scenario = {
      id: crypto.randomUUID(),
      rubricId: selectedRubric.id,
      evidenceBoostPct: evidenceBoost,
      sensitivity,
      result,
    };
    usePerf.getState().upsertScenario(scenario);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rating Simulator</h2>
        <select
          value={selectedRubricId || ''}
          onChange={(e) => setSelectedRubricId(e.target.value || null)}
          className="rounded-md border px-3 py-1 text-sm"
        >
          <option value="">Select Rubric</option>
          {rubrics.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {selectedRubric && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(scores) as RubricKey[]).map((key) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={key} className="capitalize">
                      {key}
                    </Label>
                    <Badge variant="outline">{scores[key].toFixed(2)}</Badge>
                  </div>
                  <input
                    id={key}
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    value={scores[key]}
                    onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scenario Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="evidenceBoost">Evidence Boost (%)</Label>
                  <Badge variant="outline">{evidenceBoost}%</Badge>
                </div>
                <input
                  id="evidenceBoost"
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={evidenceBoost}
                  onChange={(e) => setEvidenceBoost(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sensitivity">Sensitivity</Label>
                  <Badge variant="outline">{sensitivity.toFixed(2)}</Badge>
                </div>
                <input
                  id="sensitivity"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSimulate} className="flex-1">
                  <Play className="mr-2 h-4 w-4" />
                  Simulate
                </Button>
                <Button onClick={handleSaveScenario} variant="outline" disabled={!result}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold">
                Overall: <Badge variant="default" className="text-2xl">{result.overall.toFixed(2)}</Badge>
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              {(Object.keys(result.perKey) as RubricKey[]).map((key) => (
                <div key={key} className="flex items-center justify-between rounded border p-2">
                  <span className="text-sm capitalize">{key}</span>
                  <Badge variant="outline">{result.perKey[key].toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
