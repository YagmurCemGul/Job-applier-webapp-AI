/**
 * @fileoverview Unit tests for recorder and chunking services
 */

import { describe, it, expect } from 'vitest';
import { chunkTranscript, chunkByTime, mergeSmallSegments } from '@/services/interview/chunking.service';

describe('Recorder and Chunking Services', () => {
  describe('chunkTranscript', () => {
    it('should split text by ~2k chars with sentence boundaries', () => {
      const longText = 'This is a sentence. '.repeat(200); // ~4000 chars
      const chunks = chunkTranscript(longText, 2000);
      
      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks.every(c => c.length <= 2100)).toBe(true); // Allow some overflow
    });

    it('should maintain sentence boundaries', () => {
      const text = 'First sentence. Second sentence. Third sentence.';
      const chunks = chunkTranscript(text, 30);
      
      chunks.forEach(chunk => {
        expect(chunk.endsWith('.')).toBe(true);
      });
    });

    it('should handle single sentence', () => {
      const text = 'A single sentence.';
      const chunks = chunkTranscript(text);
      
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe(text);
    });

    it('should not create empty chunks', () => {
      const text = 'Test. ';
      const chunks = chunkTranscript(text);
      
      expect(chunks.every(c => c.trim().length > 0)).toBe(true);
    });
  });

  describe('chunkByTime', () => {
    it('should split segments by time duration', () => {
      const segments = [
        { t0: 0, t1: 60, text: 'First minute' },
        { t0: 60, t1: 120, text: 'Second minute' },
        { t0: 120, t1: 180, text: 'Third minute' },
        { t0: 180, t1: 240, text: 'Fourth minute' }
      ];

      const chunks = chunkByTime(segments, 120); // 2 minute chunks
      
      expect(chunks.length).toBe(2);
      expect(chunks[0].length).toBe(2);
      expect(chunks[1].length).toBe(2);
    });

    it('should handle empty segments', () => {
      const chunks = chunkByTime([], 120);
      expect(chunks).toHaveLength(0);
    });
  });

  describe('mergeSmallSegments', () => {
    it('should merge segments shorter than minimum duration', () => {
      const segments = [
        { t0: 0, t1: 2, text: 'Short' },
        { t0: 2, t1: 4, text: 'Also short' },
        { t0: 4, t1: 10, text: 'Longer segment' }
      ];

      const merged = mergeSmallSegments(segments, 5);
      
      expect(merged.length).toBeLessThan(segments.length);
      expect(merged[0].text).toContain('Short');
      expect(merged[0].text).toContain('Also short');
    });

    it('should preserve long segments', () => {
      const segments = [
        { t0: 0, t1: 10, text: 'Long enough' },
        { t0: 10, t1: 20, text: 'Also long' }
      ];

      const merged = mergeSmallSegments(segments, 5);
      
      expect(merged).toHaveLength(2);
    });

    it('should handle single segment', () => {
      const segments = [{ t0: 0, t1: 2, text: 'Only one' }];
      const merged = mergeSmallSegments(segments, 5);
      
      expect(merged).toHaveLength(1);
    });
  });
});
