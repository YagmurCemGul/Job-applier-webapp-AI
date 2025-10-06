import { describe, it, expect } from 'vitest'
import { renderTemplate } from '@/services/outreach/templateRender.service'

describe('templateRender.service', () => {
  it('should substitute variables', () => {
    const tpl = {
      subject: 'Hello {{Name}}',
      body: 'Hi {{Name}}, working at {{Company}}',
    }

    const result = renderTemplate(tpl, {
      Name: 'John',
      Company: 'Acme Corp',
    })

    expect(result.subject).toBe('Hello John')
    expect(result.html).toContain('Hi John')
    expect(result.html).toContain('Acme Corp')
  })

  it('should convert newlines to br tags', () => {
    const tpl = {
      subject: 'Test',
      body: 'Line 1\nLine 2\nLine 3',
    }

    const result = renderTemplate(tpl, {})

    expect(result.html).toContain('Line 1<br/>')
    expect(result.html).toContain('Line 2<br/>')
  })

  it('should sanitize HTML', () => {
    const tpl = {
      subject: 'Test',
      body: '<script>alert("xss")</script><p>Safe</p>',
    }

    const result = renderTemplate(tpl, {})

    expect(result.html).not.toContain('<script>')
    expect(result.html).toContain('Safe')
  })

  it('should create plain text version', () => {
    const tpl = {
      subject: 'Test',
      body: '<p>Hello</p><p>World</p>',
    }

    const result = renderTemplate(tpl, {})

    expect(result.text).toBe('HelloWorld')
  })

  it('should handle missing variables gracefully', () => {
    const tpl = {
      subject: 'Hello {{Name}}',
      body: 'Working at {{Company}}',
    }

    const result = renderTemplate(tpl, {})

    expect(result.subject).toBe('Hello ')
    expect(result.html).toContain('Working at ')
  })
})
