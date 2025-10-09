/**
 * @fileoverview STAR story builder service for Step 43
 * @module services/interview/storyBuilder
 */

import type { StorySTAR } from '@/types/interview.types';
import { useInterview } from '@/stores/interview.store';
import { useOnboarding } from '@/stores/onboarding.store';
import { useReviews } from '@/stores/review.store';
import { useSite } from '@/stores/site.store';

/**
 * Build a draft STAR story from existing evidence, quotes, and portfolio
 * @param title - Story title
 * @returns Draft STAR story
 */
export function buildStarDraft(title: string): StorySTAR {
  // Try to pull context from onboarding evidence (Step 38)
  const onboardingState = useOnboarding.getState();
  const evidence = onboardingState.evidence?.[0];

  // Try to pull quotes from self-review (Step 39)
  const reviewsState = useReviews.getState();
  const quote = reviewsState.selfReviews?.[0]?.quotes?.[0];

  // Try to pull portfolio link (Step 40)
  const siteState = useSite.getState();
  const link = siteState.profile?.links?.[0]?.url;

  return {
    id: crypto.randomUUID(),
    title,
    tags: ['impact', 'ownership'],
    S: evidence?.title
      ? `Context: ${evidence.title}. ${evidence.description || ''}`
      : 'Describe the situation, context, and constraints you faced…',
    T: 'Explain the goal you needed to achieve and success criteria…',
    A: 'Detail the key actions you led, trade-offs you made, and how you collaborated with others…',
    R: `Describe measurable outcomes and impact${quote ? ` — "${quote.slice(0, 100)}${quote.length > 100 ? '...' : ''}"` : '.'}`,
    metrics: evidence?.metrics || ['+25% conversion', '-30% errors'],
    links: link ? [link] : []
  };
}

/**
 * Persist or update a STAR story
 * @param s - STAR story to save
 * @returns Saved story
 */
export function saveStory(s: StorySTAR): StorySTAR {
  useInterview.getState().upsertStory(s);
  return s;
}

/**
 * Get stories by tag
 * @param tag - Tag to filter by
 * @returns Matching stories
 */
export function getStoriesByTag(tag: string): StorySTAR[] {
  return useInterview.getState().stories.filter(s => s.tags.includes(tag));
}

/**
 * Format STAR story as bullet points
 * @param story - STAR story
 * @returns Formatted bullet points
 */
export function formatAsbullets(story: StorySTAR): string {
  return [
    `**${story.title}**`,
    '',
    '**Situation:**',
    story.S,
    '',
    '**Task:**',
    story.T,
    '',
    '**Action:**',
    story.A,
    '',
    '**Result:**',
    story.R,
    ...(story.metrics && story.metrics.length > 0
      ? ['', '**Metrics:**', ...story.metrics.map(m => `- ${m}`)]
      : []),
    ...(story.links && story.links.length > 0
      ? ['', '**Links:**', ...story.links.map(l => `- ${l}`)]
      : [])
  ].join('\n');
}

/**
 * Get recently used stories
 * @param limit - Maximum number of stories to return
 * @returns Recently used stories
 */
export function getRecentStories(limit = 5): StorySTAR[] {
  return useInterview
    .getState()
    .stories.filter(s => s.lastUsedISO)
    .sort((a, b) => {
      const aTime = a.lastUsedISO ? Date.parse(a.lastUsedISO) : 0;
      const bTime = b.lastUsedISO ? Date.parse(b.lastUsedISO) : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}
