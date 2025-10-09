/**
 * @fileoverview A/B Test Lab Component
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOutreach } from '@/stores/outreach.store';
import { pickAbWinner } from '@/services/outreach/abtest.service';
import type { Sequence, AbGoal } from '@/types/outreach.types';
import { FlaskConical, TrendingUp } from 'lucide-react';

/**
 * A/B test lab with variant metrics and winner selection.
 */
export function ABTestLab() {
  const { t } = useTranslation();
  const { sequences, upsertSequence } = useOutreach();
  const [selected, setSelected] = useState<Sequence | null>(
    sequences.find(s => s.ab?.enabled) || sequences[0] || null
  );

  const handleEnableAB = () => {
    if (!selected) return;
    const updated: Sequence = {
      ...selected,
      ab: { enabled: true, goal: 'reply_rate', variants: { A: {}, B: {} } },
    };
    upsertSequence(updated);
    setSelected(updated);
  };

  const handlePickWinner = () => {
    if (!selected || !selected.ab?.enabled) return;
    const result = pickAbWinner(selected, selected.ab.goal);
    if (result.winner) {
      alert(`Winner: Variant ${result.winner} (z-score: ${result.z}, pA: ${result.pA}, pB: ${result.pB})`);
    } else {
      alert(`No conclusive winner yet (z-score: ${result.z}, pA: ${result.pA}, pB: ${result.pB})`);
    }
  };

  const abEnabled = selected?.ab?.enabled;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Sequence Selector */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FlaskConical className="inline mr-2 h-5 w-5" />
            {t('outreach.abtests')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sequences.map(seq => (
              <div
                key={seq.id}
                className={`p-2 border rounded cursor-pointer ${selected?.id === seq.id ? 'bg-muted' : ''}`}
                onClick={() => setSelected(seq)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{seq.name}</p>
                  {seq.ab?.enabled && (
                    <Badge variant="default">A/B Enabled</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* A/B Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>A/B Controls</span>
            {!abEnabled ? (
              <Button onClick={handleEnableAB} variant="default" size="sm">
                Enable A/B
              </Button>
            ) : (
              <Button onClick={handlePickWinner} variant="default" size="sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Pick Winner
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selected ? (
            <p className="text-sm text-muted-foreground">Select a sequence</p>
          ) : !abEnabled ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                A/B testing is not enabled for this sequence. Enable it to test subject/body variants.
              </p>
              <p className="text-xs text-muted-foreground">
                When enabled, the system will split sends between Variant A and B, then calculate statistical significance.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Goal</p>
                <p className="text-sm text-muted-foreground">{selected.ab?.goal}</p>
              </div>
              <div>
                <p className="font-medium">Variants</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="border p-2 rounded">
                    <Badge>Variant A</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Control version
                    </p>
                  </div>
                  <div className="border p-2 rounded">
                    <Badge>Variant B</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Test version
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Click "Pick Winner" to run z-test analysis. Winner is chosen at ~95% confidence level (|z| ≥ 1.96).
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
