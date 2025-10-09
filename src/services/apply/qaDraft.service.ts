/**
 * @fileoverview Q&A draft service using AI
 * Generates answers to screener questions based on profile and highlights
 */

import type { Screener } from '@/types/apply.types';
import { aiComplete } from '@/services/features/aiComplete.service';
import { useSite } from '@/stores/site.store';
import { useReviews } from '@/stores/review.store';

/**
 * Draft answers using profile + highlights; capped for ATS; neutral, bias-checked by qaPolicy later.
 * @param questions - Array of screener questions
 * @param lang - Language code
 * @returns Questions with drafted answers
 */
export async function draftAnswers(questions: Screener[], lang: 'en'|'tr'): Promise<Screener[]> {
  const profile = useSite.getState().profile;
  const highlights = (useReviews.getState().selfReviews[0]?.highlights ?? []).slice(0,5);
  
  const sys = [
    `Write ${lang==='tr'?'Türkçe':'English'} concise answers to application screeners.`,
    `Use bullet points where helpful; stay under 900 characters per answer.`,
    `Ground in these highlights: ${JSON.stringify(highlights)}.`,
    `Profile headline: ${profile.headline}. Skills: ${profile.skills?.join(', ')||''}.`
  ].join('\n');
  
  const prompt = questions.map((q,i)=> `${i+1}. ${q.prompt}`).join('\n');
  const out = String(await aiComplete(`${sys}\nQuestions:\n${prompt}`)||'').split(/\n+/);
  
  return questions.map((q,i)=> ({
    ...q,
    answer: out[i] ? out[i].slice(0,900) : ''
  }));
}
