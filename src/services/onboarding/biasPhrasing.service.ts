/**
 * @fileoverview Bias-safe phrasing service for feedback nudges.
 * @module services/onboarding/biasPhrasing
 */

/**
 * Nudge towards bias-safe phrasing in feedback/notes.
 */
const patterns = [
  {
    re: /\b(culture fit)\b/i,
    suggest: 'Consider "culture add" and focus on values & behaviors.',
  },
  {
    re: /\b(aggressive|bossy)\b/i,
    suggest: 'Describe specific behaviors and impact instead of labels.',
  },
  {
    re: /\b(rockstar|ninja)\b/i,
    suggest: 'Use job-relevant competencies instead of stereotypes.',
  },
];

/**
 * Get bias-safe phrasing suggestions for text.
 * @param text - Input text
 * @returns Suggestions array
 */
export function suggestBiasSafe(text: string): string[] {
  return patterns.filter((p) => p.re.test(text)).map((p) => p.suggest);
}
