import type { DomainKey } from '../messaging/protocol'

/**
 * Token bucket rate limiter per domain
 */

interface Bucket {
  remaining: number
  capacity: number
  lastRefill: number
  refillMs: number
}

const buckets = new Map<DomainKey, Bucket>()

export async function checkRateLimit(
  domain: DomainKey,
  capacity: number = 10
): Promise<{ ok: boolean; reason?: string }> {
  const now = Date.now()
  const refillMs = 60000 / capacity // Refill to distribute over 1 minute

  let bucket = buckets.get(domain)
  if (!bucket) {
    bucket = {
      remaining: capacity,
      capacity,
      lastRefill: now,
      refillMs
    }
    buckets.set(domain, bucket)
  }

  // Refill tokens
  const elapsed = now - bucket.lastRefill
  const refillCount = Math.floor(elapsed / bucket.refillMs)
  if (refillCount > 0) {
    bucket.remaining = Math.min(bucket.capacity, bucket.remaining + refillCount)
    bucket.lastRefill = now
  }

  // Check if tokens available
  if (bucket.remaining <= 0) {
    return {
      ok: false,
      reason: `Rate limit exceeded for ${domain}. Wait ${Math.ceil(bucket.refillMs / 1000)}s.`
    }
  }

  // Consume token
  bucket.remaining -= 1
  return { ok: true }
}
