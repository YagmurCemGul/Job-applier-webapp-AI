/**
 * @fileoverview Unit tests for risk scoring (Step 45)
 */

import { describe, it, expect } from 'vitest';
import { scoreRisk } from '@/services/onboarding/risk.service';

describe('Risk Scoring Service', () => {
  it('calculates score correctly', () => {
    const { score } = scoreRisk({ probability: 4, impact: 5 });
    expect(score).toBe(20);
  });
  
  it('classifies high risk (score >= 16)', () => {
    const { level } = scoreRisk({ probability: 4, impact: 4 });
    expect(level).toBe('high');
  });
  
  it('classifies medium risk (9 <= score < 16)', () => {
    const { level } = scoreRisk({ probability: 3, impact: 3 });
    expect(level).toBe('medium');
  });
  
  it('classifies low risk (score < 9)', () => {
    const { level } = scoreRisk({ probability: 2, impact: 2 });
    expect(level).toBe('low');
  });
  
  it('handles boundary case (score = 16)', () => {
    const { level } = scoreRisk({ probability: 4, impact: 4 });
    expect(level).toBe('high');
  });
  
  it('handles boundary case (score = 9)', () => {
    const { level } = scoreRisk({ probability: 3, impact: 3 });
    expect(level).toBe('medium');
  });
  
  it('handles minimum score (1×1)', () => {
    const { score, level } = scoreRisk({ probability: 1, impact: 1 });
    expect(score).toBe(1);
    expect(level).toBe('low');
  });
  
  it('handles maximum score (5×5)', () => {
    const { score, level } = scoreRisk({ probability: 5, impact: 5 });
    expect(score).toBe(25);
    expect(level).toBe('high');
  });
});
