/**
 * @fileoverview Unit tests for AI action items extraction.
 */

import { describe, it, expect, vi } from 'vitest';
import { extractActions } from '@/services/onboarding/aiActionItems.service';
import * as aiService from '@/services/features/aiComplete.service';

describe('aiActionItems.service', () => {
  describe('extractActions', () => {
    it('should return empty array on AI error', async () => {
      vi.spyOn(aiService, 'aiComplete').mockRejectedValue(new Error('AI error'));
      const result = await extractActions('Some notes');
      expect(result).toEqual([]);
    });

    it('should parse JSON response', async () => {
      vi.spyOn(aiService, 'aiComplete').mockResolvedValue([
        { text: 'Follow up with manager', owner: 'me' },
        { text: 'Review PRD', owner: 'team', dueISO: '2025-10-15T00:00:00Z' },
      ]);
      const result = await extractActions('Discussed PRD. Need to follow up.');
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Follow up with manager');
      expect(result[1].dueISO).toBe('2025-10-15T00:00:00Z');
    });

    it('should handle malformed JSON gracefully', async () => {
      vi.spyOn(aiService, 'aiComplete').mockResolvedValue('not json');
      const result = await extractActions('Notes');
      expect(result).toEqual([]);
    });

    it('should parse stringified JSON', async () => {
      vi.spyOn(aiService, 'aiComplete').mockResolvedValue(
        JSON.stringify([{ text: 'Action 1' }])
      );
      const result = await extractActions('Notes');
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Action 1');
    });
  });
});
