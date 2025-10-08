/**
 * @fileoverview Negotiation coach service for Step 37 — AI-powered negotiation planning
 * @module services/offer/negotiationCoach
 * 
 * Integrates with Step 31 AI orchestrator to generate negotiation strategies,
 * talking points, and email templates.
 */

import type { Offer } from '@/types/offer.types';
import type { NegotiationPlan, NegotiationContext } from '@/types/negotiation.types';

/**
 * Generate negotiation plan using AI
 * 
 * @param offer - Job offer to negotiate
 * @param context - Additional context (market data, priorities, BATNA)
 * @returns AI-generated negotiation plan
 */
export async function buildNegotiationPlan(
  offer: Offer,
  context: NegotiationContext
): Promise<NegotiationPlan> {
  try {
    // Import Step 31 AI service
    const { aiComplete } = await import('@/services/features/aiComplete.service');

    const prompt = buildNegotiationPrompt(offer, context);

    const response = await aiComplete(prompt, { json: true });

    const parsed = typeof response === 'string' ? JSON.parse(response) : response;

    return {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      offerId: offer.id,
      strategy: parsed.strategy ?? 'Focus on value alignment and market positioning.',
      talkingPoints: Array.isArray(parsed.talkingPoints) ? parsed.talkingPoints : [],
      targetAdjustments: Array.isArray(parsed.targetAdjustments) ? parsed.targetAdjustments : [],
      riskNotes: Array.isArray(parsed.riskNotes) ? parsed.riskNotes : [],
      batna: context.batna,
      emails: Array.isArray(parsed.emails)
        ? parsed.emails.map((e: any) => ({
            id: crypto?.randomUUID?.() ?? String(Math.random()),
            subject: e.subject ?? 'Offer Discussion',
            bodyHtml: e.bodyHtml ?? e.body ?? ''
          }))
        : []
    };
  } catch (error) {
    console.error('Failed to generate negotiation plan:', error);
    
    // Fallback plan
    return {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      offerId: offer.id,
      strategy: 'Research market rates and prepare data-backed rationale for adjustments.',
      talkingPoints: [
        'Express enthusiasm for the role and company',
        'Present market research supporting your ask',
        'Be flexible on components (base vs equity vs signing)',
        'Maintain professional and collaborative tone'
      ],
      targetAdjustments: [],
      riskNotes: ['AI service unavailable - using fallback guidance'],
      batna: context.batna,
      emails: []
    };
  }
}

/**
 * Build negotiation prompt for AI
 */
function buildNegotiationPrompt(offer: Offer, context: NegotiationContext): string {
  return [
    'You are an expert career coach specializing in job offer negotiations.',
    'Generate a negotiation plan in JSON format with these fields:',
    '- strategy: overall negotiation strategy (string)',
    '- talkingPoints: key points to emphasize (array of strings)',
    '- targetAdjustments: suggested adjustments with field, askPct/askAbs, rationale (array)',
    '- riskNotes: potential risks or concerns (array of strings)',
    '- emails: draft email templates with subject and bodyHtml (array)',
    '',
    'Guidelines:',
    '- Be respectful and collaborative',
    '- Use data-backed rationale',
    '- Suggest alternatives (e.g., signing bonus vs equity vs base)',
    '- Consider BATNA (Best Alternative To Negotiated Agreement)',
    '- Keep emails professional and concise',
    '',
    'Offer Details:',
    `- Company: ${offer.company}`,
    `- Role: ${offer.role}`,
    `- Base: ${offer.baseAnnual} ${offer.currency}`,
    `- Bonus: ${offer.bonusTargetPct ?? 0}%`,
    `- Location: ${offer.location ?? 'Not specified'}`,
    `- Remote: ${offer.remote ?? 'Not specified'}`,
    '',
    'Context:',
    `- Market: ${context.market ?? 'Not provided'}`,
    `- Priorities: ${context.priorities?.join(', ') ?? 'Not specified'}`,
    `- BATNA: ${context.batna ?? 'Not specified'}`,
    '',
    'Return valid JSON only.'
  ].join('\n');
}

/**
 * Generate counter-offer email
 */
export async function generateCounterEmail(
  offer: Offer,
  adjustments: Array<{ field: string; value: string; rationale: string }>
): Promise<{ subject: string; bodyHtml: string }> {
  try {
    const { aiComplete } = await import('@/services/features/aiComplete.service');

    const prompt = [
      'Generate a professional counter-offer email.',
      'Format: JSON with subject and bodyHtml fields.',
      'Tone: enthusiastic but professional, data-backed.',
      '',
      `Company: ${offer.company}`,
      `Role: ${offer.role}`,
      '',
      'Requested adjustments:',
      ...adjustments.map(a => `- ${a.field}: ${a.value} (${a.rationale})`),
      '',
      'Return valid JSON only.'
    ].join('\n');

    const response = await aiComplete(prompt, { json: true });
    const parsed = typeof response === 'string' ? JSON.parse(response) : response;

    return {
      subject: parsed.subject ?? `${offer.role} Offer Discussion`,
      bodyHtml: parsed.bodyHtml ?? parsed.body ?? ''
    };
  } catch (error) {
    return {
      subject: `${offer.role} Offer Discussion`,
      bodyHtml: '<p>I would like to discuss the offer details.</p>'
    };
  }
}
