import { describe, it, expect } from 'vitest'
import { buildMime } from '@/services/integrations/gmail.real.service'
import type { OutboxMessage } from '@/types/gmail.types'

describe('gmail.real.service', () => {
  it('should build MIME message with headers', () => {
    const msg: OutboxMessage = {
      id: 'msg1',
      accountId: 'test@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject',
      html: '<p>Test body</p>',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    const mime = buildMime(msg)

    expect(mime).toBeDefined()
    expect(typeof mime).toBe('string')
    // Base64 URL-safe encoding
    expect(mime).not.toContain('+')
    expect(mime).not.toContain('/')
  })

  it('should include cc and bcc when provided', () => {
    const msg: OutboxMessage = {
      id: 'msg1',
      accountId: 'test@example.com',
      to: ['recipient@example.com'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      subject: 'Test',
      html: '<p>Body</p>',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    const mime = buildMime(msg)
    const decoded = atob(mime.replace(/-/g, '+').replace(/_/g, '/'))

    expect(decoded).toContain('Cc: cc@example.com')
    expect(decoded).toContain('Bcc: bcc@example.com')
  })

  it('should handle attachments', () => {
    const msg: OutboxMessage = {
      id: 'msg1',
      accountId: 'test@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      html: '<p>Body</p>',
      status: 'pending',
      createdAt: new Date().toISOString(),
      attachments: [
        {
          filename: 'test.pdf',
          mimeType: 'application/pdf',
          dataBase64: 'dGVzdA==',
        },
      ],
    }

    const mime = buildMime(msg)
    const decoded = atob(mime.replace(/-/g, '+').replace(/_/g, '/'))

    expect(decoded).toContain('multipart/mixed')
    expect(decoded).toContain('test.pdf')
    expect(decoded).toContain('application/pdf')
  })
})
