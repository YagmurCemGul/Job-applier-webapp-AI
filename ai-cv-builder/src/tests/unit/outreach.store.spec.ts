/**
 * Unit tests for Outreach Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useOutreachStore } from '@/stores/outreach.store';

describe('Outreach Store', () => {
  beforeEach(() => {
    useOutreachStore.setState({ sequences: [] });
  });

  it('should create new sequence', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Follow-up Sequence',
      steps: [],
      active: true
    });

    const { sequences } = useOutreachStore.getState();
    expect(sequences).toHaveLength(1);
    expect(sequences[0].name).toBe('Follow-up Sequence');
    expect(sequences[0].active).toBe(true);
  });

  it('should update existing sequence', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Original Name',
      steps: [],
      active: true
    });

    useOutreachStore.getState().upsert({
      id,
      name: 'Updated Name',
      steps: [{ id: 'step1', offsetDays: 3, templateId: 'tpl1' }],
      active: false
    });

    const { sequences } = useOutreachStore.getState();
    expect(sequences).toHaveLength(1);
    expect(sequences[0].name).toBe('Updated Name');
    expect(sequences[0].steps).toHaveLength(1);
  });

  it('should remove sequence', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Test Sequence',
      steps: [],
      active: true
    });

    useOutreachStore.getState().remove(id);

    const { sequences } = useOutreachStore.getState();
    expect(sequences).toHaveLength(0);
  });

  it('should get sequence by id', () => {
    const id = useOutreachStore.getState().upsert({
      name: 'Test Sequence',
      steps: [],
      active: true
    });

    const seq = useOutreachStore.getState().getById(id);
    expect(seq).toBeDefined();
    expect(seq?.name).toBe('Test Sequence');
  });
});
