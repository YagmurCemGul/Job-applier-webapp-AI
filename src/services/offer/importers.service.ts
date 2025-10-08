/**
 * @fileoverview Offer importers service for Step 37 — parse text/email to draft offers
 * @module services/offer/importers
 */

import type { Offer } from '@/types/offer.types';

/**
 * Parse offer details from raw text or email
 * Uses heuristics and regex patterns to extract key fields
 * 
 * @param raw - Raw text (email body, offer letter, etc.)
 * @returns Partial offer object with extracted fields
 */
export function parseOfferFromText(raw: string): Partial<Offer> {
  const parsed: Partial<Offer> = {};

  // Company name (common patterns)
  const companyMatch = raw.match(/(?:from|at|with|join)\s+([A-Z][A-Za-z0-9&.\- ]{2,})/i);
  if (companyMatch) {
    parsed.company = companyMatch[1].trim();
  }

  // Role/Position
  const roleMatch = raw.match(/(?:position|role|as|for)\s+(?:a\s+)?([A-Z][A-Za-z\s]{3,30}?)(?:\s+at|\s+with|\n|\.)/i);
  if (roleMatch) {
    parsed.role = roleMatch[1].trim();
  }

  // Base salary
  const baseMatch = raw.match(/(?:base|salary|annual)[:\s]*\$?\s*([\d,]+)/i);
  if (baseMatch) {
    const baseStr = baseMatch[1].replace(/,/g, '');
    parsed.baseAnnual = Number(baseStr);
  }

  // Bonus percentage
  const bonusMatch = raw.match(/bonus[^%]*?(\d{1,2})%/i);
  if (bonusMatch) {
    parsed.bonusTargetPct = Number(bonusMatch[1]);
  }

  // Currency
  const currencyMatch = raw.match(/\b(USD|EUR|GBP|TRY|AUD|CAD|JPY|CNY|INR|BRL)\b/i);
  if (currencyMatch) {
    parsed.currency = currencyMatch[1].toUpperCase() as any;
  }

  // Signing bonus
  const signingMatch = raw.match(/signing\s+bonus[^$]*\$?\s*([\d,]+)/i);
  if (signingMatch) {
    const signingStr = signingMatch[1].replace(/,/g, '');
    parsed.benefits = {
      ...parsed.benefits,
      signingBonus: Number(signingStr)
    };
  }

  // Equity (basic detection)
  const equityMatch = raw.match(/(?:equity|RSU|options)[^$]*\$?\s*([\d,]+)/i);
  if (equityMatch) {
    const equityStr = equityMatch[1].replace(/,/g, '');
    parsed.equity = [{
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      type: 'RSU',
      targetValue: Number(equityStr)
    }];
  }

  // PTO days
  const ptoMatch = raw.match(/(\d{1,2})\s+(?:days|PTO|vacation)/i);
  if (ptoMatch) {
    parsed.benefits = {
      ...parsed.benefits,
      ptoDays: Number(ptoMatch[1])
    };
  }

  // Location
  const locationMatch = raw.match(/(?:location|office|based)[:\s]*([A-Z][A-Za-z\s,]{3,30}?)(?:\n|\.)/i);
  if (locationMatch) {
    parsed.location = locationMatch[1].trim();
  }

  // Remote policy
  if (/\b(?:fully\s+)?remote\b/i.test(raw)) {
    parsed.remote = 'remote';
  } else if (/\bhybrid\b/i.test(raw)) {
    parsed.remote = 'hybrid';
  } else if (/\bon-?site\b/i.test(raw)) {
    parsed.remote = 'on_site';
  }

  return parsed;
}

/**
 * Parse multiple offers from batch text
 */
export function parseMultipleOffers(raw: string): Partial<Offer>[] {
  // Split by common delimiters
  const sections = raw.split(/\n\n---\n\n|\n\n##/);
  return sections.map(section => parseOfferFromText(section)).filter(o => o.company || o.baseAnnual);
}
