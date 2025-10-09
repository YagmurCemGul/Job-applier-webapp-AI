/**
 * @fileoverview Unit tests for template rendering
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect } from 'vitest';
import { renderTemplate } from '@/services/outreach/templates.service';
import type { Template } from '@/types/outreach.types';

describe('Template Rendering', () => {
  it('renders variables in subject and body', () => {
    const tpl: Template = {
      id: '1',
      name: 'Test',
      subject: 'Hi {{firstName}}, question about {{topic}}',
      html: '<p>Hello {{firstName}} at {{company}}!</p>',
      variables: ['firstName', 'topic', 'company'],
    };

    const { subject, html } = renderTemplate(tpl, {
      firstName: 'Alex',
      topic: 'outreach',
      company: 'Acme Corp',
    });

    expect(subject).toBe('Hi Alex, question about outreach');
    expect(html).toContain('Hello Alex at Acme Corp!');
  });

  it('renders snippets', () => {
    const tpl: Template = {
      id: '1',
      name: 'Test',
      subject: 'Subject',
      html: '<p>{{snippet:greeting}} How are you?</p>',
      variables: [],
      snippets: { greeting: 'Hi there!' },
    };

    const { html } = renderTemplate(tpl, {});

    expect(html).toContain('Hi there! How are you?');
  });

  it('includes footer when present', () => {
    const tpl: Template = {
      id: '1',
      name: 'Test',
      subject: 'Subject',
      html: '<p>Body</p>',
      footer: '<p>Footer with {{unsubscribeUrl}}</p>',
      variables: [],
    };

    const { html } = renderTemplate(tpl, {
      unsubscribeUrl: 'https://example.com/unsub',
    });

    expect(html).toContain('<p>Body</p>');
    expect(html).toContain('Footer with https://example.com/unsub');
  });

  it('handles missing variables gracefully', () => {
    const tpl: Template = {
      id: '1',
      name: 'Test',
      subject: 'Hi {{firstName}}',
      html: '<p>{{missing}}</p>',
      variables: ['firstName', 'missing'],
    };

    const { subject, html } = renderTemplate(tpl, { firstName: 'Alex' });

    expect(subject).toBe('Hi Alex');
    expect(html).toBe('<p></p>'); // missing var becomes empty
  });
});
