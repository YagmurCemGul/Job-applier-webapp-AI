/**
 * Assessment Center Component (Step 47)
 * Take assessments and receive explainable scores.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSkills } from '@/stores/skills.store';
import { startAttempt, submitAttempt } from '@/services/skills/assessments.service';
import { evaluateBadges } from '@/services/skills/badges.service';
import { CheckCircle2, Award } from 'lucide-react';
import type { Assessment, Attempt } from '@/types/skills.types';

/**
 * Assessment Center with quiz and rubric scoring.
 */
export function AssessmentCenter() {
  const { t } = useTranslation();
  const { assessments, attempts, upsertAssessment } = useSkills();
  const [activeAttempt, setActiveAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Seed sample assessment if none exist
  if (assessments.length === 0) {
    const sample: Assessment = {
      id: crypto.randomUUID(),
      title: 'System Design Basics',
      kind: 'quiz',
      competencyKey: 'system_design',
      passScore: 70,
      questions: [
        {
          id: crypto.randomUUID(),
          prompt: 'What is CAP theorem?',
          choices: ['Consistency, Availability, Partition tolerance', 'CPU, API, Protocol', 'Cache, Auth, Performance'],
          answer: 'Consistency, Availability, Partition tolerance'
        },
        {
          id: crypto.randomUUID(),
          prompt: 'Which pattern handles high read load?',
          choices: ['Caching', 'Sharding', 'Load Balancing'],
          answer: 'Caching'
        }
      ]
    };
    upsertAssessment(sample);
  }

  const handleStart = (assessmentId: string) => {
    const attempt = startAttempt(assessmentId);
    setActiveAttempt(attempt);
    setAnswers({});
  };

  const handleSubmit = () => {
    if (!activeAttempt) return;
    const finished = submitAttempt(activeAttempt.id, answers);
    setActiveAttempt(null);
    
    // Evaluate badges
    const asmt = assessments.find(a => a.id === finished.assessmentId);
    if (asmt) evaluateBadges(asmt.competencyKey);
  };

  const currentAssessment = activeAttempt 
    ? assessments.find(a => a.id === activeAttempt.assessmentId)
    : null;

  if (activeAttempt && currentAssessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{currentAssessment.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentAssessment.questions.map((q, idx) => (
            <div key={q.id} className="space-y-2">
              <h4 className="font-medium">
                {idx + 1}. {q.prompt}
              </h4>
              {q.choices && (
                <div className="space-y-2 ml-4">
                  {q.choices.map(choice => (
                    <label key={choice} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={choice}
                        checked={answers[q.id] === choice}
                        onChange={() => setAnswers({ ...answers, [q.id]: choice })}
                        className="w-4 h-4"
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Submit Assessment
            </Button>
            <Button variant="outline" onClick={() => setActiveAttempt(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentAttempt = attempts[0];

  return (
    <div className="space-y-6">
      {/* Recent Result */}
      {recentAttempt?.feedbackHtml && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Progress value={recentAttempt.scorePct ?? 0} className="h-2 mb-2" />
              <p className="text-2xl font-bold">{recentAttempt.scorePct}%</p>
            </div>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: recentAttempt.feedbackHtml }}
            />
          </CardContent>
        </Card>
      )}

      {/* Available Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Available Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessments.map(asmt => (
              <div key={asmt.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{asmt.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {asmt.competencyKey} • {asmt.questions.length} questions • {asmt.passScore}% to pass
                  </p>
                </div>
                <Button onClick={() => handleStart(asmt.id)}>
                  Start
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
