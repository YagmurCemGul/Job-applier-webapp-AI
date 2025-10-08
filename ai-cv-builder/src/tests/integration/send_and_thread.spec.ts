/**
 * Send and Thread Integration Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Send and Thread Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should send email and create thread', async () => {
    // Mock Gmail API responses
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('messages/send')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'msg-123',
            threadId: 'thread-456'
          })
        });
      }
      if (url.includes('threads/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            id: 'thread-456',
            messages: [
              {
                id: 'msg-123',
                internalDate: Date.now().toString(),
                payload: {
                  headers: [
                    { name: 'Subject', value: 'Test Subject' },
                    { name: 'From', value: 'sender@example.com' },
                    { name: 'To', value: 'recipient@example.com' }
                  ]
                }
              }
            ]
          })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { gmailSend, gmailGetThread } = await import(
      '@/services/integrations/gmail.real.service'
    );

    // Send message
    const sendResult = await gmailSend('fake-bearer', {
      id: '1',
      accountId: 'test@example.com',
      to: ['recipient@example.com'],
      subject: 'Test',
      html: '<p>Test</p>',
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    expect(sendResult.id).toBe('msg-123');
    expect(sendResult.threadId).toBe('thread-456');

    // Fetch thread
    const thread = await gmailGetThread('fake-bearer', 'thread-456');
    expect(thread.id).toBe('thread-456');
    expect(thread.messages).toHaveLength(1);
  });
});
