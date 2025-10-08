/**
 * Scorecards Tab
 * Scorecard template selection, panelist submissions, and score summary
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Interview } from '@/types/interview.types';
import { useScorecards } from '@/stores/scorecards.store';
import ScorecardEditor from '../ScorecardEditor';
import ScorecardRun from '../ScorecardRun';
import ScoreSummary from '../ScoreSummary';
import { Award, Edit, Plus, BarChart } from 'lucide-react';

interface Props {
  interview: Interview;
  onUpdate: (interview: Interview) => void;
}

export default function ScorecardsTab({ interview, onUpdate }: Props) {
  const { templates, byInterview, getTemplate } = useScorecards();
  const [showEditor, setShowEditor] = useState(false);
  const [showRun, setShowRun] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);

  const template = getTemplate(interview.scorecardTemplateId);
  const submissions = byInterview(interview.id);

  const handleSelectTemplate = (templateId: string) => {
    onUpdate({ ...interview, scorecardTemplateId: templateId });
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      {!template && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Select Scorecard Template</h2>
          {templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No templates available</p>
              <Button onClick={() => setShowEditor(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Template
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <Card
                  key={t.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectTemplate(t.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{t.name}</h3>
                      {t.role && (
                        <p className="text-sm text-muted-foreground">For: {t.role}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t.dimensions.length} dimensions
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                onClick={() => setShowEditor(true)}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Template
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Selected Template */}
      {template && (
        <>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{template.name}</h2>
                {template.role && (
                  <p className="text-sm text-muted-foreground">For: {template.role}</p>
                )}
              </div>
              <Button variant="outline" onClick={() => setEditingTemplate(true)} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Template
              </Button>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">Dimensions</h3>
              {template.dimensions.map(d => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{d.name}</span>
                    {d.description && (
                      <span className="text-muted-foreground ml-2">- {d.description}</span>
                    )}
                  </div>
                  {d.weight && d.weight !== 1 && (
                    <span className="text-xs text-muted-foreground">Weight: {d.weight}x</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Score */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Submit Your Score</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Panel members can independently submit their ratings
            </p>
            <Button onClick={() => setShowRun(true)} className="gap-2">
              <Award className="w-4 h-4" />
              Submit Score
            </Button>
          </Card>

          {/* Score Summary */}
          {submissions.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Score Summary
                </h2>
                <span className="text-sm text-muted-foreground">
                  {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
                </span>
              </div>
              <ScoreSummary interview={interview} template={template} submissions={submissions} />
            </Card>
          )}
        </>
      )}

      {/* Dialogs */}
      {showEditor && (
        <ScorecardEditor
          open={showEditor}
          onOpenChange={setShowEditor}
          template={editingTemplate ? template : undefined}
        />
      )}

      {showRun && template && (
        <ScorecardRun
          open={showRun}
          onOpenChange={setShowRun}
          interview={interview}
          template={template}
        />
      )}
    </div>
  );
}
