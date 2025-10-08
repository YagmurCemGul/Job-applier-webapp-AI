/**
 * RSS Adapter
 * Step 32 - Generic RSS/Atom feed parser for job postings
 */

import type { SourceConfig, JobRaw } from '@/types/jobs.types';

/**
 * Fetch jobs from RSS feed
 */
export async function fetchRSS(source: SourceConfig): Promise<JobRaw[]> {
  // Expect param: feedUrl
  const feed = source.params?.feedUrl;
  if (!feed) return [];
  
  const xml = await fetch(feed).then(r => r.text());
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).map(m => m[1]);
  
  const out: JobRaw[] = items.map((it, i) => {
    const title = tag(it, 'title');
    const link = tag(it, 'link');
    const desc = tag(it, 'description');
    const pub = tag(it, 'pubDate');
    const id = link || `${source.domain}_${i}_${Date.now()}`;
    
    return {
      id,
      url: link,
      source: { name: 'rss.generic', kind: 'rss', domain: source.domain },
      title,
      company: sniffCompany(title, desc),
      location: sniffLocation(desc),
      description: desc,
      fetchedAt: new Date().toISOString(),
      postedAt: pub
    };
  });
  
  return out;
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m?.[1]?.trim() ?? '';
}

function sniffCompany(title?: string, desc?: string): string | undefined {
  const m = (title || '').match(/ at ([^|,-]+)/i) || (desc || '').match(/Company: ([^<]+)/i);
  return m?.[1]?.trim();
}

function sniffLocation(desc?: string): string | undefined {
  const m = (desc || '').match(/Location: ([^<]+)/i);
  return m?.[1]?.trim();
}
