import { describe, it, expect, beforeEach } from 'vitest'
import { aiCache } from '@/services/ai/cache.service'

describe('cache.service', () => {
  beforeEach(() => {
    aiCache.clear()
  })

  it('should set and get cached value', async () => {
    await aiCache.set('test-key', { data: 'test' }, 10000)
    const result = await aiCache.get('test-key')

    expect(result).toEqual({ data: 'test' })
  })

  it('should return undefined for expired entry', async () => {
    await aiCache.set('test-key', { data: 'test' }, 1)

    // Wait for expiration
    await new Promise((r) => setTimeout(r, 10))

    const result = await aiCache.get('test-key')
    expect(result).toBeUndefined()
  })

  it('should return undefined for non-existent key', async () => {
    const result = await aiCache.get('non-existent')
    expect(result).toBeUndefined()
  })

  it('should clear all entries', async () => {
    await aiCache.set('key1', 'value1', 10000)
    await aiCache.set('key2', 'value2', 10000)

    aiCache.clear()

    const result1 = await aiCache.get('key1')
    const result2 = await aiCache.get('key2')

    expect(result1).toBeUndefined()
    expect(result2).toBeUndefined()
  })

  it('should handle multiple keys independently', async () => {
    await aiCache.set('key1', 'value1', 10000)
    await aiCache.set('key2', 'value2', 10000)

    const result1 = await aiCache.get('key1')
    const result2 = await aiCache.get('key2')

    expect(result1).toBe('value1')
    expect(result2).toBe('value2')
  })
})
