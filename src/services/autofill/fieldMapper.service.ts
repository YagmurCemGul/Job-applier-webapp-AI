/**
 * @fileoverview Field mapping service
 * Builds autofill plans from mappings and data dictionaries
 */

import type { FieldMapping, AutofillPlan } from '@/types/autofill.types';

/**
 * Build an AutofillPlan from a mapping + data dictionary.
 * @param mapping - Field mapping configuration
 * @param data - Data dictionary with field values
 * @param runId - Application run ID
 * @returns Autofill plan ready for extension
 */
export function buildPlan(
  mapping: FieldMapping,
  data: Record<string,string>,
  runId: string
): AutofillPlan {
  const steps = mapping.fields.map((f, idx) => ({
    id: `${mapping.id}-${idx}`,
    kind: (f.type==='file' ? 'upload' : 'fill') as 'fill'|'upload'|'click'|'wait',
    name: f.name,
    selector: f.selector,
    valueKey: f.name
  }));
  
  return {
    id: crypto.randomUUID(),
    runId,
    mappingId: mapping.id,
    steps,
    data
  };
}
