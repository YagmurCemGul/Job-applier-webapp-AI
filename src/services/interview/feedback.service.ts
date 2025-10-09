/**
 * @fileoverview AI feedback service for Step 43
 * @module services/interview/feedback
 */

import { aiComplete } from '@/services/features/aiComplete.service';
import type { Transcript } from '@/types/interview.types';

/**
 * Redact sensitive information from text
 * @param text - Text to redact
 * @returns Redacted text
 */
export function redactSensitiveInfo(text: string): string {
  return text
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      '[redacted-email]'
    )
    .replace(
      /\+?\d[\d\s\-().]{6,}\d/g,
      '[redacted-phone]'
    );
}

/**
 * Build explainable AI feedback from transcript
 * Focus on: strengths, improvement areas, action items
 * @param t - Transcript
 * @param rubricNotes - Optional rubric notes
 * @returns Feedback HTML
 */
export async function buildFeedbackHTML(
  t: Transcript,
  rubricNotes?: string
): Promise<string> {
  // Redact sensitive information
  const guard = redactSensitiveInfo(t.text || '');

  const prompt = [
    'Provide concise interview feedback with the following structure:',
    '',
    '## Strengths',
    '- List 2-3 specific strengths demonstrated',
    '',
    '## Areas for Improvement',
    '- List 2-3 specific areas to work on',
    '',
    '## Action Items',
    '- List 2-3 concrete next steps',
    '',
    'Guidelines:',
    '- Focus on clarity, structure, impact, and ownership',
    '- Avoid assumptions about personal or demographic attributes',
    '- Provide specific, actionable feedback',
    '- Be constructive and encouraging',
    '',
    rubricNotes ? `Rubric Notes: ${rubricNotes}` : '',
    '',
    'Transcript excerpt:',
    guard.slice(0, 8000)
  ].join('\n');

  try {
    const response = await aiComplete(prompt);
    const html = String(response || '<p>No feedback available</p>');

    // Convert markdown to basic HTML
    return html
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[hul])/gm, '<p>')
      .replace(/(?<!>)$/gm, '</p>');
  } catch (error) {
    console.error('Failed to generate feedback:', error);
    return '<p>Unable to generate feedback at this time. Please try again.</p>';
  }
}

/**
 * Extract key insights from feedback
 * @param feedbackHtml - Feedback HTML
 * @returns Key insights array
 */
export function extractInsights(feedbackHtml: string): string[] {
  const insights: string[] = [];
  
  // Extract list items from HTML
  const listItemRegex = /<li>(.+?)<\/li>/g;
  let match;
  
  while ((match = listItemRegex.exec(feedbackHtml)) !== null) {
    insights.push(match[1].replace(/<[^>]+>/g, '').trim());
  }
  
  return insights;
}

/**
 * Generate follow-up questions based on feedback
 * @param feedbackHtml - Feedback HTML
 * @returns Follow-up questions
 */
export async function generateFollowUpQuestions(
  feedbackHtml: string
): Promise<string[]> {
  const prompt = `Based on this interview feedback, generate 3 follow-up questions to help the candidate improve. Return as JSON array of strings.

Feedback:
${feedbackHtml.slice(0, 2000)}`;

  try {
    const response = await aiComplete(prompt);
    const text = String(response || '[]');
    
    // Try to extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    
    return JSON.parse(jsonText);
  } catch {
    return [
      'How would you approach this differently next time?',
      'What additional preparation would help?',
      'What resources could strengthen this area?'
    ];
  }
}
