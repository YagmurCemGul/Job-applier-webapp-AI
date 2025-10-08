/**
 * @fileoverview Unit tests for evidence binder service.
 */

import { describe, it, expect } from 'vitest';
import { renderBinderHTML } from '@/services/onboarding/evidenceBinder.service';
import type { EvidenceItem } from '@/types/onboarding.types';

describe('evidenceBinder.service', () => {
  describe('renderBinderHTML', () => {
    it('should render empty binder', () => {
      const html = renderBinderHTML([]);
      expect(html).toContain('Evidence Binder');
      expect(html).toContain('<ul></ul>');
    });

    it('should render items with titles and dates', () => {
      const items: EvidenceItem[] = [
        {
          id: 'e1',
          title: 'Feature Launch',
          kind: 'doc',
          text: 'Launched X with 100% uptime',
          createdAt: '2025-10-01T00:00:00Z',
        },
        {
          id: 'e2',
          title: 'Metric Improvement',
          kind: 'metric',
          url: 'https://chart.example.com',
          createdAt: '2025-10-05T00:00:00Z',
        },
      ];
      const html = renderBinderHTML(items);
      expect(html).toContain('Feature Launch');
      expect(html).toContain('Launched X with 100% uptime');
      expect(html).toContain('Metric Improvement');
      expect(html).toContain('https://chart.example.com');
    });

    it('should handle Unicode in titles and text', () => {
      const items: EvidenceItem[] = [
        {
          id: 'e1',
          title: 'Test 你好',
          kind: 'note',
          text: 'Türkçe text',
          createdAt: '2025-10-01T00:00:00Z',
        },
      ];
      const html = renderBinderHTML(items);
      expect(html).toContain('你好');
      expect(html).toContain('Türkçe');
    });
  });
});
