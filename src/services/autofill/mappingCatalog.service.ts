/**
 * @fileoverview ATS field mapping catalog
 * Default mappings for common ATS platforms
 */

import type { FieldMapping } from '@/types/autofill.types';

/**
 * Minimal default mappings for common ATS logical fields.
 * Extension uses CSS selectors at runtime.
 */
export const DEFAULT_MAPPINGS: FieldMapping[] = [
  {
    id: 'greenhouse-basic',
    ats: 'greenhouse',
    fields: [
      { name:'first_name', selector:'input[name="first_name"]', type:'text', valueFrom:'profile', required:true },
      { name:'last_name',  selector:'input[name="last_name"]',  type:'text', valueFrom:'profile', required:true },
      { name:'email',      selector:'input[type="email"]',      type:'text', valueFrom:'profile', required:true },
      { name:'phone',      selector:'input[type="tel"]',        type:'text', valueFrom:'profile' },
      { name:'resume',     selector:'input[type="file"][name*="resume"]', type:'file', valueFrom:'variant' },
      { name:'cover',      selector:'input[type="file"][name*="cover"]', type:'file', valueFrom:'variant' }
    ]
  },
  {
    id: 'lever-basic',
    ats: 'lever',
    fields: [
      { name:'first_name', selector:'#first-name', type:'text', valueFrom:'profile', required:true },
      { name:'last_name',  selector:'#last-name',  type:'text', valueFrom:'profile', required:true },
      { name:'email',      selector:'#email',      type:'text', valueFrom:'profile', required:true }
    ]
  }
];
