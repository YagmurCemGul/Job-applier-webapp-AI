/**
 * Unit tests for Applications Store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useApplicationsStore } from '@/stores/applications.store';

describe('Applications Store', () => {
  beforeEach(() => {
    useApplicationsStore.setState({ items: [], activeId: undefined });
  });

  it('should create new application', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://test.com',
      company: 'Test Corp',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    });

    const { items } = useApplicationsStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe(id);
    expect(items[0].stage).toBe('applied');
    expect(items[0].status).toBe('open');
  });

  it('should update application stage', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://test.com',
      company: 'Test Corp',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    });

    useApplicationsStore.getState().setStage(id, 'interview');

    const { items } = useApplicationsStore.getState();
    expect(items[0].stage).toBe('interview');
  });

  it('should add event to application', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://test.com',
      company: 'Test Corp',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    });

    useApplicationsStore.getState().addEvent(id, {
      id: 'evt1',
      type: 'interview',
      title: 'Phone Screen',
      when: '2025-01-15T10:00:00Z'
    });

    const { items } = useApplicationsStore.getState();
    expect(items[0].events).toHaveLength(1);
    expect(items[0].events[0].title).toBe('Phone Screen');
  });

  it('should add log entry to application', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://test.com',
      company: 'Test Corp',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    });

    useApplicationsStore.getState().addLog(id, {
      id: 'log1',
      at: '2025-01-15T10:00:00Z',
      level: 'info',
      message: 'Application submitted'
    });

    const { items } = useApplicationsStore.getState();
    expect(items[0].logs).toHaveLength(1);
    expect(items[0].logs[0].message).toBe('Application submitted');
  });

  it('should limit logs to 200 entries', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://test.com',
      company: 'Test Corp',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    });

    // Add 250 logs
    for (let i = 0; i < 250; i++) {
      useApplicationsStore.getState().addLog(id, {
        id: `log${i}`,
        at: new Date().toISOString(),
        level: 'info',
        message: `Log ${i}`
      });
    }

    const { items } = useApplicationsStore.getState();
    expect(items[0].logs).toHaveLength(200);
  });

  it('should select and deselect application', () => {
    const id = useApplicationsStore.getState().create({
      jobUrl: 'https://test.com',
      company: 'Test Corp',
      role: 'Engineer',
      stage: 'applied',
      files: [],
      contacts: [],
      events: []
    });

    useApplicationsStore.getState().select(id);
    expect(useApplicationsStore.getState().activeId).toBe(id);

    useApplicationsStore.getState().select(undefined);
    expect(useApplicationsStore.getState().activeId).toBeUndefined();
  });
});
