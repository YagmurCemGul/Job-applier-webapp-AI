/**
 * @fileoverview Unit tests for prospect import
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { importProspectsCsv } from '@/services/outreach/importCsv.service';
import { useOutreach } from '@/stores/outreach.store';

describe('Prospect Import', () => {
  beforeEach(() => {
    useOutreach.setState({ prospects: [] });
  });

  it('parses CSV and creates prospects', async () => {
    const csvContent = `email,name,role,company,tags
john@example.com,John Doe,Engineer,Acme Corp,tech
jane@example.com,Jane Smith,Manager,Beta Inc,"leadership,remote"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'prospects.csv', { type: 'text/csv' });

    const count = await importProspectsCsv(file);
    
    expect(count).toBe(2);
    const { prospects } = useOutreach.getState();
    expect(prospects.length).toBe(2);
    expect(prospects[0].email).toBe('jane@example.com');
    expect(prospects[1].email).toBe('john@example.com');
  });

  it('handles missing email/linkedin gracefully', async () => {
    const csvContent = `email,name,role
,John Doe,Engineer
jane@example.com,Jane Smith,Manager`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'prospects.csv', { type: 'text/csv' });

    const count = await importProspectsCsv(file);
    
    expect(count).toBe(1); // Only jane has email
    const { prospects } = useOutreach.getState();
    expect(prospects.length).toBe(1);
    expect(prospects[0].email).toBe('jane@example.com');
  });

  it('parses comma-separated tags', async () => {
    const csvContent = `email,name,tags
john@example.com,John Doe,"tech,senior,remote"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'prospects.csv', { type: 'text/csv' });

    await importProspectsCsv(file);
    
    const { prospects } = useOutreach.getState();
    expect(prospects[0].tags).toEqual(['tech', 'senior', 'remote']);
  });
});
