/**
 * Apply Throttle Service
 * Rate limiting to prevent abuse and respect platform limits
 * Default: 20 submissions per minute per platform
 */

const buckets: Record<string, {
  rem: number;
  cap: number;
  last: number;
  refillMs: number;
}> = {};

/**
 * Apply rate limiting with token bucket algorithm
 * @param key - Throttle key (usually platform name)
 * @param cap - Maximum capacity (tokens)
 * @param refillMs - Milliseconds per token refill
 */
export async function applyThrottle(key: string, cap = 20, refillMs = 1000) {
  const now = Date.now();
  const b = buckets[key] ?? (buckets[key] = {
    rem: cap,
    cap,
    last: now,
    refillMs
  });
  
  const elapsed = now - b.last;
  const refill = Math.floor(elapsed / refillMs);
  
  if (refill > 0) {
    b.rem = Math.min(b.cap, b.rem + refill);
    b.last = now;
  }
  
  if (b.rem <= 0) {
    await new Promise(r => setTimeout(r, refillMs));
  }
  
  b.rem = Math.max(0, b.rem - 1);
}
