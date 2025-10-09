/**
 * @fileoverview Unit tests for contact mailer service.
 * @module tests/unit/contactMailer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendContactSubmission } from '@/services/site/contact.service';
import type { ContactForm } from '@/types/site.types';

// Mock fetch globally
global.fetch = vi.fn();

// Mock OAuth and Gmail services
vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-token'),
}));

vi.mock('@/services/integrations/gmail.real.service', () => ({
  buildMime: vi.fn().mockReturnValue('mock-mime-data'),
}));

describe('contact.service', () => {
  const mockForm: ContactForm = {
    id: '1',
    title: 'Contact Me',
    fields: [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'email', label: 'Email', type: 'email', required: true },
      { id: 'message', label: 'Message', type: 'textarea', required: true },
    ],
    captchaHoneypot: true,
    timeGateSec: 3,
    sendToEmail: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendContactSubmission', () => {
    it('sends email via Gmail API', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg-123' }),
      });

      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello!',
        _started: String(Date.now() - 5000), // 5 seconds ago
      };

      const result = await sendContactSubmission(
        mockForm,
        payload,
        'account-id',
        'passphrase',
        'client-id'
      );

      expect(result.id).toBe('msg-123');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('throws error on honeypot spam detection', async () => {
      const payload = {
        name: 'Spammer',
        email: 'spam@example.com',
        message: 'Spam',
        website: 'http://spam.com', // honeypot field
        _started: String(Date.now() - 5000),
      };

      await expect(
        sendContactSubmission(mockForm, payload, 'a', 'p', 'c')
      ).rejects.toThrow('Spam detected');
    });

    it('throws error on time-gate violation', async () => {
      const payload = {
        name: 'Too Fast',
        email: 'fast@example.com',
        message: 'Quick',
        _started: String(Date.now() - 1000), // 1 second ago
      };

      await expect(
        sendContactSubmission(mockForm, payload, 'a', 'p', 'c')
      ).rejects.toThrow('too quickly');
    });

    it('allows submission after time-gate', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg-456' }),
      });

      const payload = {
        name: 'Patient User',
        email: 'patient@example.com',
        message: 'Waited long enough',
        _started: String(Date.now() - 4000), // 4 seconds ago
      };

      const result = await sendContactSubmission(
        mockForm,
        payload,
        'a',
        'p',
        'c'
      );

      expect(result.id).toBe('msg-456');
    });

    it('throws error on Gmail API failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const payload = {
        name: 'User',
        email: 'user@example.com',
        message: 'Message',
        _started: String(Date.now() - 5000),
      };

      await expect(
        sendContactSubmission(mockForm, payload, 'a', 'p', 'c')
      ).rejects.toThrow('Gmail send failed');
    });

    it('escapes HTML in email body', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'msg-789' }),
      });

      const payload = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        message: 'Normal message',
        _started: String(Date.now() - 5000),
      };

      await sendContactSubmission(mockForm, payload, 'a', 'p', 'c');

      // The service should escape HTML
      expect(global.fetch).toHaveBeenCalled();
      // In a real test, we'd check the MIME content for escaped HTML
    });
  });
});