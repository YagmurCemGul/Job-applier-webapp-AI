import { describe, it, expect } from 'vitest'
import { redactPII } from '@/services/review/privacy.service'

describe('privacy.service', () => {
  it('should redact names', () => {
    const text = 'John Smith is a great engineer'
    const redacted = redactPII(text)
    expect(redacted).toContain('[redacted-name]')
    expect(redacted).not.toContain('John Smith')
  })

  it('should redact email addresses', () => {
    const text = 'Contact john.smith@example.com for details'
    const redacted = redactPII(text)
    expect(redacted).toContain('[redacted-email]')
    expect(redacted).not.toContain('john.smith@example.com')
  })

  it('should preserve non-PII text', () => {
    const text = 'Great work on the project! Very impactful.'
    const redacted = redactPII(text)
    expect(redacted).toContain('Great work')
    expect(redacted).toContain('impactful')
  })

  it('should handle mixed content', () => {
    const text = 'Jane Doe (jane@acme.com) led the migration project'
    const redacted = redactPII(text)
    expect(redacted).toContain('[redacted-name]')
    expect(redacted).toContain('[redacted-email]')
    expect(redacted).toContain('migration project')
  })
})
