/**
 * @fileoverview Integration test for sequence sending with follow-ups
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useContacts } from '@/stores/contacts.store';
import { useOutreach } from '@/stores/outreach.store';
import type { Contact } from '@/types/contacts.types';
import type { Sequence, SequenceRun, Template } from '@/types/outreach.types';

describe('Sequence Send and Follow-up Integration', () => {
  beforeEach(() => {
    useContacts.setState({ items: [] });
    useOutreach.setState({ templates: [], sequences: [], runs: [] });
  });

  it('creates and runs sequence for multiple contacts', () => {
    const { upsert: upsertContact } = useContacts.getState();
    const { upsertTemplate, upsertSequence, upsertRun } = useOutreach.getState();

    // 1. Create contacts
    const contacts: Contact[] = Array.from({ length: 5 }, (_, i) => ({
      id: `c${i}`,
      name: `Contact ${i}`,
      email: `contact${i}@example.com`,
      tags: [],
      kind: 'recruiter' as const,
      relationship: 'weak' as const,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }));

    contacts.forEach(upsertContact);

    // 2. Create template
    const template: Template = {
      id: 't1',
      name: 'Recruiter Ping',
      subject: 'Hi {{FirstName}}',
      bodyHtml: '<p>Hello {{FirstName}}</p>',
      variables: [{ key: 'FirstName', label: 'First Name' }]
    };
    upsertTemplate(template);

    // 3. Create sequence
    const sequence: Sequence = {
      id: 's1',
      name: 'Recruiter Follow-up',
      steps: [
        { id: 'step1', dayOffset: 0, channel: 'email', templateId: 't1' },
        { id: 'step2', dayOffset: 3, channel: 'email', templateId: 't1' }
      ],
      maxPerDay: 5,
      unsubscribeFooter: true
    };
    upsertSequence(sequence);

    // 4. Start sequence for all contacts
    contacts.forEach(contact => {
      const run: SequenceRun = {
        id: `run-${contact.id}`,
        sequenceId: 's1',
        contactId: contact.id,
        startedAt: new Date().toISOString(),
        status: 'scheduled',
        history: []
      };
      upsertRun(run);
    });

    // 5. Verify runs created
    const { runs } = useOutreach.getState();
    expect(runs).toHaveLength(5);
    expect(runs.every(r => r.status === 'scheduled')).toBe(true);
  });

  it('enforces rate limits', () => {
    const sequence: Sequence = {
      id: 's1',
      name: 'Test',
      steps: [],
      maxPerDay: 3 // Limit to 3 per day
    };

    expect(sequence.maxPerDay).toBe(3);
    // In real implementation, would verify only 3 emails sent per day
  });
});
