import { describe, it, expect } from 'vitest'
import { redactPII } from '@/services/review/privacy.service'

describe('privacy.service', () => {
  it('should redact names', () => {
    const text = 'John Smith did great work'
    const redacted = redactPII(text)

    expect(redacted).toContain('[redacted-name]')
    expect(redacted).not.toContain('John Smith')
  })

  it('should redact emails', () => {
    const text = 'Contact me at john.smith@example.com'
    const redacted = redactPII(text)

    expect(redacted).toContain('[redacted-email]')
    expect(redacted).not.toContain('john.smith@example.com')
  })

  it('should preserve non-PII', () => {
    const text = 'The project was completed on time and under budget'
    const redacted = redactPII(text)

    expect(redacted).toBe(text)
  })

  it('should handle multiple names and emails', () => {
    const text =
      'John Smith (john@example.com) and Jane Doe (jane@example.com) collaborated'
    const redacted = redactPII(text)

    expect(redacted).not.toContain('John Smith')
    expect(redacted).not.toContain('Jane Doe')
    expect(redacted).not.toContain('john@example.com')
    expect(redacted).not.toContain('jane@example.com')
  })
})
