import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { startJobScheduler, stopJobScheduler } from '@/services/jobs/scheduler.service'

describe('scheduler.service', () => {
  beforeEach(() => {
    stopJobScheduler()
  })

  afterEach(() => {
    stopJobScheduler()
  })

  it('should start scheduler', () => {
    expect(() => startJobScheduler()).not.toThrow()
  })

  it('should stop scheduler', () => {
    startJobScheduler()
    expect(() => stopJobScheduler()).not.toThrow()
  })

  it('should allow multiple start/stop cycles', () => {
    startJobScheduler()
    stopJobScheduler()
    startJobScheduler()
    stopJobScheduler()
    expect(true).toBe(true)
  })
})
