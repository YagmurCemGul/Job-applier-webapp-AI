import type { Transcript } from '@/types/transcript.types'

/**
 * Provider-agnostic ASR interface
 * Fallback: Web Speech API (where available) to demo live segments
 */
export interface ASRProvider {
  start(
    lang: 'en' | 'tr',
    onSegment: (seg: {
      atMs: number
      durMs: number
      speaker: 'Interviewer' | 'Candidate'
      text: string
    }) => void
  ): Promise<void>
  stop(): Promise<void>
}

/**
 * Web Speech API implementation (browser fallback)
 */
export class WebSpeechASR implements ASRProvider {
  private rec?: SpeechRecognition
  private startAt = 0

  async start(
    lang: 'en' | 'tr',
    onSegment: (seg: {
      atMs: number
      durMs: number
      speaker: 'Interviewer' | 'Candidate'
      text: string
    }) => void
  ): Promise<void> {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition

    if (!SR) {
      throw new Error('ASR not supported on this browser')
    }

    this.rec = new SR()
    this.rec.lang = lang === 'tr' ? 'tr-TR' : 'en-US'
    this.rec.continuous = true
    this.startAt = performance.now()

    this.rec.onresult = (e: any) => {
      const r = e.results[e.resultIndex]
      const t = r[0].transcript

      onSegment({
        atMs: performance.now() - this.startAt,
        durMs: 0,
        speaker: 'Candidate',
        text: t,
      })
    }

    this.rec.start()
  }

  async stop(): Promise<void> {
    this.rec?.stop()
  }
}

/**
 * Compose transcript object from collected segments
 */
export function makeTranscript(
  interviewId: string,
  lang: 'en' | 'tr',
  segs: Transcript['segments']
): Transcript {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    interviewId,
    createdAt: new Date().toISOString(),
    language: lang,
    segments: segs,
  }
}
