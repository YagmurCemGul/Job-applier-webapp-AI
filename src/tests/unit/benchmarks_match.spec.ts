/**
 * @fileoverview Benchmarks parsing unit tests for Step 44
 */

import { describe, it, expect } from 'vitest';
import { parseBenchmarkCsv } from '@/services/offers/benchmarks.service';

describe('Benchmarks Parsing', () => {
  it('should parse CSV headers correctly', () => {
    const csv = `role,level,region,currency,baseP50,baseP75,tcP50,tcP75,source,year
Software Engineer,Senior,US,USD,150000,180000,200000,250000,Levels.fyi,2024`;

    const rows = parseBenchmarkCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].role).toBe('Software Engineer');
    expect(rows[0].baseP50).toBe(150000);
  });

  it('should default year to current year', () => {
    const csv = `role,level,region,currency,baseP50,baseP75,tcP50,tcP75,source,year
Engineer,Mid,EU,EUR,100000,120000,,,CompanyX,`;

    const rows = parseBenchmarkCsv(csv);
    expect(rows[0].year).toBe(new Date().getFullYear());
  });

  it('should handle missing optional fields', () => {
    const csv = `role,level,region,currency,baseP50,baseP75,tcP50,tcP75,source,year
Engineer,,,USD,100000,,,,,`;

    const rows = parseBenchmarkCsv(csv);
    expect(rows[0].level).toBeUndefined();
    expect(rows[0].region).toBeUndefined();
  });
});
