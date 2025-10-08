/**
 * @fileoverview Social media scheduler (Calendar reminder integration).
 * @module services/site/socialScheduler
 */

import type { SocialPost } from '@/types/site.types';

/**
 * Schedule a social post (creates Calendar reminder).
 * Network posting is intentionally stubbed — users manually post.
 */
export async function scheduleSocial(
  post: SocialPost,
  accountId: string,
  passphrase: string,
  clientId: string
): Promise<{ ok: boolean }> {
  if (!post.scheduledISO) {
    throw new Error('Missing schedule date');
  }

  // Create calendar event as reminder
  const { getBearer } = await import('@/services/integrations/google.oauth.service');
  const { calendarCreate } = await import('@/services/integrations/calendar.real.service');

  const bearer = await getBearer(accountId, passphrase, clientId);
  await calendarCreate(bearer, {
    title: `Publish on ${post.network}: ${post.title}`,
    whenISO: post.scheduledISO,
    durationMin: 15,
  });

  return { ok: true };
}

/**
 * Generate social post copy from case study or blog post.
 */
export function generatePostCopy(opts: {
  title: string;
  excerpt?: string;
  url?: string;
  network: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
}): string {
  const maxLength =
    opts.network === 'twitter' ? 240 : opts.network === 'instagram' ? 200 : 400;

  let copy = opts.title;
  if (opts.excerpt) {
    copy += '\n\n' + opts.excerpt;
  }
  if (opts.url) {
    copy += '\n\n' + opts.url;
  }

  if (copy.length > maxLength) {
    copy = copy.slice(0, maxLength - 3) + '...';
  }

  return copy;
}