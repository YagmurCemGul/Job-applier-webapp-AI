/**
 * SM-2 Spaced Repetition Scheduler Unit Tests (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { createCard, reviewCard, dueCards } from '@/services/skills/spacedRep.service';

describe('SM-2 Scheduler', () => {
  beforeEach(() => {
    useSkills.setState({ cards: [] });
  });

  it('creates card with default SM-2 values', () => {
    const card = createCard({
      competencyKey: 'system_design',
      front: 'What is CAP?',
      back: 'Consistency, Availability, Partition tolerance'
    });

    expect(card.ef).toBe(2.5);
    expect(card.interval).toBe(0);
    expect(card.reps).toBe(0);
  });

  it('advances interval on quality >= 3', () => {
    const card = createCard({
      competencyKey: 'coding',
      front: 'Q',
      back: 'A'
    });

    const updated = reviewCard(card.id, 4);
    expect(updated.reps).toBe(1);
    expect(updated.interval).toBe(1); // first rep = 1 day
    expect(new Date(updated.dueISO).getTime()).toBeGreaterThan(Date.now());
  });

  it('second rep interval is 6 days', () => {
    const card = createCard({ competencyKey: 'test', front: 'Q', back: 'A' });
    
    let updated = reviewCard(card.id, 4);
    updated = reviewCard(updated.id, 4);
    
    expect(updated.reps).toBe(2);
    expect(updated.interval).toBe(6);
  });

  it('EF adjusts based on quality', () => {
    const card = createCard({ competencyKey: 'test', front: 'Q', back: 'A' });
    
    const updated = reviewCard(card.id, 5); // perfect
    expect(updated.ef).toBeGreaterThan(2.5);
  });

  it('resets on quality < 3', () => {
    const card = createCard({ competencyKey: 'test', front: 'Q', back: 'A' });
    
    let updated = reviewCard(card.id, 4);
    expect(updated.reps).toBe(1);
    
    updated = reviewCard(updated.id, 1); // fail
    expect(updated.reps).toBe(0);
    expect(updated.interval).toBe(1);
  });

  it('dueCards returns only cards due today or earlier', () => {
    const card1 = createCard({ competencyKey: 'a', front: 'Q1', back: 'A1' });
    const card2 = createCard({ competencyKey: 'b', front: 'Q2', back: 'A2' });
    
    // card1 due today
    reviewCard(card1.id, 1); // reset, interval=1, due tomorrow
    
    // card2 keep at interval=0 (due now)
    
    const due = dueCards();
    expect(due.length).toBeGreaterThanOrEqual(1);
    expect(due.some(c => c.id === card2.id)).toBe(true);
  });
});
