/**
 * @fileoverview Unit tests for deduplication and suppression
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { upsertProspect } from '@/services/outreach/prospect.service';
import { suppress } from '@/services/outreach/suppression.service';
import { useOutreach } from '@/stores/outreach.store';

describe('Dedupe and Suppression', () => {
  beforeEach(() => {
    useOutreach.setState({ prospects: [], suppressions: [] });
  });

  it('deduplicates prospects by email+company', () => {
    const p1 = upsertProspect({ 
      email: 'john@example.com', 
      name: 'John Doe', 
      company: 'Acme Corp' 
    });
    
    const p2 = upsertProspect({ 
      email: 'john@example.com', 
      name: 'John Doe Updated', 
      company: 'Acme Corp' 
    });

    const { prospects } = useOutreach.getState();
    expect(prospects.length).toBe(1);
    expect(p1.id).toBe(p2.id);
    expect(prospects[0].name).toBe('John Doe Updated');
  });

  it('keeps separate prospects for same email different company', () => {
    upsertProspect({ 
      email: 'john@example.com', 
      name: 'John Doe', 
      company: 'Acme Corp' 
    });
    
    upsertProspect({ 
      email: 'john@example.com', 
      name: 'John Doe', 
      company: 'Beta Inc' 
    });

    const { prospects } = useOutreach.getState();
    expect(prospects.length).toBe(2);
  });

  it('adds email to suppression list', () => {
    suppress('blocked@example.com', 'manual');
    
    const { suppressions, isSuppressed } = useOutreach.getState();
    expect(suppressions.length).toBe(1);
    expect(suppressions[0].email).toBe('blocked@example.com');
    expect(suppressions[0].reason).toBe('manual');
    expect(isSuppressed('blocked@example.com')).toBe(true);
  });

  it('suppression check is case-insensitive', () => {
    suppress('Blocked@Example.com', 'unsub');
    
    const { isSuppressed } = useOutreach.getState();
    expect(isSuppressed('blocked@example.com')).toBe(true);
    expect(isSuppressed('BLOCKED@EXAMPLE.COM')).toBe(true);
  });
});
