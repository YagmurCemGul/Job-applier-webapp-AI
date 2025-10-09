/**
 * @fileoverview Integration test for warm intro flow
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useContacts } from '@/stores/contacts.store';
import { useGraph } from '@/stores/graph.store';
import { useOutreach } from '@/stores/outreach.store';
import { bestIntroPath } from '@/services/graph/graph.service';
import type { Contact } from '@/types/contacts.types';
import type { IntroEdge } from '@/types/graph.types';

describe('Warm Intro Flow Integration', () => {
  beforeEach(() => {
    // Reset stores
    useContacts.setState({ items: [] });
    useGraph.setState({ edges: [] });
    useOutreach.setState({ templates: [], sequences: [], runs: [] });
  });

  it('completes full warm intro workflow', () => {
    // 1. Add contacts
    const { upsert: upsertContact } = useContacts.getState();
    
    const introducer: Contact = {
      id: 'alice',
      name: 'Alice Smith',
      email: 'alice@example.com',
      company: 'TechCorp',
      tags: [],
      kind: 'alumni',
      relationship: 'strong',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    };

    const target: Contact = {
      id: 'bob',
      name: 'Bob Jones',
      email: 'bob@example.com',
      company: 'TargetCo',
      tags: [],
      kind: 'hiring_manager',
      relationship: 'weak',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    };

    upsertContact(introducer);
    upsertContact(target);

    // 2. Add intro edge
    const { upsertEdge } = useGraph.getState();
    const edge: IntroEdge = {
      id: 'edge1',
      fromId: 'alice',
      toId: 'bob',
      strength: 3
    };
    upsertEdge(edge);

    // 3. Find best path
    const path = bestIntroPath('me', 'bob', [
      { id: 'e1', fromId: 'me', toId: 'alice', strength: 3 },
      edge
    ]);

    expect(path).not.toBeNull();
    expect(path?.path).toContain('alice');
    expect(path?.path).toContain('bob');

    // 4. Verify contacts stored
    const { items } = useContacts.getState();
    expect(items).toHaveLength(2);
  });
});
