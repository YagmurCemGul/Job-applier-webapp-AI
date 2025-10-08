/**
 * Gmail Real Service Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildMime } from '@/services/integrations/gmail.real.service';
import type { OutboxMessage } from '@/types/gmail.types';

describe('gmail.real.service', () => {
  describe('buildMime', () => {
    it('should build simple MIME message', () => {
      const msg: OutboxMessage = {
        id: '1',
        accountId: 'test@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Subject',
        html: '<p>Test body</p>',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const mime = buildMime(msg);

      expect(mime).toBeTruthy();
      expect(typeof mime).toBe('string');
      
      // Decode to verify contents
      const decoded = atob(mime.replace(/-/g, '+').replace(/_/g, '/'));
      expect(decoded).toContain('From: test@example.com');
      expect(decoded).toContain('To: recipient@example.com');
      expect(decoded).toContain('Subject: Test Subject');
      expect(decoded).toContain('<p>Test body</p>');
    });

    it('should handle multiple recipients', () => {
      const msg: OutboxMessage = {
        id: '1',
        accountId: 'test@example.com',
        to: ['recipient1@example.com', 'recipient2@example.com'],
        cc: ['cc@example.com'],
        subject: 'Test',
        html: '<p>Body</p>',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const mime = buildMime(msg);
      const decoded = atob(mime.replace(/-/g, '+').replace(/_/g, '/'));

      expect(decoded).toContain('To: recipient1@example.com, recipient2@example.com');
      expect(decoded).toContain('Cc: cc@example.com');
    });

    it('should handle attachments', () => {
      const msg: OutboxMessage = {
        id: '1',
        accountId: 'test@example.com',
        to: ['recipient@example.com'],
        subject: 'With Attachment',
        html: '<p>Body</p>',
        status: 'pending',
        createdAt: new Date().toISOString(),
        attachments: [
          {
            filename: 'test.txt',
            mimeType: 'text/plain',
            dataBase64: btoa('Test content')
          }
        ]
      };

      const mime = buildMime(msg);
      const decoded = atob(mime.replace(/-/g, '+').replace(/_/g, '/'));

      expect(decoded).toContain('multipart/mixed');
      expect(decoded).toContain('filename="test.txt"');
      expect(decoded).toContain('Content-Type: text/plain');
    });
  });
});
