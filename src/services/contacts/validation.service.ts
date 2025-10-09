export function looksLikeEmail(s?: string){ return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
export function normalizePhone(s?: string){ return s?.replace(/[^\d+]/g,''); }
