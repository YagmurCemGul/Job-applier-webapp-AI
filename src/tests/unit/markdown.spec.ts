/**
 * @fileoverview Unit tests for Markdown service.
 * @module tests/unit/markdown
 */

import { describe, it, expect } from 'vitest';
import { mdToHtml, mdToText, mdToExcerpt } from '@/services/site/markdown.service';

describe('markdown.service', () => {
  describe('mdToHtml', () => {
    it('converts headings', () => {
      const md = '# Heading 1\n\n## Heading 2';
      const html = mdToHtml(md);
      expect(html).toContain('<h1>Heading 1</h1>');
      expect(html).toContain('<h2>Heading 2</h2>');
    });

    it('converts paragraphs', () => {
      const md = 'This is a paragraph.\n\nThis is another.';
      const html = mdToHtml(md);
      expect(html).toContain('<p>This is a paragraph.</p>');
      expect(html).toContain('<p>This is another.</p>');
    });

    it('converts unordered lists', () => {
      const md = '- Item 1\n- Item 2\n- Item 3';
      const html = mdToHtml(md);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>Item 1</li>');
      expect(html).toContain('<li>Item 2</li>');
    });

    it('converts ordered lists', () => {
      const md = '1. First\n2. Second\n3. Third';
      const html = mdToHtml(md);
      expect(html).toContain('<ol>');
      expect(html).toContain('<li>First</li>');
    });

    it('converts code blocks', () => {
      const md = '```\nconst x = 1;\n```';
      const html = mdToHtml(md);
      expect(html).toContain('<pre><code>');
      expect(html).toContain('const x = 1;');
    });

    it('converts links', () => {
      const md = 'Check out [example](https://example.com)';
      const html = mdToHtml(md);
      expect(html).toContain('<a href="https://example.com"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('target="_blank"');
    });

    it('escapes HTML entities', () => {
      const md = '<script>alert("xss")</script>';
      const html = mdToHtml(md);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('handles multiple paragraphs', () => {
      const md = 'Para 1\n\nPara 2\n\nPara 3';
      const html = mdToHtml(md);
      const pCount = (html.match(/<p>/g) || []).length;
      expect(pCount).toBe(3);
    });
  });

  describe('mdToText', () => {
    it('strips Markdown formatting', () => {
      const md = '# Title\n\n**Bold** and *italic* text';
      const text = mdToText(md);
      expect(text).toBe('Title\n\nBold and italic text');
    });

    it('converts links to text', () => {
      const md = '[Link text](https://example.com)';
      const text = mdToText(md);
      expect(text).toBe('Link text');
    });

    it('removes code blocks', () => {
      const md = 'Text\n\n```\ncode\n```\n\nMore text';
      const text = mdToText(md);
      expect(text).not.toContain('```');
      expect(text).toContain('Text');
      expect(text).toContain('More text');
    });
  });

  describe('mdToExcerpt', () => {
    it('truncates to max length', () => {
      const md = 'a'.repeat(200);
      const excerpt = mdToExcerpt(md, 100);
      expect(excerpt.length).toBeLessThanOrEqual(101); // +1 for ellipsis
      expect(excerpt).toContain('…');
    });

    it('does not truncate short text', () => {
      const md = 'Short text';
      const excerpt = mdToExcerpt(md, 100);
      expect(excerpt).toBe('Short text');
      expect(excerpt).not.toContain('…');
    });

    it('strips Markdown formatting', () => {
      const md = '# Title\n\n**Bold** text';
      const excerpt = mdToExcerpt(md, 100);
      expect(excerpt).not.toContain('#');
      expect(excerpt).not.toContain('**');
    });
  });
});