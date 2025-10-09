/**
 * Frameworks Seed Unit Tests (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { seedDefaultFramework } from '@/services/skills/frameworks.service';

describe('Frameworks Seed', () => {
  beforeEach(() => {
    useSkills.setState({ frameworks: [] });
  });

  it('seeds default framework', () => {
    seedDefaultFramework();
    const frameworks = useSkills.getState().frameworks;
    expect(frameworks.length).toBe(1);
    expect(frameworks[0].role).toBe('Software Engineer');
  });

  it('ladder contains expected levels', () => {
    seedDefaultFramework();
    const fw = useSkills.getState().frameworks[0];
    expect(fw.ladder).toEqual(['L3', 'L4', 'L5', 'L6']);
  });

  it('competencies have level bars', () => {
    seedDefaultFramework();
    const fw = useSkills.getState().frameworks[0];
    const systemDesign = fw.competencies.find(c => c.key === 'system_design');
    expect(systemDesign).toBeDefined();
    expect(systemDesign?.expectedByLevel.L3).toBe(1);
    expect(systemDesign?.expectedByLevel.L6).toBe(4);
  });

  it('is idempotent - does not duplicate', () => {
    seedDefaultFramework();
    seedDefaultFramework();
    const frameworks = useSkills.getState().frameworks;
    expect(frameworks.length).toBe(1);
  });
});
