/**
 * @fileoverview Integration test: cadences and calendar creation (Step 45)
 */

import { describe, it, expect, vi } from 'vitest';
import { buildCadences } from '@/services/onboarding/cadences.service';
import { createCadenceEvents } from '@/services/integrations/calendarOnboarding.service';
import { useOnboarding } from '@/stores/onboarding.store';

// Mock calendar service
vi.mock('@/services/integrations/google.oauth.service', () => ({
  getBearer: vi.fn().mockResolvedValue('mock-bearer-token')
}));

vi.mock('@/services/integrations/calendar.real.service', () => ({
  calendarCreate: vi.fn().mockResolvedValue({
    id: 'cal-event-123',
    htmlLink: 'https://calendar.google.com/event/cal-event-123'
  })
}));

describe('Cadences and Reminders Integration', () => {
  it('builds cadences with quiet hour adjustments', () => {
    const input = {
      tz: 'America/New_York',
      startISO: '2025-03-01T10:00:00Z',
      managerEmail: 'manager@example.com',
      mentorEmail: 'mentor@example.com',
      buddyEmail: 'buddy@example.com'
    };
    
    const cadences = buildCadences(input);
    
    expect(cadences.length).toBe(4);
    expect(cadences.every(c => c.quietRespect)).toBe(true);
  });
  
  it('creates calendar events with mock credentials', async () => {
    const events = buildCadences({
      tz: 'UTC',
      startISO: new Date().toISOString(),
      managerEmail: 'manager@test.com'
    });
    
    const results = await createCadenceEvents(
      events,
      'test@example.com',
      'mock-client-id',
      'mock-passphrase'
    );
    
    expect(results.length).toBe(events.length);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('htmlLink');
  });
  
  it('stores cadence events in state', () => {
    const events = buildCadences({
      tz: 'UTC',
      startISO: new Date().toISOString(),
      managerEmail: 'manager@test.com'
    });
    
    events.forEach(event => {
      useOnboarding.getState().upsertCadence(event);
    });
    
    const stored = useOnboarding.getState().cadences;
    expect(stored.length).toBe(events.length);
  });
  
  it('verifies quiet-hour adjustments are applied', () => {
    const lateInput = {
      tz: 'America/Los_Angeles',
      startISO: '2025-03-01T03:00:00Z', // Late night
      managerEmail: 'manager@example.com'
    };
    
    const cadences = buildCadences(lateInput);
    
    // Events should be moved to working hours
    cadences.forEach(cadence => {
      const hour = new Date(cadence.startISO).getHours();
      // Should not be in late night hours
      expect(hour).not.toBeLessThan(7);
    });
  });
});
