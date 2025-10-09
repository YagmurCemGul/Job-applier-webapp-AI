/**
 * Practice to Assessment Loop Integration Test (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { createCard, reviewCard } from '@/services/skills/spacedRep.service';
import { startAttempt, submitAttempt } from '@/services/skills/assessments.service';
import { evaluateBadges } from '@/services/skills/badges.service';
import type { Assessment } from '@/types/skills.types';

describe('Practice to Assessment Loop', () => {
  beforeEach(() => {
    useSkills.setState({ cards: [], assessments: [], attempts: [], badges: [] });
  });

  it('creates flashcards → reviews → takes assessment → computes score → awards badge', () => {
    // 1. Create flashcards
    const card1 = createCard({
      competencyKey: 'system_design',
      front: 'What is eventual consistency?',
      back: 'Guarantee that all replicas converge eventually'
    });
    const card2 = createCard({
      competencyKey: 'system_design',
      front: 'What is sharding?',
      back: 'Horizontal partitioning of data'
    });

    expect(useSkills.getState().cards.length).toBe(2);

    // 2. Review cards
    const reviewed1 = reviewCard(card1.id, 4); // good
    const reviewed2 = reviewCard(card2.id, 5); // perfect

    expect(reviewed1.reps).toBe(1);
    expect(reviewed2.reps).toBe(1);
    expect(reviewed1.ef).toBeGreaterThan(2.5);
    expect(reviewed2.ef).toBeGreaterThan(reviewed1.ef);

    // 3. Create assessment
    const asmt: Assessment = {
      id: 'asmt-1',
      title: 'System Design Basics',
      kind: 'quiz',
      competencyKey: 'system_design',
      passScore: 70,
      questions: [
        { id: 'q1', prompt: 'Eventual consistency?', choices: ['A', 'B'], answer: 'A' },
        { id: 'q2', prompt: 'Sharding?', choices: ['X', 'Y'], answer: 'Y' }
      ]
    };
    useSkills.getState().upsertAssessment(asmt);

    // 4. Take assessment
    const attempt = startAttempt('asmt-1');
    const finished = submitAttempt(attempt.id, { q1: 'A', q2: 'Y' });

    expect(finished.scorePct).toBe(60); // 100% quiz * 0.6 = 60
    expect(finished.feedbackHtml).toContain('Assessment Results');

    // 5. Award badges (but score < 70, so no badge)
    let badges = evaluateBadges('system_design');
    expect(badges.length).toBe(0);

    // 6. Try again and pass
    const attempt2 = startAttempt('asmt-1');
    const finished2 = submitAttempt(attempt2.id, { q1: 'A', q2: 'Y' }, { quality: 10 }); // add rubric score

    // Now should get bronze for 1 pass
    badges = evaluateBadges('system_design');
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(badges[0].tier).toBe('bronze');
  });

  it('multiple attempts upgrade badge tier', () => {
    const asmt: Assessment = {
      id: 'asmt-1',
      title: 'Test',
      kind: 'quiz',
      competencyKey: 'coding',
      passScore: 70,
      questions: [{ id: 'q1', prompt: 'Q?', choices: ['A'], answer: 'A' }]
    };
    useSkills.getState().upsertAssessment(asmt);

    // Attempt 1
    const a1 = startAttempt('asmt-1');
    submitAttempt(a1.id, { q1: 'A' });
    let badges = evaluateBadges('coding');
    expect(badges[0]?.tier).toBe('bronze');

    // Attempt 2
    const a2 = startAttempt('asmt-1');
    submitAttempt(a2.id, { q1: 'A' });
    badges = evaluateBadges('coding');
    expect(badges[0]?.tier).toBe('silver');
  });
});
