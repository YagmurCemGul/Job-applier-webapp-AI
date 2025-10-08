/**
 * @fileoverview Plan builder service for creating and personalizing onboarding plans.
 * @module services/onboarding/planBuilder
 */

import type {
  OnboardingPlan,
  PlanMilestone,
  PlanTask,
} from '@/types/onboarding.types';
import { aiComplete } from '@/services/features/aiComplete.service';

/**
 * Create default 30/60/90 day milestones.
 * @returns Default milestone scaffold
 */
export function defaultMilestones(): PlanMilestone[] {
  return [
    {
      id: 'm30',
      title: 'First 30 Days',
      targetDay: 30,
      summary: 'Ramp up, meet stakeholders, learn systems.',
    },
    {
      id: 'm60',
      title: 'First 60 Days',
      targetDay: 60,
      summary: 'Own a scoped project, initial improvements.',
    },
    {
      id: 'm90',
      title: 'First 90 Days',
      targetDay: 90,
      summary: 'Deliver meaningful impact, plan next quarter.',
    },
  ];
}

/**
 * Generate role-aware seed tasks.
 * @param role - Job role
 * @returns Initial task list
 */
export function seedTasks(role: string): PlanTask[] {
  const base: PlanTask[] = [
    {
      id: crypto.randomUUID(),
      title: 'Read onboarding docs',
      status: 'todo',
      tags: ['learn'],
    },
    {
      id: crypto.randomUUID(),
      title: 'Set up 1:1 with manager',
      status: 'todo',
      tags: ['people'],
    },
    {
      id: crypto.randomUUID(),
      title: 'Shadow a peer on-call / delivery',
      status: 'todo',
      tags: ['practice'],
    },
  ];

  if (/engineer/i.test(role)) {
    base.push({
      id: crypto.randomUUID(),
      title: 'Run local dev & tests',
      status: 'todo',
      tags: ['dev'],
    });
  }

  if (/product/i.test(role)) {
    base.push({
      id: crypto.randomUUID(),
      title: 'Review roadmap & metrics',
      status: 'todo',
      tags: ['pm'],
    });
  }

  return base;
}

/**
 * Personalize tasks with AI given company context; returns patched list (idempotent).
 * @param tasks - Existing tasks
 * @param context - Role, company, goals, risks
 * @returns Enhanced task list with AI suggestions
 */
export async function personalizeTasksWithAI(
  tasks: PlanTask[],
  context: {
    role: string;
    company: string;
    goals?: string[];
    risks?: string[];
  }
): Promise<PlanTask[]> {
  const prompt = `Given role ${context.role} at ${context.company}, propose at most 8 additional onboarding tasks with milestone (30/60/90), each as {title, details?, milestone:'30'|'60'|'90', tags?[]}. Return JSON array. Goals: ${JSON.stringify(context.goals || [])}. Risks: ${JSON.stringify(context.risks || [])}`;

  try {
    const out = await aiComplete(prompt, { json: true });
    const arr = (typeof out === 'string' ? JSON.parse(out) : out) as Array<any>;
    const toAdd = arr.slice(0, 8).map((x) => ({
      id: crypto.randomUUID(),
      title: String(x.title || ''),
      details: x.details ? String(x.details) : undefined,
      milestoneId:
        x.milestone === '60' ? 'm60' : x.milestone === '90' ? 'm90' : 'm30',
      status: 'todo' as const,
      tags: Array.isArray(x.tags) ? x.tags.map(String) : [],
    }));
    return [...tasks, ...toAdd];
  } catch {
    return tasks;
  }
}
