/**
 * @fileoverview Integration test for email follow-up and calendar scheduling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInterview } from '@/stores/interview.store';
import { generateThankYouEmail, generateFollowUpEmail } from '@/services/interview/emailFollowup.service';
import type { FollowUp, InterviewPlan } from '@/types/interview.types';

describe('Email Follow-up & Calendar Integration', () => {
  beforeEach(() => {
    useInterview.setState({ plans: [], runs: [], stories: [], followups: [] });
  });

  it('should build thank-you email after interview', () => {
    const { upsertPlan } = useInterview.getState();

    const plan: InterviewPlan = {
      id: 'plan-1',
      company: 'TechCorp',
      role: 'Senior Engineer',
      interviewer: 'Jane Smith',
      kind: 'behavioral',
      medium: 'video',
      startISO: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      endISO: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      tz: 'UTC',
      quietRespect: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    upsertPlan(plan);

    const emailHtml = generateThankYouEmail(
      plan.interviewer!,
      plan.company!,
      plan.role!,
      'I really enjoyed our discussion about the team culture.'
    );

    expect(emailHtml).toContain('Jane Smith');
    expect(emailHtml).toContain('TechCorp');
    expect(emailHtml).toContain('Senior Engineer');
    expect(emailHtml).toContain('team culture');
  });

  it('should generate follow-up email after waiting period', () => {
    const emailHtml = generateFollowUpEmail('John Doe', 'StartupXYZ', 7);

    expect(emailHtml).toContain('John Doe');
    expect(emailHtml).toContain('StartupXYZ');
    expect(emailHtml).toContain('7 days');
  });

  it('should schedule reminder for follow-up', () => {
    const { upsertFollow } = useInterview.getState();

    const followUp: FollowUp = {
      id: 'follow-1',
      to: 'recruiter@company.com',
      subject: 'Follow-up on Interview',
      html: '<p>Following up...</p>',
      kind: 'follow_up',
      scheduledISO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    upsertFollow(followUp);

    const saved = useInterview.getState().followups[0];
    expect(saved.scheduledISO).toBeTruthy();
    expect(saved.sentId).toBeUndefined();
  });

  it('should mark follow-up as sent', () => {
    const { upsertFollow } = useInterview.getState();

    const followUp: FollowUp = {
      id: 'follow-1',
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Test</p>',
      kind: 'thank_you'
    };

    upsertFollow(followUp);
    
    // Simulate sending
    const updated: FollowUp = {
      ...followUp,
      sentId: 'gmail-msg-123'
    };
    
    upsertFollow(updated);

    const saved = useInterview.getState().followups[0];
    expect(saved.sentId).toBe('gmail-msg-123');
  });

  it('should link follow-up to interview plan', () => {
    const { upsertPlan, upsertFollow } = useInterview.getState();

    const plan: InterviewPlan = {
      id: 'plan-1',
      company: 'TestCo',
      kind: 'behavioral',
      medium: 'video',
      startISO: new Date().toISOString(),
      endISO: new Date().toISOString(),
      tz: 'UTC',
      quietRespect: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    upsertPlan(plan);

    const followUp: FollowUp = {
      id: 'follow-1',
      planId: plan.id,
      to: 'test@example.com',
      subject: 'Thank You',
      html: '<p>Thanks</p>',
      kind: 'thank_you'
    };
    upsertFollow(followUp);

    const saved = useInterview.getState().followups[0];
    expect(saved.planId).toBe(plan.id);
  });
});
