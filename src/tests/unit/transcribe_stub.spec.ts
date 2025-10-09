/**
 * @fileoverview Unit tests for transcription stub service
 */

import { describe, it, expect } from 'vitest';
import { transcribeLocal, countFillers, calculateWPM, estimateTalkRatio } from '@/services/interview/transcribe.stub.service';

describe('Transcribe Stub Service', () => {
  describe('transcribeLocal', () => {
    it('should return transcript with heuristic duration', async () => {
      const blob = new Blob(['x'.repeat(128 * 1024)], { type: 'audio/webm' });
      const transcript = await transcribeLocal(blob);
      
      expect(transcript).toHaveProperty('text');
      expect(transcript).toHaveProperty('segments');
      expect(transcript.segments).toHaveLength(1);
    });

    it('should set default language to en', async () => {
      const blob = new Blob(['test'], { type: 'audio/webm' });
      const transcript = await transcribeLocal(blob);
      
      expect(transcript.lang).toBe('en');
    });

    it('should accept language parameter', async () => {
      const blob = new Blob(['test'], { type: 'audio/webm' });
      const transcript = await transcribeLocal(blob, 'tr');
      
      expect(transcript.lang).toBe('tr');
    });

    it('should calculate duration from blob size', async () => {
      const largeBlob = new Blob(['x'.repeat(256 * 1024)], { type: 'audio/webm' });
      const transcript = await transcribeLocal(largeBlob);
      
      expect(transcript.segments[0].t1).toBeGreaterThan(60); // ~2 minutes
    });
  });

  describe('countFillers', () => {
    it('should count common filler words', () => {
      const text = 'Um, like, you know, basically I think, uh, that works.';
      const count = countFillers(text);
      
      expect(count).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const text = 'UM, LIKE, UH';
      const count = countFillers(text);
      
      expect(count).toBe(3);
    });

    it('should return 0 for clean text', () => {
      const text = 'This is clear professional communication.';
      const count = countFillers(text);
      
      expect(count).toBe(0);
    });

    it('should not count partial word matches', () => {
      const text = 'ultimate utilization';
      const count = countFillers(text);
      
      expect(count).toBe(0);
    });
  });

  describe('calculateWPM', () => {
    it('should calculate words per minute', () => {
      const text = 'This is exactly twelve words in this sample test sentence here.';
      const wpm = calculateWPM(text, 60); // 1 minute
      
      expect(wpm).toBe(12);
    });

    it('should round to nearest integer', () => {
      const text = 'Word word word.';
      const wpm = calculateWPM(text, 90); // 1.5 minutes
      
      expect(Number.isInteger(wpm)).toBe(true);
    });

    it('should handle zero duration', () => {
      const text = 'Words.';
      const wpm = calculateWPM(text, 0);
      
      expect(wpm).toBe(0);
    });
  });

  describe('estimateTalkRatio', () => {
    it('should calculate talk ratio from segments', () => {
      const segments = [
        { t0: 0, t1: 30, text: 'Speaking' },
        { t0: 60, t1: 90, text: 'More speaking' }
      ];
      const ratio = estimateTalkRatio(segments, 120);
      
      expect(ratio).toBe(0.5); // 60s talk / 120s total
    });

    it('should cap ratio at 1.0', () => {
      const segments = [
        { t0: 0, t1: 150, text: 'Long speech' }
      ];
      const ratio = estimateTalkRatio(segments, 100);
      
      expect(ratio).toBeLessThanOrEqual(1.0);
    });

    it('should handle zero total duration', () => {
      const segments = [{ t0: 0, t1: 10, text: 'Test' }];
      const ratio = estimateTalkRatio(segments, 0);
      
      expect(ratio).toBe(0);
    });
  });
});
