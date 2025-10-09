/**
 * Spaced Repetition Service (Step 47)
 * SM-2 flashcard scheduler for long-term retention.
 */

import type { Flashcard } from '@/types/skills.types';
import { useSkills } from '@/stores/skills.store';

/**
 * Create flashcards from resources or user input.
 */
export function createCard(input: Omit<Flashcard, 'id' | 'ef' | 'interval' | 'reps' | 'dueISO'>) {
  const c: Flashcard = {
    id: crypto.randomUUID(),
    ef: 2.5,
    interval: 0,
    reps: 0,
    dueISO: new Date().toISOString(),
    ...input
  };
  useSkills.getState().upsertCard(c);
  return c;
}

/**
 * SM-2 scheduler; quality 0..5.
 */
export function reviewCard(cardId: string, quality: 0 | 1 | 2 | 3 | 4 | 5) {
  const c = useSkills.getState().cards.find(x => x.id === cardId);
  if (!c) throw new Error('Card not found');
  
  const now = new Date();
  
  if (quality >= 3) {
    c.ef = Math.max(1.3, c.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    c.reps += 1;
    c.interval = c.reps === 1 ? 1 : c.reps === 2 ? 6 : Math.round(c.interval * c.ef);
  } else {
    c.reps = 0;
    c.interval = 1;
  }
  
  const next = new Date(now);
  next.setDate(now.getDate() + c.interval);
  c.dueISO = next.toISOString();
  
  useSkills.getState().upsertCard({ ...c });
  return c;
}

/**
 * Get due cards for review today.
 */
export function dueCards() {
  const today = new Date();
  return useSkills.getState().cards.filter(c => new Date(c.dueISO) <= today);
}
