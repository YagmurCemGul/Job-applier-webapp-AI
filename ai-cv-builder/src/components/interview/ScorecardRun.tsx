/**
 * Scorecard Run Component
 * Panelist submission form with ratings and recommendations
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useScorecards } from '@/stores/scorecards.store';
import { useInterviews } from '@/stores/interviews.store';
import type { Interview } from '@/types/interview.types';
import type { ScorecardTemplate, ScoreSubmission, Scale } from '@/types/scorecard.types';
import { Award } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview;
  template: ScorecardTemplate;
}

export default function ScorecardRun({ open, onOpenChange, interview, template }: Props) {
  const { upsertSubmission } = useScorecards();
  const { update } = useInterviews();
  
  const [panelistId, setPanelistId] = useState('');
  const [ratings, setRatings] = useState<Record<string, { score: Scale; note: string }>>({});
  const [overall, setOverall] = useState<Scale>(3);
  const [recommendation, setRecommendation] = useState<ScoreSubmission['recommendation']>('lean_yes');

  const handleRatingChange = (dimensionId: string, score: number) => {
    setRatings({
      ...ratings,
      [dimensionId]: {
        score: score as Scale,
        note: ratings[dimensionId]?.note || '',
      },
    });
  };

  const handleNoteChange = (dimensionId: string, note: string) => {
    setRatings({
      ...ratings,
      [dimensionId]: {
        score: ratings[dimensionId]?.score || 3,
        note,
      },
    });
  };

  const handleSubmit = () => {
    const submission: ScoreSubmission = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      interviewId: interview.id,
      panelistId: panelistId || 'anonymous',
      ratings: template.dimensions.map(d => ({
        dimensionId: d.id,
        score: ratings[d.id]?.score || 3,
        note: ratings[d.id]?.note || undefined,
      })),
      overall,
      recommendation,
      submittedAt: new Date().toISOString(),
    };

    upsertSubmission(submission);
    
    // Add submission ID to interview
    update(interview.id, {
      scoreSubmissions: [...interview.scoreSubmissions, submission.id],
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setPanelistId('');
    setRatings({});
    setOverall(3);
    setRecommendation('lean_yes');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Submit Score - {template.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Panelist ID */}
          <div className="space-y-2">
            <Label htmlFor="panelist">Your Name or Email</Label>
            <input
              id="panelist"
              type="text"
              value={panelistId}
              onChange={e => setPanelistId(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Rubric Reference */}
          {template.rubric && (
            <Card className="p-4 bg-muted/50">
              <h3 className="font-semibold text-sm mb-2">Rating Scale</h3>
              <div className="grid gap-1 text-xs">
                {Object.entries(template.rubric).map(([scale, desc]) => (
                  <div key={scale}>
                    <strong>{scale}:</strong> {desc}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Dimension Ratings */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dimension Ratings</h3>
            {template.dimensions.map(dim => (
              <Card key={dim.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">{dim.name}</div>
                    {dim.description && (
                      <p className="text-sm text-muted-foreground">{dim.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Score</Label>
                      <span className="text-sm font-semibold">
                        {ratings[dim.id]?.score || 3}/5
                      </span>
                    </div>
                    <Slider
                      value={[ratings[dim.id]?.score || 3]}
                      onValueChange={([v]) => handleRatingChange(dim.id, v)}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>

                  <Textarea
                    placeholder="Notes (optional)"
                    value={ratings[dim.id]?.note || ''}
                    onChange={e => handleNoteChange(dim.id, e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Overall Rating */}
          <Card className="p-4">
            <div className="space-y-3">
              <Label>Overall Rating</Label>
              <div className="flex items-center justify-between">
                <Slider
                  value={[overall]}
                  onValueChange={([v]) => setOverall(v as Scale)}
                  min={1}
                  max={5}
                  step={1}
                  className="flex-1"
                />
                <span className="ml-4 text-lg font-semibold">{overall}/5</span>
              </div>
            </div>
          </Card>

          {/* Recommendation */}
          <div className="space-y-3">
            <Label>Final Recommendation</Label>
            <RadioGroup value={recommendation} onValueChange={(v: any) => setRecommendation(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strong_yes" id="strong_yes" />
                <Label htmlFor="strong_yes" className="cursor-pointer">
                  Strong Yes - Exceptional candidate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">
                  Yes - Good candidate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lean_yes" id="lean_yes" />
                <Label htmlFor="lean_yes" className="cursor-pointer">
                  Lean Yes - Acceptable candidate
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer">
                  No - Not recommended
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strong_no" id="strong_no" />
                <Label htmlFor="strong_no" className="cursor-pointer">
                  Strong No - Definitely not recommended
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Score</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
