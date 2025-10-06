import type { Transcript } from '@/types/transcript.types'
import { aiRoute } from '@/services/ai/router.service'

/**
 * Summarize transcript
 * Extract STAR stories, strengths, concerns, risk flags
 */
export async function analyzeTranscript(t: Transcript): Promise<Transcript['ai']> {
  const prompt = [
    'You are an interview note assistant.',
    'Given the transcript, return JSON with fields: summary, star[ {situation, task, action, result} ], strengths[], concerns[], riskFlags[].',
    'Focus on measurable impact, ownership, ambiguity handling, communication, and culture add.',
    `Transcript:\n${t.segments.map((s) => `[${s.speaker}] ${s.text}`).join('\n')}`,
  ].join('\n')

  try {
    const result = await aiRoute(
      {
        task: 'generate',
        prompt,
        temperature: 0.3,
        maxTokens: 1000,
      },
      { allowCache: true }
    )

    if (!result.ok || !result.text) {
      return {
        summary: '',
        star: [],
        strengths: [],
        concerns: [],
        riskFlags: [],
      }
    }

    const obj = typeof result.text === 'string' ? JSON.parse(result.text) : result.text

    return {
      summary: obj.summary ?? '',
      star: obj.star ?? [],
      strengths: obj.strengths ?? [],
      concerns: obj.concerns ?? [],
      riskFlags: obj.riskFlags ?? [],
    }
  } catch {
    return {
      summary: '',
      star: [],
      strengths: [],
      concerns: [],
      riskFlags: [],
    }
  }
}
