import { describe, it, expect } from 'vitest'
import { safetyGate } from '@/services/ai/safety.service'

describe('safety.service', () => {
  describe('preCheck', () => {
    it('should allow safe content', async () => {
      const result = await safetyGate.preCheck({
        prompt: 'Write a professional cover letter',
      })

      expect(result.allowed).toBe(true)
      expect(result.flags).toHaveLength(0)
    })

    it('should flag risky content', async () => {
      const result = await safetyGate.preCheck({
        prompt: 'My credit card number is 1234-5678-9012-3456',
      })

      expect(result.allowed).toBe(false)
      expect(result.flags).toContain('heuristic-pre')
    })

    it('should check contentToCheck field', async () => {
      const result = await safetyGate.preCheck({
        contentToCheck: 'This contains the word password',
      })

      expect(result.allowed).toBe(false)
    })

    it('should allow empty content', async () => {
      const result = await safetyGate.preCheck({})

      expect(result.allowed).toBe(true)
    })
  })

  describe('postCheck', () => {
    it('should allow safe response', async () => {
      const result = await safetyGate.postCheck('This is a safe response')

      expect(result.allowed).toBe(true)
      expect(result.flags).toHaveLength(0)
    })

    it('should flag XSS-like content', async () => {
      const result = await safetyGate.postCheck('<script>alert("xss")</script>')

      expect(result.allowed).toBe(false)
      expect(result.flags).toContain('xss-like')
    })

    it('should flag javascript: protocol', async () => {
      const result = await safetyGate.postCheck('javascript:void(0)')

      expect(result.allowed).toBe(false)
    })
  })
})
