/**
 * @fileoverview Unit tests for cadence scheduling with quiet hours (Step 45)
 */

import { describe, it, expect } from 'vitest';
import { buildCadences } from '@/services/onboarding/cadences.service';
import { withinQuietHours } from '@/services/integrations/timezone.service';

describe('Cadence Scheduling Service', () => {
  describe('buildCadences', () => {
    const input = {
      tz: 'America/New_York',
      startISO: '2025-03-01T10:00:00Z',
      managerEmail: 'manager@example.com',
      mentorEmail: 'mentor@example.com',
      buddyEmail: 'buddy@example.com'
    };
    
    it('creates manager, mentor, buddy, and team cadences', () => {
      const cadences = buildCadences(input);
      
      expect(cadences.length).toBe(4);
      expect(cadences.find(c => c.kind === 'manager_1_1')).toBeDefined();
      expect(cadences.find(c => c.kind === 'mentor')).toBeDefined();
      expect(cadences.find(c => c.kind === 'buddy')).toBeDefined();
      expect(cadences.find(c => c.kind === 'team_ceremony')).toBeDefined();
    });
    
    it('assigns recurrence patterns', () => {
      const cadences = buildCadences(input);
      
      const manager = cadences.find(c => c.kind === 'manager_1_1');
      expect(manager?.recurrence).toBe('weekly');
      
      const mentor = cadences.find(c => c.kind === 'mentor');
      expect(mentor?.recurrence).toBe('biweekly');
    });
    
    it('sets duration to at least 25 minutes', () => {
      const cadences = buildCadences(input);
      
      cadences.forEach(cadence => {
        const duration = (Date.parse(cadence.endISO) - Date.parse(cadence.startISO)) / 60000;
        expect(duration).toBeGreaterThanOrEqual(25);
      });
    });
    
    it('respects quiet hours', () => {
      const lateInput = {
        ...input,
        startISO: '2025-03-01T02:00:00Z' // 2 AM UTC (late at night)
      };
      
      const cadences = buildCadences(lateInput);
      
      // Events should be shifted out of quiet hours
      cadences.forEach(cadence => {
        if (cadence.quietRespect) {
          const dt = new Date(cadence.startISO);
          const hour = dt.getHours();
          // Should be moved to 10 AM if originally in quiet hours
          expect(withinQuietHours(cadence.startISO, lateInput.tz)).toBe(false);
        }
      });
    });
    
    it('includes attendees', () => {
      const cadences = buildCadences(input);
      
      const manager = cadences.find(c => c.kind === 'manager_1_1');
      expect(manager?.attendees).toContain('manager@example.com');
      
      const mentor = cadences.find(c => c.kind === 'mentor');
      expect(mentor?.attendees).toContain('mentor@example.com');
    });
  });
});
