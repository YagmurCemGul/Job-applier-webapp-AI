/**
 * Transcription Service
 * Provider-agnostic ASR interface with Web Speech API fallback
 */

import type { Transcript } from '@/types/transcript.types';

/**
 * ASR Provider interface for pluggable transcription services
 */
export interface ASRProvider {
  start(
    lang: 'en' | 'tr',
    onSegment: (seg: {
      atMs: number;
      durMs: number;
      speaker: 'Interviewer' | 'Candidate' | 'System';
      text: string;
    }) => void
  ): Promise<void>;
  stop(): Promise<void>;
}

/**
 * Web Speech API implementation (browser fallback)
 */
export class WebSpeechASR implements ASRProvider {
  private rec?: SpeechRecognition;
  private startAt = 0;

  async start(
    lang: 'en' | 'tr',
    onSegment: (seg: {
      atMs: number;
      durMs: number;
      speaker: 'Interviewer' | 'Candidate' | 'System';
      text: string;
    }) => void
  ): Promise<void> {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      throw new Error('Speech recognition not supported on this browser');
    }

    this.rec = new SR();
    this.rec.lang = lang === 'tr' ? 'tr-TR' : 'en-US';
    this.rec.continuous = true;
    this.rec.interimResults = false;
    this.startAt = performance.now();

    this.rec.onresult = (e: any) => {
      const result = e.results[e.resultIndex];
      const transcript = result[0].transcript;
      onSegment({
        atMs: Math.floor(performance.now() - this.startAt),
        durMs: 0,
        speaker: 'Candidate',
        text: transcript,
      });
    };

    this.rec.onerror = (e: any) => {
      console.error('Speech recognition error:', e.error);
    };

    this.rec.start();
  }

  async stop(): Promise<void> {
    this.rec?.stop();
  }
}

/**
 * Composes a transcript object from collected segments
 */
export function makeTranscript(
  interviewId: string,
  lang: 'en' | 'tr',
  segs: Transcript['segments']
): Transcript {
  return {
    id: crypto?.randomUUID?.() ?? String(Date.now()),
    interviewId,
    createdAt: new Date().toISOString(),
    language: lang,
    segments: segs,
  };
}

/**
 * Factory to get appropriate ASR provider
 */
export function getASRProvider(): ASRProvider {
  // For now, always return Web Speech API
  // Future: add checks for other providers (Azure, Google Cloud Speech, etc.)
  return new WebSpeechASR();
}
