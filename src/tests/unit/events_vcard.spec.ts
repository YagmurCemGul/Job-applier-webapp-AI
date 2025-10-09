/**
 * @fileoverview Unit tests for vCard generation
 */

import { describe, it, expect } from 'vitest';
import { buildVCard } from '@/services/events/vcard.service';

describe('vCard Builder', () => {
  it('generates valid vCard with all fields', () => {
    const vcard = buildVCard({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      title: 'Engineer',
      org: 'TechCorp',
      url: 'https://johndoe.com'
    });

    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:3.0');
    expect(vcard).toContain('FN:John Doe');
    expect(vcard).toContain('EMAIL:john@example.com');
    expect(vcard).toContain('TEL:+1234567890');
    expect(vcard).toContain('TITLE:Engineer');
    expect(vcard).toContain('ORG:TechCorp');
    expect(vcard).toContain('URL:https://johndoe.com');
    expect(vcard).toContain('END:VCARD');
  });

  it('handles missing optional fields', () => {
    const vcard = buildVCard({
      name: 'Jane Smith'
    });

    expect(vcard).toContain('FN:Jane Smith');
    expect(vcard).not.toContain('EMAIL:');
    expect(vcard).not.toContain('TEL:');
  });

  it('uses proper newline formatting', () => {
    const vcard = buildVCard({ name: 'Test' });
    const lines = vcard.split('\n');
    
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines[lines.length - 1]).toBe('END:VCARD');
  });
});
