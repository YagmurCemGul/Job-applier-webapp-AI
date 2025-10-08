/**
 * Tracking Service Tests
 */
import { describe, it, expect } from 'vitest';
import {
  makeOpenPixel,
  wrapLinksForClick,
  generateTrackingId
} from '@/services/outreach/tracking.service';

describe('tracking.service', () => {
  describe('makeOpenPixel', () => {
    it('should return data URI when no tracking ID', () => {
      const pixel = makeOpenPixel();
      expect(pixel).toContain('data:image/gif;base64');
    });

    it('should return tracking endpoint with ID', () => {
      const pixel = makeOpenPixel('abc123');
      expect(pixel).toContain('/api/trk/o.gif');
      expect(pixel).toContain('id=abc123');
    });
  });

  describe('wrapLinksForClick', () => {
    it('should not modify HTML when no tracking ID', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = wrapLinksForClick(html);
      expect(result).toBe(html);
    });

    it('should wrap links with tracking endpoint', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = wrapLinksForClick(html, 'track123');

      expect(result).toContain('/api/trk/c?');
      expect(result).toContain('u=https%3A%2F%2Fexample.com');
      expect(result).toContain('id=track123');
    });

    it('should handle multiple links', () => {
      const html = '<a href="https://site1.com">One</a> <a href="https://site2.com">Two</a>';
      const result = wrapLinksForClick(html, 'track123');

      const matches = result.match(/\/api\/trk\/c\?/g);
      expect(matches).toHaveLength(2);
    });
  });

  describe('generateTrackingId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateTrackingId();
      const id2 = generateTrackingId();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });
});
