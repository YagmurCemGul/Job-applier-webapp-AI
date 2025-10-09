/**
 * Badges Award Unit Tests (Step 47)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSkills } from '@/stores/skills.store';
import { evaluateBadges } from '@/services/skills/badges.service';
import type { Assessment, Attempt, SkillInventoryRow } from '@/types/skills.types';

describe('Badges Award', () => {
  beforeEach(() => {
    useSkills.setState({ badges: [], assessments: [], attempts: [], inventory: [] });
  });

  it('awards bronze for 1 passing attempt', () => {
    const asmt: Assessment = {
      id: 'asmt-1',
      title: 'Test',
      kind: 'quiz',
      competencyKey: 'coding',
      passScore: 70,
      questions: []
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt: Attempt = {
      id: 'attempt-1',
      assessmentId: 'asmt-1',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      scorePct: 75
    };
    useSkills.getState().upsertAttempt(attempt);

    const badges = evaluateBadges('coding');
    expect(badges.length).toBe(1);
    expect(badges[0].tier).toBe('bronze');
  });

  it('awards silver for 2+ passing attempts', () => {
    const asmt: Assessment = {
      id: 'asmt-1',
      title: 'Test',
      kind: 'quiz',
      competencyKey: 'system_design',
      passScore: 70,
      questions: []
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt1: Attempt = {
      id: 'a1',
      assessmentId: 'asmt-1',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      scorePct: 80
    };
    const attempt2: Attempt = {
      id: 'a2',
      assessmentId: 'asmt-1',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      scorePct: 85
    };
    useSkills.getState().upsertAttempt(attempt1);
    useSkills.getState().upsertAttempt(attempt2);

    const badges = evaluateBadges('system_design');
    expect(badges.length).toBe(1);
    expect(badges[0].tier).toBe('silver');
  });

  it('awards gold for inventory level >= 3', () => {
    const inv: SkillInventoryRow = {
      id: '1',
      competencyKey: 'domain',
      selfLevel: 3,
      confidencePct: 85,
      notes: ''
    };
    useSkills.getState().upsertInventory(inv);

    const badges = evaluateBadges('domain');
    expect(badges.length).toBe(1);
    expect(badges[0].tier).toBe('gold');
  });

  it('returns empty if no qualifying criteria', () => {
    const badges = evaluateBadges('execution');
    expect(badges.length).toBe(0);
  });

  it('ignores failing attempts', () => {
    const asmt: Assessment = {
      id: 'asmt-1',
      title: 'Test',
      kind: 'quiz',
      competencyKey: 'communication',
      passScore: 70,
      questions: []
    };
    useSkills.getState().upsertAssessment(asmt);

    const attempt: Attempt = {
      id: 'a1',
      assessmentId: 'asmt-1',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      scorePct: 65 // below pass
    };
    useSkills.getState().upsertAttempt(attempt);

    const badges = evaluateBadges('communication');
    expect(badges.length).toBe(0);
  });
});
