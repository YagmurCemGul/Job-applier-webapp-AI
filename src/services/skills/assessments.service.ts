/**
 * Assessments Service (Step 47)
 * Start attempts, submit answers, and compute scores.
 */

import type { Assessment, Attempt } from '@/types/skills.types';
import { useSkills } from '@/stores/skills.store';
import { renderFeedback } from './scoring.service';

/**
 * Start an attempt.
 */
export function startAttempt(assessmentId: string) {
  const a: Attempt = {
    id: crypto.randomUUID(),
    assessmentId,
    startedAt: new Date().toISOString()
  };
  useSkills.getState().upsertAttempt(a);
  return a;
}

/**
 * Submit answers and compute score.
 */
export function submitAttempt(
  attemptId: string,
  answers: Attempt['answers'],
  rubricScores?: Attempt['rubricScores']
) {
  const attempt = useSkills.getState().attempts.find(x => x.id === attemptId);
  if (!attempt) throw new Error('Attempt not found');
  
  const asmt = useSkills.getState().assessments.find(x => x.id === attempt.assessmentId) as Assessment;
  
  let correct = 0;
  let totalQuiz = 0;
  
  for (const q of asmt.questions) {
    if (q.choices && q.answer) {
      totalQuiz++;
      if ((answers?.[q.id] ?? '') === q.answer) correct++;
    }
  }
  
  const quizPct = totalQuiz ? (correct / totalQuiz) * 100 : 0;
  const rubricPct = rubricScores
    ? (Object.values(rubricScores).reduce((a, b) => a + b, 0) /
        (asmt.questions.flatMap(q => q.rubric || []).reduce((a, b) => a + (b.max), 0) || 1)) * 100
    : 0;
  
  const scorePct = Math.round((quizPct * 0.6 + rubricPct * 0.4));
  const feedbackHtml = renderFeedback(asmt, { quizPct, rubricPct, scorePct });
  
  const finished: Attempt = {
    ...attempt,
    finishedAt: new Date().toISOString(),
    answers,
    rubricScores,
    scorePct,
    feedbackHtml
  };
  
  useSkills.getState().upsertAttempt(finished);
  return finished;
}
