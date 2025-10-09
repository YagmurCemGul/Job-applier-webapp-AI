/**
 * @fileoverview Integration test for unsubscribe preferences
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { suppress } from '@/services/outreach/suppression.service';
import { useOutreach } from '@/stores/outreach.store';

describe('Unsubscribe Preferences', () => {
  beforeEach(() => {
    useOutreach.setState({ suppressions: [] });
  });

  it('adds email to suppression list on unsubscribe', () => {
    suppress('user@example.com', 'unsub');

    const { suppressions, isSuppressed } = useOutreach.getState();
    
    expect(suppressions.length).toBe(1);
    expect(suppressions[0].email).toBe('user@example.com');
    expect(suppressions[0].reason).toBe('unsub');
    expect(isSuppressed('user@example.com')).toBe(true);
  });

  it('prevents duplicate suppressions for same email', () => {
    suppress('user@example.com', 'unsub');
    suppress('user@example.com', 'manual'); // Should replace

    const { suppressions } = useOutreach.getState();
    
    expect(suppressions.length).toBe(1);
    expect(suppressions[0].reason).toBe('manual'); // Latest
  });

  it('stores timestamp of suppression', () => {
    const before = new Date().toISOString();
    suppress('user@example.com', 'bounce');
    const after = new Date().toISOString();

    const { suppressions } = useOutreach.getState();
    
    expect(suppressions[0].addedAt).toBeGreaterThanOrEqual(before);
    expect(suppressions[0].addedAt).toBeLessThanOrEqual(after);
  });

  it('normalizes email to lowercase', () => {
    suppress('User@Example.COM', 'unsub');

    const { suppressions, isSuppressed } = useOutreach.getState();
    
    expect(suppressions[0].email).toBe('user@example.com');
    expect(isSuppressed('USER@EXAMPLE.COM')).toBe(true);
  });

  it('supports different suppression reasons', () => {
    suppress('unsub@example.com', 'unsub');
    suppress('bounce@example.com', 'bounce');
    suppress('manual@example.com', 'manual');

    const { suppressions } = useOutreach.getState();
    
    expect(suppressions.length).toBe(3);
    expect(suppressions.find(s => s.email === 'unsub@example.com')?.reason).toBe('unsub');
    expect(suppressions.find(s => s.email === 'bounce@example.com')?.reason).toBe('bounce');
    expect(suppressions.find(s => s.email === 'manual@example.com')?.reason).toBe('manual');
  });
});
