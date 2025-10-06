/**
 * Lightweight bias guard tips triggered on certain phrases
 * Client-only
 */

const rules = [
  {
    pattern: /\b(culture fit|fit in)\b/i,
    tip: 'Consider "culture add" instead of "fit" to reduce similarity bias.'
  },
  {
    pattern: /\b(communication issue)\b/i,
    tip: 'Link to concrete examples and impact to avoid vague feedback.'
  },
  {
    pattern: /\b(likeable|nice)\b/i,
    tip: 'Focus on job-relevant competencies, not personality adjectives.'
  },
  {
    pattern: /\b(young|old|age)\b/i,
    tip: 'Avoid age-related comments. Focus on skills and experience.'
  },
  {
    pattern: /\b(aggressive|emotional)\b/i,
    tip: 'Use neutral, objective language. Describe specific behaviors.'
  }
]

export function biasTips(text: string): string[] {
  return rules.filter((r) => r.pattern.test(text)).map((r) => r.tip)
}
