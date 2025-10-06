/**
 * Token bucket throttling for auto-apply
 * Default: 20 applications per minute per platform
 */

interface Bucket {
  rem: number
  cap: number
  last: number
  refillMs: number
}

const buckets: Record<string, Bucket> = {}

export async function applyThrottle(
  key: string,
  cap = 20,
  refillMs = 1000
): Promise<void> {
  const now = Date.now()
  const b = buckets[key] ?? (buckets[key] = { rem: cap, cap, last: now, refillMs })

  const elapsed = now - b.last
  const refill = Math.floor(elapsed / refillMs)

  if (refill > 0) {
    b.rem = Math.min(b.cap, b.rem + refill)
  }

  b.last = now

  if (b.rem <= 0) {
    await new Promise((r) => setTimeout(r, refillMs))
  }

  b.rem = Math.max(0, b.rem - 1)
}
