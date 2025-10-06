import { describe, it, expect } from 'vitest'
import { defaultMilestones, seedTasks } from '@/services/onboarding/planBuilder.service'

describe('planBuilder.service', () => {
  it('should create default milestones', () => {
    const milestones = defaultMilestones()

    expect(milestones).toHaveLength(3)
    expect(milestones[0].targetDay).toBe(30)
    expect(milestones[1].targetDay).toBe(60)
    expect(milestones[2].targetDay).toBe(90)
    expect(milestones[0].id).toBe('m30')
    expect(milestones[1].id).toBe('m60')
    expect(milestones[2].id).toBe('m90')
  })

  it('should seed tasks for generic role', () => {
    const tasks = seedTasks('Manager')

    expect(tasks.length).toBeGreaterThanOrEqual(3)
    expect(tasks.some((t) => t.title.includes('onboarding'))).toBe(true)
    expect(tasks.some((t) => t.title.includes('1:1'))).toBe(true)
  })

  it('should add engineer-specific tasks', () => {
    const tasks = seedTasks('Software Engineer')

    const devTask = tasks.find((t) => t.title.includes('dev'))
    expect(devTask).toBeDefined()
    expect(devTask?.tags).toContain('dev')
  })

  it('should add product-specific tasks', () => {
    const tasks = seedTasks('Product Manager')

    const pmTask = tasks.find((t) => t.title.includes('roadmap'))
    expect(pmTask).toBeDefined()
    expect(pmTask?.tags).toContain('pm')
  })

  it('should generate unique IDs for tasks', () => {
    const tasks = seedTasks('Engineer')

    const ids = tasks.map((t) => t.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(tasks.length)
  })
})
