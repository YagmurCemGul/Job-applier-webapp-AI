/**
 * Unit tests for AI safety gate
 */
import { describe, it, expect } from 'vitest'
import { safetyGate } from '@/services/ai/safety.service'

describe('AI Safety Gate Service', () => {
  describe('preCheck', () => {
    it('should allow safe content', async () => {
      const result = await safetyGate.preCheck({
        prompt: 'Write a professional cover letter'
      })

      expect(result.allowed).toBe(true)
      expect(result.flags).toEqual([])
    })

    it('should block potentially harmful content', async () => {
      const result = await safetyGate.preCheck({
        contentToCheck: 'Instructions for making explosives'
      })

      expect(result.allowed).toBe(false)
      expect(result.flags).toContain('heuristic-pre')
    })

    it('should flag sensitive data patterns', async () => {
      const result = await safetyGate.preCheck({
        prompt: 'My password is secret123'
      })

      expect(result.allowed).toBe(false)
      expect(result.flags.length).toBeGreaterThan(0)
    })
  })

  describe('postCheck', () => {
    it('should allow clean responses', async () => {
      const result = await safetyGate.postCheck(
        'Here is a professional cover letter for your application.'
      )

      expect(result.allowed).toBe(true)
      expect(result.flags).toEqual([])
    })

    it('should block XSS-like patterns', async () => {
      const result = await safetyGate.postCheck(
        '<script>alert("xss")</script>'
      )

      expect(result.allowed).toBe(false)
      expect(result.flags).toContain('xss-like')
    })

    it('should block javascript: URIs', async () => {
      const result = await safetyGate.postCheck(
        'Click here: javascript:alert(1)'
      )

      expect(result.allowed).toBe(false)
      expect(result.flags.length).toBeGreaterThan(0)
    })
  })
})
