/**
 * @fileoverview Talking points service for Step 44
 * @module services/negotiation/talkingPoints
 */

import { useReviews } from '@/stores/review.store';
import { useSite } from '@/stores/site.store';
import { useInterview } from '@/stores/interview.store';

/**
 * Build evidence-backed talking points for negotiation
 * @param company - Company name (optional)
 * @returns Array of talking points
 */
export function buildTalkingPoints(company?: string): string[] {
  const quotes = useReviews.getState().selfReviews?.[0]?.quotes || [];
  const links = useSite.getState().profile?.links || [];
  const latestMock = useInterview.getState().runs?.[0];

  const pts: string[] = [
    `Impact: Delivered ${useReviews.getState().selfReviews?.[0]?.highlights?.[0] ?? 'measurable results'} aligned to ${company ?? 'your'} goals.`,
  ];

  if (latestMock?.feedbackHtml) {
    pts.push('Interview feedback highlighted strong clarity and structure.');
  }

  if (links[0]?.url) {
    pts.push(`Portfolio case: ${links[0].url}`);
  }

  // Add up to 2 quotes
  for (const q of quotes.slice(0, 2)) {
    pts.push(`Reference quote: "${q}"`);
  }

  return pts.filter(Boolean);
}
