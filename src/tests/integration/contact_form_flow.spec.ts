/**
 * @fileoverview Integration tests for contact form flow.
 * @module tests/integration/contact_form_flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSite } from '@/stores/site.store';
import { sendContactSubmission } from '@/services/site/contact.service';
import type { ContactForm } from '@/types/site.types';

// Mock dependencies
global.fetch = vi.fn();

vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-token'),
}));

vi.mock('@/services/integrations/gmail.real.service', () => ({
  buildMime: vi.fn().mockReturnValue('mock-mime'),
}));

describe('Contact Form Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates contact form and handles submission', async () => {
    const { setContact } = useSite.getState();

    // Create form
    const form: ContactForm = {
      id: '1',
      title: 'Get in Touch',
      fields: [
        { id: 'name', label: 'Your Name', type: 'text', required: true },
        {
          id: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
        },
        { id: 'message', label: 'Message', type: 'textarea', required: true },
      ],
      captchaHoneypot: true,
      timeGateSec: 3,
      sendToEmail: 'contact@example.com',
      successMessage: 'Thanks for reaching out!',
    };

    setContact(form);
    expect(useSite.getState().site.contact).toEqual(form);

    // Simulate form submission
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'msg-123' }),
    });

    const payload = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'I would love to collaborate!',
      _started: String(Date.now() - 5000),
    };

    const result = await sendContactSubmission(
      form,
      payload,
      'account-id',
      'passphrase',
      'client-id'
    );

    expect(result.id).toBe('msg-123');
  });

  it('prevents spam with honeypot', async () => {
    const { setContact } = useSite.getState();

    const form: ContactForm = {
      id: '1',
      title: 'Contact',
      fields: [],
      captchaHoneypot: true,
      timeGateSec: 0,
      sendToEmail: 'test@example.com',
    };

    setContact(form);

    // Spammer fills honeypot
    const payload = {
      name: 'Spammer',
      email: 'spam@example.com',
      message: 'Buy my product!',
      website: 'http://spam.com', // Honeypot field
      _started: String(Date.now()),
    };

    await expect(
      sendContactSubmission(form, payload, 'a', 'p', 'c')
    ).rejects.toThrow('Spam detected');
  });

  it('enforces time-gate', async () => {
    const form: ContactForm = {
      id: '1',
      title: 'Contact',
      fields: [],
      captchaHoneypot: false,
      timeGateSec: 5,
      sendToEmail: 'test@example.com',
    };

    useSite.getState().setContact(form);

    // Too fast submission
    const payload = {
      name: 'Hasty User',
      email: 'hasty@example.com',
      message: 'Quick message',
      _started: String(Date.now() - 2000), // 2 seconds
    };

    await expect(
      sendContactSubmission(form, payload, 'a', 'p', 'c')
    ).rejects.toThrow('too quickly');
  });

  it('allows valid submission after time-gate', async () => {
    const form: ContactForm = {
      id: '1',
      title: 'Contact',
      fields: [
        { id: 'name', label: 'Name', type: 'text', required: true },
        { id: 'email', label: 'Email', type: 'email', required: true },
      ],
      captchaHoneypot: false,
      timeGateSec: 3,
      sendToEmail: 'test@example.com',
    };

    useSite.getState().setContact(form);

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'msg-456' }),
    });

    const payload = {
      name: 'Patient User',
      email: 'patient@example.com',
      message: 'Thoughtful message',
      _started: String(Date.now() - 4000), // 4 seconds
    };

    const result = await sendContactSubmission(
      form,
      payload,
      'account-id',
      'passphrase',
      'client-id'
    );

    expect(result.id).toBe('msg-456');
  });

  it('updates form configuration', () => {
    const { setContact } = useSite.getState();

    // Initial form
    const form: ContactForm = {
      id: '1',
      title: 'Contact',
      fields: [{ id: 'name', label: 'Name', type: 'text', required: true }],
      captchaHoneypot: true,
      timeGateSec: 3,
      sendToEmail: 'old@example.com',
    };

    setContact(form);

    // Update
    const updated: ContactForm = {
      ...form,
      sendToEmail: 'new@example.com',
      fields: [
        ...form.fields,
        { id: 'phone', label: 'Phone', type: 'text', required: false },
      ],
    };

    setContact(updated);

    const current = useSite.getState().site.contact;
    expect(current?.sendToEmail).toBe('new@example.com');
    expect(current?.fields).toHaveLength(2);
  });
});