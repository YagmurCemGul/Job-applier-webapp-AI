/**
 * @fileoverview Type definitions for autofill and browser extension bridge
 */

export interface FieldMapping {
  id: string;
  ats: 'greenhouse'|'lever'|'workday'|'smartrecruiters'|'ashby'|'unknown';
  fields: Array<{
    name: string;                  // logical name e.g., "first_name"
    selector: string;              // CSS selector (extension uses content script)
    type: 'text'|'textarea'|'select'|'radio'|'checkbox'|'file';
    valueFrom: 'profile'|'qa'|'static'|'variant'|'custom';
    required?: boolean;
    maxLen?: number;
  }>;
}

export interface AutofillPlan {
  id: string;
  runId: string;
  mappingId: string;
  steps: Array<{
    id: string;
    kind: 'fill'|'upload'|'click'|'wait';
    name: string;
    selector?: string;
    valueKey?: string;     // refers to plan.data map
    timeoutMs?: number;
  }>;
  data: Record<string,string>; // resolved values
}
