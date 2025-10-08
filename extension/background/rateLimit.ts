/**
 * Token bucket rate limiter per domain
 */

import { DomainKey } from '../storage/schema';

type BucketState = {
  tokens: number;
  lastRefill: number;
};

export class RateLimiter {
  private buckets = new Map<DomainKey, BucketState>();
  private refillInterval = 60000; // 1 minute

  async checkLimit(domain: DomainKey, limit: number): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    let bucket = this.buckets.get(domain);

    if (!bucket) {
      bucket = { tokens: limit, lastRefill: now };
      this.buckets.set(domain, bucket);
    }

    // Refill tokens based on time elapsed
    const elapsed = now - bucket.lastRefill;
    if (elapsed >= this.refillInterval) {
      const refills = Math.floor(elapsed / this.refillInterval);
      bucket.tokens = Math.min(limit, bucket.tokens + refills);
      bucket.lastRefill = now;
    }

    // Check if request is allowed
    if (bucket.tokens > 0) {
      bucket.tokens--;
      return { allowed: true };
    }

    // Calculate retry after time
    const retryAfter = this.refillInterval - (now - bucket.lastRefill);
    return { allowed: false, retryAfter };
  }

  reset(domain: DomainKey): void {
    this.buckets.delete(domain);
  }

  resetAll(): void {
    this.buckets.clear();
  }
}
