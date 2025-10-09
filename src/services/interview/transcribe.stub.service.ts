/**
 * @fileoverview Local transcription stub service for Step 43
 * On-device transcript stub: splits text by silence markers the UI injects (manual notes)
 * @module services/interview/transcribe.stub
 */

import type { Transcript } from '@/types/interview.types';

/**
 * Create a stub transcript from audio blob (local processing only)
 * For privacy, we do not upload; return a stub with duration guess
 * @param blob - Audio/video blob
 * @param lang - Language code
 * @returns Stub transcript with heuristic duration
 */
export async function transcribeLocal(
  blob: Blob,
  lang: Transcript['lang'] = 'en'
): Promise<Transcript> {
  // Heuristic: ~128KB per minute for compressed audio
  const minutes = Math.max(1, Math.round(blob.size / (128 * 1024)));

  const text = `[Local stub transcript] Approximately ${minutes} minute${minutes === 1 ? '' : 's'} of recording. Add notes during mock interview to create detailed segments.`;

  const segments = [
    {
      t0: 0,
      t1: minutes * 60,
      text
    }
  ];

  return {
    lang,
    text,
    segments,
    wordsPerMin: 120, // Average speaking rate
    fillerCount: 0,
    talkListenRatio: 0.9 // Assume mostly talking
  };
}

/**
 * Analyze transcript for filler words
 * @param text - Transcript text
 * @returns Filler word count
 */
export function countFillers(text: string): number {
  const fillers = /\b(um|uh|like|you know|kind of|sort of|basically|actually|literally)\b/gi;
  const matches = text.match(fillers);
  return matches ? matches.length : 0;
}

/**
 * Calculate words per minute
 * @param text - Transcript text
 * @param durationSeconds - Duration in seconds
 * @returns Words per minute
 */
export function calculateWPM(text: string, durationSeconds: number): number {
  const words = text.trim().split(/\s+/).length;
  const minutes = durationSeconds / 60;
  return minutes > 0 ? Math.round(words / minutes) : 0;
}

/**
 * Estimate talk/listen ratio from segments
 * @param segments - Transcript segments
 * @param totalDuration - Total duration in seconds
 * @returns Talk/listen ratio (0-1, higher = more talking)
 */
export function estimateTalkRatio(
  segments: Array<{ t0: number; t1: number; text: string }>,
  totalDuration: number
): number {
  const talkTime = segments.reduce((sum, seg) => sum + (seg.t1 - seg.t0), 0);
  return totalDuration > 0 ? Math.min(1, talkTime / totalDuration) : 0;
}
