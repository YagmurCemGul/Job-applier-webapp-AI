/**
 * Semantic cache service
 * Simple in-memory cache with TTL for AI responses
 */
type Entry = { value: any; exp: number };
const mem = new Map<string, Entry>();

export const aiCache = {
  async get(key: string) {
    const e = mem.get(key);
    if (e && e.exp > Date.now()) return e.value;
    mem.delete(key); // Clean up expired
    return undefined;
  },
  async set(key: string, value: any, ttlMs: number) {
    mem.set(key, { value, exp: Date.now() + ttlMs });
  },
  clear() { mem.clear(); }
};
