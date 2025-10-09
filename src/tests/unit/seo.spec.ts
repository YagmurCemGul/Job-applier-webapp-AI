/**
 * @fileoverview Unit tests for SEO service.
 * @module tests/unit/seo
 */

import { describe, it, expect } from 'vitest';
import {
  slugify,
  buildMeta,
  buildSitemap,
  buildRobotsTxt,
  validateSEO,
} from '@/services/site/seo.service';

describe('seo.service', () => {
  describe('slugify', () => {
    it('converts to lowercase', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('replaces spaces with hyphens', () => {
      expect(slugify('Multiple   Spaces')).toBe('multiple-spaces');
    });

    it('removes special characters', () => {
      expect(slugify('Hello! @World#')).toBe('hello-world');
    });

    it('removes leading/trailing hyphens', () => {
      expect(slugify('  hello world  ')).toBe('hello-world');
    });

    it('limits length to 80 chars', () => {
      const long = 'a'.repeat(100);
      expect(slugify(long).length).toBeLessThanOrEqual(80);
    });

    it('handles edge cases', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
      expect(slugify('---')).toBe('');
    });
  });

  describe('buildMeta', () => {
    it('includes title and description', () => {
      const meta = buildMeta({
        title: 'Test Page',
        description: 'Test description',
      });
      expect(meta).toContain('<title>Test Page</title>');
      expect(meta).toContain('name="description"');
      expect(meta).toContain('Test description');
    });

    it('includes Open Graph tags', () => {
      const meta = buildMeta({
        title: 'Test',
        description: 'Desc',
      });
      expect(meta).toContain('property="og:title"');
      expect(meta).toContain('property="og:description"');
    });

    it('includes Twitter card tags', () => {
      const meta = buildMeta({ title: 'Test' });
      expect(meta).toContain('name="twitter:card"');
      expect(meta).toContain('summary_large_image');
    });

    it('includes OG image when provided', () => {
      const meta = buildMeta({
        title: 'Test',
        ogImageUrl: 'https://example.com/image.png',
      });
      expect(meta).toContain('property="og:image"');
      expect(meta).toContain('https://example.com/image.png');
    });

    it('includes noai meta when enabled', () => {
      const meta = buildMeta({ title: 'Test', noAI: true });
      expect(meta).toContain('name="robots"');
      expect(meta).toContain('noai');
    });

    it('escapes HTML entities', () => {
      const meta = buildMeta({
        title: '<script>alert("xss")</script>',
        description: 'Test & test',
      });
      expect(meta).not.toContain('<script>');
      expect(meta).toContain('&lt;script&gt;');
      expect(meta).toContain('&amp;');
    });
  });

  describe('buildSitemap', () => {
    it('generates valid XML', () => {
      const sitemap = buildSitemap('https://example.com', ['', 'about', 'blog']);
      expect(sitemap).toContain('<?xml version="1.0"');
      expect(sitemap).toContain('<urlset');
      expect(sitemap).toContain('</urlset>');
    });

    it('includes all URLs', () => {
      const sitemap = buildSitemap('https://example.com', [
        '',
        'cases/case1.html',
        'blog/post1.html',
      ]);
      expect(sitemap).toContain('<loc>https://example.com/</loc>');
      expect(sitemap).toContain('<loc>https://example.com/cases/case1.html</loc>');
      expect(sitemap).toContain('<loc>https://example.com/blog/post1.html</loc>');
    });

    it('includes lastmod date', () => {
      const sitemap = buildSitemap('https://example.com', ['']);
      expect(sitemap).toContain('<lastmod>');
    });
  });

  describe('buildRobotsTxt', () => {
    it('allows all user agents', () => {
      const robots = buildRobotsTxt('https://example.com/sitemap.xml');
      expect(robots).toContain('User-agent: *');
      expect(robots).toContain('Allow: /');
    });

    it('includes sitemap URL', () => {
      const robots = buildRobotsTxt('https://example.com/sitemap.xml');
      expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
    });
  });

  describe('validateSEO', () => {
    it('validates title length', () => {
      const short = validateSEO({ title: 'Short' });
      expect(short.warnings).toContain('Title too short (min 10 chars)');

      const long = validateSEO({ title: 'a'.repeat(70) });
      expect(long.warnings).toContain('Title exceeds 60 characters');

      const good = validateSEO({ title: 'Perfect Length Title' });
      expect(good.valid).toBe(true);
    });

    it('validates description length', () => {
      const long = validateSEO({
        title: 'Good title here',
        description: 'a'.repeat(200),
      });
      expect(long.warnings).toContain('Description exceeds 160 characters');
    });

    it('validates slug length', () => {
      const long = validateSEO({
        title: 'Good title',
        slug: 'a'.repeat(90),
      });
      expect(long.warnings).toContain('Slug exceeds 80 characters');
    });

    it('passes with valid inputs', () => {
      const result = validateSEO({
        title: 'Perfect SEO Title',
        description: 'A good description that is not too long',
        slug: 'perfect-seo-title',
      });
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
});