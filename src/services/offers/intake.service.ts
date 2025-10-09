/**
 * @fileoverview Offer intake service for Step 44
 * @module services/offers/intake
 */

import type { Offer } from '@/types/offer.types.step44';
import { extractTextFromPdf } from '@/services/integrations/pdfText.client';
import { parseOffer } from './parseOffer.service';

/**
 * Intake offer from various sources and return parsed draft
 * @param input - Offer input (PDF, text, or manual)
 * @returns Parsed offer draft
 */
export async function intakeOffer(input: {
  pdf?: File;
  text?: string;
  company?: string;
  url?: string;
  currency?: string;
}): Promise<Offer> {
  const id = crypto.randomUUID();
  const rawText = input.pdf
    ? await extractTextFromPdf(input.pdf)
    : (input.text ?? '');
  
  const base: Offer = {
    id,
    company: input.company ?? 'Unknown',
    role: '—',
    currency: input.currency ?? 'USD',
    baseAnnual: 0,
    source: input.pdf ? 'pdf' : (input.text ? 'text' : 'manual'),
    sourceUrl: input.url,
    rawText,
    extractedAt: new Date().toISOString()
  };
  
  return parseOffer(base);
}
