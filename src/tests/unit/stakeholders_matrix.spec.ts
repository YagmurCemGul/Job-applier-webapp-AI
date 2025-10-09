/**
 * @fileoverview Unit tests for stakeholder matrix (Step 45)
 */

import { describe, it, expect } from 'vitest';
import { quadrant } from '@/services/onboarding/stakeholders.service';
import type { Stakeholder } from '@/types/onboarding.types';

describe('Stakeholder Matrix Service', () => {
  describe('quadrant classification', () => {
    it('classifies high power/high interest as manage_closely', () => {
      const stakeholder: Stakeholder = {
        id: '1',
        name: 'Jane Doe',
        power: 5,
        interest: 5
      };
      
      expect(quadrant(stakeholder)).toBe('manage_closely');
    });
    
    it('classifies high power/low interest as keep_satisfied', () => {
      const stakeholder: Stakeholder = {
        id: '1',
        name: 'John Smith',
        power: 5,
        interest: 2
      };
      
      expect(quadrant(stakeholder)).toBe('keep_satisfied');
    });
    
    it('classifies low power/high interest as keep_informed', () => {
      const stakeholder: Stakeholder = {
        id: '1',
        name: 'Alice Johnson',
        power: 2,
        interest: 5
      };
      
      expect(quadrant(stakeholder)).toBe('keep_informed');
    });
    
    it('classifies low power/low interest as monitor', () => {
      const stakeholder: Stakeholder = {
        id: '1',
        name: 'Bob Wilson',
        power: 2,
        interest: 2
      };
      
      expect(quadrant(stakeholder)).toBe('monitor');
    });
    
    it('handles boundary cases (power=4)', () => {
      const stakeholder: Stakeholder = {
        id: '1',
        name: 'Charlie Brown',
        power: 4,
        interest: 5
      };
      
      expect(quadrant(stakeholder)).toBe('manage_closely');
    });
    
    it('handles boundary cases (interest=4)', () => {
      const stakeholder: Stakeholder = {
        id: '1',
        name: 'Diana Prince',
        power: 5,
        interest: 4
      };
      
      expect(quadrant(stakeholder)).toBe('manage_closely');
    });
  });
});
