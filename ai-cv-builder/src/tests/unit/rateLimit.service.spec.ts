/**
 * Unit tests for AI rate limiter
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { aiRateLimit } from '@/services/ai/rateLimit.service'

describe('AI Rate Limit Service', () => {
  it('should allow consumption within capacity', async () => {
    const start = Date.now()
    
    for (let i = 0; i < 5; i++) {
      await aiRateLimit.consume('test-provider')
    }
    
    const duration = Date.now() - start
    
    // Should complete quickly without throttling
    expect(duration).toBeLessThan(100)
  })

  it('should throttle when exceeding capacity', async () => {
    const provider = 'throttle-test'
    
    // Consume many tokens rapidly
    const promises = Array.from({ length: 70 }, () => aiRateLimit.consume(provider))
    
    const start = Date.now()
    await Promise.all(promises)
    const duration = Date.now() - start
    
    // Should have been throttled (>60 req/min means some delay)
    expect(duration).toBeGreaterThan(50)
  }, 10000)

  it('should refill tokens over time', async () => {
    const provider = 'refill-test'
    
    // Consume initial tokens
    for (let i = 0; i < 10; i++) {
      await aiRateLimit.consume(provider)
    }
    
    // Wait for refill
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Should allow more consumption without significant delay
    const start = Date.now()
    for (let i = 0; i < 5; i++) {
      await aiRateLimit.consume(provider)
    }
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(100)
  })
})
