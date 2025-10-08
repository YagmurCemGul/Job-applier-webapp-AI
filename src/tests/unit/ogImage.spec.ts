/**
 * @fileoverview Unit tests for OG image service.
 * @module tests/unit/ogImage
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { renderOgImage, dataUrlToBlob } from '@/services/site/ogImage.service';

// Mock HTMLCanvasElement for Node environment
beforeAll(() => {
  if (typeof HTMLCanvasElement === 'undefined') {
    global.HTMLCanvasElement = class {
      width = 0;
      height = 0;
      getContext() {
        return {
          fillStyle: '',
          font: '',
          textBaseline: '',
          fillRect: vi.fn(),
          fillText: vi.fn(),
          measureText: vi.fn(() => ({ width: 100 })),
        };
      }
      toDataURL() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      }
    } as any;
  }
});

describe('ogImage.service', () => {
  describe('renderOgImage', () => {
    it('returns a data URL', async () => {
      const url = await renderOgImage('Test Title');
      expect(url).toMatch(/^data:image\/png;base64,/);
    });

    it('accepts custom colors', async () => {
      const url = await renderOgImage('Test', {
        primary: '#000000',
        accent: '#ffffff',
      });
      expect(url).toBeDefined();
    });

    it('accepts custom font', async () => {
      const url = await renderOgImage('Test', {
        fontFamily: 'Arial',
      });
      expect(url).toBeDefined();
    });

    it('handles long titles', async () => {
      const longTitle = 'This is a very long title that should wrap to multiple lines in the OG image';
      const url = await renderOgImage(longTitle);
      expect(url).toBeDefined();
    });
  });

  describe('dataUrlToBlob', () => {
    it('converts data URL to Blob', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const blob = dataUrlToBlob(dataUrl);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('handles different MIME types', () => {
      const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const blob = dataUrlToBlob(dataUrl);
      expect(blob.type).toBe('image/jpeg');
    });
  });
});