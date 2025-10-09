/**
 * @fileoverview Integration test for pipeline Kanban flow
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { usePipeline } from '@/stores/pipeline.store';
import { useContacts } from '@/stores/contacts.store';
import { score } from '@/services/pipeline/recruiterPipeline.service';
import type { PipelineItem } from '@/stores/pipeline.store';
import type { Contact } from '@/types/contacts.types';

describe('Pipeline Kanban Flow Integration', () => {
  beforeEach(() => {
    usePipeline.setState({ items: [] });
    useContacts.setState({ items: [] });
  });

  it('moves candidate through pipeline stages', () => {
    const { upsert, setStage, byStage } = usePipeline.getState();
    const { upsert: upsertContact } = useContacts.getState();

    // 1. Add contact
    const contact: Contact = {
      id: 'c1',
      name: 'Alice Recruiter',
      email: 'alice@techcorp.com',
      company: 'TechCorp',
      tags: [],
      kind: 'recruiter',
      relationship: 'casual',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    };
    upsertContact(contact);

    // 2. Add to pipeline as prospect
    const item: PipelineItem = {
      id: 'p1',
      contactId: 'c1',
      company: 'TechCorp',
      role: 'Senior Engineer',
      stage: 'prospect',
      lastActionISO: new Date().toISOString()
    };
    upsert(item);

    // 3. Move through stages
    expect(byStage('prospect')).toHaveLength(1);
    
    setStage('p1', 'intro_requested');
    expect(byStage('intro_requested')).toHaveLength(1);
    expect(byStage('prospect')).toHaveLength(0);

    setStage('p1', 'referred');
    expect(byStage('referred')).toHaveLength(1);

    setStage('p1', 'screening');
    expect(byStage('screening')).toHaveLength(1);

    // 4. Verify score increases with stage
    const { items } = usePipeline.getState();
    const currentItem = items.find(i => i.id === 'p1')!;
    const currentScore = score(currentItem);
    
    expect(currentScore).toBeGreaterThan(0.5); // screening should have decent score
  });

  it('persists notes across stage changes', () => {
    const { upsert, setStage } = usePipeline.getState();

    const item: PipelineItem = {
      id: 'p1',
      contactId: 'c1',
      stage: 'prospect',
      notes: 'Initial contact notes',
      lastActionISO: new Date().toISOString()
    };
    upsert(item);

    setStage('p1', 'screening');

    const { items } = usePipeline.getState();
    const updated = items.find(i => i.id === 'p1');
    expect(updated?.notes).toBe('Initial contact notes');
  });
});
