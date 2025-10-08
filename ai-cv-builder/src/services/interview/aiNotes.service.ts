/**
 * AI Notes Service
 * Analyzes interview transcripts to extract STAR stories, strengths, concerns, and risk flags
 */

import type { Transcript } from '@/types/transcript.types';

/**
 * Analyzes transcript and generates AI insights
 * Uses Step 31 AI Orchestrator for intelligent summarization
 */
export async function analyzeTranscript(t: Transcript): Promise<Transcript['ai']> {
  const prompt = [
    'You are an interview note assistant analyzing a candidate interview transcript.',
    'Return a JSON object with the following fields:',
    '- summary: A concise 2-3 sentence summary of the interview',
    '- star: Array of STAR stories found (objects with situation, task, action, result)',
    '- strengths: Array of candidate strengths demonstrated',
    '- concerns: Array of potential concerns or areas for development',
    '- riskFlags: Array of concerning patterns (e.g., "vague impact", "lack of ownership")',
    '',
    'Focus on:',
    '- Measurable impact and quantifiable results',
    '- Ownership and initiative',
    '- Handling ambiguity and problem-solving',
    '- Communication clarity and structure',
    '- Cultural contribution (not just "fit")',
    '',
    'Transcript:',
    t.segments.map(s => `[${s.speaker}] ${s.text}`).join('\n'),
  ].join('\n');

  try {
    // Try to use Step 31 AI Complete service
    const { aiComplete } = await import('@/services/features/aiComplete.service');
    const res = await aiComplete(prompt, { json: true });
    const obj = typeof res === 'string' ? JSON.parse(res) : res;

    return {
      summary: obj.summary ?? '',
      star: obj.star ?? [],
      strengths: obj.strengths ?? [],
      concerns: obj.concerns ?? [],
      riskFlags: obj.riskFlags ?? [],
    };
  } catch (error) {
    console.error('Failed to analyze transcript:', error);
    
    // Fallback: basic analysis
    return {
      summary: 'Interview transcript analysis unavailable.',
      star: [],
      strengths: [],
      concerns: [],
      riskFlags: [],
    };
  }
}

/**
 * Extracts STAR stories from text using pattern matching
 */
export function extractSTARStories(text: string): Array<{
  situation: string;
  task: string;
  action: string;
  result: string;
}> {
  const stories: Array<{ situation: string; task: string; action: string; result: string }> = [];
  
  // Simple pattern matching for STAR indicators
  const situationMarkers = /\b(situation|context|challenge|problem)\b/gi;
  const taskMarkers = /\b(task|goal|objective|needed to)\b/gi;
  const actionMarkers = /\b(action|did|implemented|built|created)\b/gi;
  const resultMarkers = /\b(result|outcome|impact|achieved|improved)\b/gi;

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentStory: Partial<{ situation: string; task: string; action: string; result: string }> = {};
  
  for (const sentence of sentences) {
    if (situationMarkers.test(sentence)) {
      if (Object.keys(currentStory).length > 0) {
        if (currentStory.situation && currentStory.task && currentStory.action && currentStory.result) {
          stories.push(currentStory as any);
        }
        currentStory = {};
      }
      currentStory.situation = sentence.trim();
    } else if (taskMarkers.test(sentence) && !currentStory.task) {
      currentStory.task = sentence.trim();
    } else if (actionMarkers.test(sentence) && !currentStory.action) {
      currentStory.action = sentence.trim();
    } else if (resultMarkers.test(sentence) && !currentStory.result) {
      currentStory.result = sentence.trim();
    }
  }

  if (currentStory.situation && currentStory.task && currentStory.action && currentStory.result) {
    stories.push(currentStory as any);
  }

  return stories;
}
