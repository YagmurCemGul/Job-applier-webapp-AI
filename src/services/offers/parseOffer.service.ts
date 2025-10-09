/**
 * @fileoverview Offer parsing service for Step 44
 * @module services/offers/parseOffer
 */

import type { Offer, OfferParseResult } from '@/types/offer.types.step44';

/**
 * Heuristic parser from user-provided text (no external calls)
 * Extracts compensation details using regex patterns
 * @param o - Offer with raw text
 * @returns Offer with parsed fields
 */
export function parseOffer(o: Offer): Offer {
  const t = (o.rawText || '').replace(/\r/g, '');
  
  // Helper to extract numbers
  const num = (re: RegExp) => {
    const match = t.match(re);
    return Number((match?.[1] || '').replace(/[^\d.]/g, ''));
  };
  
  // Helper to extract strings
  const str = (re: RegExp) => t.match(re)?.[1]?.trim();

  const guess: OfferParseResult = {
    base: {
      key: 'baseAnnual',
      value: num(/base salary[^$\d]*([$€£]?\s?[\d,\.]+)/i) || 
             num(/annual salary[^$\d]*([$€£]?\s?[\d,\.]+)/i),
      confidence: 0.6
    },
    bonusTargetPct: {
      key: 'bonusTargetPct',
      value: num(/bonus[^%\n]*?(\d{1,2}\.?\d?)\s?%/i),
      confidence: 0.6
    },
    signOnYr1: {
      key: 'signOnYr1',
      value: num(/sign[\-\s]?on[^$\d]*([$€£]?\s?[\d,\.]+)/i),
      confidence: 0.5
    },
    equityGrantShares: {
      key: 'equityGrantShares',
      value: num(/(?:rsu|restricted stock).+?(\d[\d,\.]+)/i),
      confidence: 0.5
    },
    vestYears: {
      key: 'vestYears',
      value: num(/vest(?:ing)? over (\d)/i),
      confidence: 0.5
    },
    cliffMonths: {
      key: 'cliffMonths',
      value: num(/cliff.*?(\d{1,2})\s*month/i),
      confidence: 0.5
    },
    schedule: {
      key: 'schedule',
      value: (t.match(/monthly/i) ? 'monthly' :
              t.match(/quarterly/i) ? 'quarterly' : undefined) as any,
      confidence: 0.4
    },
    currency: {
      key: 'currency',
      value: (t.match(/\bUSD|EUR|TRY|GBP|CAD|AUD\b/i)?.[0]?.toUpperCase()) || o.currency,
      confidence: 0.8
    },
    role: {
      key: 'role',
      value: str(/role[:\-]\s*(.+)/i),
      confidence: 0.4
    },
    level: {
      key: 'level',
      value: str(/level[:\-]\s*(.+)/i),
      confidence: 0.4
    },
    location: {
      key: 'location',
      value: str(/location[:\-]\s*(.+)/i),
      confidence: 0.4
    }
  };

  const patch: Partial<Offer> = {
    baseAnnual: guess.base?.value || o.baseAnnual,
    bonusTargetPct: guess.bonusTargetPct?.value || o.bonusTargetPct,
    signOnYr1: guess.signOnYr1?.value || o.signOnYr1,
    currency: guess.currency?.value || o.currency,
    role: guess.role?.value || o.role,
    level: guess.level?.value || o.level,
    location: guess.location?.value || o.location,
    equity: o.equity ?? (guess.equityGrantShares?.value ? {
      kind: 'rsu',
      grantShares: guess.equityGrantShares.value,
      vestYears: Number(guess.vestYears?.value || 4),
      cliffMonths: Number(guess.cliffMonths?.value || 12),
      schedule: (guess.schedule?.value || 'monthly') as any
    } : undefined)
  };

  return { ...o, ...patch };
}
