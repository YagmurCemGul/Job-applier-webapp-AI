import { describe, it, expect } from 'vitest'
import { hmacSHA256, verifyHMAC } from '../../background/hmac'

describe('security', () => {
  it('should generate HMAC signature', async () => {
    const message = 'test message'
    const key = 'secret-key'

    const signature = await hmacSHA256(message, key)
    expect(signature).toBeDefined()
    expect(signature.length).toBe(64) // SHA-256 hex string
  })

  it('should verify valid HMAC', async () => {
    const message = 'test message'
    const key = 'secret-key'

    const signature = await hmacSHA256(message, key)
    const valid = await verifyHMAC(message, signature, key)
    expect(valid).toBe(true)
  })

  it('should reject invalid HMAC', async () => {
    const message = 'test message'
    const key = 'secret-key'
    const wrongSignature = 'invalid'

    const valid = await verifyHMAC(message, wrongSignature, key)
    expect(valid).toBe(false)
  })

  it('should reject tampered message', async () => {
    const message = 'test message'
    const tamperedMessage = 'tampered message'
    const key = 'secret-key'

    const signature = await hmacSHA256(message, key)
    const valid = await verifyHMAC(tamperedMessage, signature, key)
    expect(valid).toBe(false)
  })
})
