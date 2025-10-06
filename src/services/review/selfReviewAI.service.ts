import type { SelfReview, ImpactEntry } from '@/types/review.types'
import { aiRoute } from '@/services/ai/router.service'

/**
 * Generate a self-review grounded in impact entries using STAR and strong verbs
 */
export async function generateSelfReview(
  cycleId: string,
  lang: 'en' | 'tr',
  impacts: ImpactEntry[]
): Promise<SelfReview> {
  const prompt = [
    `Write a concise ${lang === 'tr' ? 'Türkçe' : 'English'} self-review using STAR.`,
    `Sections: Overview (3-5 sentences), Highlights (4-7 bullets with metrics), Growth Areas (2-4 bullets), Next Objectives (3-5 bullets).`,
    `Use strong action verbs. Avoid filler. Keep total under 600 words.`,
    `Ground strictly in these impact items (JSON): ${JSON.stringify(impacts.slice(0, 20))}`,
  ].join('\n')

  try {
    const result = await aiRoute(
      {
        task: 'generate',
        prompt,
        temperature: 0.4,
        maxTokens: 1200,
      },
      { allowCache: true }
    )

    if (!result.ok || !result.text) {
      return createFallbackReview(cycleId, lang)
    }

    const text = String(result.text || '')
    return materializeSelfReview(cycleId, lang, text)
  } catch {
    return createFallbackReview(cycleId, lang)
  }
}

/**
 * Materialize self-review from text
 */
export function materializeSelfReview(
  cycleId: string,
  lang: 'en' | 'tr',
  text: string
): SelfReview {
  const parts = sectionize(text)
  const wc = text.trim().split(/\s+/).length
  const clarity = Math.max(0.1, Math.min(1, 1 - wc / 900)) // shorter → clearer

  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    cycleId,
    lang,
    overview: parts.overview,
    highlights: parts.highlights,
    growthAreas: parts.growth,
    nextObjectives: parts.objectives,
    wordCount: wc,
    clarityScore: clarity,
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Parse sections from text
 */
function sectionize(t: string): {
  overview: string
  highlights: string[]
  growth: string[]
  objectives: string[]
} {
  const get = (h: string) =>
    (t.split(new RegExp(`${h}\\s*:?`, 'i'))[1] || '').split(/\n\n|^\s*$/m)[0] || ''

  const bullets = (s: string) =>
    s
      .split(/\n/)
      .map((x) => x.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)

  const ov = /overview/i.test(t) ? get('overview') : t.split('\n')[0]
  const hi = bullets(/highlights/i.test(t) ? get('highlights') : t)
  const gr = bullets(/growth/i.test(t) ? get('growth') : '')
  const no = bullets(/objectives|next steps/i.test(t) ? get('objectives|next steps') : '')

  return {
    overview: ov.trim(),
    highlights: hi.slice(0, 7),
    growth: gr.slice(0, 5),
    objectives: no.slice(0, 5),
  }
}

/**
 * Create fallback review if AI fails
 */
function createFallbackReview(cycleId: string, lang: 'en' | 'tr'): SelfReview {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    cycleId,
    lang,
    overview:
      lang === 'tr'
        ? 'Lütfen kendiniz için değerlendirme yazın.'
        : 'Please write your self-review.',
    highlights: [],
    growthAreas: [],
    nextObjectives: [],
    wordCount: 0,
    clarityScore: 0,
    updatedAt: new Date().toISOString(),
  }
}
