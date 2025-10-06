/**
 * Simple in-memory semantic cache with TTL
 */

type Entry = { value: any; exp: number }

const mem = new Map<string, Entry>()

export const aiCache = {
  async get(key: string) {
    const e = mem.get(key)
    if (e && e.exp > Date.now()) {
      return e.value
    }
    mem.delete(key)
    return undefined
  },

  async set(key: string, value: any, ttlMs: number) {
    mem.set(key, { value, exp: Date.now() + ttlMs })
  },

  clear() {
    mem.clear()
  },
}
