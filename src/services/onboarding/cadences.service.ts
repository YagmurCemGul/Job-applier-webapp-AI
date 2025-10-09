/**
 * @fileoverview Cadence scheduler service (Step 45)
 * @module services/onboarding/cadences
 */

import type { CadenceEvent } from '@/types/onboarding.types';
import { withinQuietHours } from '@/services/integrations/timezone.service';

/**
 * Build recurring cadence events with quiet-hours guard.
 * @param input - Input parameters for cadence events
 * @returns Array of cadence events
 */
export function buildCadences(input: {
  tz: string;
  startISO: string;
  managerEmail?: string;
  mentorEmail?: string;
  buddyEmail?: string;
}): CadenceEvent[] {
  const start = new Date(input.startISO);
  
  const slot = (d: number, h: number): string => {
    const t = new Date(start);
    t.setDate(t.getDate() + d);
    t.setHours(h, 0, 0, 0);
    return t.toISOString();
  };
  
  const mk = (
    kind: CadenceEvent['kind'],
    dayOffset: number,
    hour: number,
    recurrence: CadenceEvent['recurrence'],
    attendees: string[],
    title: string
  ): CadenceEvent => {
    const s = slot(dayOffset, hour);
    const e = new Date(s);
    e.setMinutes(e.getMinutes() + 30);
    
    const ev: CadenceEvent = {
      id: crypto.randomUUID(),
      kind,
      title,
      attendees,
      tz: input.tz,
      startISO: s,
      endISO: e.toISOString(),
      recurrence,
      quietRespect: true
    };
    
    // Adjust if in quiet hours
    if (withinQuietHours(s, input.tz)) {
      const dt = new Date(s);
      dt.setHours(10);
      ev.startISO = dt.toISOString();
      const de = new Date(ev.startISO);
      de.setMinutes(de.getMinutes() + 30);
      ev.endISO = de.toISOString();
    }
    
    return ev;
  };
  
  return [
    mk('manager_1_1', 3, 10, 'weekly', [input.managerEmail || ''], 'Manager 1:1'),
    mk('mentor', 7, 11, 'biweekly', [input.mentorEmail || ''], 'Mentor Sync'),
    mk('buddy', 2, 14, 'weekly', [input.buddyEmail || ''], 'Buddy Check-in'),
    mk('team_ceremony', 1, 10, 'weekly', [], 'Team Ceremony')
  ];
}
