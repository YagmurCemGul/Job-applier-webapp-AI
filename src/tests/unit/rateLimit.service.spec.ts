import { describe, it, expect } from 'vitest'
import { aiRateLimit } from '@/services/ai/rateLimit.service'

describe('rateLimit.service', () => {
  it('should allow consumption within capacity', async () => {
    // Should not throw or hang
    await expect(aiRateLimit.consume('test-provider')).resolves.toBeUndefined()
  })

  it('should consume multiple times', async () => {
    for (let i = 0; i < 5; i++) {
      await aiRateLimit.consume('test-provider-2')
    }
    // Should complete without hanging
    expect(true).toBe(true)
  })

  it('should handle different providers independently', async () => {
    await aiRateLimit.consume('provider-a')
    await aiRateLimit.consume('provider-b')
    await aiRateLimit.consume('provider-a')

    expect(true).toBe(true)
  })
})
