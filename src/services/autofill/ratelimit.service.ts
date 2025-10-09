/**
 * @fileoverview Client-side rate limiting service
 * Prevents excessive autofill operations
 */

/**
 * Simple client-side rate limiter: allow N actions per rolling window (minutes).
 * @param key - Rate limit key
 * @param max - Maximum actions allowed
 * @param minutes - Time window in minutes
 * @returns Rate limit status
 */
export function allowAction(key: string, max: number, minutes: number): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const k = `rl_${key}`;
  const raw = localStorage.getItem(k);
  const arr = raw ? JSON.parse(raw) as number[] : [];
  const keep = arr.filter(ts => now - ts < minutes*60000);
  
  if (keep.length >= max) {
    return { allowed:false, remaining:0 };
  }
  
  keep.push(now);
  localStorage.setItem(k, JSON.stringify(keep));
  return { allowed:true, remaining: max - keep.length };
}
