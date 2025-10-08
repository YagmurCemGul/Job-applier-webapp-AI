/**
 * @fileoverview Unit tests for evidence binder service.
 * @module tests/unit/evidenceBinder
 */

import { describe, it, expect } from 'vitest';
import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service';
import type { EvidenceItem } from '@/types/onboarding.types';

describe('evidenceBinder.service', () => {
  describe('renderBinderHTML', () => {
    it('should render empty list', () => {
      const html = renderBinderHTML([]);
      expect(html).toContain('Evidence Binder');
      expect(html).toContain('<ul></ul>');
    });

    it('should include item title and date', () => {
      const items: EvidenceItem[] = [
        {
          id: 'e1',
          title: 'Launch Success',
          kind: 'note',
          text: 'We launched the feature successfully.',
          createdAt: '2025-10-01T00:00:00Z',
        },
      ];
      const html = renderBinderHTML(items);
      expect(html).toContain('Launch Success');
      expect(html).toContain('We launched the feature successfully.');
    });

    it('should handle URLs', () => {
      const items: EvidenceItem[] = [
        {
          id: 'e1',
          title: 'Design Doc',
          kind: 'link',
          url: 'https://example.com/doc',
          createdAt: '2025-10-01T00:00:00Z',
        },
      ];
      const html = renderBinderHTML(items);
      expect(html).toContain('https://example.com/doc');
    });

    it('should handle multiple items', () => {
      const items: EvidenceItem[] = [
        {
          id: 'e1',
          title: 'Item 1',
          kind: 'note',
          createdAt: '2025-10-01T00:00:00Z',
        },
        {
          id: 'e2',
          title: 'Item 2',
          kind: 'doc',
          createdAt: '2025-10-02T00:00:00Z',
        },
      ];
      const html = renderBinderHTML(items);
      expect(html).toContain('Item 1');
      expect(html).toContain('Item 2');
    });
  });
});
