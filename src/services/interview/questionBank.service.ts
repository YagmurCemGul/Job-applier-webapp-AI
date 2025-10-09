/**
 * @fileoverview Question bank management service for Step 43
 * @module services/interview/questionBank
 */

import type { QuestionItem } from '@/types/interview.types';
import { useQuestionBank } from '@/stores/questionBank.store';
import { aiComplete } from '@/services/features/aiComplete.service';

/**
 * Seed default questions (idempotent) for behavioral/system design/coding
 */
export function seedDefaultQuestions(): void {
  // Only seed if bank is empty
  if (useQuestionBank.getState().items.length > 0) {
    return;
  }

  const mk = (
    prompt: string,
    kind: QuestionItem['kind'],
    tags: string[],
    diff: QuestionItem['difficulty']
  ): QuestionItem => ({
    id: crypto.randomUUID(),
    prompt,
    kind,
    tags,
    difficulty: diff,
    source: 'bank'
  });

  const defaults: QuestionItem[] = [
    // Behavioral
    mk(
      'Tell me about a time you led without authority.',
      'behavioral',
      ['leadership', 'influence'],
      3
    ),
    mk(
      'Describe a situation where you had to deal with ambiguity.',
      'behavioral',
      ['ambiguity', 'ownership'],
      3
    ),
    mk(
      'Tell me about a time you disagreed with your manager.',
      'behavioral',
      ['communication', 'conflict'],
      4
    ),
    mk(
      'Share an example of a project that failed and what you learned.',
      'behavioral',
      ['learning', 'resilience'],
      3
    ),

    // System Design
    mk(
      'Design a URL shortener.',
      'system_design',
      ['design', 'scalability'],
      3
    ),
    mk(
      'Design a rate limiter.',
      'system_design',
      ['design', 'algorithms'],
      4
    ),
    mk(
      'Design a distributed cache.',
      'system_design',
      ['distributed', 'cache'],
      5
    ),

    // Coding
    mk(
      'Given an array of integers, return indices of the two numbers that add up to target.',
      'coding',
      ['arrays', 'hashmap'],
      2
    ),
    mk(
      'Reverse a linked list.',
      'coding',
      ['linked-list', 'pointers'],
      2
    ),
    mk(
      'Find the longest substring without repeating characters.',
      'coding',
      ['strings', 'sliding-window'],
      3
    ),

    // Product
    mk(
      'How would you improve our product for new users?',
      'product',
      ['product-sense', 'user-experience'],
      3
    ),
    mk(
      'Design a feature to increase user engagement.',
      'product',
      ['metrics', 'growth'],
      4
    ),

    // Analytics
    mk(
      'How would you measure the success of a new feature launch?',
      'analytics',
      ['metrics', 'experimentation'],
      3
    ),
    mk(
      'Explain A/B testing to a non-technical stakeholder.',
      'analytics',
      ['communication', 'statistics'],
      2
    )
  ];

  useQuestionBank.getState().bulk(defaults);
}

/**
 * Generate interview questions from a job description using AI
 * @param jd - Job description text
 * @param role - Role title
 * @returns Array of generated questions
 */
export async function generateFromJD(
  jd: string,
  role: string
): Promise<QuestionItem[]> {
  const prompt = `From this job description for a ${role}, produce 6 concise interview questions (mix behavioral, role-specific, and one culture fit).
Return ONLY valid JSON array with objects containing these exact fields:
- prompt (string): the question text
- kind (string): one of: behavioral, system_design, coding, product, design, analytics, managerial
- tags (array of 3 strings): relevant tags
- difficulty (number): 1-5

Job Description:
${jd.slice(0, 4000)}

Respond with ONLY the JSON array, no other text.`;

  try {
    const text = String((await aiComplete(prompt)) || '[]');
    
    // Try to extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonText) as Array<{
      prompt: string;
      kind: string;
      tags: string[];
      difficulty: number;
    }>;

    return parsed.map(x => ({
      id: crypto.randomUUID(),
      prompt: x.prompt,
      kind: (x.kind as QuestionItem['kind']) || 'behavioral',
      tags: x.tags || [],
      difficulty: Math.min(5, Math.max(1, Math.floor(x.difficulty))) as QuestionItem['difficulty'],
      source: 'jd'
    }));
  } catch (error) {
    console.error('Failed to parse AI-generated questions:', error);
    return [];
  }
}

/**
 * Filter questions by criteria
 * @param items - All questions
 * @param filters - Filter criteria
 * @returns Filtered questions
 */
export function filterQuestions(
  items: QuestionItem[],
  filters: {
    kind?: QuestionItem['kind'];
    tags?: string[];
    minDifficulty?: number;
    maxDifficulty?: number;
    search?: string;
  }
): QuestionItem[] {
  return items.filter(q => {
    if (filters.kind && q.kind !== filters.kind) return false;
    if (filters.tags && !filters.tags.some(t => q.tags.includes(t))) return false;
    if (filters.minDifficulty && q.difficulty < filters.minDifficulty) return false;
    if (filters.maxDifficulty && q.difficulty > filters.maxDifficulty) return false;
    if (filters.search && !q.prompt.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });
}
