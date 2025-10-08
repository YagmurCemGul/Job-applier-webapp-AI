/**
 * Bias Guard Service
 * Provides real-time tips to reduce unconscious bias in interview feedback
 */

interface BiasRule {
  pattern: RegExp;
  tip: string;
  category: 'similarity' | 'vagueness' | 'stereotyping' | 'halo';
}

/**
 * Bias detection rules
 */
const rules: BiasRule[] = [
  {
    pattern: /\b(culture fit|fit in|fits well)\b/gi,
    tip: 'Consider "culture add" instead of "fit" to reduce similarity bias and value diverse perspectives.',
    category: 'similarity',
  },
  {
    pattern: /\b(communication issue|not clear)\b/gi,
    tip: 'Link to concrete examples and impact to avoid vague feedback. What specifically was unclear?',
    category: 'vagueness',
  },
  {
    pattern: /\b(likeable|nice|friendly|pleasant)\b/gi,
    tip: 'Focus on job-relevant competencies rather than personality adjectives that may reflect affinity bias.',
    category: 'similarity',
  },
  {
    pattern: /\b(aggressive|assertive|bossy)\b/gi,
    tip: 'Be aware of gendered language. Describe specific behaviors and their impact objectively.',
    category: 'stereotyping',
  },
  {
    pattern: /\b(too young|too old|overqualified)\b/gi,
    tip: 'Avoid age-related assumptions. Focus on skills, experience relevance, and growth potential.',
    category: 'stereotyping',
  },
  {
    pattern: /\b(not technical enough|not senior enough)\b/gi,
    tip: 'Provide specific examples of gaps relative to role requirements. Consider potential vs. current state.',
    category: 'vagueness',
  },
  {
    pattern: /\b(gut feeling|intuition|just feels)\b/gi,
    tip: 'Ground feedback in observable behaviors and specific examples to reduce halo/horn effects.',
    category: 'halo',
  },
  {
    pattern: /\b(impressive|brilliant|amazing)\b/gi,
    tip: 'Specify what was impressive with concrete examples to avoid halo effect and ensure consistent evaluation.',
    category: 'halo',
  },
  {
    pattern: /\b(cultural background|accent|where are you from)\b/gi,
    tip: 'Avoid comments on cultural background or accent unless directly relevant to job requirements.',
    category: 'stereotyping',
  },
  {
    pattern: /\b(family|children|marital status|pregnant)\b/gi,
    tip: 'Personal/family status questions may be discriminatory and are not relevant to job performance.',
    category: 'stereotyping',
  },
];

/**
 * Analyzes text for potential bias and returns applicable tips
 */
export function biasTips(text: string): Array<{ tip: string; category: string; match: string }> {
  const tips: Array<{ tip: string; category: string; match: string }> = [];

  for (const rule of rules) {
    const matches = text.match(rule.pattern);
    if (matches) {
      // Deduplicate by tip
      if (!tips.find(t => t.tip === rule.tip)) {
        tips.push({
          tip: rule.tip,
          category: rule.category,
          match: matches[0],
        });
      }
    }
  }

  return tips;
}

/**
 * Returns bias awareness guidelines
 */
export function getBiasGuidelines(): Array<{ title: string; description: string }> {
  return [
    {
      title: 'Culture Add vs. Culture Fit',
      description: 'Focus on what unique perspectives and experiences the candidate brings, not how similar they are to existing team members.',
    },
    {
      title: 'Specific and Observable',
      description: 'Ground all feedback in concrete examples and measurable outcomes, not gut feelings or general impressions.',
    },
    {
      title: 'Structured Evaluation',
      description: 'Use consistent rubrics and scorecards for all candidates to ensure fair, comparable assessments.',
    },
    {
      title: 'Diverse Panel',
      description: 'Include diverse perspectives in interview panels to reduce individual biases and blind spots.',
    },
    {
      title: 'Separate Note-Taking',
      description: 'Have each panelist take independent notes before discussing to avoid groupthink and anchoring.',
    },
    {
      title: 'Focus on Potential',
      description: 'Evaluate growth trajectory and learning ability, not just current state, especially for underrepresented candidates.',
    },
  ];
}

/**
 * Validates feedback for bias before submission
 */
export function validateFeedback(text: string): { valid: boolean; warnings: string[] } {
  const warnings = biasTips(text).map(t => t.tip);
  return {
    valid: warnings.length === 0,
    warnings,
  };
}
