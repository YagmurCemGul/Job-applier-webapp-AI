/**
 * @fileoverview Q&A policy and compliance service
 * Flags risky topics and redacts PII from screener answers
 */

import type { Screener } from '@/types/apply.types';

/**
 * Flag risky topics (salary, visa, location) and redact PII-like strings (emails/phones).
 * @param answers - Array of screener questions with answers
 * @returns Screeners with flags and redacted answers
 */
export function policyScan(answers: Screener[]): Screener[] {
  return answers.map(q => {
    const flags: Screener['flags'] = [];
    const lower = q.prompt.toLowerCase();
    
    if (/(salary|compensation|pay)/.test(lower)) flags.push('salary');
    if (/(visa|work authorization|sponsorship)/.test(lower)) flags.push('visa');
    if (/(location|relocate)/.test(lower)) flags.push('location');
    
    const redacted = (q.answer||'')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[redacted-email]')
      .replace(/\+?\d[\d\s\-().]{6,}\d/g,'[redacted-phone]');
    
    return { ...q, flags, redactedAnswer: redacted };
  });
}
