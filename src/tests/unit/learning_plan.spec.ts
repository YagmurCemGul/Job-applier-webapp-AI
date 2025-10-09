/**
 * @fileoverview Unit tests for learning plan (Step 45)
 */

import { describe, it, expect } from 'vitest';
import { seedLearning } from '@/services/onboarding/learning.service';

describe('Learning Plan Service', () => {
  it('seeds engineer-specific resources', () => {
    const items = seedLearning('Senior Engineer');
    
    expect(items.length).toBeGreaterThan(0);
    expect(items.some(i => i.title.toLowerCase().includes('system'))).toBe(true);
  });
  
  it('seeds product-specific resources', () => {
    const items = seedLearning('Product Manager');
    
    expect(items.length).toBeGreaterThan(0);
    expect(items.some(i => i.title.toLowerCase().includes('product'))).toBe(true);
  });
  
  it('seeds generic resources for unknown roles', () => {
    const items = seedLearning('Unknown Role');
    
    expect(items.length).toBeGreaterThan(0);
    expect(items.some(i => i.title.toLowerCase().includes('handbook'))).toBe(true);
  });
  
  it('assigns correct learning kinds', () => {
    const items = seedLearning('Engineer');
    
    items.forEach(item => {
      expect(['course', 'doc', 'repo', 'person', 'video']).toContain(item.kind);
    });
  });
  
  it('initializes status as planned', () => {
    const items = seedLearning('Engineer');
    
    items.forEach(item => {
      expect(item.status).toBe('planned');
    });
  });
});
