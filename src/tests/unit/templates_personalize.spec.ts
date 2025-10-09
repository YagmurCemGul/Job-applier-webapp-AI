/**
 * @fileoverview Unit tests for template personalization
 */

import { describe, it, expect } from 'vitest';
import { personalize } from '@/services/outreach/templates.service';
import type { Template } from '@/types/outreach.types';

describe('Template Personalization', () => {
  it('replaces variables in subject and body', () => {
    const template: Template = {
      id: '1',
      name: 'Test',
      subject: 'Hi {{FirstName}}',
      bodyHtml: '<p>Hello {{FirstName}}, I am a {{YourRole}}</p>',
      variables: [
        { key: 'FirstName', label: 'First Name' },
        { key: 'YourRole', label: 'Your Role' }
      ]
    };

    const vars = { FirstName: 'Alice', YourRole: 'Engineer' };
    const result = personalize(template, vars);

    expect(result.subject).toBe('Hi Alice');
    expect(result.html).toBe('<p>Hello Alice, I am a Engineer</p>');
  });

  it('handles missing variables with empty string', () => {
    const template: Template = {
      id: '1',
      name: 'Test',
      subject: 'Hi {{FirstName}}',
      bodyHtml: '<p>{{Missing}}</p>',
      variables: []
    };

    const result = personalize(template, {});
    expect(result.subject).toBe('Hi ');
    expect(result.html).toBe('<p></p>');
  });

  it('preserves HTML structure', () => {
    const template: Template = {
      id: '1',
      name: 'Test',
      subject: 'Test',
      bodyHtml: '<div><p>Hi {{Name}}</p><a href="{{Link}}">Click</a></div>',
      variables: []
    };

    const vars = { Name: 'Bob', Link: 'https://example.com' };
    const result = personalize(template, vars);
    expect(result.html).toBe('<div><p>Hi Bob</p><a href="https://example.com">Click</a></div>');
  });
});
