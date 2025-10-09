/**
 * @fileoverview Unit tests for CSV/VCF importers
 */

import { describe, it, expect } from 'vitest';
import { parseCSV, parseVCF } from '@/services/contacts/importers.service';

describe('CSV Importer', () => {
  it('parses basic CSV with all columns', () => {
    const csv = `name,email,company,title,city,tags
John Doe,john@example.com,TechCorp,Engineer,NYC,recruiter;tech`;
    
    const contacts = parseCSV(csv);
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe('John Doe');
    expect(contacts[0].email).toBe('john@example.com');
    expect(contacts[0].company).toBe('TechCorp');
    expect(contacts[0].tags).toEqual(['recruiter', 'tech']);
  });

  it('handles missing columns gracefully', () => {
    const csv = `name,email
Jane Smith,jane@example.com`;
    
    const contacts = parseCSV(csv);
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe('Jane Smith');
    expect(contacts[0].company).toBeUndefined();
  });

  it('handles Unicode names', () => {
    const csv = `name,email
Müller François,mueller@example.com`;
    
    const contacts = parseCSV(csv);
    expect(contacts[0].name).toBe('Müller François');
  });
});

describe('VCF Importer', () => {
  it('parses basic vCard', () => {
    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
EMAIL:john@example.com
TEL:+1234567890
ORG:TechCorp
TITLE:Engineer
END:VCARD`;
    
    const contacts = parseVCF(vcf);
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe('John Doe');
    expect(contacts[0].email).toBe('john@example.com');
    expect(contacts[0].phone).toBe('+1234567890');
    expect(contacts[0].company).toBe('TechCorp');
  });

  it('handles multiple vCards', () => {
    const vcf = `BEGIN:VCARD
VERSION:3.0
FN:John Doe
EMAIL:john@example.com
END:VCARD
BEGIN:VCARD
VERSION:3.0
FN:Jane Smith
EMAIL:jane@example.com
END:VCARD`;
    
    const contacts = parseVCF(vcf);
    expect(contacts).toHaveLength(2);
  });
});
