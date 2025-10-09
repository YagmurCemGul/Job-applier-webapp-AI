/**
 * @fileoverview Benchmark parsing service for Step 44
 * @module services/offers/benchmarks
 */

import type { BenchmarkRow } from '@/types/negotiation.types.step44';

/**
 * Parse CSV into benchmark rows
 * Expected headers: role,level,region,currency,baseP50,baseP75,tcP50,tcP75,source,year
 * @param csv - CSV content
 * @returns Array of benchmark rows
 */
export function parseBenchmarkCsv(csv: string): BenchmarkRow[] {
  const [head, ...rows] = csv.trim().split(/\r?\n/);
  const h = head.split(',').map(s => s.trim().toLowerCase());
  const idx = (k: string) => h.indexOf(k);

  return rows.map(r => {
    const c = r.split(',').map(x => x.trim());
    return {
      id: crypto.randomUUID(),
      role: c[idx('role')] || '',
      level: c[idx('level')] || undefined,
      region: c[idx('region')] || undefined,
      currency: (c[idx('currency')] || 'USD').toUpperCase(),
      baseP50: Number(c[idx('basep50')] || 0),
      baseP75: Number(c[idx('basep75')] || 0) || undefined,
      tcP50: Number(c[idx('tcp50')] || 0) || undefined,
      tcP75: Number(c[idx('tcp75')] || 0) || undefined,
      source: c[idx('source')] || undefined,
      year: Number(c[idx('year')] || new Date().getFullYear())
    };
  });
}
