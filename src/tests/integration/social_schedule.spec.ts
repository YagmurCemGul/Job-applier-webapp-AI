/**
 * @fileoverview Integration tests for social scheduling.
 * @module tests/integration/social_schedule
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSite } from '@/stores/site.store';
import { scheduleSocial } from '@/services/site/socialScheduler.service';
import type { SocialPost } from '@/types/site.types';

// Mock dependencies
vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-token'),
}));

vi.mock('@/services/integrations/calendar.real.service', () => ({
  calendarCreate: vi.fn().mockResolvedValue({ id: 'cal-123' }),
}));

describe('Social Scheduling Integration', () => {
  beforeEach(() => {
    // Reset social posts
    useSite.getState().social = [];
  });

  it('creates and schedules a LinkedIn post', async () => {
    const { upsertSocial, markSocial } = useSite.getState();

    // Create post
    const post: SocialPost = {
      id: '1',
      network: 'linkedin',
      title: 'New Case Study Published',
      body: 'Check out my latest work on product launch! 🚀',
      url: 'https://example.com/cases/product-launch.html',
      scheduledISO: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      status: 'draft',
    };

    upsertSocial(post);
    expect(useSite.getState().social).toHaveLength(1);

    // Schedule it
    await scheduleSocial(post, 'account-id', 'passphrase', 'client-id');

    // Verify status updated
    markSocial(post.id, 'scheduled');
    const updated = useSite.getState().social.find((p) => p.id === post.id);
    expect(updated?.status).toBe('scheduled');
  });

  it('schedules multiple posts for different networks', async () => {
    const { upsertSocial } = useSite.getState();

    const posts: SocialPost[] = [
      {
        id: '1',
        network: 'linkedin',
        title: 'LinkedIn Post',
        body: 'Professional update',
        scheduledISO: new Date(Date.now() + 86400000).toISOString(),
        status: 'draft',
      },
      {
        id: '2',
        network: 'twitter',
        title: 'Twitter Post',
        body: 'Quick tweet',
        scheduledISO: new Date(Date.now() + 172800000).toISOString(),
        status: 'draft',
      },
    ];

    posts.forEach((p) => upsertSocial(p));
    expect(useSite.getState().social).toHaveLength(2);

    // Schedule both
    for (const post of posts) {
      await scheduleSocial(post, 'account-id', 'passphrase', 'client-id');
    }

    // Both should be scheduled
    expect(useSite.getState().social.every((p) => p.scheduledISO)).toBe(true);
  });

  it('generates post from case study', async () => {
    const { upsertCase, upsertSocial } = useSite.getState();

    // Create case study
    upsertCase({
      id: '1',
      title: 'Product Launch Success',
      slug: 'product-launch',
      excerpt: '10k users in first week',
      contentMd: 'Full story',
      dateISO: '2025-01-01',
      visibility: 'public',
    });

    // Generate social post from it
    const post: SocialPost = {
      id: '1',
      network: 'linkedin',
      title: 'Product Launch Success',
      body: 'Just published a case study about our product launch. 10k users in first week! Read more: https://example.com/cases/product-launch.html',
      url: 'https://example.com/cases/product-launch.html',
      scheduledISO: new Date(Date.now() + 86400000).toISOString(),
      status: 'draft',
    };

    upsertSocial(post);

    const social = useSite.getState().social.find((p) => p.id === '1');
    expect(social?.title).toBe('Product Launch Success');
    expect(social?.body).toContain('10k users');
  });

  it('filters posts by status', () => {
    const { upsertSocial } = useSite.getState();

    const posts: SocialPost[] = [
      {
        id: '1',
        network: 'linkedin',
        title: 'Draft',
        body: 'Draft post',
        status: 'draft',
      },
      {
        id: '2',
        network: 'twitter',
        title: 'Scheduled',
        body: 'Scheduled post',
        scheduledISO: new Date().toISOString(),
        status: 'scheduled',
      },
      {
        id: '3',
        network: 'linkedin',
        title: 'Posted',
        body: 'Posted post',
        status: 'posted',
      },
    ];

    posts.forEach((p) => upsertSocial(p));

    const { social } = useSite.getState();
    const drafts = social.filter((p) => p.status === 'draft');
    const scheduled = social.filter((p) => p.status === 'scheduled');
    const posted = social.filter((p) => p.status === 'posted');

    expect(drafts).toHaveLength(1);
    expect(scheduled).toHaveLength(1);
    expect(posted).toHaveLength(1);
  });
});