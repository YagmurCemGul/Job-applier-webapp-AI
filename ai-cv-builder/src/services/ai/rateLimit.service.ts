/**
 * Token bucket rate limiter
 * Implements basic 60 req/min per provider
 */
const buckets: Record<string, { capacity: number; remaining: number; refillMs: number; last: number }> = {};

/** Basic token bucket: 60 req/min/provider */
export const aiRateLimit = {
  async consume(provider: string) {
    const now = Date.now();
    const b = buckets[provider] ?? (buckets[provider] = { capacity: 60, remaining: 60, refillMs: 1000, last: now });
    const elapsed = now - b.last;
    const refill = Math.floor(elapsed / b.refillMs);
    if (refill > 0) {
      b.remaining = Math.min(b.capacity, b.remaining + refill);
      b.last = now;
    }
    if (b.remaining <= 0) {
      await new Promise(r => setTimeout(r, b.refillMs));
      b.remaining = 1;
    }
    b.remaining = Math.max(0, b.remaining - 1);
  }
};
