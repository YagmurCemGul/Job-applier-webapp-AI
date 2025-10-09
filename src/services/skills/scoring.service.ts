/**
 * Scoring Service (Step 47)
 * Render explainable feedback for assessments.
 */

import type { Assessment } from '@/types/skills.types';

/**
 * Explainable feedback render.
 */
export function renderFeedback(
  asmt: Assessment,
  s: { quizPct: number; rubricPct: number; scorePct: number }
) {
  return [
    `<h3>Assessment Results — ${asmt.title}</h3>`,
    `<p>Quiz: ${Math.round(s.quizPct)}%, Rubric: ${Math.round(s.rubricPct)}%, <b>Total:</b> ${s.scorePct}%</p>`,
    `<p>Scoring weights: Quiz 60% / Rubric 40%. This is educational guidance, not certification.</p>`
  ].join('\n');
}
