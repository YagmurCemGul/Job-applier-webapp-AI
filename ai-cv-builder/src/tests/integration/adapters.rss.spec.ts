/**
 * RSS Adapter Integration Tests
 * Step 32 - Tests for RSS job feed parsing
 */

import { describe, it, expect } from 'vitest';
import { fetchRSS } from '@/services/jobs/adapters/rss.adapter';
import type { SourceConfig } from '@/types/jobs.types';

describe('rss.adapter', () => {
  const mockRSSFeed = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Job Feed</title>
    <item>
      <title>Senior Engineer at ACME Corp</title>
      <link>https://example.com/job/123</link>
      <description>Location: New York. Great opportunity!</description>
      <pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Junior Developer</title>
      <link>https://example.com/job/456</link>
      <description>Company: Tech Startup. Remote position.</description>
      <pubDate>Tue, 02 Jan 2024 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

  it('should parse RSS feed', async () => {
    // Mock fetch
    global.fetch = async () => ({
      ok: true,
      text: async () => mockRSSFeed,
    } as Response);

    const source: SourceConfig = {
      key: 'rss.test',
      enabled: true,
      kind: 'rss',
      domain: 'example.com',
      params: { feedUrl: 'https://example.com/feed.rss' },
    };

    const jobs = await fetchRSS(source);
    
    expect(jobs).toHaveLength(2);
    expect(jobs[0].title).toBe('Senior Engineer at ACME Corp');
    expect(jobs[0].company).toBe('ACME Corp');
    expect(jobs[0].location).toBe('New York');
    expect(jobs[1].title).toBe('Junior Developer');
  });

  it('should return empty for missing feedUrl', async () => {
    const source: SourceConfig = {
      key: 'rss.test',
      enabled: true,
      kind: 'rss',
      domain: 'example.com',
    };

    const jobs = await fetchRSS(source);
    expect(jobs).toHaveLength(0);
  });
});
