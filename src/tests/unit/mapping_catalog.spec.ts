/**
 * @fileoverview Unit tests for ATS mapping catalog
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_MAPPINGS } from '@/services/autofill/mappingCatalog.service';

describe('mappingCatalog', () => {
  it('includes Greenhouse mapping', () => {
    const greenhouse = DEFAULT_MAPPINGS.find(m => m.ats === 'greenhouse');
    expect(greenhouse).toBeDefined();
    expect(greenhouse?.id).toBe('greenhouse-basic');
  });

  it('includes Lever mapping', () => {
    const lever = DEFAULT_MAPPINGS.find(m => m.ats === 'lever');
    expect(lever).toBeDefined();
    expect(lever?.id).toBe('lever-basic');
  });

  it('Greenhouse mapping has required fields', () => {
    const greenhouse = DEFAULT_MAPPINGS.find(m => m.ats === 'greenhouse');
    const requiredFields = greenhouse?.fields.filter(f => f.required);
    expect(requiredFields?.length).toBeGreaterThan(0);
    expect(requiredFields?.some(f => f.name === 'first_name')).toBe(true);
    expect(requiredFields?.some(f => f.name === 'email')).toBe(true);
  });

  it('includes file upload fields', () => {
    const greenhouse = DEFAULT_MAPPINGS.find(m => m.ats === 'greenhouse');
    const fileFields = greenhouse?.fields.filter(f => f.type === 'file');
    expect(fileFields?.length).toBeGreaterThan(0);
  });

  it('all fields have selectors', () => {
    DEFAULT_MAPPINGS.forEach(mapping => {
      mapping.fields.forEach(field => {
        expect(field.selector).toBeTruthy();
      });
    });
  });
});
