import type { Offer } from '@/types/offer.types'
import type { NegotiationPlan } from '@/types/negotiation.types'
import { aiRoute } from '@/services/ai/router.service'

/**
 * Generate a negotiation plan using Step 31 AI orchestrator
 * Provides strategy, talking points, target adjustments, and email templates
 */
export async function buildNegotiationPlan(
  o: Offer,
  context: {
    market?: string
    priorities?: string[]
    batna?: string
  }
): Promise<NegotiationPlan> {
  const prompt = [
    'You are a negotiation coach for job offers.',
    'Return JSON with fields: strategy (string), talkingPoints (string[]), targetAdjustments ([{field, askPct?, askAbs?, rationale}]), riskNotes (string[]), emails ([{subject, bodyHtml}]).',
    'Focus on respectful tone, data-backed rationale, and optional alternatives (signing vs equity vs base).',
    `Offer: ${JSON.stringify(o)}`,
    `Context: ${JSON.stringify(context)}`
  ].join('\n')

  try {
    const result = await aiRoute(
      {
        task: 'generate',
        prompt,
        temperature: 0.4,
        maxTokens: 1500
      },
      { allowCache: true }
    )

    if (!result.ok || !result.text) {
      return createFallbackPlan(o, context)
    }

    const obj =
      typeof result.text === 'string' ? JSON.parse(result.text) : result.text

    const plan: NegotiationPlan = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      offerId: o.id,
      strategy: obj.strategy ?? '',
      talkingPoints: obj.talkingPoints ?? [],
      targetAdjustments: obj.targetAdjustments ?? [],
      riskNotes: obj.riskNotes ?? [],
      batna: context.batna,
      emails: (obj.emails ?? []).map((e: any) => ({
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Math.random()),
        subject: e.subject ?? '',
        bodyHtml: e.bodyHtml ?? ''
      }))
    }

    return plan
  } catch {
    return createFallbackPlan(o, context)
  }
}

/**
 * Fallback plan if AI fails
 */
function createFallbackPlan(
  o: Offer,
  context: { batna?: string }
): NegotiationPlan {
  return {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now()),
    offerId: o.id,
    strategy: 'Use data-backed rationale and maintain professional tone',
    talkingPoints: [
      'Thank them for the offer',
      'Express enthusiasm for the role',
      'Share market research if available',
      'Be flexible and collaborative'
    ],
    targetAdjustments: [],
    riskNotes: ['Verify internal policies before negotiating'],
    batna: context.batna,
    emails: []
  }
}
