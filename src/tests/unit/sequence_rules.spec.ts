/**
 * @fileoverview Unit tests for sequence rules
 * Step 48: Networking CRM & Outreach Sequencer
 */

import { describe, it, expect } from 'vitest';
import { createSafeSequence } from '@/services/outreach/sequence.service';

describe('Sequence Rules', () => {
  it('creates sequence with default safety rules', () => {
    const seq = createSafeSequence('Test Sequence', '<p>Hello {{firstName}}</p>');

    expect(seq.name).toBe('Test Sequence');
    expect(seq.steps.length).toBe(3); // email, wait, email
    expect(seq.rules?.throttlePerHour).toBe(30);
    expect(seq.rules?.dailyCap).toBe(150);
    expect(seq.rules?.quietHours).toBe(true);
  });

  it('email steps have stopOnReply and stopOnUnsub', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');

    const emailSteps = seq.steps.filter(s => s.kind === 'email');
    
    emailSteps.forEach(step => {
      expect(step.stopOnReply).toBe(true);
      expect(step.stopOnUnsub).toBe(true);
    });
  });

  it('includes wait step with default duration', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');

    const waitStep = seq.steps.find(s => s.kind === 'wait');
    
    expect(waitStep).toBeDefined();
    expect(waitStep?.waitDays).toBe(3);
  });

  it('sets gmail as default channel for email steps', () => {
    const seq = createSafeSequence('Test', '<p>Test</p>');

    const emailSteps = seq.steps.filter(s => s.kind === 'email');
    
    emailSteps.forEach(step => {
      expect(step.channel).toBe('gmail');
    });
  });
});
