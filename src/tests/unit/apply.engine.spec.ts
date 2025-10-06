import { describe, it, expect, beforeEach } from 'vitest'
import { autoApply } from '@/services/apply/apply.engine'
import { useApplicationsStore } from '@/store/applicationsStore'

describe('apply.engine', () => {
  beforeEach(() => {
    useApplicationsStore.setState({ items: [], activeId: undefined })
  })

  it('should throw when optIn is false', async () => {
    await expect(
      autoApply({
        platform: 'greenhouse',
        jobUrl: 'https://greenhouse.com/jobs/123',
        company: 'Acme',
        role: 'Engineer',
        mapperArgs: { jobUrl: 'https://greenhouse.com/jobs/123' },
        optIn: false,
      })
    ).rejects.toThrow('Auto-apply requires explicit opt-in')
  })

  it('should create application when optIn is true', async () => {
    const appId = await autoApply({
      platform: 'greenhouse',
      jobUrl: 'https://greenhouse.com/jobs/123',
      company: 'Acme',
      role: 'Engineer',
      mapperArgs: { jobUrl: 'https://greenhouse.com/jobs/123' },
      optIn: true,
    })

    expect(appId).toBeDefined()
    const items = useApplicationsStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].company).toBe('Acme')
    expect(items[0].stage).toBe('applied')
  })

  it('should add log entry', async () => {
    const appId = await autoApply({
      platform: 'lever',
      jobUrl: 'https://jobs.lever.co/company/job',
      company: 'Tech Corp',
      role: 'Developer',
      mapperArgs: { jobUrl: 'https://jobs.lever.co/company/job' },
      optIn: true,
    })

    const items = useApplicationsStore.getState().items
    const app = items.find((a) => a.id === appId)
    expect(app?.logs).toBeDefined()
    expect(app?.logs.length).toBeGreaterThan(0)
    expect(app?.logs[0].message).toContain('Submitted')
  })

  it('should set appliedAt timestamp', async () => {
    const appId = await autoApply({
      platform: 'indeed',
      jobUrl: 'https://indeed.com/job/123',
      company: 'StartUp',
      role: 'Backend',
      mapperArgs: { jobUrl: 'https://indeed.com/job/123' },
      optIn: true,
    })

    const items = useApplicationsStore.getState().items
    const app = items.find((a) => a.id === appId)
    expect(app?.appliedAt).toBeDefined()
  })
})
