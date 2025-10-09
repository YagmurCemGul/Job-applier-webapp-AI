/**
 * @fileoverview Rubric scoring panel for Step 43
 * @module components/interview/RubricPanel
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Save } from 'lucide-react';
import type { Rubric, RubricScore } from '@/types/rubric.types';
import { DEFAULT_RUBRIC, computeScore } from '@/services/interview/rubric.service';
import { toast } from 'sonner';

interface RubricPanelProps {
  rubric?: Rubric;
  initialScore?: RubricScore;
  onSave: (score: RubricScore) => void;
}

export function RubricPanel({ rubric = DEFAULT_RUBRIC, initialScore, onSave }: RubricPanelProps) {
  const { t } = useTranslation();
  const [ratings, setRatings] = useState<Record<string, number>>(
    initialScore?.scores || rubric.competencies.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {})
  );
  const [notes, setNotes] = useState(initialScore?.notes || '');

  const score = computeScore({ rubric, ratings, notes });

  const handleSave = () => {
    onSave(score);
    toast.success(t('interview.scoreSaved'));
  };

  const getScoreColor = (total: number) => {
    if (total >= 3.5) return 'text-green-600';
    if (total >= 2.5) return 'text-yellow-600';
    if (total >= 1.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{rubric.name} {t('interview.rubric')}</CardTitle>
          <div className={`text-3xl font-bold ${getScoreColor(score.total)}`}>
            {score.total.toFixed(2)}/4.0
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {rubric.competencies.map(comp => (
          <div key={comp.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={comp.key}>{comp.label}</Label>
              <span className="text-sm font-medium">{ratings[comp.key]}/4</span>
            </div>
            <Slider
              id={comp.key}
              min={0}
              max={4}
              step={1}
              value={[ratings[comp.key]]}
              onValueChange={([value]) => setRatings({ ...ratings, [comp.key]: value })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('interview.rubric.poor')}</span>
              <span>{t('interview.rubric.average')}</span>
              <span>{t('interview.rubric.excellent')}</span>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="notes">{t('interview.rubric.notes')}</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={t('interview.rubric.notesPlaceholder')}
            rows={4}
          />
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">{t('interview.rubric.breakdown')}</h4>
          <div className="space-y-1 text-sm">
            {rubric.competencies.map(comp => (
              <div key={comp.key} className="flex justify-between">
                <span>{comp.label}:</span>
                <span>{(ratings[comp.key] * comp.weight).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {t('interview.saveScore')}
        </Button>
      </CardContent>
    </Card>
  );
}
