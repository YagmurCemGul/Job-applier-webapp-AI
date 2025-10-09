/**
 * Feedback Templates Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePerf } from '@/stores/perf.store';
import { seedFeedbackTemplates } from '@/services/perf/feedback360.service';

describe('Feedback Templates', () => {
  beforeEach(() => {
    usePerf.setState({ templates: [] });
  });

  it('seeds default template', () => {
    seedFeedbackTemplates();
    const templates = usePerf.getState().templates;
    expect(templates.length).toBeGreaterThan(0);
  });

  it('includes expected sections', () => {
    seedFeedbackTemplates();
    const template = usePerf.getState().templates[0];
    expect(template.sections).toBeDefined();
    expect(template.sections.length).toBeGreaterThan(0);
    expect(template.sections[0]).toHaveProperty('key');
    expect(template.sections[0]).toHaveProperty('title');
    expect(template.sections[0]).toHaveProperty('prompt');
  });

  it('maps rubric keys', () => {
    seedFeedbackTemplates();
    const template = usePerf.getState().templates[0];
    expect(template.rubric).toBeDefined();
    expect(template.rubric?.length).toBeGreaterThan(0);
  });

  it('is idempotent', () => {
    seedFeedbackTemplates();
    const count1 = usePerf.getState().templates.length;
    seedFeedbackTemplates();
    const count2 = usePerf.getState().templates.length;
    expect(count1).toBe(count2);
  });
});
