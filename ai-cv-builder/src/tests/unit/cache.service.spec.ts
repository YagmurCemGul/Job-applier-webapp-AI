/**
 * Unit tests for AI cache service
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { aiCache } from '@/services/ai/cache.service'

describe('AI Cache Service', () => {
  beforeEach(() => {
    aiCache.clear()
  })

  it('should store and retrieve cached values', async () => {
    const key = 'test-key'
    const value = { result: 'Hello, World!' }

    await aiCache.set(key, value, 10000)
    const retrieved = await aiCache.get(key)

    expect(retrieved).toEqual(value)
  })

  it('should return undefined for non-existent keys', async () => {
    const result = await aiCache.get('non-existent-key')
    expect(result).toBeUndefined()
  })

  it('should expire entries after TTL', async () => {
    const key = 'expire-test'
    const value = { data: 'expires soon' }

    await aiCache.set(key, value, 50) // 50ms TTL

    const immediate = await aiCache.get(key)
    expect(immediate).toEqual(value)

    await new Promise(resolve => setTimeout(resolve, 100))

    const expired = await aiCache.get(key)
    expect(expired).toBeUndefined()
  })

  it('should clear all entries', async () => {
    await aiCache.set('key1', 'value1', 10000)
    await aiCache.set('key2', 'value2', 10000)

    aiCache.clear()

    expect(await aiCache.get('key1')).toBeUndefined()
    expect(await aiCache.get('key2')).toBeUndefined()
  })
})
