/**
 * Unit tests for Apply Engine
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { autoApply } from '@/services/apply/apply.engine';
import { useApplicationsStore } from '@/stores/applications.store';

// Mock the message bus
vi.mock('@/services/apply/messageBus.service', () => ({
  sendBusMessage: vi.fn()
}));

describe('Apply Engine', () => {
  beforeEach(() => {
    // Reset store before each test
    useApplicationsStore.setState({ items: [], activeId: undefined });
  });

  it('should reject when opt-in is false', async () => {
    await expect(
      autoApply({
        platform: 'greenhouse',
        jobUrl: 'https://test.com',
        optIn: false,
        mapperArgs: { jobUrl: 'https://test.com', cvFile: 'cv.pdf' }
      })
    ).rejects.toThrow('Auto-apply requires explicit opt-in');
  });

  it('should create application record when opt-in is true', async () => {
    const appId = await autoApply({
      platform: 'greenhouse',
      jobUrl: 'https://test.com',
      company: 'Test Corp',
      role: 'Engineer',
      optIn: true,
      mapperArgs: { jobUrl: 'https://test.com', cvFile: 'cv.pdf' }
    });

    const { items } = useApplicationsStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(appId);
    expect(items[0].company).toBe('Test Corp');
    expect(items[0].role).toBe('Engineer');
    expect(items[0].stage).toBe('applied');
  });

  it('should add logs to application', async () => {
    const appId = await autoApply({
      platform: 'greenhouse',
      jobUrl: 'https://test.com',
      optIn: true,
      mapperArgs: { jobUrl: 'https://test.com', cvFile: 'cv.pdf' }
    });

    const { items } = useApplicationsStore.getState();
    const app = items.find(a => a.id === appId);
    expect(app?.logs.length).toBeGreaterThan(0);
    expect(app?.logs[0].level).toBe('info');
  });

  it('should set appliedAt timestamp', async () => {
    const appId = await autoApply({
      platform: 'greenhouse',
      jobUrl: 'https://test.com',
      optIn: true,
      mapperArgs: { jobUrl: 'https://test.com', cvFile: 'cv.pdf' }
    });

    const { items } = useApplicationsStore.getState();
    const app = items.find(a => a.id === appId);
    expect(app?.appliedAt).toBeTruthy();
  });
});
