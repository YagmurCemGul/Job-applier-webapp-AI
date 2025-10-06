import type {
  PlanMilestone,
  PlanTask
} from '@/types/onboarding.types'
import { aiRoute } from '@/services/ai/router.service'

/**
 * Create a role-aware 30/60/90 scaffold
 */
export function defaultMilestones(): PlanMilestone[] {
  return [
    {
      id: 'm30',
      title: 'First 30 Days',
      targetDay: 30,
      summary: 'Ramp up, meet stakeholders, learn systems.'
    },
    {
      id: 'm60',
      title: 'First 60 Days',
      targetDay: 60,
      summary: 'Own a scoped project, initial improvements.'
    },
    {
      id: 'm90',
      title: 'First 90 Days',
      targetDay: 90,
      summary: 'Deliver meaningful impact, plan next quarter.'
    }
  ]
}

/**
 * Generate seed tasks based on role
 */
export function seedTasks(role: string): PlanTask[] {
  const base: PlanTask[] = [
    {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      title: 'Read onboarding docs',
      status: 'todo',
      tags: ['learn']
    },
    {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + 1),
      title: 'Set up 1:1 with manager',
      status: 'todo',
      tags: ['people']
    },
    {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + 2),
      title: 'Shadow a peer on-call / delivery',
      status: 'todo',
      tags: ['practice']
    }
  ]

  if (/engineer/i.test(role)) {
    base.push({
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + 3),
      title: 'Run local dev & tests',
      status: 'todo',
      tags: ['dev']
    })
  }

  if (/product/i.test(role)) {
    base.push({
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now() + 4),
      title: 'Review roadmap & metrics',
      status: 'todo',
      tags: ['pm']
    })
  }

  return base
}

/**
 * Personalize tasks with AI given company context
 * Returns patched list (idempotent)
 */
export async function personalizeTasksWithAI(
  tasks: PlanTask[],
  context: {
    role: string
    company: string
    goals?: string[]
    risks?: string[]
  }
): Promise<PlanTask[]> {
  const prompt = `Given role ${context.role} at ${context.company}, propose at most 8 additional onboarding tasks with milestone (30/60/90), each as {title, details?, milestone:'30'|'60'|'90', tags?[]}. Return JSON array. Goals: ${JSON.stringify(context.goals || [])}. Risks: ${JSON.stringify(context.risks || [])}`

  try {
    const result = await aiRoute(
      {
        task: 'generate',
        prompt,
        temperature: 0.4,
        maxTokens: 1000
      },
      { allowCache: true }
    )

    if (!result.ok || !result.text) {
      return tasks
    }

    const arr =
      typeof result.text === 'string'
        ? JSON.parse(result.text)
        : (result.text as Array<any>)

    const toAdd = arr.slice(0, 8).map((x) => ({
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Math.random()),
      title: String(x.title || ''),
      details: x.details ? String(x.details) : undefined,
      milestoneId:
        x.milestone === '60' ? 'm60' : x.milestone === '90' ? 'm90' : 'm30',
      status: 'todo' as const,
      tags: Array.isArray(x.tags) ? x.tags.map(String) : []
    }))

    return [...tasks, ...toAdd]
  } catch {
    return tasks
  }
}
