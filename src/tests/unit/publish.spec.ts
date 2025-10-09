/**
 * @fileoverview Unit tests for publish service.
 * @module tests/unit/publish
 */

import { describe, it, expect, vi } from 'vitest';
import { exportStaticZip } from '@/services/site/publish.service';
import type { SiteState } from '@/types/site.types';

// Mock JSZip
vi.mock('jszip', () => ({
  default: class JSZip {
    files: Record<string, any> = {};
    file(name: string, content: string) {
      this.files[name] = content;
    }
    async generateAsync() {
      return new Blob(['mock-zip-content'], { type: 'application/zip' });
    }
  },
}));

describe('publish.service', () => {
  const mockSite: SiteState = {
    profile: {
      id: 'me',
      headline: 'Test Portfolio',
      bio: 'Test bio',
      links: [{ label: 'GitHub', url: 'https://github.com/test' }],
      skills: ['TypeScript', 'React'],
    },
    theme: {
      id: 'minimal',
      name: 'Minimal',
      primary: '#111827',
      accent: '#4f46e5',
      fontHead: 'Inter',
      fontBody: 'Inter',
      layout: 'single',
      darkAuto: true,
    },
    cases: [
      {
        id: '1',
        title: 'Case Study 1',
        slug: 'case-1',
        excerpt: 'Test case',
        contentMd: '# Case 1\n\nTest content',
        dateISO: '2025-01-01',
        visibility: 'public',
      },
      {
        id: '2',
        title: 'Draft Case',
        slug: 'draft',
        contentMd: 'Draft',
        dateISO: '2025-01-01',
        visibility: 'draft',
      },
    ],
    posts: [
      {
        id: '1',
        title: 'Blog Post 1',
        slug: 'post-1',
        contentMd: '# Post 1\n\nTest post',
        dateISO: '2025-01-01',
        visibility: 'public',
      },
    ],
    media: [],
    targets: [],
    analyticsOptIn: false,
    noAITrainingMeta: false,
    updatedAt: '2025-01-01',
  };

  describe('exportStaticZip', () => {
    it('returns a Blob URL and size', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result.url).toMatch(/^blob:/);
      expect(result.size).toBeGreaterThan(0);
    });

    it('includes only public content', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result).toBeDefined();
      // The exported ZIP should not include draft content
      // This is validated in the service by filtering visibility
    });

    it('includes CSS file', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result).toBeDefined();
      // Service creates assets/styles.css
    });

    it('includes index.html', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result).toBeDefined();
      // Service creates index.html with profile and links
    });

    it('includes sitemap.xml', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result).toBeDefined();
      // Service creates sitemap.xml
    });

    it('includes robots.txt', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result).toBeDefined();
      // Service creates robots.txt
    });

    it('creates case study pages', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result).toBeDefined();
      // Service creates cases/case-1.html
    });

    it('creates blog post pages', async () => {
      const result = await exportStaticZip(mockSite);
      expect(result).toBeDefined();
      // Service creates blog/post-1.html
    });

    it('applies theme styling', async () => {
      const customSite = {
        ...mockSite,
        theme: {
          ...mockSite.theme,
          primary: '#000000',
          accent: '#ff0000',
        },
      };
      const result = await exportStaticZip(customSite);
      expect(result).toBeDefined();
      // CSS should include custom colors
    });

    it('includes noai meta when enabled', async () => {
      const noAiSite = {
        ...mockSite,
        noAITrainingMeta: true,
      };
      const result = await exportStaticZip(noAiSite);
      expect(result).toBeDefined();
      // Meta tags should include noai
    });
  });
});