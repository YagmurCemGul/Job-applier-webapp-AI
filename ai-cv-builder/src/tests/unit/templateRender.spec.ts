/**
 * Template Render Service Tests
 */
import { describe, it, expect } from 'vitest';
import { renderTemplate } from '@/services/outreach/templateRender.service';

describe('templateRender.service', () => {
  it('should substitute variables correctly', () => {
    const template = {
      subject: 'Hello {{Name}}',
      body: 'Dear {{Name}}, your position is {{Position}}.'
    };
    const vars = { Name: 'John', Position: 'Engineer' };

    const result = renderTemplate(template, vars);

    expect(result.subject).toBe('Hello John');
    expect(result.html).toContain('Dear John');
    expect(result.html).toContain('your position is Engineer');
  });

  it('should handle missing variables', () => {
    const template = {
      subject: 'Hello {{Name}}',
      body: 'Position: {{Position}}'
    };
    const vars = { Name: 'John' };

    const result = renderTemplate(template, vars);

    expect(result.subject).toBe('Hello John');
    expect(result.html).toContain('Position:');
    expect(result.html).not.toContain('{{Position}}');
  });

  it('should convert newlines to br tags', () => {
    const template = {
      subject: 'Test',
      body: 'Line 1\nLine 2\nLine 3'
    };

    const result = renderTemplate(template, {});

    expect(result.html).toContain('<br/>');
    expect(result.html.split('<br/>').length).toBe(3);
  });

  it('should sanitize HTML', () => {
    const template = {
      subject: 'Test',
      body: '<script>alert("xss")</script><p>Safe content</p>'
    };

    const result = renderTemplate(template, {});

    expect(result.html).not.toContain('<script>');
    expect(result.html).toContain('Safe content');
  });

  it('should generate plain text version', () => {
    const template = {
      subject: 'Test',
      body: '<b>Bold</b> text'
    };

    const result = renderTemplate(template, {});

    expect(result.text).toBe('Bold text');
    expect(result.text).not.toContain('<b>');
  });
});
