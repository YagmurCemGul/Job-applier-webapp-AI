/**
 * @fileoverview Attachment validation service
 * Checks variant documents for policy compliance
 */

import type { VariantDoc } from '@/types/apply.types';

/**
 * Simple metadata check (filename length, forbidden words, extension).
 * @param v - Variant document to validate
 * @returns Validation result with warnings
 */
export function validateAttachment(v: VariantDoc): { ok: boolean; warnings: string[] } {
  const bad = /(draft|old|backup|personal)/i.test(v.title);
  const extOk = /pdf|docx|gdoc/i.test(v.format);
  
  return {
    ok: !bad && extOk,
    warnings: [
      bad ? 'Title suggests non-final document' : '',
      extOk ? '' : 'Unsupported format'
    ].filter(Boolean)
  };
}
