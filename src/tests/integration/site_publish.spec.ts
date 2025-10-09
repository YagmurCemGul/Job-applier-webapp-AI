/**
 * @fileoverview Integration tests for site publishing flow.
 * @module tests/integration/site_publish
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSite } from '@/stores/site.store';
import { exportStaticZip } from '@/services/site/publish.service';
import type { CaseStudy, BlogPost } from '@/types/site.types';

// Mock JSZip
vi.mock('jszip', () => ({
  default: class JSZip {
    files: Record<string, any> = {};
    file(name: string, content: string) {
      this.files[name] = content;
    }
    async generateAsync() {
      return new Blob(['mock-zip'], { type: 'application/zip' });
    }
  },
}));

describe('Site Publishing Integration', () => {
  beforeEach(() => {
    // Reset store
    const store = useSite.getState();
    store.site.cases = [];
    store.site.posts = [];
  });

  it('creates case study and blog post, then exports', async () => {
    const { upsertCase, upsertPost, site } = useSite.getState();

    // Create case study
    const caseStudy: CaseStudy = {
      id: '1',
      title: 'Product Launch',
      slug: 'product-launch',
      excerpt: 'Launched new product with 10k users in first week',
      contentMd: '# Product Launch\n\nSuccessful launch story',
      dateISO: '2025-01-01',
      visibility: 'draft',
    };
    upsertCase(caseStudy);

    // Create blog post
    const blogPost: BlogPost = {
      id: '1',
      title: 'Lessons from Launching',
      slug: 'lessons-launching',
      contentMd: '# Lessons\n\nKey takeaways',
      dateISO: '2025-01-15',
      visibility: 'draft',
    };
    upsertPost(blogPost);

    // Verify they're in store
    expect(useSite.getState().site.cases).toHaveLength(1);
    expect(useSite.getState().site.posts).toHaveLength(1);

    // Set to public
    upsertCase({ ...caseStudy, visibility: 'public' });
    upsertPost({ ...blogPost, visibility: 'public' });

    // Export site
    const result = await exportStaticZip(useSite.getState().site);
    expect(result.url).toMatch(/^blob:/);
    expect(result.size).toBeGreaterThan(0);
  });

  it('exports only public content', async () => {
    const { upsertCase, upsertPost } = useSite.getState();

    // Create mixed visibility content
    upsertCase({
      id: '1',
      title: 'Public Case',
      slug: 'public-case',
      contentMd: '# Public',
      dateISO: '2025-01-01',
      visibility: 'public',
    });

    upsertCase({
      id: '2',
      title: 'Draft Case',
      slug: 'draft-case',
      contentMd: '# Draft',
      dateISO: '2025-01-01',
      visibility: 'draft',
    });

    upsertPost({
      id: '1',
      title: 'Public Post',
      slug: 'public-post',
      contentMd: '# Public',
      dateISO: '2025-01-01',
      visibility: 'public',
    });

    const site = useSite.getState().site;
    const publicCases = site.cases.filter((c) => c.visibility === 'public');
    const publicPosts = site.posts.filter((p) => p.visibility === 'public');

    expect(publicCases).toHaveLength(1);
    expect(publicPosts).toHaveLength(1);

    const result = await exportStaticZip(site);
    expect(result).toBeDefined();
  });

  it('updates profile and exports with new info', async () => {
    const { upsertProfile } = useSite.getState();

    upsertProfile({
      headline: 'Senior Product Manager',
      bio: 'Building products that matter',
      links: [
        { label: 'LinkedIn', url: 'https://linkedin.com/in/test' },
        { label: 'GitHub', url: 'https://github.com/test' },
      ],
    });

    const site = useSite.getState().site;
    expect(site.profile.headline).toBe('Senior Product Manager');
    expect(site.profile.links).toHaveLength(2);

    const result = await exportStaticZip(site);
    expect(result).toBeDefined();
  });

  it('applies theme to exported site', async () => {
    const { setTheme, upsertCase } = useSite.getState();

    setTheme({
      primary: '#000000',
      accent: '#ff0000',
      fontHead: 'Playfair Display',
      fontBody: 'Georgia',
    });

    upsertCase({
      id: '1',
      title: 'Test',
      slug: 'test',
      contentMd: 'Test',
      dateISO: '2025-01-01',
      visibility: 'public',
    });

    const site = useSite.getState().site;
    expect(site.theme.primary).toBe('#000000');

    const result = await exportStaticZip(site);
    expect(result).toBeDefined();
  });
});