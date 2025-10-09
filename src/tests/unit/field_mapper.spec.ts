/**
 * @fileoverview Unit tests for field mapper
 */

import { describe, it, expect } from 'vitest';
import { buildPlan } from '@/services/autofill/fieldMapper.service';
import type { FieldMapping } from '@/types/autofill.types';

describe('fieldMapper', () => {
  const mockMapping: FieldMapping = {
    id: 'test-mapping',
    ats: 'greenhouse',
    fields: [
      { name: 'first_name', selector: '#first-name', type: 'text', valueFrom: 'profile', required: true },
      { name: 'email', selector: '#email', type: 'text', valueFrom: 'profile', required: true },
      { name: 'resume', selector: '#resume', type: 'file', valueFrom: 'variant' }
    ]
  };

  const mockData = {
    first_name: 'John',
    email: 'john@example.com',
    resume: 'https://example.com/resume.pdf'
  };

  it('builds plan with correct steps', () => {
    const plan = buildPlan(mockMapping, mockData, 'run-123');
    expect(plan.steps).toHaveLength(3);
  });

  it('creates fill steps for text fields', () => {
    const plan = buildPlan(mockMapping, mockData, 'run-123');
    const textSteps = plan.steps.filter(s => s.kind === 'fill');
    expect(textSteps).toHaveLength(2);
  });

  it('creates upload steps for file fields', () => {
    const plan = buildPlan(mockMapping, mockData, 'run-123');
    const uploadSteps = plan.steps.filter(s => s.kind === 'upload');
    expect(uploadSteps).toHaveLength(1);
  });

  it('includes data dictionary', () => {
    const plan = buildPlan(mockMapping, mockData, 'run-123');
    expect(plan.data).toEqual(mockData);
  });

  it('assigns correct runId', () => {
    const plan = buildPlan(mockMapping, mockData, 'run-123');
    expect(plan.runId).toBe('run-123');
  });

  it('references mappingId', () => {
    const plan = buildPlan(mockMapping, mockData, 'run-123');
    expect(plan.mappingId).toBe('test-mapping');
  });

  it('generates unique plan ID', () => {
    const plan1 = buildPlan(mockMapping, mockData, 'run-123');
    const plan2 = buildPlan(mockMapping, mockData, 'run-123');
    expect(plan1.id).not.toBe(plan2.id);
  });
});
