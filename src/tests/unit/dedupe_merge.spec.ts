/**
 * @fileoverview Unit tests for deduplication and merging
 */

import { describe, it, expect } from 'vitest';
import { dedupeByEmail } from '@/services/contacts/dedupe.service';
import type { Contact } from '@/types/contacts.types';

describe('Dedupe Service', () => {
  it('merges contacts by email', () => {
    const existing: Contact[] = [{
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'TechCorp',
      tags: [],
      kind: 'engineer',
      relationship: 'weak',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }];

    const imported: Contact[] = [{
      id: '2',
      name: 'John D.',
      email: 'john@example.com',
      title: 'Senior Engineer',
      tags: [],
      kind: 'engineer',
      relationship: 'weak',
      createdAt: '2025-01-02',
      updatedAt: '2025-01-02'
    }];

    const merged = dedupeByEmail(existing, imported);
    expect(merged).toHaveLength(1);
    expect(merged[0].company).toBe('TechCorp'); // Keeps existing
    expect(merged[0].title).toBe('Senior Engineer'); // Adds new field
  });

  it('adds new contacts when email differs', () => {
    const existing: Contact[] = [{
      id: '1',
      name: 'John',
      email: 'john@example.com',
      tags: [],
      kind: 'engineer',
      relationship: 'weak',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }];

    const imported: Contact[] = [{
      id: '2',
      name: 'Jane',
      email: 'jane@example.com',
      tags: [],
      kind: 'engineer',
      relationship: 'weak',
      createdAt: '2025-01-02',
      updatedAt: '2025-01-02'
    }];

    const merged = dedupeByEmail(existing, imported);
    expect(merged).toHaveLength(2);
  });

  it('handles case-insensitive email matching', () => {
    const existing: Contact[] = [{
      id: '1',
      name: 'John',
      email: 'JOHN@EXAMPLE.COM',
      tags: [],
      kind: 'engineer',
      relationship: 'weak',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    }];

    const imported: Contact[] = [{
      id: '2',
      name: 'John',
      email: 'john@example.com',
      tags: [],
      kind: 'engineer',
      relationship: 'weak',
      createdAt: '2025-01-02',
      updatedAt: '2025-01-02'
    }];

    const merged = dedupeByEmail(existing, imported);
    expect(merged).toHaveLength(1);
  });
});
